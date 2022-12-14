require("dotenv").config();
const express = require("express");
const db = require("./db/db");
const userRouter = require("./routers/user");

// check db connection
db.getConnection((err, connection) => {
  if (err) throw err;
  console.log("DB connected successful: " + connection.threadId);
});

// the app
const app = express();
// enable json
app.use(express.json());
// user routes
app.use(userRouter);

// specify port
const port = process.env.PORT;

// listen for port
app.listen(port, () => console.log(`Server Started on port ${port}...`));
