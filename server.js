const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));  

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

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB error:", err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
