const chatarea1 = document.querySelector("#chatarea-1")
const inputbox = chatarea1.querySelector("prompt-text")

async function gotoscreen2(question) {
  window.location.replace(`https://localhost:5500/frontend/screen2.html/ques="${encodeURIComponent(question)}`);
}

inputbox.addEventListener("keydown",async (evt) => {
  if (evt.key != "Enter") {
    return
  }
  let content = inputbox.textContent;
  if (!textContent) {
    return
  }

  
  
})