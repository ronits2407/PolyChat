const dotenv = require("dotenv");
dotenv.config();

// =========== controller for getting AI generated responses

// Load the models ==================

// Claude
const KeyWordMap = require("./keywords");
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
  let { message, model, chatId } = req.body;
  let response_string = "";

  try {
    if (!message || !model) {
      res.status(400).json({
        error: "Message or model name not provided",
      });
      return;
    }

    if (!chatId) {
      try {
        const newConversation = new Chat(req.body);
        newConversation.title = message;
        await newConversation.save();

        chatId = newConversation._id;
      } catch (error) {
        res.status(500).json({
          message: "Error while creating a chat",
          error: error.message,
        });
      }
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

    try {
    const conversation = await Chat.findById(chatId);
    if (!conversation) {
      res.status(404).json({
        message: "Conversation not found",
      });
    }

    conversation.messages.push({
      role : "user",
      content : message,
      model
    });
    conversation.messages.push({
      role : "assistant",
      content : response_string,
      model
    });

    await conversation.save();
  } catch (error) {
    res.status(500).json({
      message: "Could not create the conversation",
      error: error.message,
    });
  }

    res.status(200).json({
      chatId,
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

// ========== controller to allow user to get past chats Title when
// landing on screen1
const mongoose = require("mongoose");
const Chat = require("./model");

const getConversationTitle = async (req, res) => {
  try {
    const convo_title = await Chat.find({}, { title: 1 });
    res.status(200).json(convo_title);
    return;
  } catch (error) {
    res.status(500).json({
      message: "Error querying the MongoDB databse",
      error: error.message,
    });
  }
};

// =============== controller for getting an entire chat
const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.id);
    console.log("Success")
    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({
      message: "Could not get the chat data",
      error: error.message,
    });
  }
};

//============== Controller for creating a conversation
const createConversation = async (req, res) => {
  try {
    const newConversation = new Chat(req.body);
    await newConversation.save();

    res.status(201).json({
      message: "Conversation saved",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error while creating a chat",
      error: error.message,
    });
  }
};

//================== Controller for updating chats inside a conversation
const updateConversation = async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.id);
    if (!conversation) {
      res.status(404).json({
        message: "Conversation not found",
      });
    }

    conversation.messages.push(req.body);

    await conversation.save();

    res.status(200).json({
      message: "Conversation was updated",
    });
  } catch (error) {
    res.status(500).json({
      message: "Could not update the connversation",
      error: error.message,
    });
  }
};

module.exports = {
  handleChat,
  getConversationTitle,
  createConversation,
  updateConversation,
  getConversationMessages,
};
