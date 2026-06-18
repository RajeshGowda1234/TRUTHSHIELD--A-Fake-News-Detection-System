// popup.js

document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById("login-section");
    const appSection = document.getElementById("app-section");
    const analyzeBtn = document.getElementById("analyze-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const resultArea = document.getElementById("result-area");
    const predictionLabel = document.getElementById("prediction-label");
    const confidenceScore = document.getElementById("confidence-score");
    const loading = document.getElementById("loading");

    // 1. Check if we have a token
    chrome.storage.local.get(["auth_token"], (result) => {
        if (result.auth_token) {
            showApp(result.auth_token);
        } else {
            showLogin();
        }
    });

    function showLogin() {
        loginSection.classList.remove("hidden");
        appSection.classList.add("hidden");
    }

    function showApp(token) {
        loginSection.classList.add("hidden");
        appSection.classList.remove("hidden");

        // Attach event listener with token closure
        analyzeBtn.onclick = () => analyzeText(token);
    }

    // 2. Logout Logic
    logoutBtn.addEventListener("click", () => {
        chrome.storage.local.remove("auth_token", () => {
            showLogin();
        });
    });

    // 3. Analyze Logic
    async function analyzeText(token) {
        // Reset UI
        resultArea.style.display = "none";
        loading.classList.remove("hidden");
        analyzeBtn.disabled = true;

        try {
            // Get selected text from active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error("No active tab found");
            }

            // Script injection to get selection
            const results = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => window.getSelection().toString()
            });

            const selectedText = results[0].result;

            if (!selectedText || selectedText.trim().length === 0) {
                throw new Error("Please select some text first!");
            }

            // DEBUG: Check what we are sending
            console.log("Analyzing text with token...");

            // API Call
            const response = await fetch("https://truthshield-a-fake-news-detection-system.onrender.com/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ text: selectedText })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    // Token expired or invalid
                    chrome.storage.local.remove("auth_token");
                    showLogin();
                    throw new Error("Session expired. Please log in again.");
                }
                throw new Error(data.error || "Server error");
            }

            // Show Results
            displayResult(data);

        } catch (err) {
            resultArea.style.display = "block";
            predictionLabel.innerText = "Error";
            predictionLabel.className = "error";
            confidenceScore.innerText = err.message;
        } finally {
            loading.classList.add("hidden");
            analyzeBtn.disabled = false;
        }
    }

    function displayResult(data) {
        resultArea.style.display = "block";
        const pred = data.prediction;
        const conf = (data.confidence * 100).toFixed(1);

        predictionLabel.innerText = pred; // "Fake", "Real", "Uncertain"

        if (pred === "Fake") {
            predictionLabel.className = "error";
            predictionLabel.innerText = "⚠️ Potentially FAKE";
        } else if (pred === "Real") {
            predictionLabel.className = "success";
            predictionLabel.innerText = "✅ Likely REAL";
        } else {
            predictionLabel.className = "warning";
        }

        confidenceScore.innerText = `Confidence: ${conf}%`;
    }
});
