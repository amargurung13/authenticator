const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");

// GET /institution/stats → count certificates
router.get("/stats", async (req, res) => {
  try {
    const totalCertificates = await Certificate.countDocuments();
    res.json({
      total_certificates: totalCertificates
    });
  } catch (err) {
    console.error("Institution stats error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

module.exports = router;
