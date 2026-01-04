//-------------necessary imports
const dotenv = require("dotenv");
dotenv.config();
const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const { GoogleGenAI  } = require("@google/genai");
const ollama = require("ollama").default
const mongoose = require("mongoose");
const Chat = require("./model");
const keywordMap = require("./keywords");
const fs = require("fs")
const { CohereClientV2 } = require('cohere-ai');
const { text } = require("stream/consumers");



//---------------------------












// ----------------------------------Load the models ==================

// Cohere
const cohere = new CohereClientV2({
   token: process.env.COHERE_API_KEY 
  });

// GPT-4o
const client_openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Gemini-3.5-pro
const client_google = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


// Gemma and Mistral do not need manual loading




function angleBetween(A, B){
  // calculate the angle between these twp vectors

  let dot = 0;
  let mag_A = 0;
  let mag_B = 0;

  for (let i = 0; i < A.length; i++) {
    dot += A[i] * B[i];
    mag_A += A[i] * A[i];
    mag_B += B[i] * B[i];
  }

  return (dot / (Math.sqrt(mag_A)) * (Math.sqrt(mag_B)))
}









//------------------- Function to decide the Model to respond based on user message in AUTO mode

async function autoselectmodel(message) {
  // SET the model which is going to predict the model for this particular message
  let methods = [
    "gemma",
    "chatgpt",
    "gemini",
    "cohere",
    "mistral",
    "manual",
    "semantic",
  ];

  const method = process.env.DEFAULT_MODEL_SELECTION_METHOD;

  // Check if we have a valid method
  if (!methods.includes(method)) {
    throw new Error("The developer did not choose a valid method");
  }

  // If the method was using gemma for predicting the model
  if (method == "gemma") {
    try {
      let predicted_model = await ollama.chat({
        model: "gemma",
        messages: [
          {
            role: "system",
            content: `
            Based on the given user message analyse the user intent of the conversation and classify the message into one of 5 model categories as per the user requirement.
            
            Following is the raw classification keywords : ${keywordMap} 

            Output format , a JSON object with single property
            {
              "model" : <one of the model form 5 model categries>
            } 
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
        format: {
          type: "object",
          model : {
            type: "string",
            enum : ["gemini", "chatgpt", "gemma", "cohere", "mistral"]
          },
          required: ["model"],
        },
      });

      return predicted_model;
    } catch (error) {
      console.error(error);
      // method = "manual"
    }
  } else if (method == "manual") {
    // convert the current message to lowercase
    let lower_message = message.toLowerCase();

    // check for values in model kwywords manually
    for (const key in keywordMap) {
      for (const element of keywordMap[key]) {
        if (lower_message.includes(element)) {
          return key;
        }
      }
    }

    return process.env.DEFAULT_MODEL || "gemma";
  } else if (method == "semantic") {
    // check the model based on the most matched vector 

    try {
      let response = await ollama.embed({
        model : "mxbai-embed-large",
        input  : message,
      })
      
      const userVector = response.embeddings[0];
  
      // check this vector against all embeddings in generated Embeddings
      const embeddingsFile  = JSON.parse(fs.readFileSync("./api/embeddingPhrases.json", "utf8"))
  
      let defaultModel = {
        model : "chatgpt", // set a default model in case none mathces,
        score : 0
      }
  
      for (const model of embeddingsFile) {
        for (const embedding of model.embeddings) {
          let scoreCurrent = angleBetween(embedding, userVector);
  
          if (scoreCurrent > defaultModel.score) {
            defaultModel.model = model.model,
            defaultModel.score = scoreCurrent
          }
        }
      }
  
      return defaultModel.model;
      

    }// if ollama fails to load 
    catch (error) {
      try {
        console.log("Ollama falied to embed")
    const response = await openai.embeddings.create({

        model: "text-embedding-3-small",
        input: message,
    });


    const userVector = response.data[0].embedding;

    
    const embeddingsFile = JSON.parse(fs.readFileSync("./api/embeddingPhrases-openai.json", "utf8"));

    let defaultModel = {
        model: "chatgpt", 
        score: 0
    };

    
    for (const modelData of embeddingsFile) {

        for (const embedding of modelData.embeddings) {

            let scoreCurrent = angleBetween(embedding, userVector);

            if (scoreCurrent > defaultModel.score) {
                defaultModel.model = modelData.model;
                defaultModel.score = scoreCurrent;
            }
        }
    }

    
    return defaultModel.score;
      } catch (error) {
        console.error("failed to fetch the embeddings")
        res.status(500).json({
          message : "Failed to get an answer",
          err : error.message
        })
      }
    }


    

  }
}

const handleChat = async (req, res) => {
  let { message, model, chatId } = req.body;
  let response_string = "";

  try {
    // Check if we got a valid model
    if (!message || !model) {
      res.status(400).json({
        error: "Message or model name not provided",
      });
      return;
    }

    // create a variable for storing the current conversation previous chats
    let conversation_already;

    if (!chatId) {
      try {
        // if this is a new chat first create it in databse and assign conversation_already the value of chat
        const newConversation = new Chat({
          title: message,
          messages: [
            {
              role: "user",
              content: message,
              model,
            },
          ],
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
        // get the previous conversations from database and store it in conversation_already
        conversation_already = await Chat.findById(chatId, {
          messages: { $slice: -3 },
          summary: 1,
        });

        if (!conversation_already) {
          res.status(500).json({
            message:
              "No previous chats found with the id , given Id is invalid",
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
          message: "Error while retrieving/saving the chat",
          error: error.message,
        });
        return;
      }
    }

    // If the model provided by the user is "auto"

    // If the model provided by the user is "auto"
    if (model == "auto") {
      model = await autoselectmodel(message);
      console.log(model)
    }

    // check if user gave us a valid model
    let available_models = Object.keys(keywordMap);

    if (!available_models.includes(model)) {
      res.status(400).json({
        error: "The model you requested is either not available or is invalid",
      });
      return;
    }

    //-------- If the model choosen by the user was Claude

    if (model == "cohere") {
      let messagesList = [{
        role : "system",
        content : `This is summary of previous chats with user(it will be empty if this is the first chat with the user): ${conversation_already.summary}`
      }];
      
      for (const message of conversation_already.messages) {
        messagesList.push({
          role: message.role,
          content: message.content,
        });
      }

      const response = await cohere.chat({
        model: "command-a-03-2025",
        messages: messagesList
      });
      
      if (!response.message) {
        res.status(400).json({
          error: "The Cohere model did not give any textual response",
        });
        return;
      }

      response_string = response.message.content[0].text
    } else if (model == "chatgpt") {
      try {
        let messageList = [
          {
            role: "system",
            content: `This is summary of previous chats with user(it will be empty if this is the first chat with the user): ${conversation_already.summary}
        also don't include starters like "based on the summary this is the answer..", in short don't give any reference of this summary
        treat this as a system prompt
        `,
          },
        ];
        for (const message of conversation_already.messages) {
          messageList.push({
            role: message.role,
            content: message.content,
          });
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
        console.log(error);
      }
    } else if (model == "gemini") {
      let messageList = [];
      for (const message of conversation_already.messages) {
        messageList.push({
          role: message.role == "user" ? "user" : "model",
          parts: [
            {
              text: message.content,
            },
          ],
        });
      }
      const response = await client_google.models.generateContent({
        model: "gemini-2.5-flash",
        system_instructions : {
          parts : [
            {
              text : `This is summary of previous chats with user(it will be empty if this is the first chat with the user): ${conversation_already.summary}`
            }
          ]
        },
        contents: messageList,
      });

      if (!response) {
        res.status(400).json({
          error: "The Google model did not give any textual response",
        });
        return;
      }

      response_string = response.text;
    }
    // i am using a local model gemma and mistral for testing purposes as API free trial
    // ran out
    else if (model == "mistral" || model == "gemma") {
      try {
        let messageList = [
          {
            role: "system",
            content: `### Conversation History
                      ${conversation_already.summary || "None"}

                      ### Instructions
                      1 Answer the user's next message directly
                      2 Use the History ONLY if the user asks about past topics
                      3 DO NOT mention "the summary", "based on previous chats", or "context" in your response`,
          },
        ];
        for (const message of conversation_already.messages) {
          messageList.push({
            role: message.role,
            content: message.content,
          });
        }

        const response = await ollama.chat({
            model: ((model == "mistral") ? "mistral:7b":"gemma:2b"),
            messages: messageList,
            stream: false,
          })

        

        response_string = response.message.content;
      
       
      } 
      catch (error) {
        res.status(400).json({
          err: error.message,
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

    // after backend has sent response then update the current summery using a local model
    try {
      const new_summary = await ollama.chat({
        model : process.env.DEFAULT_SUMMERY_MODEL,
        messages : [{
          role : "system",
          content : `Take the previous summery ,current user question and your response to make a new summary(less than 150 words response) of the conversation combining everything without starting with e.g "here's the new summery" 
          Previous summery : ${conversation_already.summary}
          User question : ${message}
          Model Response : ${response_string}
          
          NOTE :- Only include the key details and NOT everything in detail and make it SHORT
          NOTE :- Do not include heaters or footers like "Sure heres your summary.." or any reference to this system prompts 
          `

          
      }]
      })

      conversation_already.summary = new_summary.message.content
    } 
    catch (error) {
      console.log("Could not develop summery\n"+error)
    }

    await conversation_already.save()


    return;
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error handling chat", error: error.message });
  }
};



























// ========== controller to allow user to get past chats Title when
// landing on screen1

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
  getConversationMessages
};
