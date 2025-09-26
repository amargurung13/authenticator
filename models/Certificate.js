const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    student_name: { type: String, required: true },
    roll_number: { type: String }, // 🔹 not required
    course: { type: String },
    year_of_passing: { type: Number, default: new Date().getFullYear() }, // 🔹 default current year
    certificate_id: { type: String, unique: true, default: () => `AUTO-${Date.now()}` }, // 🔹 auto default
    grade: { type: String, default: "N/A" }, // 🔹 default if missing
    notes: { type: String },
    institution: { type: String, default: "Unknown" },
    status: { type: String, default: "valid" },
    date_of_issuance: { type: String, default: null },
    date_of_validity: { type: String, default: null },
    cpd_points: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Certificate", certificateSchema);
