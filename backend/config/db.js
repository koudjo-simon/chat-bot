const mysql = require("mysql");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cs_bot_db",
});

connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion : " + err.stack);
    return;
  }
  console.log("Connecté en tant que id " + connection.threadId);
});

module.exports = connection;
