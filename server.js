const express = require('express');
const path = require('path');
const router = require("./routes/router")
const expressSession = require('express-session');
const cookieParser = require("cookie-parser");
require('dotenv').config();

const PORT = process.env.PORT || 8080
const app = express()

app.use(express.urlencoded({extended:false}))

app.use(cookieParser())
app.use(expressSession({secret: process.env.SESSION_SECRET, resave:false, saveUninitialized:false}))

app.use(express.static(path.join(__dirname, "public")))
app.set("view engine", "ejs")

app.use(router)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
})