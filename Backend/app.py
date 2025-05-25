from flask import Flask, render_template, request
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from google import genai
from dotenv import load_dotenv
import json
load_dotenv()  # Load environment variables from .env file

from supabase import create_client, Client
import jwt
import requests

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

# Helper to get Clerk public key (JWKS)
def verify_clerk_token(token):
    jwks_url = "https://mint-kite-79.clerk.accounts.dev/.well-known/jwks.json"
    jwk_client = jwt.PyJWKClient(jwks_url)
    signing_key = jwk_client.get_signing_key_from_jwt(token)
    decoded = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=os.getenv("CLERK_CLIENT_ID"),
    )
    print("Decoded Clerk token:", decoded)
    return decoded["sub"]  # Clerk user ID

@app.route('/upload', methods=['POST'])
def upload():
    # 1. Get and verify Clerk token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Missing or invalid Authorization header"}, 401
    token = auth_header.split(" ", 1)[1]
    try:
        clerk_user_id = verify_clerk_token(token)
        print("Clerk user id:", clerk_user_id)
    except Exception as e:
        print("Token verification failed:", e)
        return {"error": "Invalid Clerk token"}, 401

    uploaded_file = request.files['resume']
    if uploaded_file.filename.endswith('.pdf'):
        filename = secure_filename(uploaded_file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        uploaded_file.save(filepath)

        # Extract text from PDF
        reader = PdfReader(filepath)
        extracted_text = ""
        for page in reader.pages:
            extracted_text += page.extract_text() or ""

        # Extract structured profile using Gemini
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        profile_json = extract_profile_with_gemini(extracted_text, gemini_api_key)
        # print("Extracted profile JSON:", profile_json)
        save_profile_to_supabase(profile_json, clerk_user_id)

        return f"<h2>Extracted Profile JSON</h2><pre>{json.dumps(profile_json, indent=2)}</pre>"
    else:
        return "Only PDF files are allowed."

@app.route('/match-job', methods=['POST'])
def match_job_to_profile():
    # Get and verify Clerk token
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return {"error": "Missing or invalid Authorization header"}, 401
    token = auth_header.split(" ", 1)[1]
    try:
        clerk_user_id = verify_clerk_token(token)
        print("Clerk user id:", clerk_user_id)
    except Exception as e:
        print("Token verification failed:", e)
        return {"error": "Invalid Clerk token"}, 401

    # Accept clerk_user_id from form if present (for flexibility)
    if request.is_json:
        data = request.get_json()
        job_description = data.get('job_description')
        user_id = data.get('clerk_user_id', clerk_user_id)
    else:
        job_description = request.form.get('job_text')
        user_id = request.form.get('clerk_user_id', clerk_user_id)
        # If job_pdf is present, you could extract text from it here if needed

    if not job_description:
        return {"error": "Missing job description"}, 400
    if not user_id:
        return {"error": "Missing user id"}, 400

    profile = fetch_profile_from_supabase(user_id)
    if not profile:
        return {"error": "User profile not found"}, 404
    gemini_input = build_gemini_prompt(profile, job_description)
    gemini_response = send_to_gemini(gemini_input)
    print(gemini_response)

    # Parse Gemini output for job info and matches
    job_title = gemini_response.get("job_title")
    job_company = gemini_response.get("job_company")
    job_raw_description = gemini_response.get("job_raw_description", job_description)
    matched_skill_ids = gemini_response.get("matched_skill_ids", [])
    matched_project_ids = gemini_response.get("matched_project_ids", [])
    matched_experience_ids = gemini_response.get("matched_experience_ids", [])
    improved_descriptions = gemini_response.get("improved_descriptions", {})

    # 1. Create job in job_descriptions
    job_insert = supabase.table("job_descriptions").insert({
        "profile_id": user_id,
        "title": job_title,
        "company": job_company,
        "raw_description": job_raw_description
    }).execute()
    job_id = None
    if job_insert.data and len(job_insert.data) > 0:
        job_id = job_insert.data[0]["id"]
    else:
        return {"error": "Failed to create job description"}, 500

    # 2. Create job_matches (skills)
    for skill_id in matched_skill_ids:
        try:
            supabase.table("job_matches").insert({
                "job_id": job_id,
                "skill_id": skill_id
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass
            else:
                raise

    # 3. Create project_matches
    for project_id in matched_project_ids:
        improved_desc = improved_descriptions.get(str(project_id)) or improved_descriptions.get(project_id) or None
        try:
            supabase.table("project_matches").insert({
                "job_id": job_id,
                "project_id": project_id,
                "improved_description": improved_desc
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass
            else:
                raise

    # 4. Create experience_matches
    for exp_id in matched_experience_ids:
        improved_desc = improved_descriptions.get(str(exp_id)) or improved_descriptions.get(exp_id) or None
        try:
            supabase.table("experience_matches").insert({
                "job_id": job_id,
                "experience_id": exp_id,
                "improved_description": improved_desc
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass
            else:
                raise

    return {
        "job_id": job_id,
        "matched_skill_ids": matched_skill_ids,
        "matched_project_ids": matched_project_ids,
        "matched_experience_ids": matched_experience_ids
    }

def fetch_profile_from_supabase(clerk_user_id: str) -> dict:
    # Fetch the user profile by clerk_user_id
    profile_resp = supabase.table("user_profiles").select("*").eq("clerk_user_id", clerk_user_id).maybe_single().execute()
    if not profile_resp or not profile_resp.data:
        return None
    profile_data = profile_resp.data
    profile_id = profile_data["clerk_user_id"]

    # Fetch skills
    skills = supabase.table("skills").select("id, name").eq("profile_id", profile_id).execute().data
    # Fetch projects
    projects = supabase.table("projects").select("id, name, description, link").eq("profile_id", profile_id).execute().data
    # Fetch work experiences
    experiences = supabase.table("work_experiences").select("id, position, company, duration, description").eq("profile_id", profile_id).execute().data
    # Fetch education
    education = supabase.table("education").select("id, degree, institution, year").eq("profile_id", profile_id).execute().data
    # Fetch links
    links = supabase.table("links").select("id, url").eq("profile_id", profile_id).execute().data

    return {
        "profile_id": profile_id,
        "name": profile_data.get("name"),
        "email": profile_data.get("email"),
        "phone": profile_data.get("phone"),
        "skills": skills,
        "projects": projects,
        "experiences": experiences,
        "education": education,
        "links": links
    }

MATCH_PROMPT_TEMPLATE = """
You're an expert resume matcher. Here's a user's profile:

Skills:
{skills}

Projects:
{projects}

Work Experience:
{experiences}

Job Description:
{job_description}

Return a JSON object with:
- job_title: the job title (if available)
- job_company: the company name (if available)
- job_raw_description: the full job description text, with newlines separated by \\n
- matched_skill_ids: list of skill ids that best match
- matched_project_ids: list of project ids that best match
- matched_experience_ids: list of experience ids that best match
- improved_descriptions: {{ id: updated_description }} for projects and experiences these should follow the XYZ format: What was done , what it achieved , how it was done . Be concise and concrete but natural and conversational. and newlines should be separated by \\n.

Ensure this would be the best combination of skills, projects, and experiences for the user to match the job description and company.

Only return valid JSON. No explanations or markdown.
"""

def build_gemini_prompt(profile: dict, job_description: str) -> str:
    return MATCH_PROMPT_TEMPLATE.format(
        skills=json.dumps(profile["skills"], indent=2),
        projects=json.dumps(profile["projects"], indent=2),
        experiences=json.dumps(profile["experiences"], indent=2),
        job_description=job_description
    )

def send_to_gemini(prompt: str) -> dict:
    client = genai.Client(api_key=os.getenv('GEMINI_API_KEY'))

    response = client.models.generate_content(
        model="gemini-2.0-flash",  # Use flash for speed if preferred
        contents=prompt
    )

    try:
        print(response.text)
        return json.loads(clean_and_parse_gemini_output(response.text))
    except json.JSONDecodeError:
        return {"error": "Invalid Gemini response", "raw_output": response.text}

def save_profile_to_supabase(profile_data: dict, clerk_id: str):
    # 1. Check if user already exists
    existing = supabase.table("user_profiles").select("*").eq("clerk_user_id", clerk_id).maybe_single().execute()

    if existing and existing.data:
        profile_id = existing.data["clerk_user_id"]
        supabase.table("user_profiles").update({
            "name": profile_data.get("name"),
            "email": profile_data.get("email"),
            "phone": profile_data.get("phone")
        }).eq("clerk_user_id", clerk_id).execute()
    else:
        profile_resp = supabase.table("user_profiles").insert({
            "clerk_user_id": clerk_id,
            "name": profile_data.get("name"),
            "email": profile_data.get("email"),
            "phone": profile_data.get("phone")
        }).execute()
        profile_id = clerk_id

    # Insert skills (ignore duplicates)
    for skill in profile_data.get("skills", []):
        try:
            supabase.table("skills").insert({
                "name": skill,
                "profile_id": profile_id
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass  # Ignore duplicate
            else:
                raise

    # Insert projects (ignore duplicates)
    for proj in profile_data.get("projects", []):
        try:
            supabase.table("projects").insert({
                "name": proj.get("name"),
                "description": proj.get("description"),
                "link": proj.get("link"),
                "profile_id": profile_id
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass
            else:
                raise

    # Insert work experiences (ignore duplicates)
    for exp in profile_data.get("work_experience", []):
        try:
            supabase.table("work_experiences").insert({
                "position": exp.get("position"),
                "company": exp.get("company"),
                "duration": exp.get("duration"),
                "description": exp.get("description"),
                "profile_id": profile_id
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass
            else:
                raise

    # Insert education (ignore duplicates)
    for edu in profile_data.get("education", []):
        try:
            supabase.table("education").insert({
                "degree": edu.get("degree"),
                "institution": edu.get("institution"),
                "year": edu.get("year"),
                "profile_id": profile_id
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass
            else:
                raise

    # Insert links (ignore duplicates)
    for url in profile_data.get("links", []):
        try:
            supabase.table("links").insert({
                "url": url,
                "profile_id": profile_id
            }).execute()
        except Exception as e:
            if "duplicate key value violates unique constraint" in str(e):
                pass
            else:
                raise
    print("Profile saved for user:", clerk_id)

GEMINI_PROMPT_TEMPLATE = """
You are a resume analysis expert. Given the following raw resume text, extract structured information in JSON format with the following fields:

- name
- email
- phone
- skills (as a list)
- work_experience (as a list of objects with: position, company, duration, description)
- education (as a list of objects with: degree, institution, year)
- projects (as a list of objects with: name, description , with newlines separated by \\n, link if present)
- links (any relevant links like LinkedIn, GitHub, portfolio)

Only return valid JSON. Do not include explanations or Markdown.

Here is the resume text:
\"\"\"{resume_text}\"\"\"
"""

def extract_profile_with_gemini(resume_text: str, gemini_api_key: str) -> dict:
    client = genai.Client(api_key=gemini_api_key)

    prompt = GEMINI_PROMPT_TEMPLATE.format(resume_text=resume_text)

    response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt
)


    try:
        cleaned_response = clean_and_parse_gemini_output(response.text)
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        print("Failed to parse Gemini output as JSON")
        print("Raw output:\n", response.text)
        return {}
    
def clean_and_parse_gemini_output(raw_text: str) -> dict:
    lines = raw_text.strip().splitlines()

    # Remove first and last lines if they are triple quotes
    if lines[0].strip() == '```json' and lines[-1].strip() == '```':
        lines = lines[1:-1]

    cleaned = "\n".join(lines)
    try:
        return cleaned
    except json.JSONDecodeError:
        print("Failed to parse cleaned Gemini output as JSON")
        print("Cleaned string:\n", cleaned)
        return {}   



if __name__ == '__main__':
    app.run(debug=True)
