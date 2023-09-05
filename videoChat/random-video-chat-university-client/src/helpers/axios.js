import axios from "axios"
import secureLocalStorage from "react-secure-storage"
import { USER_DETAILS } from "./StorageHelper"

// export const API_URL = "https://server.savebysharing.com"
export const API_URL = "http://localhost:4000"
// export const API_URL = "https://rich-pear-gazelle-gear.cyclic.app"

const token = secureLocalStorage.getItem(USER_DETAILS)
  ? JSON.parse(secureLocalStorage.getItem(USER_DETAILS)).token
  : null

axios.defaults.baseURL = API_URL
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

export default axios
