//-----------------Load repeatadly used compenents , API and page info

const API_BASE_URL = "http://localhost:5000/api";
const newchatbutton = document.querySelector("#newchat");
const recentChatList = document.querySelector(".recentChatList");
const chatTitleTemplate = document.querySelector(".recentChat");
const prompt = document.querySelector("#prompt-text");
const modelSelect = document.querySelector("#model-select-drop-down");
const response_div = document.querySelector(".response");
const conversation = document.querySelector("#conversation");
const send_button = document.querySelector(".send");
const params = new URLSearchParams(window.location.search);
const panel = document.querySelector("#panel");
const sidepanetoggle = document.querySelector("#chat-history-button");

//------------------------------------------------------------






















//--------- Define a function for Loading the titles of all chats

async function getTitles() {

  try {

    // Get chatTitles Data from API
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: "GET",
    });

    // Check if backend was able to give data correctly
    if (!response.ok) {
      throw new Error(`Failed to get chat titles: ${response.status}\n`);
    }

    // Convert the data received in json
    const data = await response.json();

    // Load Chat for each conversation in Database
    for (const conversation of data) {
      // clone the template chat
      let temp = chatTitleTemplate.cloneNode(true);

      // set the template chat attributes
      temp.style.display = "flex";
      let link = temp.querySelector("a");
      link.href = `${window.location.origin}/screen2.html?chatid=${encodeURIComponent(conversation._id)}`;
      link.textContent = conversation.title;

      // add the chat to the document
      recentChatList.prepend(temp);
    }
  } 
  catch (error) {
    console.error(error);
  }
};

//--------------------------------------------------------------



















//------------- backend API calling functions-------------------

let currId;

//--------------get AI response from backend---------------
async function handleChat(message, model, chatId = null) {
  try {

    // get response from API
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        model: model,
        chatId: chatId,
      }),
    });

    // Check if response was successful
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // parse the response into json
    const data = await response.json();
    return data;
  } 
  catch (error) {
    console.error("Error calling handleChat API:\n", error);
  }
}
//---------------------------------------











//------------------------------- Responsive UI components

//--------scrolling
function scrollToBottom() {
  conversation.scrollTo({
    top: conversation.scrollHeight,
    behavior: "smooth",
  });
}

//------------sidepane toggle

sidepanetoggle.addEventListener("click", () => {
  if (panel.style.display == "flex") {
    panel.style.display = "none";
  } 
  else {
    panel.style.display = "flex";
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    panel.style.display = "none";
  } 
  else {
    panel.style.display = "flex";
  }
});
//-----------------------------------------


















//--------------------------- chat handlers

// keep track of the currest question in the chat
let questionId = 2;

//-----------set a variable to see if we got the title or not
let gotTitle = false;

//---------------- Run getanswer everytime user asks a question and dynamically change user UI
async function getanswer(promptInfo) {
  
  try {

    // Get the info of the question
    const model = promptInfo.model;
    const message = promptInfo.message;
    const question_ID = promptInfo.ID;

    
      // see if information is valid
    if (!message || !model || !question_ID) {
      throw new Error("Parameters of the promptInfo are empty");
    }

    // Immidiately after user sends response , make the input box empty
    prompt.value = "";

    // get the response template clone and make display flex
    let response_curr = response_div.cloneNode(true);
    response_curr.style.display = "flex";
    // set the class of the new response to current question number
    response_curr.classList.remove("question-1");
    response_curr.classList.add(`question-${question_ID}`);
    // set the question on the screen to what user typed before
    response_curr.querySelector(".question").textContent = message;
    // set the answer_content of the template to none , if any
    const answer_content = response_curr.querySelector(".answer");
    answer_content.innerHTML = "";

    // now to first create a temporary copy of the response
    let temp = response_curr.cloneNode(true);
    // now remove the answer part from the response and append the question to the chat screen
    response_curr.querySelector(".response-info").remove();
    response_curr.querySelector(".related-questions").remove();
    response_curr.querySelector("hr").style.display = "inline"
    conversation.appendChild(response_curr);
    // scroll to bottom if necesssary
    scrollToBottom();


    // now before getting a response see if all the previous chats are loaded only once when page loads
    if (!gotTitle) {
      await getTitles();
      gotTitle = true;
    }

    // Get the answer from our handle chat
    let data = await handleChat(message, model, promptInfo.chatId);

    // See if the current answer request was of a newchat or existing chat
    if (!promptInfo.chatId) {
      
      // get the template for chat title in the side panel
      const chatTemplate = chatTitleTemplate.cloneNode(true);

      // set the styles of the panel title and also the link of the resective titles
      chatTemplate.style.display = "flex";
      let link = chatTemplate.querySelector("a");
      link.textContent = message;

      // set the link of the title same as screen 1 redirect link , only this time we are redirecting to the same page
      link.href = `${window.location.origin}/screen2.html?chatid=${encodeURIComponent(data.chatId)}`

      // Push the title
      recentChatList.prepend(chatTemplate);
    }

    // set the id of the coversation currently going on 
    currId = data.chatId;

    // Load the response (Answer generated by ${modelname})
    response_curr = document.querySelector(`.question-${question_ID}`);

    //stop the loading bar
    response_curr.querySelector("hr").remove()
    temp.querySelector(
      ".model-name"
    ).textContent = `Answer generated by ${model}`;

    // Load the actual answer content by parsing it by a markdown to html parser
    temp.querySelector(".answer").innerHTML = marked.parse(data.message);

    // add the response to the chat screen and scroll to bottom
    response_curr.appendChild(temp.querySelector(".response-info"));
    scrollToBottom();


    // handle the realated questions thing

    // response_curr.appendChild(temp.query);
  } catch (error) {
    console.error(error);
  }
}




















// function for getting the contents of a specific chat
async function getChatById(ID) {
  try {
    // Get the entire past coversation from API
    let response = await fetch(`${API_BASE_URL}/conversations/${ID}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Response status retured an error : ${response.status}`);
    }
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error)
  }
}



// function for displaying the chat in the chatarea whenever user loads a new chat
function displayChat(_conversation) {

  for (const [index, message] of _conversation.messages.entries()) {
    if (message.role == "user") {
      // For each question increate the questionId count so that when user asks another question
      // it will respond correctly
      questionId++;
      let answer = _conversation.messages[index + 1];
      if (!answer) {
        continue;
      }

      // again clone the chat and follow the same process
      let temp = response_div.cloneNode(true);
      temp.style.display = "flex";
      temp.querySelector(".question").textContent = message.content;
      temp.querySelector(
        ".model-name"
      ).textContent = `Answer generated by ${answer.model}`;
      temp.querySelector(".answer").innerHTML = marked.parse(answer.content);

      conversation.appendChild(temp);
      scrollToBottom();
    }
  }
}
//---------------------------------------------------------



















// load the first chat when the page loads

if (params.get("model") && params.get("query")) {

  // Set the drop down model value to the query value
  modelSelect.value = params.get("model");

  // Get an answer from the API
  getanswer({
    model: params.get("model"),
    message: params.get("query"),
    ID: questionId,
  });

  // Set the url of the page to default so that it looks nice
  window.history.replaceState({}, "", window.location.pathname);
  // increment the question count
  questionId++;

} 
else if (params.get("chatid")) {
  // If we were redirected with a certain chatid therefore we have to load that chat

  // get the titles while loading the chat , simultaniously
  getTitles();
  gotTitle = true;

  // Get the chatid
  let chatid = params.get("chatid");

  // replace the window url to default so that it looks nice
  window.history.replaceState({}, "", window.location.pathname);

  // Start displaying the chat by getting chatinfo first and then calling the display function
  async function loadConversation() {
    try {
      currId = chatid
      const chatData = await getChatById(chatid);
      displayChat(chatData);
    } 
    catch (error) {
      console.error(error)
    }
  }
  loadConversation()

} 
else {
  // if the page was called without any params user likely meant to go to NewChat
  window.location.replace(`${window.location.origin}`);
}
//--------------------------------------------------------------------------------

















//-------- Add event listeners to the send and enter button whenever user has some content in chat
send_button.addEventListener("click", async () => {
  const query = prompt.value;
  const model = modelSelect.value;

  getanswer({
    model,
    message: query,
    ID: questionId,
    chatId: currId,
  });

  questionId++;
});

prompt.addEventListener("keydown", async (evt) => {
  const query = prompt.value;
  const model = modelSelect.value;
  console.log(model)

  if (evt.key != "Enter") {
    return;
  }

  getanswer({
    model,
    message: query,
    ID: questionId,
    chatId: currId,
  });

  questionId++;
});

//------------------------------------------------------------------






















// ----------------------- New Chat button redirects user to screen1

newchatbutton.addEventListener("click", () => {
  window.location.href = `${window.location.origin}/`;
});

