document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("input");
  inputField.addEventListener("keydown", (e) => {
    if (e.code === "Enter") {
      let input = inputField.value;
      inputField.value = "";
      output(input);
    }
  });
});

async function output(input) {
  const messagesContainer = document.getElementById("messages");

  // Show user message and typing status
  addChat(input, "Typing...");

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const data = await response.json();
    const reply = data.response || "Sorry, I didn't get that.";

    // Replace "Typing..." with Gemini reply
    const botDiv = messagesContainer.querySelector(".bot.response span:last-child");
    setTimeout(() => {
      botDiv.innerText = reply;
      textToSpeech(reply);
    }, 1000);

  } catch (error) {
    const botDiv = messagesContainer.querySelector(".bot.response span:last-child");
    botDiv.innerText = "Sorry, something went wrong.";
  }
}

function addChat(input, product) {
  const messagesContainer = document.getElementById("messages");

  let userDiv = document.createElement("div");
  userDiv.id = "user";
  userDiv.className = "user response";
  userDiv.innerHTML = `<img src="user.png" class="avatar"><span>${input}</span>`;
  messagesContainer.appendChild(userDiv);

  let botDiv = document.createElement("div");
  let botImg = document.createElement("img");
  let botText = document.createElement("span");
  botDiv.id = "bot";
  botImg.src = "bot-mini.png";
  botImg.className = "avatar";
  botDiv.className = "bot response";
  botText.innerText = "Typing...";
  botDiv.appendChild(botText);
  botDiv.appendChild(botImg);
  messagesContainer.appendChild(botDiv);

  messagesContainer.scrollTop = messagesContainer.scrollHeight - messagesContainer.clientHeight;
}
