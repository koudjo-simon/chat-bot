const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");

dotenv.config();

// Configuration requise pour GoogleGenerativeAI
const configuration = new GoogleGenerativeAI(process.env.API_KEY);

const history = [];

// initialisation de modèle
const modelId = "gemini-pro";

const model = configuration.getGenerativeModel({
  model: modelId,
});

/**
 * Génère une réponse sur la base de demande de l'utilisateur.
 * @param {Object} req - L'objet de requête.
 * @param {Object} res - L'objet de reponse.
 * @returns {Promise} - Une promesse qui se résout lorsque la réponse est envoyée.
 */
const generateResponse = async (req, res) => {
  try {
    const { prompt } = req.body;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(text);

    history.push(text);
    /* console.log(history); */

    res.send({ response: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  history,
  generateResponse,
};
