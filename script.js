const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerDiv = document.getElementById("answer");
const mainContainer = document.getElementById("mainContainer");

const clickSound = document.getElementById("clickSound");
const answerSound = document.getElementById("answerSound");
const errorSound = document.getElementById("errorSound");

let loadingInterval;

// Start in "start" mode
mainContainer.classList.add("start");

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
    answerDiv.innerHTML = `⏳ Thinking${dots}`;
  }, 500);
}

function stopLoadingDots() {
  clearInterval(loadingInterval);
}

async function handleAsk() {
  const question = questionInput.value.trim();
  playSound(clickSound);

  if (!question) {
    playSound(errorSound);
    answerDiv.innerHTML = "⚠️ Please type something!";
    return;
  }

  // Activate layout transition
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
      answerDiv.innerHTML = "🎉 " + data.answer;
      playSound(answerSound);
    } else {
      answerDiv.innerHTML = "⚠️ Couldn't find an answer.";
      playSound(errorSound);
    }

    // Scroll to top
    answerDiv.scrollTo({ top: 0, behavior: "smooth" });

  } catch (error) {
    console.error("❌ Fetch Error:", error);
    stopLoadingDots();
    askButton.disabled = false;
    questionInput.disabled = false;
    askButton.textContent = "🎤 Ask Me";
    answerDiv.innerHTML = "⚠️ Oops! Something went wrong.";
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
