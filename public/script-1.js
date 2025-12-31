//================API functins===========
const inputbox = document.querySelector("#prompt-text");
const sendbutton = document.querySelector(".send")

async function gotoscreen2({message, model}) {
  window.location.href = `${window.location.origin}/screen2.html?model=${encodeURIComponent(model)}&query=${encodeURIComponent(message)}`
}

inputbox.addEventListener("keydown", (evt) => {
  if (evt.key != "Enter") {
    return;
  }
  let content = inputbox.value;
  if (!content) {
    return;
  }
  
  const model = document.querySelector(`input[name="model"]:checked`)
  gotoscreen2({
    model : model.id,
    message : content,
  });
});

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



//=========================

//============== Responsive UI===================
const sidepanetoggle = document.querySelector("#sidepane-toggle");
const panel = document.querySelector("#panel");

sidepanetoggle.addEventListener("click", () => {
  console.log("Toggle button was clicked");
  if (panel.style.display == "flex") {
    panel.style.display = "none";
  } else {
    panel.style.display = "flex";
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
    panel.style.display = "none";
  } else {
    panel.style.display = "flex";
  }
});

//============ New chat insertion in database =======

const newchatbutton = document.querySelector("#newchat")

newchatbutton.addEventListener("click", () => {
  inputbox.value = "";
  inputbox.focus();

})


// =============== Load the titles of all chats ==

const API_BASE_URL = "http://localhost:5000/api";
const chatTitleTemplate = document.querySelector(".recentChat")
const ChatListDiv = document.querySelector(".recentChatList")

async function getTitles() {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: "GET"
    });

    if (!response.ok) {
      throw new Error(`Failed to get chat titles: ${response.status}`);
    }
    const data = await response.json();
    
    for (const conversation of data) {

      let temp = chatTitleTemplate.cloneNode(true);

      temp.style.display = "flex"
      let link = temp.querySelector("a")
      link.id = conversation._id
      link.href = `${window.location.origin}/screen2.html?chatid=${encodeURIComponent(conversation._id)}`
      link.textContent = conversation.title

      ChatListDiv.prepend(temp);

    }

  } catch (error) {
    console.error("Error calling handleChat API:", error);
    throw error;
  }
}

getTitles();

