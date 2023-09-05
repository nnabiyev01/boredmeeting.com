const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_CONNECT, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    console.log("MongoDB Connected")
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message)
    process.exit(1)
  }
}

module.exports = connectDB
