const mongoose = require("mongoose")
const roomSchema = new mongoose.Schema({
  user1: {
    type: String, // Use "String" data type for UUID
  },
  user2: {
    type: String, // Use "String" data type for UUID
    default: null,
  },

  university: {
    type: String,
    default: null,
  },
  isGlobal: {
    type: Boolean,
    default: false,
  },
})

const Room = mongoose.model("Room", roomSchema)

module.exports = Room
