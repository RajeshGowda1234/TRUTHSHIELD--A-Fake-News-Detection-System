// content.js
console.log("TruthShield Content Script Loaded");

window.addEventListener("message", (event) => {
    // Security check: ensure the message is from trustable source logic if needed
    // For now we trust the site matching the manifest.
    
    if (event.data && event.data.type === "TRUTHSHIELD_AUTH") {
        console.log("Received Auth Token in Content Script:", event.data.token);
        
        // Send to background script
        chrome.runtime.sendMessage({
            action: "SAVE_TOKEN",
            token: event.data.token
        }, (response) => {
            console.log("Background response:", response);
        });
    }
});
