"""Regression checks for the ORBIT-Bot matcher.

Run from the project root:  python backend/test_robot_engine.py
(also collected by pytest if installed). Keep robot.js matchLocal in sync with robot_server.py.
"""
from __future__ import annotations

from robot_server import ENGINE

MOODS = {"happy", "excited", "scanning", "thinking"}
EXPECTED = {
    "Summarize Raj's Teradata impact": "teradata-impact",
    "How does he use MCP & LLMs?": "mcp-llms",
    "Tell me about his FastAPI & Redis work": "fastapi-redis",
    "What is his tech stack?": "tech-stack",
    "How to contact Raj?": "contact",
    "hello": "greeting",
    "who are you": "about-bot",
    "how does he keep reads fast with redis locks": "fastapi-redis",
    "Does he know kubernetes?": "kubernetes-gitops",
    "where did he study": "education",
    "tell me a joke": "joke",
    "what about opentelemetry tracing": "observability",
    "thanks": "thanks",
    "What is Raj working on right now?": "ai-engineer",
    "what did he do before": "backend-engineer",
    "how does he do blue green deployments": "kubernetes-gitops",
    "which cloud providers": "cloud-aws",
    "can you tell me his email": "contact",
    "Who is Raj?": "about-raj",
    "what is the End-to-End RAG API": "rag-project",
    "microservices": "microcloudpy",
    "his linkedin": "contact",
    "does he know vue": "frontend-vue-react",
    "tell me about his internship": "aligned-intern",
    "does he know opencv": "missing-person",
    "How did Raj use Vue.js & React.js?": "frontend-vue-react",
    "How did he manage state with Vuex & Hooks?": "state-management",
    "Tell me about his FastAPI, Flask & data automation": "api-data-automation",
    "what is the weather in paris": None,
    "xyz qqq": None,
}


def test_expected_routing() -> None:
    wrong = {q: ENGINE.answer(q)["intent"] for q, intent in EXPECTED.items() if ENGINE.answer(q)["intent"] != intent}
    assert not wrong, f"misrouted: {wrong}"


def test_every_intent_answers_its_own_questions() -> None:
    wrong = {
        question: ENGINE.answer(question)["intent"]
        for intent in ENGINE.intents
        for question in intent["questions"]
        if ENGINE.answer(question)["intent"] != intent["id"]
    }
    assert not wrong, f"intent questions that route elsewhere: {wrong}"


def test_moods_and_fallback() -> None:
    assert all(intent["mood"] in MOODS for intent in ENGINE.intents)
    miss = ENGINE.answer("xyz qqq")
    assert miss["intent"] is None and miss["mood"] == "thinking" and miss["suggestions"]


if __name__ == "__main__":
    for name, check in list(globals().items()):
        if name.startswith("test_"):
            check()
            print(f"ok  {name}")
