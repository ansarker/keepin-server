require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require("./middleware/error");

/**
 * -------- Mongodb Connection --------
 */
const { connection } = require('./config/database');
connection;

const port = process.env.PORT || 8888;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

/**
 * -------- ROUTES --------
 */
const userRoutes = require('./routes/auth/routes.user');
const passwordRoutes = require('./routes/routes.password');
const cardRoutes = require('./routes/routes.card');

app.get('/', (req, res) => {
  res.status(200).send("<a href='/auth/signin'>Signin</a><br/><a href='/auth/signup'>Signup</a>")
})

app.use('/auth', userRoutes);
app.use('/passwords', passwordRoutes);
app.use('/cards', cardRoutes);
app.use(errorHandler);

/**
 * -------- SERVER --------
 */
const listener = app.listen(port, () => {
  console.log(`Listening to http://localhost:${port}`);
});

process.on("unhandledRejection", (err, promise) => {
  console.log('Error ', err);
  listener.close(() => process.exit(1))
})