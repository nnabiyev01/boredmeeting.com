const connectDB = require("./db")
connectDB() // Call the function to connect to MongoDB

// External Module
const cors = require("cors")
const dotenv = require("dotenv")
const express = require("express")
const User = require("./Models/UserStatus.model.js")
const Room = require("./Models/Rooms.js")
const http = require("http") // Added to create http server
const socketIO = require("socket.io") // Added to use socket.io
const { Mutex } = require("async-mutex")

const mutex = new Mutex()
const app = express()
// Internal Module
const userRoute = require("./Routes/user.route.js")
const universityRouter = require("./Routes/universities")
require("./app") // Import the app.js file

// Using Middleware
app.use(express.json())
app.use(cors())
dotenv.config()

// Main Routes
app.use("/user", userRoute)
app.use("/universities", universityRouter)

// Create the http server using the Express app
const server = http.createServer(app)

// Use socket.io on the server
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://918d-103-7-60-176.ngrok-free.app",
    ],
  },
})

io.on("connection", (socket) => {
  socket.on("joinRoom", (data) => joinRoom(socket, data))

  socket.on("getDataUpdate", async () => {
    const globalUsers = await User.find({
      isGlobal: true,
    })
    const universityUsers = await User.find({
      isGlobal: false,
    })
    io.emit("dataUpdateHere", {
      globalUsers,
      universityUsers,
    })
  })

  const changeStream = User.watch()

  changeStream.on("change", async (change) => {
    const globalUsers = await User.find({
      isGlobal: true,
    })
    const universityUsers = await User.find({
      isGlobal: false,
    })
    io.emit("dataUpdate", {
      globalUsers,
      universityUsers,
    })
  })

  socket.on("disconnect", async ({ email }) => {
    console.log("User disconnected")
    if (!socket.roomId) return
    // Set the user status to unavailable and delete the room
    await updateUserStatus(socket.email, "unavailable")
    const user = await User.findOne({ email: socket.email })
    user.meetingHistory = []
    await user.save()

    await deleteRoom(socket.roomId)
    socket.to(socket.roomId).emit("reset")
  })

  socket.on("offer", (offer) => {
    socket.to(socket.roomId).emit("process-offer", offer)
  })

  socket.on("checkRoomId", () => {
    console.log("Checking room id", socket.roomId)
  })

  socket.on("answer", (offer) => {
    socket.to(socket.roomId).emit("process-answer", offer)
  })

  socket.on("skip", async () => {
    console.log("User skipped", socket.roomId)

    if (!socket.roomId) return

    // Set the user status to unavailable and delete the room
    await updateUserStatus(socket.email, "available")
    await deleteRoom(socket.roomId)
    socket.to(socket.roomId).emit("reset")
    socket.emit("reset")
  })

  socket.on("send_message", (msg) => {
    socket.to(socket.roomId).emit("new_message", msg)
    socket.emit("new_message", msg)
  })
})

async function joinRoom(socket, { email, university, isGlobal, topics }) {
  // console.log(`${new Date()}: The user ${email} is searching for a room...`)

  // Set the user status as "available" when they connect to the socket

  // console.log("socket.roomId", socket.roomId)
  if (socket.roomId) {
    await deleteRoom(socket.roomId)
  }

  await mutex.runExclusive(async () => {
    var room

    if (university && !isGlobal) {
      // Connect same university people
      const availableRooms = await Room.find({
        user2: null,
        university: university,
      })
      if (availableRooms.length === 0) {
        room = await Room.create({
          user1: email,
          topics,
          university: university,
          isGlobal: false,
        })
        await room.save()

        await updateUserStatus(email, "available", university, false, topics)
        socket.join(room._id.toString())
        socket.emit("waiting")
      } else {
        const roomsToJoin = availableRooms.filter(
          (room) => !room.user1.includes(email)
        )
        if (roomsToJoin.length === 0) return socket.emit("reset")
        const randomRoom = Math.floor(Math.random() * roomsToJoin.length)
        room = availableRooms[randomRoom]

        const user1 = await User.findOne({ email: room?.user1 })
        var user2 = await User.findOne({ email: email })

        if (
          user1 &&
          user1?.meetingHistory?.length &&
          user1?.meetingHistory?.includes(email)
        ) {
          return socket.emit("skip")
        }

        if (
          user2 &&
          user2?.meetingHistory?.length &&
          user2?.meetingHistory?.includes(user1?.email)
        ) {
          return socket.emit("skip")
        }

        room.user2 = email
        await room.save()

        await updateUserStatus(email, "unavailable", university, false, topics)
        await updateUserStatus(room.user1, "unavailable", university)

        user2 = await User.findOne({ email: email })

        user1.meetingHistory.push(email)
        user2.meetingHistory.push(user1.email)
        await user1.save()
        await user2.save()

        socket.join(room._id.toString())
        socket.emit("topics", topics + " " + user1.topics)
        io.to(room._id.toString()).emit(
          "user-joined",
          topics + " " + user1.topics
        )
      }
    } else if (isGlobal) {
      // Go global - Connect with people from all universities
      const availableRooms = await Room.find({ user2: null, isGlobal: true })
      if (availableRooms.length === 0) {
        room = await Room.create({
          user1: email,
          isGlobal: true,
        })

        await updateUserStatus(email, "available", null, true)
        socket.join(room._id.toString())
        socket.emit("waiting")
      } else {
        const roomsToJoin = availableRooms.filter(
          (room) => !room.user1.includes(email)
        )
        if (roomsToJoin.length === 0) return socket.emit("reset")
        const randomRoom = Math.floor(Math.random() * roomsToJoin.length)
        room = availableRooms[randomRoom]
        room.user2 = email
        await room.save()

        await updateUserStatus(email, "unavailable", university, true)
        await updateUserStatus(room.user1, "unavailable", university, true)
        socket.join(room._id.toString())
        socket.to(room._id.toString()).emit("user-joined")
      }
    }

    socket.roomId = room?._id.toString()
    socket.email = email
  })
}

async function updateUserStatus(
  email,
  status,
  university = "",
  isGlobal = false,
  topics = ""
) {
  const user = await User.findOne({ email: email })
  if (user) {
    user.status = status
    if (university) {
      user.university = university
    }
    user.topics = topics ? topics : user.topics
    user.isGlobal = isGlobal ? true : false
    await user.save()
  } else {
    await User.create({
      email: email,
      university: university,
      status: status,
      isGlobal: isGlobal ? true : false,
      topics: topics,
    })
  }
}

function deleteRoom(roomId) {
  return Room.findByIdAndDelete(roomId)
}

// Start the server
const PORT = process.env.PORT || 4000
server.listen(PORT, () => {
  console.log(`Server Running On Port ${PORT}`)
})
