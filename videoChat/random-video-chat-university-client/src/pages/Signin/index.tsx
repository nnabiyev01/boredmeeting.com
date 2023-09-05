import React, { useState, useEffect } from "react"
import { Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { API_URL } from "src/helpers/constants"
import { USER_DETAILS } from "src/helpers/StorageHelper"
import secureLocalStorage from "react-secure-storage"

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prevState) => ({ ...prevState, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Send data to the backend
      const response = await axios.post(API_URL + "/user/login", formData)

      // Clear form data
      setFormData({
        email: "",
        password: "",
      })

      // Navigate to a new page after successful registration
      secureLocalStorage.setItem(
        USER_DETAILS,
        JSON.stringify(response.data.result)
      )
      navigate("/")
    } catch (error) {
      // Handle error response
      console.log(error)
      toast.dismiss()
      const { response } = error
      if (response?.status === 404) {
        return toast.error("No user found with this email")
      }
      if (response?.status === 400) {
        return toast.error("Invalid email or password")
      }
      toast.error("Something went wrong")
    }
  }

  return (
    <Row className="justify-content-center align-items-center">
      <Col md={6} sm={12}>
        <Form className="container" onSubmit={handleSubmit}>
          <h1>Log In</h1>

          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label for="password">Password</Label>
            <Input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <Button color="primary" type="submit">
            Login
          </Button>
          <h6>OR</h6>
          <Button
            color="primary"
            type="button"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </Form>
      </Col>
    </Row>
  )
}

export default LoginForm
