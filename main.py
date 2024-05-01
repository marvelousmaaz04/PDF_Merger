# import pikepdf
from pikepdf import *
import glob

new_pdf = Pdf.new()

for file in glob.glob("./" + "*.pdf"):
    old_pdf = Pdf.open(file)
    new_pdf.pages.extend(old_pdf.pages)

new_pdf.save("demo.pdf")