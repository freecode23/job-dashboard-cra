// base utility
require("dotenv").config();
const path = require('path');
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

console.log("backend env=", process.env.SERP_API);

const jobsRoute = require("./routes/jobs");
app.use("/jobs", jobsRoute);


const PORT_CONTAINER = 3001
const PORT = process.env.PORT || PORT_CONTAINER
app.listen(PORT, function () {
    // display port number on container:
    console.log(`Running on port ${PORT}`)
})
