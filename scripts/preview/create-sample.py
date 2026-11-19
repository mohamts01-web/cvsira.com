from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader

filename = "scripts/preview/sample-cv.pdf"
pdf = canvas.Canvas(filename, pagesize=A4)
pdf.setTitle("Elmam CV - Synthetic preview sample")
pdf.setAuthor("Elmam CV")
pdf.setFont("Helvetica-Bold", 24)
pdf.drawString(55, 770, "Sample Applicant")
pdf.setFont("Helvetica", 12)
for y, line in zip(range(735, 560, -25), [
    "Synthetic demonstration - no personal information",
    "candidate@example.invalid",
    "Junior Accountant",
    "Experience: Reconciled purchase invoices with expense records.",
    "Education: Sample qualification, 2025",
    "Skills: Excel, reporting, communication",
]):
    pdf.drawString(55, y, line)
pdf.save()
text = "".join(page.extract_text() for page in PdfReader(filename).pages)
assert "Synthetic demonstration" in text
assert "candidate@example.invalid" in text
print("Created and verified synthetic sample PDF.")
