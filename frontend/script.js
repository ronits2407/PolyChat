const API_BASE_URL = "http://localhost:5000/api";

async function handleChat(message, model, chatId = null) {
  try {
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error calling handleChat API:", error);
    throw error;
  }
}


const send_button = document.querySelector(".send")
const prompt = document.querySelector("#prompt-text")
const modelSelect = document.querySelector("#model-select-drop-down")
const response_div = document.querySelector(".response")
const conversation = document.querySelector("#conversation")

function scrollToBottom() {
  conversation.scrollTo({
    top: conversation.scrollHeight,
    behavior: "smooth"
  });
}



let questionId = 2;

send_button.addEventListener( "click" , async () => {
  const query = prompt.value;
  if (!query) {
    return
  }
  const model = modelSelect.value;
  const response_curr = response_div.cloneNode(true);
  response_curr.style.display = "flex";

  
  response_curr.classList.remove("question-1");
  response_curr.classList.add(`question-${questionId}`);
  response_curr.querySelector(".question").textContent = query;
  const answer_content = response_curr.querySelector(".answer");
  answer_content.innerHTML = '';
  conversation.appendChild(response_curr)
  prompt.value = '';
  scrollToBottom();

  
  const answer =  await handleChat(query, model);
  
  
  
  const answer_text = marked.parse(answer["message"])

  answer_content.innerHTML = answer_text;
  questionId++;


  console.log(answer_text)
  
})

prompt.addEventListener("keydown", async (evt) => {
  const query = prompt.value;
  if (evt.key == "Enter" && prompt.value) {
  // const query = prompt.value;
  if (!query) {
    return
  }
  const model = modelSelect.value;
  const response_curr = response_div.cloneNode(true);
  response_curr.style.display = "flex";

  
  response_curr.classList.remove("question-1");
  response_curr.classList.add(`question-${questionId}`);
  response_curr.querySelector(".question").textContent = query;
  const answer_content = response_curr.querySelector(".answer");
  answer_content.innerHTML = '';
  conversation.appendChild(response_curr)
  prompt.value = '';
  scrollToBottom();

  
  const answer =  await handleChat(query, model);
  
  
  
  const answer_text = marked.parse(answer["message"])

  answer_content.innerHTML = answer_text;
  questionId++;


  console.log(answer_text)
  }
})




// for screen 2


const chatarea1 = document.querySelector("#chatarea-2")
const inputbox = chatarea1.querySelector("#prompt-text")

inputbox.addEventListener("keydown",async (evt) => {
  if (evt.key != "Enter") {
    return
  }
  let content = inputbox.textContent;
  if (!textContent) {
    return
  }

  
  
})





const panel = document.querySelector("#panel")
const sidepanetoggle = document.querySelector("#chat-history-button");

sidepanetoggle.addEventListener("click", () => {
  console.log("Toggle button was clicked")
  if (panel.style.display == "flex") {
    panel.style.display = "none"
  }
  else{
    panel.style.display = "flex"
  }
})



window.addEventListener("resize", () => {
  if (window.innerWidth < 768) {
     panel.style.display = "none"
  }
  else{
    panel.style.display = "flex"
  }
})