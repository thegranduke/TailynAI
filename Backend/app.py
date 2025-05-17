from flask import Flask, render_template, request
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from google import genai
from dotenv import load_dotenv
import json
load_dotenv()  # Load environment variables from .env file

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

        return f"<h2>Extracted Profile JSON</h2><pre>{json.dumps(profile_json, indent=2)}</pre>"

    else:
        return "Only PDF files are allowed."

    




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
