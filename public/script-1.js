//================API functins===========
const inputbox = document.querySelector("#prompt-text");
const sendbutton = document.querySelector(".send")

function gotoscreen2(question) {
  window.location.replace(`${window.location.origin}/screen2.html?query=${encodeURIComponent(question)}`);
}

inputbox.addEventListener("keydown", (evt) => {
  if (evt.key != "Enter") {
    return;
  }
  let content = inputbox.value;
  if (!content) {
    return;
  }
  
  gotoscreen2(content);
});

sendbutton.addEventListener("click", () => {
  let content = inputbox.value;
  if (!content) {
    return;
  }

  gotoscreen2(content)

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

//==========================================
