import axios from 'axios'

export const API_BASE_URL = 'https://exam-api.dev.mis.cmu.ac.th/api'

const http = axios.create({
    baseURL: API_BASE_URL,
    timeout: 15000,
})

export default http