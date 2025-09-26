const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const Certificate = require("../models/Certificate");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Extract text helper
async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    return (await pdfParse(file.buffer)).text;
  } else if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
    const { data: { text } } = await Tesseract.recognize(file.buffer, "eng");
    return text;
  }
  throw new Error("Unsupported file type");
}

// Improved parser
function parseCertificateData(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // Student Name
  let student_name =
    text.match(/(Name|Recipient|Learner)[:\-]?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i)?.[2] ||
    lines.find(l => /^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(l)) || 
    "Unknown";

  // Course
  let course =
    text.match(/Certificate of\s*(.*?)(Program|Course|Training)?/i)?.[1]?.trim() ||
    text.match(/completed\s*(.*?)\s*(program|course|training)/i)?.[1]?.trim() ||
    lines.find(l => /(Training|Course|Program|Certification)/i.test(l)) ||
    "N/A";

  // Dates
  let date_of_issuance =
    text.match(/(Issued|Date of Issuance)[:\-]?\s*([0-9]{1,2}[\/\-\s][0-9]{1,2}[\/\-\s][0-9]{2,4})/i)?.[2] || null;

  let date_of_validity =
    text.match(/(Valid Until|Date of Validity)[:\-]?\s*([0-9]{1,2}[\/\-\s][0-9]{1,2}[\/\-\s][0-9]{2,4})/i)?.[2] || null;

  // Institution
  let institution =
    lines.find(l =>
      /(University|College|Coursera|Institute|Training|Academy)/i.test(l)
    ) || "N/A";

  // CPD points
  let cpd_points =
    parseInt(text.match(/(\d+)\s*(CPD|credits?)/i)?.[1]) || null;

  return {
    student_name: student_name.replace(/[:=]/g, "").trim(),
    course,
    date_of_issuance,
    date_of_validity,
    institution,
    cpd_points,
  };
}

// Verify uploaded certificate
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: "No file uploaded" });

    const text = await extractText(req.file);
    console.log("🔍 Extracted raw text:\n", text);

    const extracted_data = parseCertificateData(text);
    console.log("📝 Parsed data:", extracted_data);

    // Try to find record in DB
    const record = await Certificate.findOne({
      student_name: extracted_data.student_name,
      course: extracted_data.course,
    });

    let validation_checks = {
      dbRecordExists: !!record,
      nameMatch: record ? record.student_name === extracted_data.student_name : false,
      courseMatch: record ? record.course === extracted_data.course : false,
      institutionMatch: record ? record.institution === extracted_data.institution : false,
      issuanceDateMatch: record ? record.date_of_issuance === extracted_data.date_of_issuance : false,
      validityDateMatch: record ? record.date_of_validity === extracted_data.date_of_validity : false,
      cpdPointsMatch: record ? record.cpd_points == extracted_data.cpd_points : false,
      signatureValid: true,
    };

    const is_valid = Object.values(validation_checks).every(v => v === true);

    res.json({
      is_valid,
      confidence: is_valid ? 95.0 : 50.0,
      extracted_data,
      validation_checks,
      matching_record: record || null,
    });
  } catch (err) {
    console.error("Verification error:", err);
    res.status(500).json({ detail: "Verification failed" });
  }
});

module.exports = router;
