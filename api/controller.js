//-------------necessary imports
const dotenv = require("dotenv");
dotenv.config();
const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const { GoogleGenAI  } = require("@google/genai");
const ollama = require("ollama").default
const mongoose = require("mongoose");
const Chat = require("./model");
const {keywordMap, keywords} = require("./keywords");


//---------------------------












// ----------------------------------Load the models ==================

// Claude
const client_anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// GPT-4o
const client_openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Gemini-3.5-pro
const client_google = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Gemma and Mistral do not need manual loading













//------------------- Function to decide the Model to respond based on user message in AUTO mode

async function autoselectmodel(message, summary=null, lastchat=null) {

  // SET the model which is going to predict the model for this particular message
  let methods = ["gemma", "chatgpt", "gemini", "claude", "mistral", "manual"]

  const method = process.env.DEFAULT_MODEL_SELECTION_METHOD;

  // Check if we have a valid method
  if (!methods.includes(method)) {
    throw new Error("The developer did not choose a valid method")
  }

  // If the method was using gemma for predicting the model
  if (method == "gemma") {
    try {
      let predicted_model = await ollama.chat({
        model : "gemma",
        messages : [
          {
            role: "system",
            content: `
            Based on the given summary and the last chat analyse the user intent of the conversation and classify the message into one of 5 model categories as per the user requirement. Following is the raw classification keywords : ${keywordMap} Following is the user messages summary : ${summary} Following is the most recent conversation of user : ${lastchat}

            NOTE => OUTPUT A SINGLE key value pair object named with the key "predictedModel" i.e the name of one of the model from Keyword object 
            `
          },
          {
            role : "user",
            content : message,
          }
        ],
        format : {
          type : "object",
          predictedModel : {
            type : "string"
          },
          required : ["predictedModel"]
        }
      })

      return predicted_model
    } 


    catch (error) {
      console.error(error)
      // method = "manual"
    }
  }
  else if (method == "manual"){

    // convert the current message to lowercase
  let lower_message = message.toLowerCase();

  // check for values in model kwywords manually
  for (const key in keywords) {
    for (const element of keywords[key]) {
      if (lower_message.includes(element)) {
        return key;
      }
    }
  }

  return process.env.DEFAULT_MODEL || "gemma";
  }
}
















// =========== controller for getting AI generated responses

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
    let conversation_already

    if (!chatId) {
      try {
        // if this is a new chat first create it in databse and assign conversation_already the value of chat
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

        // get the previous conversations from database and store it in conversation_already
        conversation_already = await Chat.findById(chatId, {
          summary : 1
        });

        if (!conversation_already) {
          res.status(500).json({
            message: "No previous chats found with the id , given Id is invalid",
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
    if (model == "auto") {
      model = await autoselectmodel(message);
    }

    // check if user gave us a valid model
    let available_models = Object.keys(keywords);

    if (!available_models.includes(model)) {
      res.status(400).json({
        error: "The model you requested is either not available or is invalid",
      });
      return;
    }


    //-------- If the model choosen by the user was Claude
    if (model == "claude") {

      // create the message list of the last 2-3 chats so that model knows more clearly what is in the conversation
      let prompt = {
        role : "system",
        content : `
        You are tasked with generating two outputs based on the provided information.
        You must always respond by calling the tool "response_template"

          ### Inputs
          - **Last Chats Summary:** ${conversation_already.summary || "no summary"}

          ### Task
          1. **Update the Summary**  
            - Combine the existing summary with the current question and your generated answer
            - Produce a new summary string that reflects the updated context

          2. **User Response**  
            - Provide the direct answer (your generated response) to the current question sent by user

          ### Output Format
          Return a single JSON object as in the tool with the following structure:

          {
            "userResponse": "<string_of_user_response>",
            "newSummary": "<string_of_new_summary>"
          }

          - "userResponse" → The answer you generate for the current question  
          - "newSummary" → The updated summary that merges the current summary, the question, and your answer

        `
        }
        
        // get response form the model
        const response = await client_anthropic.messages.create({
          model: "claude-sonnet-4-5",
          max_tokens : 1000,
          messages: [prompt, {
            role : "user",
            content : message
          }],
          tools : [{
            name : "response_template",
            desscription : "This is the model response containing both newSummary and userResponse",
            input_schema : {
              type : "object",
              properties : {
                userResponse : {type : "string"},
                newSummary : {type : "string"},
              },
              
              required : ["userResponse", "newSummary"]
              
            }
          }]
        });
        
        const toolBlock = response.content.find( block => block.type == "tool_use");
        
        
        if (!toolBlock || toolBlock.name != "response_template") {
          res.status(400).json({
            error: "The Anthropic model did not give any textual response",
          });
          return;
        }
        
        
        
        response_string = toolBlock.input.userResponse;
        conversation_already.summary = toolBlock.input.newSummary;
      
    } else if (model == "chatgpt") {
      try {

    const response = await client_openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
            you  are a  helpful assistant
            past chats summary: ${conversation_already.summary || "none"}
            
            task:
            1 Answer the user's question
            2 Update the summary to include this new interaction
          `
        },
        { role: "user", content: message }
      ],
      response_format: {

        type: "json_schema",

        json_schema: {
          name: "contextual_memory_template",
          strict: true,
          schema: {

            type: "object",

            properties: 
            {
              userResponse: { type: "string" },
              newSummary: { type: "string" }
            },

            required: ["userResponse", "newSummary"],
            // this is rquird for strict rule foolowing
            additionalProperties: false
          }
        }
      }
    });

    const answer = JSON.parse(response.choices[0].message.content);

    response_string = answer.userResponse;
    conversation_already.summary = answer.newSummary;

    }
    catch (error) {
        console.log(error)
    }
    } else if (model == "gemini") {
     
      const response = await client_google.models.generateContent({
        model: "gemini-2.0-flash",
        contents : [{
          role : "user",
          parts : [{
            text : `
            Previous summary  ${conversation_already.summary || "none"}
                

                Current user question: ${message}

                Task:
                1 Provide a direect response to the user.
                2 Update summary of the conversation.
            `
          }]
        }],
        generationConfig : {
          responseMimeType: "application/json",
          responseSchema: {

            type: "object",

            properties: 
            {
                userResponse: { type: "string" },

                newSummary: { type: "string" }
            },

            required: [ "userResponse" , "newSummary"]
          },
        }
      });

      if (!response) {
        res.status(400).json({
          error: "The Google model did not give any textual response",
        });
        return;
      }

      const result_parsed = JSON.parse(response.response.text())

      response_string = result_parsed.userResponse;
      conversation_already.summary = result_parsed.newSummary;
    }

    // i am using a local model gemma:2b for testing purposes as API free trial
    // ran out
    else if (model == "gemma" || model=="mistral") {
      try {

    const response = await ollama.chat({

      model: ((model == "gemma") ? "gemma:2b":"mistral:7b"),
      messages: [
        {
          role: "system",
          content: `
            You are a helpful assistant.
            past content summary: ${conversation_already.summary || "none"}
            
            TASK: 
            1. Answer the user's current question.
            2. Update the summary to include this interaction.
            
            RESPOND ONLY IN JSON.
          `
        },
        { role: "user", content: message }
      ],
      stream: false,
      format: {
        type: "object",

        properties: 
        
      {
         userResponse: { type: "string" },
         newSummary: { type: "string" }
      },

      required: ["userResponse", "newSummary"]
    },
      options: { temperature: 0 }// it was in ollama documentatoin
    });

    const answer = JSON.parse(response.message.content);

    response_string = answer.userResponse;
    conversation_already.summary = answer.newSummary;
      
       
      } catch (error) {
        res.status(400).json({
          err : error.message
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
