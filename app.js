const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/Project-8');
// mongoose.connect("mongodb+srv://nijasbinabbas:gGPV60STw86bkmok@cluster0.sgvgomu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

const express = require("express");
const app = express();

const session = require("express-session");
const path = require('path');
require("dotenv").config();
const cookieParser = require("cookie-parser");

const userRoute = require("./route/userRoute");
const adminRoute = require('./route/adminRoute');


const nocache = require('nocache');
const passport = require('passport');

// Use the nocache middleware before defining routes
app.use(nocache());

// For session
app.use(session({
    secret: "hai",
    resave: false,
    saveUninitialized: false
}));

//for google verification

app.use(passport.initialize())
app.use(passport.session())

// For cookie
app.use(cookieParser());

// For static files
app.use(express.static(path.join(__dirname, 'public')));

// User route 
app.use('/', userRoute);

// Admin route
app.use('/admin', adminRoute);

app.listen(3000, () => {
    console.log("Server Created");
});
