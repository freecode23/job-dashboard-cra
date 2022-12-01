// base utility
require("dotenv").config();
const path = require('path');
const express = require('express')
const cors = require('cors')
const app = express()
app.use(cors())

console.log("backend env=", process.env.SERP_API);
app.get('/', (req, res) => {
    // access from browser on http://localhost:3050/api/
    res.send('Hi There')
});

app.get('/values', (req, res) => {
    // access from browser on http://localhost:3050/api/values
    res.send('This is a value')
});


const PORT_CONTAINER = 3001
const PORT = process.env.PORT || PORT_CONTAINER
app.listen(PORT, function () {
    // display port number on container:
    console.log(`Running on port ${PORT}`)
})
