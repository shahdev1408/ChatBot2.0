document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("input");
  const sendButton = document.getElementById("send");
  const themeToggle = document.getElementById("theme-toggle");

  inputField.addEventListener("keydown", (e) => {
    if (e.code === "Enter") sendMessage();
  });

  sendButton.addEventListener("click", sendMessage);

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
});

function sendMessage() {
  const inputField = document.getElementById("input");
  const input = inputField.value.trim();
  if (!input) return;
  inputField.value = "";
  output(input);
}

async function output(input) {
  const messagesContainer = document.getElementById("messages");

  const botText = addChat(input, "Typing..."); // This gives us the span to update

  try {
    const response = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input })
    });

    const data = await response.json();
    const reply = data.response || "Sorry, I didn't get that.";

    setTimeout(() => {
      botText.innerText = reply;
      textToSpeech(reply);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);

  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    botText.innerText = "Sorry, something went wrong.";
  }
}

function addChat(input, product) {
  const messagesContainer = document.getElementById("messages");

  // User message
  const userDiv = document.createElement("div");
  userDiv.id = "user";
  userDiv.className = "user response";
  userDiv.innerHTML = `<img src="user.png" class="avatar"><span>${input}</span>`;
  messagesContainer.appendChild(userDiv);

  // Bot placeholder
  const botDiv = document.createElement("div");
  const botImg = document.createElement("img");
  const botText = document.createElement("span");

  botDiv.id = "bot";
  botDiv.className = "bot response";
  botImg.src = "bot-mini.png";
  botImg.className = "avatar";

  botText.innerText = product;

  botDiv.appendChild(botText);
  botDiv.appendChild(botImg);
  messagesContainer.appendChild(botDiv);

  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  return botText; // Return this so we can update it later
}
