const OpenAI = require("openai");

const { GoogleGenAI } = require("@google/genai");
const { json } = require("express");
const client = new OpenAI();
const ai = new GoogleGenAI({});

const handleChat = async (req, res) => {
  const { message, model } = req.body;

  try {
    const { message } = req.body;

    const query = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model, // or whichever model you pulled
        prompt: message,
        stream: false,
      }),
    };

    const response = await fetch("http://localhost:11434/api/generate",query);

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error handling chat", error: error.message });
  }
};

module.exports = {
  handleChat,
};
