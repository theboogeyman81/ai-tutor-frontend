const askButton = document.getElementById("askButton");
const questionInput = document.getElementById("questionInput");
const answerDiv = document.getElementById("answer");

const clickSound = document.getElementById("clickSound");
const answerSound = document.getElementById("answerSound");
const errorSound = document.getElementById("errorSound");

let loadingInterval;

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
  clickSound.play();

  if (!question) {
    errorSound.play();
    answerDiv.innerHTML = "⚠️ Please type something!";
    return;
  }

  showLoadingDots();

  try {
    const response = await fetch("http://127.0.0.1:5000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    const data = await response.json();
    stopLoadingDots();
    answerDiv.innerHTML = "🎉 " + data.answer;
    answerSound.play();
  } catch (error) {
    console.error(error);
    stopLoadingDots();
    answerDiv.innerHTML = "⚠️ Oops! Something went wrong.";
    errorSound.play();
  }
});
