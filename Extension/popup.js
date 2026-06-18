const API_URL = "https://truthshield-a-fake-news-detection-system.onrender.com/predict";
const MAX_CHARS = 5000;

// DOM Elements
const analyzeBtn = document.getElementById("analyzeBtn");
const btnText    = document.getElementById("btnText");
const btnLoader  = document.getElementById("btnLoader");
const statusDiv  = document.getElementById("status");
const initialView = document.getElementById("initialView");
const resultView  = document.getElementById("resultView");
const predictionText = document.getElementById("predictionText");
const confidenceText = document.getElementById("confidenceText");
const confidenceBar  = document.getElementById("confidenceBar");
const realBar  = document.getElementById("realBar");
const fakeBar  = document.getElementById("fakeBar");
const realPct  = document.getElementById("realPct");
const fakePct  = document.getElementById("fakePct");

// Tab elements
const tabSelected = document.getElementById("tabSelected");
const tabManual   = document.getElementById("tabManual");
const selectedMode = document.getElementById("selectedMode");
const manualMode  = document.getElementById("manualMode");
const manualText  = document.getElementById("manualText");
const manualCharCount = document.getElementById("manualCharCount");

// Current mode
let currentMode = "selected"; // "selected" or "manual"

// ── Tab Switching ──────────────────────────────────────────────────────
tabSelected.addEventListener("click", () => {
  currentMode = "selected";
  tabSelected.classList.add("active");
  tabManual.classList.remove("active");
  selectedMode.style.display = "block";
  manualMode.style.display = "none";
  resetResult();
});

tabManual.addEventListener("click", () => {
  currentMode = "manual";
  tabManual.classList.add("active");
  tabSelected.classList.remove("active");
  manualMode.style.display = "block";
  selectedMode.style.display = "none";
  resetResult();
});

// Char counter for manual textarea
manualText.addEventListener("input", () => {
  const len = manualText.value.length;
  if (len > MAX_CHARS) {
    manualText.value = manualText.value.slice(0, MAX_CHARS);
  }
  manualCharCount.textContent = `${Math.min(len, MAX_CHARS)} / ${MAX_CHARS}`;
});

// ── Helpers ────────────────────────────────────────────────────────────
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

function resetResult() {
  resultView.classList.remove("visible", "is-fake", "is-real", "is-uncertain");
  confidenceBar.style.width = "0%";
  realBar.style.width = "0%";
  fakeBar.style.width = "0%";
  statusDiv.textContent = "";
}

function showResult(prediction, confidence, probReal, probFake) {
  // Hide instructions
  if (initialView) initialView.style.display = "none";

  // Reset classes
  resultView.className = "result-card";
  resultView.classList.remove("is-fake", "is-real", "is-uncertain", "visible");

  let typeClass = "is-uncertain";
  if (prediction === "Fake") typeClass = "is-fake";
  if (prediction === "Real") typeClass = "is-real";

  resultView.classList.add(typeClass);

  // Verdict label with emoji
  const emoji = prediction === "Real" ? "✅" : prediction === "Fake" ? "🚫" : "⚠️";
  predictionText.textContent = `${emoji} ${prediction}`;

  // Confidence
  const pct = (confidence * 100).toFixed(1) + "%";
  confidenceText.textContent = pct;
  confidenceBar.style.width = "0%";

  // Prob bars
  const realPctVal  = (probReal  * 100).toFixed(1) + "%";
  const fakePctVal  = (probFake  * 100).toFixed(1) + "%";
  realPct.textContent = realPctVal;
  fakePct.textContent = fakePctVal;
  realBar.style.width = "0%";
  fakeBar.style.width = "0%";

  // Show card then animate bars
  resultView.classList.add("visible");

  setTimeout(() => {
    confidenceBar.style.width = pct;
    realBar.style.width = realPctVal;
    fakeBar.style.width = fakePctVal;
  }, 120);
}

async function callAPI(text) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Server error: ${response.status}`);
  }

  return response.json();
}

// ── Main Analyze Button ────────────────────────────────────────────────
analyzeBtn.addEventListener("click", async () => {
  resetResult();
  setLoading(true);

  try {
    let selectedText = "";

    if (currentMode === "manual") {
      // Manual mode — use textarea
      selectedText = (manualText.value || "").trim();
      if (!selectedText) {
        statusDiv.textContent = "Please enter some text to analyze.";
        setLoading(false);
        return;
      }
    } else {
      // Selected text mode — get selection from active tab
      statusDiv.textContent = "Reading selected text...";

      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const [{ result }] = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => window.getSelection().toString(),
        });

        selectedText = (result || "").trim();
      } catch (scriptErr) {
        // If scripting fails (e.g. on chrome:// pages), ask user to switch to manual
        statusDiv.textContent = "⚠️ Cannot read this page. Use Manual Input tab instead.";
        setLoading(false);
        return;
      }

      if (!selectedText) {
        statusDiv.textContent = "No text selected. Please highlight news text first, or use Manual Input tab.";
        setLoading(false);
        return;
      }
    }

    if (selectedText.length < 50) {
      statusDiv.textContent = "Text too short. Please provide at least 50 characters.";
      setLoading(false);
      return;
    }

    statusDiv.textContent = "Analyzing with AI...";

    const data = await callAPI(selectedText);

    setLoading(false);
    statusDiv.textContent = "";

    const pred     = data.prediction || "Uncertain";
    const conf     = data.confidence || 0;
    const probReal = data.prob_real   || 0;
    const probFake = data.prob_fake   || 0;

    showResult(pred, conf, probReal, probFake);

  } catch (err) {
    console.error(err);
    setLoading(false);
    statusDiv.textContent = "❌ Error: " + (err.message || "Could not connect to server.");
  }
});
