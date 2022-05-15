const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const connectDB = require("./db");

const app = express();

const port = 4002;

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, OPTIONS, DELETE');
    next();
  });

app.use(morgan("dev"));

app.use(helmet());

connectDB();


app.listen(port, ()=>{
    console.log(`API server listening on ${port}`);
});