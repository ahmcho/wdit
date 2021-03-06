const express = require('express');
const mongoose = require("mongoose");
const passport = require("passport");
const compression = require('compression');
const cors = require("cors");

const users = require('./routes/api/users');
const trips = require('./routes/api/trips');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false}));
app.use(compression());

//Database
const db = process.env.MONGO_URL;

//Connection to Database
mongoose.connect(db,{ 
    useNewUrlParser:true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false 
})
  .then(() => console.log("MongoDB successfully connected"))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport config
require("./config/passport")(passport);

// Routes
app.use("/api/users", users);
app.use("/api/trips", trips);

module.exports = app;