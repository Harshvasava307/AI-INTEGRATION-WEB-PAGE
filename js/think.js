const API_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = "[Enter your token from open router]"; // Replace with your key

const chatBox = document.getElementById("chatBox");
const input = document.getElementById("userInput");
const btn = document.getElementById("askBtn");
const modelSelect = document.getElementById("modelSelect");

let firstMessage = true;

// Send user input to API
async function askAI() {
  const message = input.value.trim();
  if (!message) return;

  if (firstMessage) firstMessage = false;

  addMessage(message, "user");
  input.value = "";

  const loadingEl = addMessage("Thinking", "ai", true);

  try {
    const selectedModel = modelSelect.value;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: message }
        ]
      })
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    // OpenRouter AI returns content in data.choices[0].message.content
    // But sometimes in .message.content[0] depending on model
    let content = "";

    try {
      content = data.choices[0].message.content;
    } catch {
      content = "(No response content)";
    }

    loadingEl.classList.remove("loading");
    typeText(loadingEl, content);

  } catch (err) {
    console.error(err);
    loadingEl.classList.remove("loading");
    loadingEl.innerHTML = `<p>Network error. Check console for details.</p>`;
  }
}

// Add message element
function addMessage(text, sender, isLoading=false) {
  const msg = document.createElement("div");
  msg.classList.add("message", sender);
  msg.innerHTML = sender === "ai" ? marked.parse(text) : text;
  if (isLoading) msg.classList.add("loading");
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg;
}

// Typing animation
function typeText(el, text) {
  el.innerHTML = '';
  let i = 0;
  const interval = setInterval(() => {
    el.innerHTML = marked.parse(text.slice(0, i));
    chatBox.scrollTop = chatBox.scrollHeight;
    i++;
    if (i > text.length) clearInterval(interval);
  }, 15);
}

// Event listeners
btn.addEventListener("click", askAI);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    askAI();
  }
});
