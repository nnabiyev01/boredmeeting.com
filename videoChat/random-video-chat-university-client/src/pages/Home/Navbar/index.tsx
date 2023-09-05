import "./style.css"
import useUserData from "src/hooks/useUserData"
import { USER_DETAILS } from "src/helpers/StorageHelper"
import secureLocalStorage from "react-secure-storage"
import { useNavigate } from "react-router-dom"
import { Button } from "reactstrap"
export default function Navbar() {
  const userData = useUserData()
  const navigate = useNavigate()

  return (
    <nav
      id="navbar"
      className="justify-content-between align-items-center bg-light shadow p-3  rounded"
    >
      <h2 className="lobster">Idea Chat</h2>
      <small className="text-dark fw-bold">
        {userData.email} {" - "}
        <small>{userData.university.name}</small>
      </small>

      <Button
        color="danger"
        outline
        type="button"
        onClick={() => {
          secureLocalStorage.removeItem(USER_DETAILS)
          navigate("/login")
        }}
      >
        Logout
      </Button>
    </nav>
  )
}
