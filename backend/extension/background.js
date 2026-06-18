// background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SAVE_TOKEN") {
        const token = request.token;

        chrome.storage.local.set({ "auth_token": token }, () => {
            console.log("Token saved securely in extension storage.");
            sendResponse({ status: "success", message: "Token stored" });
        });

        return true; // Keep channel open for async response
    }

    if (request.action === "LOGOUT") {
        chrome.storage.local.remove("auth_token", () => {
            sendResponse({ status: "success", message: "Logged out" });
        });
        return true;
    }
});
