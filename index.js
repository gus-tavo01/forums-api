require('dotenv').config();
const express = require('express');
const cors = require('cors');
const controllers = require('./controllers');
const database = require('./config/database');
const configureAuth = require('./config/auth');

const port = process.env.PORT || 5000;
const app = express();

// configuration
configureAuth();
database.connect();

// initialize middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(controllers);

app.listen(port);
