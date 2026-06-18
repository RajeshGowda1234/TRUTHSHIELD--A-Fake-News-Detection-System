const API_URL = "https://truthshield-a-fake-news-detection-system.onrender.com/predict";

// DOM Elements
const analyzeBtn = document.getElementById("analyzeBtn");
const btnText = document.getElementById("btnText");
const btnLoader = document.getElementById("btnLoader");
const statusDiv = document.getElementById("status");
const initialView = document.getElementById("initialView");
const resultView = document.getElementById("resultView");
const predictionText = document.getElementById("predictionText");
const confidenceText = document.getElementById("confidenceText");
const confidenceBar = document.getElementById("confidenceBar");

// Helper to set Loading State
function setLoading(isLoading) {
  if (isLoading) {
    analyzeBtn.disabled = true;
    btnText.style.display = "none";
    btnLoader.style.display = "block";
    statusDiv.textContent = "";
  } else {
    analyzeBtn.disabled = false;
    btnText.style.display = "block";
    btnLoader.style.display = "none";
  }
}

// Helper to reset and show result
function showResult(prediction, confidenceScore) {
  // Hide initial instructions if visible
  initialView.style.display = "none";
  
  // Reset classes
  resultView.className = "result-card"; 
  resultView.classList.remove("is-fake", "is-real", "is-uncertain", "visible");
  
  // Determine Type
  let typeClass = "is-uncertain";
  if (prediction === "Fake") typeClass = "is-fake";
  if (prediction === "Real") typeClass = "is-real";
  
  resultView.classList.add(typeClass);
  
  // Update Text
  predictionText.textContent = prediction;
  
  const percentage = (confidenceScore * 100).toFixed(1) + "%";
  confidenceText.textContent = percentage;
  
  // Animate Bar (wait a tick for transition)
  confidenceBar.style.width = "0%";
  setTimeout(() => {
    confidenceBar.style.width = percentage;
  }, 100);

  // Show Card
  setTimeout(() => {
    resultView.classList.add("visible");
  }, 50);
}

analyzeBtn.addEventListener("click", async () => {
  setLoading(true);
  statusDiv.textContent = "Reading text...";
  
  // Reset view
  resultView.classList.remove("visible");
  confidenceBar.style.width = "0%";
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => window.getSelection().toString(),
    });

    const selectedText = (result || "").trim();

    if (!selectedText) {
      statusDiv.textContent = "Please select news text on the page.";
      setLoading(false);
      return;
    }

    if (selectedText.length < 50) { // Lowered limit for testing ease, orig was 200
      statusDiv.textContent = "Text too short. Please select more text.";
      setLoading(false);
      return;
    }

    statusDiv.textContent = "Analyzing pattern...";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: selectedText }),
    });

    if (!response.ok) {
      statusDiv.textContent = "Server error: " + response.status;
      setLoading(false);
      return;
    }

    const data = await response.json();

    // Success
    setLoading(false);
    statusDiv.textContent = ""; // Clear status on success
    
    const pred = data.prediction || "Unknown";
    const conf = data.confidence || 0;
    
    showResult(pred, conf);

  } catch (err) {
    console.error(err);
    setLoading(false);
    statusDiv.textContent = "Error: Could not connect to analysis server.";
  }
});
