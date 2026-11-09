import axios from "axios"
import { auth } from "../firebase/firebase.js"

const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URI,
})

api.interceptors.request.use(async (config) => {
    const currentUser = auth.currentUser

    if (currentUser) {
        const idtoken = await currentUser.getIdToken()

        config.headers.Authorization = `Bearer ${idtoken}`
    }

    return config
})

export default api