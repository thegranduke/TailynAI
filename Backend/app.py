from flask import Flask, render_template, request
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from google import genai
from dotenv import load_dotenv
import json
from models import db, UserProfile, Skill, WorkExperience, Education, Project, Link
load_dotenv()  # Load environment variables from .env file

from supabase import create_client, Client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
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
        gemini_api_key = os.getenv('GEMINI_API_KEY')  # Make sure this is set in your environment
        profile_json = extract_profile_with_gemini(extracted_text, gemini_api_key)
        save_profile_to_supabase(profile_json)

        return f"<h2>Extracted Profile JSON</h2><pre>{json.dumps(profile_json, indent=2)}</pre>"

    else:
        return "Only PDF files are allowed."

@app.route('/match-job', methods=['POST'])
def match_job_to_profile():
    if request.is_json:
        data = request.get_json()
    else:
        # Handle multipart/form-data
        job_text = request.form.get('job_text')
        job_pdf = request.files.get('job_pdf')
        # You can extract text from the PDF here if needed
    data = {
        "job_description": job_text,
        # Add more fields as needed
    }
    job_description = data.get('job_description')
    user_email = "einompi@gmail.com" #data.get('email')

    if not job_description:
        return {"error": "Missing job description"}, 400
    if not user_email:
        return {"error": "Missing email"}, 400

    profile = fetch_profile_from_supabase(user_email)
    gemini_input = build_gemini_prompt(profile, job_description)
    gemini_response = send_to_gemini(gemini_input)

    return gemini_response

def fetch_profile_from_supabase(email: str) -> dict:
    profile_resp = supabase.table("user_profiles").select("*").eq("email", email).single().execute()
    profile_data = profile_resp.data
    profile_id = profile_data["id"]

    skills = supabase.table("skills").select("id, name").eq("profile_id", profile_id).execute().data
    projects = supabase.table("projects").select("id, name, description").eq("profile_id", profile_id).execute().data
    experiences = supabase.table("work_experiences").select("id, position, company, duration, description").eq("profile_id", profile_id).execute().data

    return {
        "profile_id": profile_id,
        "skills": skills,
        "projects": projects,
        "experiences": experiences
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
\"\"\"{job_description}\"\"\"

Return a JSON object with:
- matched_skill_ids
- matched_project_ids
- matched_experience_ids
- improved_descriptions: {{ id: updated_description }}

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
        return json.loads(clean_and_parse_gemini_output(response.text))
    except json.JSONDecodeError:
        return {"error": "Invalid Gemini response", "raw_output": response.text}



    

def save_profile_to_supabase(profile_data: dict):
    # Insert main profile
    profile_resp = supabase.table("user_profiles").insert({
        "name": profile_data.get("name"),
        "email": profile_data.get("email"),
        "phone": profile_data.get("phone")
    }).execute()
    profile_id = profile_resp.data[0]["id"]

    # Insert skills
    for skill in profile_data.get("skills", []):
        supabase.table("skills").insert({
            "name": skill,
            "profile_id": profile_id
        }).execute()

    # Insert work experiences
    for exp in profile_data.get("work_experience", []):
        supabase.table("work_experiences").insert({
            "position": exp.get("position"),
            "company": exp.get("company"),
            "duration": exp.get("duration"),
            "description": exp.get("description"),
            "profile_id": profile_id
        }).execute()

    # Insert education
    for edu in profile_data.get("education", []):
        supabase.table("education").insert({
            "degree": edu.get("degree"),
            "institution": edu.get("institution"),
            "year": edu.get("year"),
            "profile_id": profile_id
        }).execute()

    # Insert projects
    for proj in profile_data.get("projects", []):
        supabase.table("projects").insert({
            "name": proj.get("name"),
            "description": proj.get("description"),
            "link": proj.get("link"),
            "profile_id": profile_id
        }).execute()

    # Insert links
    for url in profile_data.get("links", []):
        supabase.table("links").insert({
            "url": url,
            "profile_id": profile_id
        }).execute()


GEMINI_PROMPT_TEMPLATE = """
You are a resume analysis expert. Given the following raw resume text, extract structured information in JSON format with the following fields:

- name
- email
- phone
- skills (as a list)
- work_experience (as a list of objects with: position, company, duration, description)
- education (as a list of objects with: degree, institution, year)
- projects (as a list of objects with: name, description, link if present)
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
