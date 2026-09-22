const express = require('express');
const serverApp = require('../server');

const app = express();
app.use(serverApp);

module.exports = app;
