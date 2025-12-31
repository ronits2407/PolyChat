const dotenv = require("dotenv");
dotenv.config();
const KeyWordMap = require("./keywords");

// Load the models ==================
// Claude
const Anthropic = require("@anthropic-ai/sdk");
const client_anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GPT-4o
const OpenAI = require("openai");
const client_openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Gemini-3.5-pro
const { GoogleGenerativeAI } = require("@google/generative-ai");
const client_google = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const google_model = client_google.getGenerativeModel({
  model: "gemini-3.5-pro",
});

// gemma:2b local model for testing
const local_url = "http://localhost:11434/api/generate";

//==============

async function autoselectmodel(message) {
  let lower_message = message.toLowerCase();

  for (const key in KeyWordMap) {
    for (const element of KeyWordMap[key]) {
      if (lower_message.includes(element)) {
        return key;
      }
    }
  }

  return process.env.DEFAULT_MODEL || "gpt-4o";
}

const handleChat = async (req, res) => {
  let { message, model } = req.body;
  let response_string = "";

  try {
    if (!message || !model) {
      res.status(400).json({
        error: "Message or model name not provided",
      });
      return;
    }

    if (model == "auto") {
      model = await autoselectmodel(message);
    }

    let available_models = Object.keys(KeyWordMap);

    if (!available_models.includes(model)) {
      res.status(400).json({
        error: "The model you requested is either not available or is invalid",
      });
      return;
    }

    if (model == "claude-2.5") {
      const response = await client_anthropic.messages.create({
        model: "claude-2.5",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });

      if (!response || !response.content) {
        res.status(400).json({
          error: "The Anthropic model did not give any textual response",
        });
        return;
      }

      for (const block of response.content) {
        if (block.type == "text") {
          response_string = response_string + block.text;
        }
      }
    } else if (model == "gpt-4o") {
      const response = await client_openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });

      if (!response || !response.choices || !response.choices[0].message) {
        res.status(400).json({
          error: "The OpenAI model did not give any textual response",
        });
        return;
      }

      response_string = response.choices[0].message.content;
    } else if (model == "gemini-3.5-pro") {
      const response = await google_model.generateContent(message);

      if (!response) {
        res.status(400).json({
          error: "The Google model did not give any textual response",
        });
        return;
      }

      response_string = response.response.text();
    }
    // i am using a local model gemma:2b for testing purposes as API free trial
    // ran out
    else if (model == "gemma:2b") {
      const query = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt: message,
          stream: false,
        }),
      };

      const response = await fetch(local_url, query);

      if (!response.ok) {
        const error_details = await response.json();
        res.status(400).json({
          error: "An error occured while retrieving the response",
          error_details,
        });
        return;
      }
      try {
        const answer = await response.json();
        console.log(answer);
        response_string = answer["response"];
      } catch (error) {
        res.status(400).json({
          error: "Ollama failed",
        });
      }
    }

    res.status(200).json({
      model,
      message: response_string,
    });
    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error handling chat", error: error.message });
  }
};

module.exports = {
  handleChat,
};
