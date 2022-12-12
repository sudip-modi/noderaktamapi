require("dotenv").config();
const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

const db = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
});

db.getConnection((err, connection) => {
  if (err) throw err;
  console.log("DB connected successful: " + connection.threadId);
});

app.post("/user/create", async (req, res) => {
  console.log(req);
  const user = req.body.name;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  db.getConnection(async (err, connection) => {
    if (err) throw err;

    const sqlSearch = "select * from usertable where user = ?";
    const search_query = mysql.format(sqlSearch, [user]);

    const sqlInsert = "insert into usertable values (0,?,?)";
    const insert_query = mysql.format(sqlInsert, [user, hashedPassword]);

    await connection.query(search_query, async (err, result) => {
      if (err) throw err;

      console.log(result.length);

      if (result.length != 0) {
        connection.release();
        res.sendStatus(409);
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();

          if (err) throw err;

          console.log(result.insertId);
          res.sendStatus(201);
        });
      }
    });
  });
});

const port = process.env.PORT;

app.listen(port, () => console.log(`Server Started on port ${port}...`));
