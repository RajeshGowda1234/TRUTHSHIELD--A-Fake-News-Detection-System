import sqlite3
import jwt
import datetime
import bcrypt
from flask import Flask, request, jsonify, render_template, redirect, url_for, session
from flask_cors import CORS
import joblib
import os
import re
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Ensure NLTK resources are available
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('tokenizers/punkt_tab')
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')
    nltk.download('stopwords')

# Expanded stop words to remove source bias
stop_words = set(stopwords.words("english"))
source_markers = ["reuters", "washington", "london", "new", "york", "paris", "berlin", "beijing", "tokyo", "moscow"]
for word in source_markers:
    stop_words.add(word)

def clean_text(text):
    """Enhanced cleaning to remove source bias."""
    text = str(text).lower()
    # Remove "(Reuters) -" style prefixes or similar source headers
    text = re.sub(r'^[a-z\s]+ \(reuters\) - ', ' ', text)
    text = re.sub(r"[^a-zA-Z ]", " ", text)
    tokens = word_tokenize(text)
    tokens = [t for t in tokens if t not in stop_words]
    return " ".join(tokens)

# Load trained model and vectorizer (Using V2 updated models)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "truthshield_model_v2.pkl")
VEC_PATH = os.path.join(BASE_DIR, "truthshield_vectorizer_v2.pkl")

try:
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VEC_PATH)
    MODEL_LOADED = True
except Exception as e:
    print(f"Error loading model: {e}")
    MODEL_LOADED = False

app = Flask(__name__)
# Allow * origins. remove supports_credentials to avoid conflicts with *
CORS(app, resources={r"/*": {"origins": "*"}}) 
app.secret_key = "supersecretkey"  # Change this in production

# Database Path (Robust)
DB_NAME = os.path.join(BASE_DIR, "database.db")

# --- Database Helper Functions ---
def init_db():
    """Initialize the database with a users table."""
    with sqlite3.connect(DB_NAME) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        ''')
        conn.commit()

init_db()  # Run on startup

def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

# --- Authentication Routes ---

@app.route("/")
def home():
    return redirect(url_for('login'))

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        # Handle JSON (React/API)
        data = request.get_json(silent=True)
        if data:
            username = data.get("username") or data.get("email") # Handle email as username if needed
            password = data.get("password")
            
            # Simple validation
            if not username or not password:
                 return jsonify({"error": "Missing username or password"}), 400
                 
            # Hash password
            hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            try:
                with sqlite3.connect(DB_NAME) as conn:
                    cursor = conn.cursor()
                    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_pw))
                    conn.commit()
                return jsonify({"message": "Signup successful! Please login."}), 201
            except sqlite3.IntegrityError:
                return jsonify({"error": "Username/Email already exists!"}), 409

        # Handle Form (Legacy/Template)
        username = request.form["username"]
        password = request.form["password"]

        # Hash password
        hashed_pw = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        try:
            with sqlite3.connect(DB_NAME) as conn:
                cursor = conn.cursor()
                cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_pw))
                conn.commit()
            return redirect(url_for('login'))
        except sqlite3.IntegrityError:
            return "Username already exists!"

    return render_template("signup.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        # Handle JSON (React/API)
        data = request.get_json(silent=True)
        if data:
            username = data.get("username") or data.get("email")
            password = data.get("password")
            
            if not username or not password:
                return jsonify({"error": "Missing credentials"}), 400
                
            conn = get_db_connection()
            user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
            conn.close()

            if user and bcrypt.checkpw(password.encode('utf-8'), user["password"]):
                # Generate JWT Token
                token = jwt.encode({
                    "user": username,
                    "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
                }, app.secret_key, algorithm="HS256")
                
                return jsonify({
                    "message": "Login successful",
                    "token": token,
                    "username": username
                }), 200
            else:
                return jsonify({"error": "Invalid credentials"}), 401

        # Handle Form (Legacy)
        username = request.form["username"]
        password = request.form["password"]

        conn = get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE username = ?", (username,)).fetchone()
        conn.close()

        if user and bcrypt.checkpw(password.encode('utf-8'), user["password"]):
            # Generate JWT Token
            token = jwt.encode({
                "user": username,
                "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }, app.secret_key, algorithm="HS256")
            
            # Store in session for website usage
            session['user'] = username
            session['token'] = token # In a real app, maybe store this differently or just use session
            
            return redirect(url_for('dashboard'))
        else:
            return "Invalid credentials"

    return render_template("login.html")

@app.route("/dashboard")
def dashboard():
    if 'user' not in session:
        return redirect(url_for('login'))
    
    return render_template("dashboard.html", username=session['user'], token=session.get('token'))

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for('login'))

# --- ML API Route (Protected) ---
@app.route("/predict", methods=["POST"])
def predict():
    if not MODEL_LOADED:
        return jsonify({"error": "Model not loaded"}), 500

    # Define auth_header first
    auth_header = request.headers.get('Authorization')
    token = None

    # Verify Token (Optional for now to allow Extension/Frontend to work easily)
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
    
    # Fallback: Check body
    if not token:
        try:
            body_data = request.get_json(force=True, silent=True)
            if body_data:
                token = body_data.get('token')
        except Exception:
            pass

    # For now, allow requests without token for easier testing
    if not token:
        print("DEBUG: Token Missing - Proceeding anyway (Auth Optional)")
        # return jsonify({"error": "Token is missing!"}), 401 
    else:
        try:
            decoded = jwt.decode(token, app.secret_key, algorithms=["HS256"])
            print(f"DEBUG: Token Decoded successfully: {decoded}")
        except Exception as e:
            print(f"DEBUG: Token decode failed: {e}")
            # return jsonify({"error": "Token is invalid!"}), 401

    # Proceed with prediction
    try:
        data = request.get_json()
        text = data.get("text", "").strip()

        if not text:
            return jsonify({"error": "No text provided"}), 400

        MAX_CHARS = 5000
        if len(text) > MAX_CHARS:
            return jsonify({"error": f"Input too long. Max: {MAX_CHARS}"}), 400

        # Clean text before vectorization
        cleaned_text = clean_text(text)
        
        if not cleaned_text:
            return jsonify({"error": "Text empty after cleaning"}), 400

        text_vec = vectorizer.transform([cleaned_text])
        proba = model.predict_proba(text_vec)[0]
        # In our dataset: 0 = Fake, 1 = Real
        prob_fake, prob_real = float(proba[0]), float(proba[1])
        max_conf = max(prob_fake, prob_real)

        # Adjusted thresholds for better sensitivity (52% confidence required)
        FAKE_STRONG = 0.52
        REAL_STRONG = 0.52

        print(f"DEBUG Prediction: Fake={prob_fake:.2f}, Real={prob_real:.2f}")

        if prob_fake >= FAKE_STRONG:
            label = "Fake"
        elif prob_real >= REAL_STRONG:
            label = "Real"
        else:
            label = "Uncertain"

        return jsonify({
            "prediction": label,
            "confidence": max_conf,
            "prob_fake": prob_fake,
            "prob_real": prob_real
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
