import axios from "axios"
export const axiosInstance = axios.create({
    // nginx
    // ports:
    //   - '3050:80'
    // http://localhost:<PORT_NUMBER_STATED_ON_DOCKER_COMPOSE>/api/
    baseURL: "http://localhost:3050/api/"
})
