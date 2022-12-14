const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const db = require("../db/db");

const router = express.Router();

// db.getConnection((err, connection) => {
//   if (err) throw err;
//   console.log("DB connected successful: " + connection.threadId);
// });

router.post("/user/create", async (req, res) => {
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

router.post("user/login", (req, res) => {
  const user = req.body.name;
  const password = req.body.password;
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "Select * from userTable where user = ?";
    const search_query = mysql.format(sqlSearch, [user]);
    await connection.query(search_query, async (err, result) => {
      connection.release();

      if (err) throw err;
      if (result.length == 0) {
        console.log("--------> User does not exist");
        res.sendStatus(404);
      } else {
        const hashedPassword = result[0].password;

        if (await bcrypt.compare(password, hashedPassword)) {
          console.log("---------> Login Successful");
          res.send(`${user} is logged in!`);
        } else {
          console.log("---------> Password Incorrect");
          res.send("Password incorrect!");
        }
      }
    });
  });
});

router.get("/user/:id", (req, res) => {
  res.send("hi");
});

router.get("/donors", (req, res) => {
  res.send("hi");
});

router.get("/receivers", (req, res) => {
  res.send("hi");
});

module.exports = router;
