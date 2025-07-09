const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected Successfully"));

const express = require("express");
const app = express();

const session = require("express-session");
const path = require("path");
const cookieParser = require("cookie-parser");

const userRoute = require("./route/userRoute");
const adminRoute = require("./route/adminRoute");

const nocache = require("nocache");
const passport = require("passport");

app.use(nocache());

// For session
app.use(
  session({
    secret: "hai",
    resave: false,
    saveUninitialized: false,
  })
);

//for google verification

app.use(passport.initialize());
app.use(passport.session());


app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

// User route
app.use("/", userRoute);

// Admin route
app.use("/admin", adminRoute);

app.listen(3000, () => {
  console.log("Server Created");
});
