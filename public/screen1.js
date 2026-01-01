//-------------------- Document element and page info imports 

const inputbox = document.querySelector("#prompt-text");
const sendbutton = document.querySelector(".send")
const sidepanetoggle = document.querySelector("#sidepane-toggle");
const panel = document.querySelector("#panel");
const newchatbutton = document.querySelector("#newchat")
const chatTitleTemplate = document.querySelector(".recentChat")
const ChatListDiv = document.querySelector(".recentChatList")

const API_BASE_URL = "http://localhost:5000/api";

//--*--------------*----------*-------------*-----



















//--------------------- Responsive UI----------------------

// toggle the sidepanel by clicking the menu button on the page
sidepanetoggle.addEventListener("click", () => {

  if (panel.style.display == "flex") {
    panel.style.display = "none";
  } 
  else {
    panel.style.display = "flex";
  }

});

// hide side panel when the size of the page becomes too small and show it when size is large enough
window.addEventListener("resize", () => {

  if (window.innerWidth < 768) {
    panel.style.display = "none";
  } 
  else {
    panel.style.display = "flex";
  }

});

// make it so that input box focuses whenever user clicks on new chat button on screen1
newchatbutton.addEventListener("click", () => {
  inputbox.value = "";
  inputbox.focus();

})

//-------------------------------------------------------------------------






















//------------------  Load the titles of all previous chats in sidepane using an IIFE


(async function () {

  try {
    // Get the chat title data from backend API
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: "GET"
    });

    // Check if the API was able to give us data correctly
    if (!response.ok) {
      throw new Error(`Failed to get chat titles: ${response.status}\n`);
    }


    const data = await response.json();
    
    for (const conversation of data) {

      let temp = chatTitleTemplate.cloneNode(true);

      temp.style.display = "flex"
      let link = temp.querySelector("a")
      link.id = conversation._id
      link.href = `${window.location.origin}/screen2.html?chatid=${encodeURIComponent(conversation._id)}&recent=true`
      link.textContent = conversation.title

      ChatListDiv.prepend(temp);

    }

  } 
  catch (error) {
    // alert the user if we can't get the chat data
    alert("Could not Fetch Recent-Chats from the Server.");
    console.log(error);
  }
})();

//-----------------------------------------------------------------











//----------------------------Actions which will happen after asking a question on screen 1

// whenever user asks a question on screen1 we redirect the question to screen2 by encoding the model and the question in the GET url
function gotoscreen2({message, model}) {
  
  // we first handle when the message contains spaces or symbols by encoding them in URL format
  window.location.href = `${window.location.origin}/screen2.html?model=${encodeURIComponent(model)}&query=${encodeURIComponent(message)}`

}

// call the gotoscreen2 function whenever user presses enter when the input box is focused or user clicks the send button with the message and model
inputbox.addEventListener("keydown", (evt) => {
  // ensure that user presses enter and not any other key
  if (evt.key != "Enter") {
    return;
  }

  // get the message at the time of pressing enter
  let content = inputbox.value;
  if (!content) {
    return;
  }
  // get the model at the time of pressing enter
  const model = document.querySelector(`input[name="model"]:checked`)

  // once we have the model and message redirect user to screen2
  gotoscreen2({
    model : model.id,
    message : content,
  });

});

// Do the same thing as did for pressing Enter
sendbutton.addEventListener("click", () => {
  let content = inputbox.value;
  const model = document.querySelector(`input[name="model"]:checked`)
  if (!content) {
    return;
  }

  gotoscreen2({
    model : model.id,
    message : content,
  })

})

//----------------------------------------------------------------------






