const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const bd = require('./bd');
const config = require('./config');
const router = require('./network/router');

bd(config.DB_URL);

const app = express();

app.use(session({
  secret: 'cerebrolandia123',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static(path.join(__dirname, 'public')));
app.use(express.json());

router(app);

app.listen(config.PORT, () => {
  console.log(`La aplicación está escuchando en http://${config.HOST}:${config.PORT}`);
});

