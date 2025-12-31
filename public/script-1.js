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
