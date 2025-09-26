const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

async function resetDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await mongoose.connection.dropDatabase();
    console.log("✅ Database dropped successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("❌ Error resetting DB:", err);
  }
}

resetDB();
