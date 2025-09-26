const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
const certRoutes = require("./routes/certificates");
const adminRoutes = require("./routes/admin");
const institutionRoutes = require("./routes/institution");
const verifyRoutes = require("./routes/verify");  // ✅ added here

// Use routes
app.use("/auth", authRoutes);
app.use("/certificates", certRoutes);
app.use("/admin", adminRoutes);
app.use("/institution", institutionRoutes);
app.use("/verify", verifyRoutes);  // ✅ added here

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
