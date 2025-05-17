from flask import Flask, render_template, request
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader

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

        # You can now use extracted_text in your app
        print("Extracted Text:\n", extracted_text)

        return f"<h2>Resume uploaded and text extracted!</h2><pre>{extracted_text[:1000]}</pre>"  # show preview
    else:
        return "Only PDF files are allowed."

if __name__ == '__main__':
    app.run(debug=True)
