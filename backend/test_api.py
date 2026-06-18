import requests
import json

URL = "http://127.0.0.1:5000/predict"

test_cases = [
    "The European Central Bank kept interest rates unchanged on Thursday.",
    "Breaking news: New research proves that eating 10 pounds of chocolate a day will make you live forever.",
    "The United States Census Bureau is a principal agency of the U.S. Federal Statistical System."
]

print("--- Backend Prediction Tests ---")
for text in test_cases:
    try:
        response = requests.post(URL, json={"text": text})
        data = response.json()
        print(f"Text: {text[:50]}...")
        if "error" in data:
            print(f"Error: {data['error']}\n")
        else:
            print(f"Prediction: {data['prediction']} (Conf: {data['confidence']:.2f})")
            print(f"Prob Fake: {data['prob_fake']:.2f}, Prob Real: {data['prob_real']:.2f}\n")
    except Exception as e:
        print(f"Request failed: {e}\n")
