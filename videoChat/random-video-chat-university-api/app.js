const express = require("express")
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://918d-103-7-60-176.ngrok-free.app",
    ],
  },
})
const bodyParser = require("body-parser")
const admin = require("firebase-admin")
const port = process.env.PORT || 4000
const cors = require("cors")
const mongoose = require("mongoose")
const User = require("./Models/UserStatus.model.js")
const Room = require("./Models/Rooms.js")
const { EventEmitter } = require("stream")
const { Mutex } = require("async-mutex")

const mutex = new Mutex()

app.use(
  cors({
    origin: "https://d862-103-7-60-176.ngrok-free.app",
  })
)

io.on("connection", (socket) => {
  socket.on("joinRoom", (data) => joinRoom(socket, data))

  socket.on("disconnect", async () => {
    console.log("User disconnected")
    if (!socket.roomId) return

    // Set the user status to unavailable and delete the room
    await updateUserStatus(socket.userId, "unavailable")
    await deleteRoom(socket.roomId)
    socket.to(socket.roomId).emit("reset")
  })

  socket.on("offer", (offer) => {
    socket.to(socket.roomId).emit("process-offer", offer)
  })

  socket.on("answer", (offer) => {
    socket.to(socket.roomId).emit("process-answer", offer)
  })

  socket.on("skip", async () => {
    console.log("User skipped")
    if (!socket.roomId) return

    // Set the user status to unavailable and delete the room
    await updateUserStatus(socket.userId, "unavailable")
    await deleteRoom(socket.roomId)
    socket.to(socket.roomId).emit("reset")
    socket.emit("reset")
  })

  socket.on("send_message", (msg) => {
    console.log(msg)
    socket.to(socket.roomId).emit("new_message", msg)
    socket.emit("new_message", msg)
  })
})

async function joinRoom(socket, { userId, university, isGlobal }) {
  console.log(`${new Date()}: The user ${userId} is searching for a room...`)
  if (socket.roomId) {
    await updateUserStatus(socket.userId, "unavailable")
    await deleteRoom(socket.roomId)
  }

  await mutex.runExclusive(async () => {
    var room

    const userMeetingStatus = await isUserInMeeting(userId)
    console.log("userMeetingStatus", userMeetingStatus)
    if (university) {
      // Connect same university people
      const availableRooms = await Room.find({
        user2: null,
        university: university,
      })
      if (availableRooms.length === 0) {
        room = await Room.create({
          user1: userId,
          university: university,
          isGlobal: false,
        })

        socket.join(room.id)
        socket.emit("waiting")
      } else {
        const randomRoom = Math.floor(Math.random() * availableRooms.length)
        room = availableRooms[randomRoom]
        room.user2 = userId
        await room.save()

        socket.join(room.id)
        socket.to(room.id).emit("user_joined")
      }
    } else if (isGlobal) {
      // Go global - Connect with people from all universities
      const availableRooms = await Room.find({ user2: null, isGlobal: true })
      if (availableRooms.length === 0) {
        room = await Room.create({
          user1: userId,
          isGlobal: true,
        })

        socket.join(room.id)
        socket.emit("waiting")
      } else {
        const randomRoom = Math.floor(Math.random() * availableRooms.length)
        room = availableRooms[randomRoom]
        room.user2 = userId
        await room.save()

        socket.join(room.id)
        socket.to(room.id).emit("user_joined")
      }
    }

    socket.roomId = room?.id
    socket.userId = userId

    console.log(
      `${new Date()}: The user ${userId} joined the room [${room?.id}]`
    )

    // Update user status to available
    await updateUserStatus(userId, "available")

    // Send the number of available users in the same university to the user
    const availableUniversityUsers = await getAvailableUniversityUsers(
      university,
      userId
    )
    socket.emit("available_university_users", availableUniversityUsers)

    // Send the number of available global users to the user
    const availableGlobalUsers = await getAvailableGlobalUsers(userId)
    socket.emit("available_global_users", availableGlobalUsers)
  })
}

async function updateUserStatus(userId, status) {
  await User.updateOne({ email: userId }, { status: status })
}

async function isUserInMeeting(userId) {
  // Simulated function to check if the user is in a meeting
  // Replace with your actual implementation to check user meeting status
  // For now, let's assume a constant value for demonstration purposes
  return false
}

async function getAvailableUniversityUsers(university, userId) {
  const count = await Room.countDocuments({
    university: university,
    user2: null,
  })
  return count
}

async function getAvailableGlobalUsers(userId) {
  const count = await Room.countDocuments({
    isGlobal: true,
    user2: null,
  })
  return count
}

function deleteRoom(roomId) {
  return Room.findByIdAndDelete(roomId)
}

module.exports = app // Export the app for server.js
