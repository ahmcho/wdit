const express = require('express');
const mongoose = require("mongoose");
const passport = require("passport");
const cors = require("cors");

const users = require('./routes/api/users');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false}));

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

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Backend is running on port ${port} !`));
