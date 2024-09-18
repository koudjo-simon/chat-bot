const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const { generateResponse } = require("./controllers/index.js");
const { history } = require("./controllers/index.js");

const connection = require("./config/db");

dotenv.config();

const app = express();

const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:4200",
  })
);

const port = process.env.PORT;

app.use(bodyParser.json());

/* Générer la réponse */
app.post("/generate", generateResponse);

/* Générer l'historique */
app.get("/generate", (req, res) => {
  res.send(history);
});

/* Récupérer un utilisateur */
app.get("/user", (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).send("Email est requis");
  }

  const query = "SELECT * FROM appuser WHERE email = ?";
  connection.query(query, [email], (error, results) => {
    if (error) {
      return res.status(500).send("Erreur du serveur");
    }

    if (results.length === 0) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    res.json(results[0]);
  });
});

/* Enregistrer un utilisateur */
app.post("/user", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).send("Nom et email sont requis");
  }

  const query = "INSERT INTO appuser (name, email) VALUES (?, ?)";
  connection.query(query, [name, email], (error, results) => {
    if (error) {
      return res.status(500).send("Erreur du serveur");
    }

    // Récupération de l'ID auto-incrémenté du nouvel utilisateur
    const newUser = {
      id: results.insertId, // ID généré par MySQL
      name,
      email,
    };

    res.status(201).json(newUser);
  });
});

/* Enregister un message */
app.post("/message", (req, res) => {
  const { createdAt, sender, chatId, parts } = req.body;

  if (!createdAt || !sender || !chatId || !parts) {
    return res
      .status(400)
      .send("Date de création, expéditeur, chatId et parties sont requis");
  }

  const query =
    "INSERT INTO message (chatId, createdAt, sender) VALUES (?, ?, ?)";
  connection.query(query, [chatId, createdAt, sender], (error, results) => {
    if (error) {
      return res.status(500).send("Erreur du serveur");
    }

    const messageId = results.insertId;

    const messageParts = parts.map((part) => [part.part, messageId]);
    const queryParts = "INSERT INTO messagepart (part, messageId) VALUES ?";
    connection.query(queryParts, [messageParts], (error) => {
      if (error) {
        return res.status(500).send("Erreur du serveur");
      }

      res.status(201).json({ id: messageId, createdAt, sender, chatId, parts });
    });
  });
});

/* Récupérer un message */
app.get("/message", (req, res) => {
  const query = `
    SELECT m.id, m.createdAt, m.sender, m.chatId, mp.id as partId, mp.part
    FROM message m
    LEFT JOIN messagepart mp ON m.id = mp.messageId
  `;
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).send("Erreur du serveur");
    }

    const messages = results.reduce((acc, row) => {
      const message = acc.find((m) => m.id === row.id);
      if (message) {
        message.content.push({ id: row.partId, part: row.part });
      } else {
        acc.push({
          id: row.id,
          createdAt: row.createdAt,
          sender: row.sender,
          userId: row.userId,
          content: [{ id: row.partId, part: row.part }],
        });
      }
      return acc;
    }, []);

    res.json(messages);
  });
});

/* Enregistrer un chat */
app.post("/chat", (req, res) => {
  const { userId, name } = req.body;
  console.log("Enregistrer un chat: ", userId, name);

  if (!userId || !name) {
    return res.status(400).send("userId et name sont requis");
  }

  const query = "INSERT INTO chat (userId, name) VALUES (?, ?)";
  connection.query(query, [userId, name], (error, results) => {
    if (error) {
      return res.status(500).send("Erreur du serveur");
    }

    const newChat = {
      id: results.insertId,
      userId,
      name,
    };

    res.status(201).json(newChat);
  });
});

/* Récupérer tous les chats */
app.get("/chats", (req, res) => {
  const query = "SELECT * FROM chat ORDER BY id DESC";
  connection.query(query, (error, results) => {
    if (error) {
      return res.status(500).send("Erreur du serveur");
    }

    res.json(results);
  });
});

/* Récupérer les messages d'un chat */
app.get("/chats/:chatId/messages", (req, res) => {
  const { chatId } = req.params;

  const query = `
    SELECT m.id, m.createdAt, m.sender, mp.part
    FROM message m
    JOIN messagepart mp ON m.id = mp.messageId
    WHERE m.chatId = ?
    ORDER BY m.createdAt ASC
  `;

  connection.query(query, [chatId], (error, results) => {
    if (error) {
      return res.status(500).send("Erreur du serveur");
    }

    const messages = results.reduce((acc, row) => {
      const message = acc.find((m) => m.id === row.id);
      if (message) {
        message.content.push({ part: row.part });
      } else {
        acc.push({
          id: row.id,
          createdAt: row.createdAt,
          sender: row.sender,
          content: [{ part: row.part }],
        });
      }
      return acc;
    }, []);

    res.json(messages);
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
