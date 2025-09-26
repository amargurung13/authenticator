const express = require("express");
const router = express.Router();
const Certificate = require("../models/Certificate");
const User = require("../models/User");

// GET /admin/stats → total certificates, users
router.get("/stats", async (req, res) => {
  try {
    const totalCertificates = await Certificate.countDocuments();
    const totalUsers = await User.countDocuments();

    res.json({
      total_certificates: totalCertificates,
      total_users: totalUsers
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

// GET /admin/activity → recent certificate additions
router.get("/activity", async (req, res) => {
  try {
    const recentCertificates = await Certificate.find()
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = recentCertificates.map(cert => ({
      action: "Certificate Added",
      user: cert.student_name,
      details: `${cert.course} (${cert.roll_number})`,
      timestamp: cert.createdAt
    }));

    res.json(activity);
  } catch (err) {
    console.error("Admin activity error:", err);
    res.status(500).json({ detail: "Server error" });
  }
});

// Reset database (only for admin)
router.delete("/reset", async (req, res) => {
  try {
    // Clear collections
    await Certificate.deleteMany({});
    await User.deleteMany({ user_type: { $ne: "admin" } }); // optional: keep admins

    res.json({ message: "Database reset successfully" });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ detail: "Failed to reset database" });
  }
});


module.exports = router;
