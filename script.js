// script.js
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const micBtn = document.getElementById("mic");
const messages = document.getElementById("messages");
const mouth = document.getElementById("bot-mouth");
const leftEye = document.getElementById("left-eye");
const rightEye = document.getElementById("right-eye");

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
    mouth.classList.add("mouth-talking");

    const response = await fetch("https://chatbot2-0-pobq.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });

    const data = await response.json();
    const botReply = data.reply || "Sorry, no response.";
    addMessage("bot", botReply);

    const utterance = new SpeechSynthesisUtterance(botReply);
    utterance.onend = () => mouth.classList.remove("mouth-talking");
    speechSynthesis.speak(utterance);
  } catch (error) {
    addMessage("bot", "❌ Error: Unable to reach the server.");
    mouth.classList.remove("mouth-talking");
    console.error(error);
  }
}

function addMessage(sender, text) {
  const div = document.createElement("div");
  div.className = `response ${sender}`;
  const span = document.createElement("span");
  span.textContent = text;
  div.appendChild(span);
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Voice recognition
micBtn.onclick = () => {
  if (!("webkitSpeechRecognition" in window)) {
    alert("Speech recognition not supported in this browser.");
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

// Blink eyes animation
setInterval(() => {
  leftEye.setAttribute("fill", "#333");
  rightEye.setAttribute("fill", "#333");
  setTimeout(() => {
    leftEye.setAttribute("fill", "#fff");
    rightEye.setAttribute("fill", "#fff");
  }, 150);
}, 4000);
