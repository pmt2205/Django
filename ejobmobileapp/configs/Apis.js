import axios from "axios"

const BASE_URL = 'http://192.168.1.3:8000/'

const endpoints = {
    'industries': '/industries/'
}

export default axios.create({
    baseURL: BASE_URL
})