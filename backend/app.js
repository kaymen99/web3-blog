const express = require("express")
const cors = require("cors");
const bodyParser = require("body-parser")
const fs = require('fs');
const { save, get } = require("./utils");


// create our express app
const app = express()

// middleware
app.use(bodyParser.json())
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', (request, response) => {
    var posts = get()
    response.send(posts)
})

app.post("/save-post", (request, response) => {
    const { id, post } = request.body
    save(String(id), post)
    console.log(`Post of id : ${id} saved with hash ${post}`)
})


//start server
app.listen(3001, () => {
    console.log("listeniing at port:3001")
}) 