import { USER_DETAILS } from "src/helpers/StorageHelper"
import React from "react"
import secureLocalStorage from "react-secure-storage"

const useUserData = () => {
  const user = JSON.parse(secureLocalStorage.getItem(USER_DETAILS))
  return user
}

export default useUserData
