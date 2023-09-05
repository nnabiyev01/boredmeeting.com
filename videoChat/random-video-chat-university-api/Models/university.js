const mongoose = require("mongoose")

// User model
const uniSchema = new mongoose.Schema({
  latitude: {
    type: String,
  },
  longitude: {
    type: String,
  },
  name: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  alias: {
    type: String,
  },
})

const University = mongoose.model("University", uniSchema)

module.exports = University
