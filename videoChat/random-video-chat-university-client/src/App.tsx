import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home"
import Meet from "./pages/Meet"
import Signup from "./pages/SignUp"
import Signin from "./pages/Signin"
import AuthMiddleware from "src/routes/authRoute.jsx"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MeetGlobal from "./pages/MeetGlobal"

function App() {
  return (
    <>
      <ToastContainer />

      <Routes>
        <Route path="/login" element={<Signin />} />
        <Route path="/register" element={<Signup />} />
        <Route
          path="/"
          element={
            <AuthMiddleware>
              <Home />
            </AuthMiddleware>
          }
        />
        <Route
          path="/meet"
          element={
            <AuthMiddleware>
              <Meet />
            </AuthMiddleware>
          }
        />
        <Route
          path="/meet-global"
          element={
            <AuthMiddleware>
              <MeetGlobal />
            </AuthMiddleware>
          }
        />
      </Routes>
    </>
  )
}

export default App
