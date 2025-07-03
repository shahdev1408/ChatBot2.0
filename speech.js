const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = "en-US";
recognition.interimResults = false;

micBtn.addEventListener("click", () => {
  recognition.start();
});

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  inputField.value = transcript;
  sendBtn.click();
};

recognition.onerror = (event) => {
  alert("🎙️ Voice error: " + event.error);
};

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  speechSynthesis.speak(utterance);
}
