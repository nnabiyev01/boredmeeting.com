import { useState, useEffect } from "react"
import { config } from "../../../config"
import { io } from "socket.io-client"
import { Swal } from "../../SweetAltert"
import { useLanguage } from "../../hooks/useLanguage"
import Navbar from "./Navbar"
import useUserData from "../../hooks/useUserData"

import "./style.css"
import { Badge, Input } from "reactstrap"

export default function Home() {
  const [socket, setSocket] = useState(io(config.server))
  const userData = useUserData()
  const [topics, setTopics] = useState("")

  const [uniOnlineUsers, setUniOnlineUsers] = useState(0)
  const [globalOnlineUsers, setGlobalOnlineUsers] = useState(0)
  const { text } = useLanguage()

  useEffect(() => {
    // Listen for real-time data updates from the backend

    socket.emit("getDataUpdate")

    socket.on("dataUpdateHere", (updatedData) => {
      const status = "available"

      const universityUsers = updatedData.universityUsers.filter(
        (uni) =>
          uni.university === userData?.university.name &&
          uni.status === status &&
          !uni.isGlobal &&
          uni.email !== userData?.email
      )

      const globalUsers = updatedData.globalUsers.filter(
        (uni) =>
          uni.isGlobal && uni.status === status && uni.email !== userData?.email
      )
      setGlobalOnlineUsers(globalUsers.length || 0)

      setUniOnlineUsers(universityUsers.length || 0)
    })

    socket.on("dataUpdate", (updatedData) => {
      const status = "available"

      const universityUsers = updatedData.universityUsers.filter(
        (uni) =>
          uni.university === userData?.university.name &&
          uni.status === status &&
          !uni.isGlobal &&
          uni.email !== userData?.email
      )

      const globalUsers = updatedData.globalUsers.filter(
        (uni) =>
          uni.isGlobal && uni.status === status && uni.email !== userData?.email
      )
      setGlobalOnlineUsers(globalUsers.length || 0)

      setUniOnlineUsers(universityUsers.length || 0)
    })

    // Don't forget to clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect()
    }
  }, [])

  function warning() {
    console.log("Warning Clicked")
    Swal.fire({
      title: (
        <strong className="home-swal-title lobster">{text.Home.careful}</strong>
      ),
      html: (
        <>
          <span className="lexend justify">{text.Home.warning}</span>
          <br />
          <span className="lexend justify">Topics : {topics}</span>
        </>
      ),
      icon: "warning",
      confirmButtonText: <>{text.Home.warningButton}</>,
    }).then((result: any) => {
      if (result.isConfirmed) {
        location.href = topics.trim() ? "/meet?topics=" + topics : "/meet"
      }
    })
  }

  function warningGlobal() {
    Swal.fire({
      title: (
        <strong className="home-swal-title lobster">{text.Home.careful}</strong>
      ),
      html: (
        <>
          <span className="lexend justify">{text.Home.warning}</span>
          <br />
          <span className="lexend justify">Topics : {topics}</span>
        </>
      ),
      icon: "warning",
      confirmButtonText: <>{text.Home.warningButton}</>,
    }).then((result: any) => {
      if (result.isConfirmed) {
        location.href = topics
          ? "/meet-global?topics=" + topics
          : "/meet-global"
      }
    })
  }

  return (
    <div id="home">
      <div className="foreground">
        <Navbar />

        <div className="d-flex justify-content-center align-items-center w-100 h-80">
          <div>
            <h1 className="lobster">{text.Home.title}</h1>
            <p className="lexend">{text.Home.subtitle}</p>
            <Input
              className="mt-2 "
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="Enter the topics in which you're interested (Comma Separated)"
            />
            <br />

            <button className="start lobster me-lg-4" onClick={warning}>
              {text.Home.start}
            </button>
            <button
              className="start lobster bg-success"
              onClick={warningGlobal}
            >
              Go Global
            </button>
          </div>
        </div>
        <div className="d-flex justify-content-between py-2 px-4">
          <Badge
            color={uniOnlineUsers ? "success" : "warning"}
            className="online-info"
          >
            {uniOnlineUsers
              ? `University Users : ${uniOnlineUsers}`
              : "No Users are available from your university"}
          </Badge>
          <Badge
            color={globalOnlineUsers ? "success" : "warning"}
            className="online-info"
          >
            {globalOnlineUsers
              ? `Global Users : ${globalOnlineUsers}`
              : "No Global Users are available"}
          </Badge>
        </div>
      </div>
    </div>
  )
}
