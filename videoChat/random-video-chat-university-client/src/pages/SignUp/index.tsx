import React, { useState, useEffect } from "react"
import { Form, FormGroup, Label, Input, Button, Row, Col } from "reactstrap"
import axios from "axios"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"
import { API_URL } from "src/helpers/constants"
import { USER_DETAILS } from "src/helpers/StorageHelper"
import secureLocalStorage from "react-secure-storage"

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    university: "", // Default value
    age: "",
    major: "",
  })

  const [universities, setUniversities] = useState([])

  const getUniversities = async () => {
    try {
      const response = await axios.get(API_URL + "/universities")
      setUniversities(response.data.result)
    } catch (error) {
      // window.location.reload()
    }
  }

  useEffect(() => {
    getUniversities()
  }, [])

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData((prevState) => ({ ...prevState, [id]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Send data to the backend
      const response = await axios.post(API_URL + "/user/register", formData)

      toast.success("User registered successfully")

      // Clear form data
      setFormData({
        name: "",
        password: "",
        university: "", // Reset to default value
        age: "",
        major: "",
      })

      // Navigate to a new page after successful registration
      secureLocalStorage.setItem(
        USER_DETAILS,
        JSON.stringify(response.data.result)
      )
      navigate("/")
    } catch (error) {
      // Handle error response
      const { message } = error.response.data
      toast.error(message)
    }
  }

  return (
    <Row className="justify-content-center align-items-center">
      <Col md={6} sm={12}>
        <Form className="container" onSubmit={handleSubmit}>
          <h1>Registration</h1>
          <FormGroup>
            <Label for="name">Name</Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

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
          <FormGroup>
            <Label for="university">University</Label>
            <Input
              type="select"
              id="university"
              value={formData.university}
              onChange={handleChange}
            >
              <option value={""} disabled>
                Select University
              </option>
              {universities.map((university) => (
                <option key={university._id} value={university._id}>
                  {
                    // Camel Case
                    university.name.charAt(0).toUpperCase() +
                      university.name.slice(1).toLowerCase()
                  }
                </option>
              ))}
              {/* Add more universities */}
            </Input>
          </FormGroup>
          <FormGroup>
            <Label for="age">Age</Label>
            <Input
              type="number"
              id="age"
              value={formData.age}
              onChange={handleChange}
            />
          </FormGroup>
          <FormGroup>
            <Label for="major">Major</Label>
            <Input
              type="text"
              id="major"
              value={formData.major}
              onChange={handleChange}
            />
          </FormGroup>
          <Button color="primary" type="submit">
            Register
          </Button>
        </Form>
      </Col>
    </Row>
  )
}

export default RegistrationForm
