const chatarea1 = document.querySelector("#chatarea-1")
const inputbox = chatarea1.querySelector("#prompt-text")

async function gotoscreen2(question) {
  //${encodeURIComponent(question)}
  window.location.replace(`https://localhost:5500`)
}

inputbox.addEventListener("keydown", (evt) => {
  if (evt.key != "Enter") {
    return
  }
  let content = inputbox.textContent;
  if (!textContent) {
    return
  }

  
  
})




const sidepanetoggle = document.querySelector("#sidepane-toggle");
const panel = document.querySelector("#panel")

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