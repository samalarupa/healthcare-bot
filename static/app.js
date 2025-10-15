const chatWindow = document.getElementById("chat-window");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");

let firstMessage = true;

function addMessage(sender, text) {
  if (firstMessage && sender === "user") {
    const welcomeMsg = document.querySelector(".welcome-message");
    if (welcomeMsg) {
      welcomeMsg.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => welcomeMsg.remove(), 300);
    }
    firstMessage = false;
  }

  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}-wrapper`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.innerText = sender === "user" ? "U" : "AI";

  const message = document.createElement("div");
  message.className = "message";

  if (text === "Typing...") {
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = `
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    `;
    message.appendChild(typingIndicator);
  } else {
    message.innerText = text;
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(message);
  chatWindow.appendChild(wrapper);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;
  
  addMessage("user", message);
  input.value = "";
  addMessage("bot", "Typing...");
  
  try {
    const resp = await fetch("/get", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `msg=${encodeURIComponent(message)}`
    });
    const data = await resp.json();
    
    const lastBotWrapper = document.querySelector(".bot-wrapper:last-child");
    lastBotWrapper.remove();
    addMessage("bot", data.response);
  } catch (err) {
    console.error(err);
    const lastBotWrapper = document.querySelector(".bot-wrapper:last-child");
    if (lastBotWrapper) {
      lastBotWrapper.remove();
    }
    addMessage("bot", "Sorry, I'm having trouble connecting. Please try again.");
  }
});

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeOut {
    from { opacity: 1; transform: scale(1); }
    to { opacity: 0; transform: scale(0.9); }
  }
`;
document.head.appendChild(style);