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
const { GoogleGenAI  } = require("@google/genai");
const client_google = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// gemma:2b local model for testing
const local_url = "http://localhost:11434/api/chat";

async function autoselectmodel(message) {
  let lower_message = message.toLowerCase();

  for (const key in KeyWordMap) {
    for (const element of KeyWordMap[key]) {
      if (lower_message.includes(element)) {
        return key;
      }
    }
  }

  return process.env.DEFAULT_MODEL || "gemma";
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

    let conversation_already

    if (!chatId) {
      try {
        const newConversation = new Chat({
          title : message,
          messages : [{
            role : "user",
            content : message,
            model,
          }]
        });

        await newConversation.save();

        chatId = newConversation._id;
        conversation_already = newConversation;
      } catch (error) {
        res.status(500).json({
          message: "Error while creating a chat",
          error: error.message,
        });
        return;
      }
    } else {
      try {
        conversation_already = await Chat.findById(chatId, {
          messages: { $slice: -10 },
        });

        if (!conversation_already) {
          res.status(500).json({
            message: "Error while retrieving the previous chats",
          });
          return;
        }
        conversation_already.messages.push({
          role: "user",
          content: message,
        });

        await conversation_already.save();
      } catch (error) {
        res.status(500).json({
          message: "Error while retrieving the chat , no chat found",
          error: error.message,
        });
        return;
      }
    }

    // console.log(conversation_already)

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

    if (model == "claude") {
      let messagesList = []
      for (const message of conversation_already.messages) {
        messagesList.push({
          role : message.role,
          content : message.content,
        })
      }
      const response = await client_anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens : 1000,
        messages: messagesList
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
    } else if (model == "chatgpt") {
      try {
        let messageList = []
        for (const message of conversation_already.messages) {
          messageList.push({
            role : message.role,
            content : message.content
          })
        }
        const response = await client_openai.responses.create({
          model: "gpt-4.1-mini",
          input: messageList,
        });

        // console.log(response);

        if (!response || !response.output_text) {
          res.status(400).json({
            error: "The OpenAI model did not give any textual response",
          });
          return;
        }

        response_string = response.output_text;
      } catch (error) {
        console.log(error)
      }
    } else if (model == "gemini") {
      let messageList = []
      for (const message of conversation_already.messages) {
        messageList.push({
            role : ((message.role == "user") ? "user":"model"),
            parts : [
              {
                text : message.content
              }
            ]
          })
      }
      const response = await client_google.models.generateContent({
        model: "gemini-2.5-flash",
        contents : messageList
      });

      if (!response) {
        res.status(400).json({
          error: "The Google model did not give any textual response",
        });
        return;
      }

      response_string = response.text;
    }
    // i am using a local model gemma:2b for testing purposes as API free trial
    // ran out
    else if (model == "gemma") {
      let messagesList = []
        for (const message of conversation_already.messages) {
          messagesList.push({
            role : message.role,
            content : message.content
          })
        }
      const query = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model : "gemma:2b",
          messages : messagesList,
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
        // console.log(answer);
        response_string = answer["message"]["content"];
      } catch (error) {
        res.status(400).json({
          error: "Ollama Gemma failed",
        });
        return;
      }
    }
    else if (model == "mistral") {
      try {
        let messageList = []
        for (const message of conversation_already.messages) {
          messageList.push({
            role : message.role,
            content : message.content
          })
        }

      const query = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model : "mistral:7b",
          messages : messageList,
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
        const answer = await response.json();
        // console.log(answer);
        response_string = answer["message"]["content"];
      } catch (error) {
        res.status(400).json({
          error: "Ollama Mistral failed",
        });
        return;
      }
    }

    try {
      conversation_already.messages.push({
        role: "assistant",
        content: response_string,
        model,
      });

      await conversation_already.save();
    } catch (error) {
      res.status(500).json({
        message: "Could not create the conversation",
        error: error.message,
      });
      return;
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
  return;
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
    return;
  }
};

// =============== controller for getting an entire chat
const getConversationMessages = async (req, res) => {
  try {
    const conversation = await Chat.findById(req.params.id);
    // console.log("Success");
    res.status(200).json(conversation);
    return;
  } catch (error) {
    res.status(500).json({
      message: "Could not get the chat data",
      error: error.message,
    });
    return;
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
    return;
  } catch (error) {
    res.status(500).json({
      message: "Error while creating a chat",
      error: error.message,
    });
    return;
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
      return;
    }

    conversation.messages.push(req.body);

    await conversation.save();

    res.status(200).json({
      message: "Conversation was updated",
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: "Could not update the connversation",
      error: error.message,
    });
    return;
  }
};

module.exports = {
  handleChat,
  getConversationTitle,
  createConversation,
  updateConversation,
  getConversationMessages,
};
