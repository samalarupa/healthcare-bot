from flask import Flask, render_template, request, jsonify
import json
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import os

app = Flask(__name__)

# ---------- Load your dataset ----------
DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "healthcare_dataset.json")

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

# ---------- Extract questions (patterns) and answers (responses) ----------
questions = []
answers = []

for intent in data.get("intents", []):
    for p in intent.get("patterns", []):
        questions.append(p.lower())
        # choose first response; can randomize later
        answers.append(intent.get("responses", ["No response found."])[0])

# ---------- Build TF-IDF model ----------
vectorizer = TfidfVectorizer()
tfidf_matrix = vectorizer.fit_transform(questions)

def get_best_answer(user_input):
    user_input = user_input.lower()
    user_vec = vectorizer.transform([user_input])
    similarities = cosine_similarity(user_vec, tfidf_matrix)[0]
    best_idx = np.argmax(similarities)
    best_score = similarities[best_idx]

    print(f"🔍 Best match: '{questions[best_idx]}' (score={best_score:.2f})")

    if best_score >= 0.5:
        return answers[best_idx]
    else:
        return "Sorry, I can only answer questions related to medicines and Ayurvedic remedies."

# ---------- Routes ----------
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get", methods=["POST"])
def get_bot_response():
    user_msg = request.form["msg"]
    bot_reply = get_best_answer(user_msg)
    return jsonify({"response": bot_reply})

# ---------- Run ----------
if __name__ == "__main__":
    app.run(debug=True)
