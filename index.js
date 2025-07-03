const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");
const messages = document.getElementById("messages");
const mouth = document.getElementById("bot-mouth");

// Theme toggle
document.getElementById("theme-toggle").onclick = () => {
  document.body.classList.toggle("dark");
};

// Send message
sendBtn.onclick = () => sendMessage();
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage("user", userMessage);
  input.value = "";

  try {
    // Animate mouth before fetch
    mouth.classList.add("mouth-talking");

    const response = await fetch("http://localhost:3000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    const botReply = data.reply || "Sorry, no response.";
    addMessage("bot", botReply);

    // Speak the reply
    const utterance = new SpeechSynthesisUtterance(botReply);
    utterance.onend = () => mouth.classList.remove("mouth-talking");
    speechSynthesis.speak(utterance);
  } catch (error) {
    addMessage("bot", "❌ Error: Unable to reach the server.");
    mouth.classList.remove("mouth-talking");
    console.error(error);
  }
}

// Add chat message
function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `response ${sender}`;
  const span = document.createElement("span");
  span.textContent = text;
  div.appendChild(span);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Voice-to-text (speech recognition)
micBtn.onclick = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();
  micBtn.textContent = "🎙️";

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    input.value = transcript;
    micBtn.textContent = "🎤";
    sendMessage();
  };

  recognition.onerror = () => {
    micBtn.textContent = "🎤";
  };

  recognition.onend = () => {
    micBtn.textContent = "🎤";
  };
};
