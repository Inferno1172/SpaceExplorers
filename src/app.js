// ==================================================
// IMPORTS AND APP SETUP
// ==================================================
const express = require("express");
const app = express();


// enable parsing JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//////////////////////////////////////////////////////
// SETUP STATIC FILES
//////////////////////////////////////////////////////
app.use(express.static('public'));


// ==================================================
// ROUTES
// ==================================================
const mainRoutes = require("../src/routes/mainRoutes");
app.use("/api", mainRoutes);


// ==================================================
// EXPORT APP
// ==================================================
module.exports = app;

