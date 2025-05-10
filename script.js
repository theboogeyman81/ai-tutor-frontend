const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerDiv = document.getElementById("answer");
const mainContainer = document.getElementById("mainContainer");

const clickSound = document.getElementById("clickSound");
const answerSound = document.getElementById("answerSound");
const errorSound = document.getElementById("errorSound");

const typingText = document.getElementById("typingText");
const sparkleContainer = document.getElementById("sparkle-container");

let loadingInterval;
let sparkleTimeout;

// Start in "start" mode
mainContainer.classList.add("start");
typingText.textContent = "💡 I'm here to help! Ask me something fun like \"What is gravity?\" or \"Why is the sky blue?\" 🌈";

function playSound(sound) {
  if (sound && typeof sound.play === "function") {
    sound.currentTime = 0;
    sound.play().catch(err => console.warn("Sound error:", err));
  }
}

function showLoadingDots() {
  let dotCount = 0;
  loadingInterval = setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    const dots = ".".repeat(dotCount);
    typingText.textContent = `⏳ Thinking${dots}`;
  }, 500);
}

function stopLoadingDots() {
  clearInterval(loadingInterval);
  typingText.textContent = "";
}

function sparkle() {
  const sparkle = document.createElement("div");
  sparkle.textContent = "✨";
  sparkle.style.position = "absolute";
  sparkle.style.left = `${Math.random() * 100}%`;
  sparkle.style.top = `${Math.random() * 100}%`;
  sparkle.style.fontSize = `${Math.random() * 24 + 12}px`;
  sparkle.style.opacity = "1";
  sparkle.style.transition = "opacity 1s ease-out";
  sparkleContainer.appendChild(sparkle);

  setTimeout(() => {
    sparkle.style.opacity = "0";
    setTimeout(() => sparkle.remove(), 1000);
  }, 300);
}

function triggerSparkleRain(count = 20) {
  clearTimeout(sparkleTimeout);
  for (let i = 0; i < count; i++) {
    setTimeout(sparkle, i * 100);
  }
  sparkleTimeout = setTimeout(() => {
    sparkleContainer.innerHTML = "";
  }, count * 100 + 1000);
}

function typeAnswer(text) {
  typingText.innerHTML = ""; // clear old content
  let index = 0;

  function type() {
    if (index < text.length) {
      typingText.innerHTML += text.charAt(index) === "\n" ? "<br>" : text.charAt(index);
      index++;
      setTimeout(type, 25);
    }
  }

  type();
}

function scrollToAnswer() {
  setTimeout(() => {
    answerDiv.scrollTo({ top: 0, behavior: "smooth" });
  }, 300);
}

async function handleAsk() {
  const question = questionInput.value.trim();
  playSound(clickSound);

  if (!question) {
    playSound(errorSound);
    typingText.textContent = "⚠️ Please type something!";
    return;
  }

  // Layout transition
  mainContainer.classList.remove("start");
  mainContainer.classList.add("active");

  askButton.disabled = true;
  questionInput.disabled = true;
  askButton.textContent = "Thinking...";
  showLoadingDots();

  try {
    const response = await fetch("https://ai-tutor-for-kids-1.onrender.com/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, session_id: "default" })
    });

    stopLoadingDots();
    askButton.disabled = false;
    questionInput.disabled = false;
    askButton.textContent = "🎤 Ask Me";

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.answer) {
      triggerSparkleRain();
      playSound(answerSound);
      typeAnswer("🎉 " + data.answer);
      scrollToAnswer();
    } else {
      playSound(errorSound);
      typingText.textContent = "⚠️ Couldn't find an answer.";
    }

  } catch (error) {
    console.error("❌ Fetch Error:", error);
    stopLoadingDots();
    askButton.disabled = false;
    questionInput.disabled = false;
    askButton.textContent = "🎤 Ask Me";
    typingText.textContent = "⚠️ Oops! Something went wrong.";
    playSound(errorSound);
  }
}

// Click event
askButton.addEventListener("click", handleAsk);

// Enter key triggers ask
questionInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    handleAsk();
  }
});
