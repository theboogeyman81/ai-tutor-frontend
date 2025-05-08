const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerDiv = document.getElementById("answer");

const clickSound = document.getElementById("clickSound");
const answerSound = document.getElementById("answerSound");
const errorSound = document.getElementById("errorSound");

let loadingInterval;

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

askButton.addEventListener("click", async () => {
  const question = questionInput.value.trim();
  playSound(clickSound);

  if (!question) {
    playSound(errorSound);
    answerDiv.innerHTML = "⚠️ Please type something!";
    return;
  }

  showLoadingDots();
  askButton.disabled = true;
  questionInput.disabled = true;

  try {
    const response = await fetch("https://ai-tutor-for-kids-1.onrender.com/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, session_id: "default" })
    });

    stopLoadingDots();
    askButton.disabled = false;
    questionInput.disabled = false;

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
  } catch (error) {
    console.error("❌ Fetch Error:", error);
    stopLoadingDots();
    askButton.disabled = false;
    questionInput.disabled = false;
    answerDiv.innerHTML = "⚠️ Oops! Something went wrong.";
    playSound(errorSound);
  }
});
