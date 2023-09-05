// External Import
const mongoose = require("mongoose")

// Init Schema
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
  },
  major: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    dropDups: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  university: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "University",
  },

  active: {
    type: Boolean,
    required: true,
    default: false,
  },
  verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  randString: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  updated_at: {
    type: Date,
    default: Date.now(),
  },
})

// Model Init
const userModel = new mongoose.model("userModel", userSchema)
userModel.createIndexes()

module.exports = userModel
