const mongoose = require("mongoose")

// User model
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  university: {
    type: String,
  },
  topics: {
    type: String, // Science, Programming
    default: null,
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
  meetingHistory: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ["available", "unavailable"],
    default: "unavailable",
  },
})

const User = mongoose.model("User", userSchema)

module.exports = User
