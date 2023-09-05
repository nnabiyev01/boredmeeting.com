import { USER_DETAILS } from "src/helpers/StorageHelper"
import React from "react"
import { Navigate } from "react-router-dom"
import secureLocalStorage from "react-secure-storage"

const Authmiddleware = (props) => {
  if (!secureLocalStorage.getItem(USER_DETAILS)) {
    return <Navigate to={{ pathname: "/login" }} />
  }
  return <React.Fragment>{props.children}</React.Fragment>
}

export default Authmiddleware
