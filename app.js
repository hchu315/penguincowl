// creates a new Express Server
const express = require("express");
const app = express()

const mongoose = require("mongoose");
const db = require ("./config/keys").mongoURI;

mongoose
  .connect(db, { 
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch(err => console.log(err));


// run server at this port for heroku deployment or @ port 5000
const port = process.env.PORT || 5000;

// create a basic route to render info
app.get("/", (req, res) => res.send("Boom!"));

// start a socket to listen for connections on the path
app.listen(port, () => console.log(`Server is running on port ${port}`));


