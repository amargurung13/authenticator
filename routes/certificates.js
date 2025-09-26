const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const Certificate = require("../models/Certificate");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Extract text from uploaded file
 */
async function extractText(file) {
  if (file.mimetype === "application/pdf") {
    return (await pdfParse(file.buffer)).text;
  } else if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
    const { data: { text } } = await Tesseract.recognize(file.buffer, "eng");
    return text;
  }
  throw new Error("Unsupported file type");
}

/**
 * Parse text to extract certificate fields
 */
function parseCertificateData(text) {
  return {
    student_name: text.match(/Name:\s*(.*)/i)?.[1] || "Unknown",
    roll_number: text.match(/Roll\s*No:\s*(\w+)/i)?.[1] || "N/A",
    course: text.match(/Course:\s*(.*)/i)?.[1] || "N/A",
    grade: text.match(/Grade:\s*(\w+)/i)?.[1] || "N/A",
    institution: text.match(/University|College:\s*(.*)/i)?.[1] || "N/A",
    date_of_issuance: text.match(/Date of Issuance:\s*(.*)/i)?.[1] || null,
    date_of_validity: text.match(/Date of Validity:\s*(.*)/i)?.[1] || null,
    cpd_points: parseInt(text.match(/(\d+)\s*CPD\s*points/i)?.[1]) || null,
  };
}

/**
 * @route POST /certificates/add
 * Add certificate manually (from JSON body)
 */
router.post("/add", async (req, res) => {
  try {
    const cert = new Certificate(req.body);
    await cert.save();
    res.json({ message: "Certificate added successfully", cert });
  } catch (err) {
    console.error("Add certificate error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

/**
 * @route POST /certificates/upload
 * Upload a certificate (PDF/Image), parse & save to DB
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ detail: "No file uploaded" });

    // Extract & parse
    const text = await extractText(req.file);
    const certData = parseCertificateData(text);

    // Save to DB
    const cert = new Certificate(certData);
    await cert.save();

    res.json({ message: "Certificate uploaded & parsed successfully", cert });
  } catch (err) {
    console.error("Upload certificate error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

/**
 * @route GET /certificates
 * Fetch all certificates
 */
router.get("/", async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 });
    res.json(certificates);
  } catch (err) {
    console.error("Fetch certificates error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

module.exports = router;
