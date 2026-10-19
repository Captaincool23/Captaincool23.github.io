"""ORBIT-Bot backend: answers questions about Raj from assets/robot-knowledge.json.

Run from the project root. This serves the portfolio and the API together:

    python -m pip install -r backend/requirements.txt
    python -m uvicorn backend.robot_server:app --port 8000

To run it next to another static server instead, start it on another port and point the dock at it:
<aside id="orbit-dock" data-api="http://localhost:8001/api/ask-robot">.
Without this server the page falls back to matching the same JSON in the browser.
"""
from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, field_validator

ROOT = Path(__file__).resolve().parent.parent
KNOWLEDGE_PATH = ROOT / "assets" / "robot-knowledge.json"
SITE_SUFFIXES = {".html", ".css", ".js", ".pdf"}

Mood = Literal["happy", "excited", "scanning", "thinking"]

STOPWORDS = frozenset(
    "a an the is are was were be been am to of in on at for with and or but about what whats who how "
    "does do did his her he she him me tell can could would please give any some it its this that "
    "these those s".split()
)


def stem(token: str) -> str:
    if len(token) > 4 and token.endswith("ies"):
        return token[:-3] + "y"
    if len(token) > 5 and token.endswith("ing"):
        return token[:-3]
    if len(token) > 4 and token.endswith("ed"):
        return token[:-2]
    if len(token) > 3 and token.endswith("s") and not token.endswith("ss"):
        return token[:-1]
    return token


def tokenize(text: str) -> list[str]:
    words = re.sub(r"[^a-z0-9]+", " ", text.lower()).split()
    return [stem(word) for word in words if len(word) > 1 and word not in STOPWORDS]


class KnowledgeEngine:
    """TF-IDF cosine similarity combined with keyword-intent routing and near-exact question matching."""

    def __init__(self, knowledge: dict) -> None:
        self.meta = knowledge["meta"]
        self.threshold = float(self.meta.get("threshold", 0.18))
        self.intents = knowledge["intents"]
        self.docs = []
        document_frequency: Counter[str] = Counter()
        for intent in self.intents:
            counts: Counter[str] = Counter()
            for question in intent["questions"]:
                for token in tokenize(question):
                    counts[token] += 2
            for keyword in intent["keywords"]:
                for token in tokenize(keyword):
                    counts[token] += 3
            for token in tokenize(intent["title"]):
                counts[token] += 2
            for token in tokenize(intent["answer"]):
                counts[token] += 1
            phrases = [" ".join(tokenize(keyword)) for keyword in intent["keywords"]]
            self.docs.append({
                "intent": intent,
                "counts": counts,
                "keyword_tokens": {token for keyword in intent["keywords"] for token in tokenize(keyword)},
                "phrases": [phrase for phrase in phrases if " " in phrase],
                "question_sets": [set(tokenize(question)) for question in intent["questions"]],
            })
            document_frequency.update(counts.keys())
        self.count = len(self.docs)
        self.document_frequency = document_frequency
        for doc in self.docs:
            vector = {token: (1 + math.log(count)) * self.idf(token) for token, count in doc["counts"].items()}
            doc["vector"] = vector
            doc["norm"] = math.sqrt(sum(weight * weight for weight in vector.values())) or 1.0

    def idf(self, token: str) -> float:
        return math.log((self.count + 1) / (self.document_frequency.get(token, 0) + 1)) + 1

    def answer(self, question: str) -> dict:
        fallback = self.meta["fallback"]
        miss = {
            "answer": fallback["answer"],
            "mood": fallback["mood"],
            "intent": None,
            "confidence": 0.0,
            "suggestions": list(self.meta.get("suggestions", [])),
        }
        tokens = tokenize(question)
        if not tokens:
            return miss
        query_counts = Counter(tokens)
        query_vector = {token: (1 + math.log(count)) * self.idf(token) for token, count in query_counts.items()}
        query_norm = math.sqrt(sum(weight * weight for weight in query_vector.values())) or 1.0
        padded = f" {' '.join(tokens)} "
        query_set = set(tokens)
        best = None
        for doc in self.docs:
            dot = sum(weight * doc["vector"].get(token, 0.0) for token, weight in query_vector.items())
            cosine = dot / (query_norm * doc["norm"])
            hits = len(query_set & doc["keyword_tokens"])
            phrase_hits = sum(1 for phrase in doc["phrases"] if f" {phrase} " in padded)
            route = min(0.6, 0.2 * hits + 0.35 * phrase_hits)
            overlap = 0.0
            for question_set in doc["question_sets"]:
                shared = len(query_set & question_set)
                union = len(query_set) + len(question_set) - shared
                overlap = max(overlap, shared / union if union else 0.0)
            exact = 1.0 if overlap >= 0.75 else 0.0
            score = 0.5 * cosine + route + 0.6 * exact
            if best is None or score > best[0]:
                best = (score, doc)
        if best is None or best[0] < self.threshold:
            return miss
        score, doc = best
        intent = doc["intent"]
        return {
            "answer": intent["answer"],
            "mood": intent["mood"],
            "intent": intent["id"],
            "confidence": round(min(1.0, score), 3),
            "suggestions": [],
        }


ENGINE = KnowledgeEngine(json.loads(KNOWLEDGE_PATH.read_text(encoding="utf-8")))


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=300)

    @field_validator("question")
    @classmethod
    def not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("question must not be blank")
        return value


class AskResponse(BaseModel):
    answer: str
    mood: Mood
    intent: str | None
    confidence: float
    suggestions: list[str]


app = FastAPI(title="ORBIT-Bot", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.get("/api/health")
def health() -> dict[str, str | int]:
    return {"status": "ok", "intents": len(ENGINE.intents)}


@app.post("/api/ask-robot", response_model=AskResponse)
def ask_robot(payload: AskRequest) -> AskResponse:
    return AskResponse(**ENGINE.answer(payload.question))


app.mount("/assets", StaticFiles(directory=ROOT / "assets"), name="assets")


@app.get("/", include_in_schema=False)
def index() -> FileResponse:
    return FileResponse(ROOT / "index.html")


@app.api_route("/{filename}", methods=["GET", "HEAD"], include_in_schema=False)
def site_file(filename: str) -> FileResponse:
    path = ROOT / filename
    if filename.startswith(".") or path.name != filename or path.suffix not in SITE_SUFFIXES or not path.is_file():
        raise HTTPException(status_code=404)
    return FileResponse(path)
