from flask import Flask, render_template, request, send_file
from pikepdf import *
import os

app = Flask(__name__)

@app.route('/')
def hello_world():
    return render_template("index.html")

@app.route('/merge', methods=['POST'])
def merge():
    print('Request received!')

    # Create a new PDF
    new_pdf = Pdf.new()

    # Loop through the files sent in the request
    for file in request.files.getlist('files'):
        # Save the file temporarily
        filename = os.path.join("files/uploads", file.filename)
        os.makedirs(os.path.dirname(filename), exist_ok=True)  # Create directory if it doesn't exist
        file.save(filename)
        # Open the PDF and append its pages to the new PDF
        old_pdf = Pdf.open(filename)
        new_pdf.pages.extend(old_pdf.pages)
        # Delete the temporary file
     

    # Specify the directory where you want to save the merged PDF file
    output_directory = "static/merged_pdfs"
    os.makedirs(output_directory, exist_ok=True)  # Create directory if it doesn't exist
    merged_filename = os.path.join(output_directory, "ypdf_merged.pdf")
    
    # Save the merged PDF file to the specified directory
    new_pdf.save(merged_filename)
    
    # Return the merged PDF file as an attachment
    return send_file(merged_filename, as_attachment=True)

if __name__ == "__main__":
    app.run(debug=True, port=8098)
