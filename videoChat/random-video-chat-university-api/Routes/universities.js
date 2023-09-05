const express = require("express")
const University = require("../Models/university")
const universityRouter = express.Router()

const getUniversities = async (req, res) => {
  try {
    const universities = await University.find()
    res.status(200).json({
      result: universities,
      msg: "Successfully Viewed Universities",
    })
  } catch (err) {
    res.status(500).json({
      msg: "Server Error",
      err: err,
    })
  }
}

universityRouter.get("/", getUniversities)

module.exports = universityRouter
