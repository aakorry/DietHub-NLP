import os
import re
import time
import unicodedata
from contextlib import asynccontextmanager

import torch
import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from cache_manager import ExplanationCache, RecipeCache

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "model", "distilbert")
TOKENIZER_ID = "distilbert-base-uncased-finetuned-sst-2-english"

MEAN_SUGAR = 10.85810766787474
STD_SUGAR = 13.3627190349059
MAX_LENGTH = 128

OLLAMA_URL = "http://localhost:11434/api/chat"
OLLAMA_MODEL = "llama2:7b-chat"
MAX_TOKENS = 1000

model = None
tokenizer = None
explanation_cache = None
recipe_cache = None


def clean_ingredients(text: str) -> str:
    text = unicodedata.normalize("NFKC", text or "")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def get_category(sugar_g: float) -> str:
    if sugar_g < 10:
        return "Low"
    elif sugar_g < 25:
        return "Medium"
    elif sugar_g < 40:
        return "High"
    else:
        return "Very High"


def build_explanation_prompt(recipe: str, sugar_g: float, category: str) -> str:
    return f"""You are a nutrition expert. Recipe: {recipe[:200]}
Sugar Level: {sugar_g}g per serving ({category})
Provide: 1) Specific substitutions 2) Complementary foods 3) Sweetening options 4) Health modifications"""


def build_recipe_prompt(dish_name: str) -> str:
    return f"""You are a professional chef. Generate a complete, detailed recipe for "{dish_name}".

Use plain text format only — no markdown, no bold (**), no italics (*), no headers (#). Write it like a normal recipe book.

Include:
- A brief description of the dish
- Ingredients list with specific measurements (cups, grams, tbsp, tsp, oz, etc.)
- Step-by-step cooking instructions (numbered steps)
- Prep time, cook time, and servings
- Cooking tips and substitution suggestions

Be specific with measurements — use both metric and imperial where helpful.
Do not include any sugar-reduction or health advice in the recipe itself."""


def call_llama_api(prompt: str) -> str:
    start = time.time()
    payload = {
        "model": OLLAMA_MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "options": {
            "temperature": 0.7,
            "num_predict": MAX_TOKENS,
        },
    }
    response = requests.post(OLLAMA_URL, json=payload, timeout=120)
    elapsed = time.time() - start
    response.raise_for_status()
    result = response.json()
    print(f"[LLAMA] took {elapsed:.1f}s")
    return result["message"]["content"]


def generate_explanation(recipe: str, sugar_g: float, category: str) -> str:
    global explanation_cache

    cached = explanation_cache.get(recipe, category)
    if cached:
        return cached

    explanation = call_llama_api(build_explanation_prompt(recipe, sugar_g, category))
    explanation_cache.set(recipe, category, sugar_g, explanation)
    return explanation


def generate_recipe(dish_name: str) -> str:
    global recipe_cache

    cached = recipe_cache.get(dish_name)
    if cached:
        return cached

    recipe = call_llama_api(build_recipe_prompt(dish_name))
    recipe = re.sub(r'\*\*([^*]+)\*\*', r'\1', recipe)
    recipe = re.sub(r'(?:^|(?<=\s))\*([^*/\s]+)\*(?=\s|$)', r'\1', recipe)
    recipe_cache.set(dish_name, recipe)
    return recipe


@asynccontextmanager
async def lifespan(app: FastAPI):
    global model, tokenizer, explanation_cache, recipe_cache
    print("Loading model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_ID)
    model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
    model.eval()
    print("Model loaded successfully!")

    print("Initializing explanation cache...")
    explanation_cache = ExplanationCache()
    print(f"Explanation cache: {explanation_cache.get_cache_info()}")

    print("Initializing recipe cache...")
    recipe_cache = RecipeCache()
    print(f"Recipe cache: {recipe_cache.get_cache_info()}")

    yield
    print("Shutting down...")


app = FastAPI(title="DietHub Sugar Prediction API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class PredictRequest(BaseModel):
    recipe: str


class PredictResponse(BaseModel):
    sugar_g: float
    category: str
    explanation: str
    raw_prediction: float


@app.get("/health")
async def health_check():
    ollama_ok = False
    try:
        r = requests.get("http://localhost:11434/api/tags", timeout=3)
        ollama_ok = r.status_code == 200
    except:
        pass
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "llama_available": ollama_ok,
        "model_path": MODEL_PATH,
        "explanation_cache": explanation_cache.get_cache_info() if explanation_cache else None,
        "recipe_cache": recipe_cache.get_cache_info() if recipe_cache else None,
    }


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest):
    if model is None or tokenizer is None:
        raise RuntimeError("Model not loaded yet")

    t0 = time.time()

    cleaned = clean_ingredients(request.recipe)
    if not cleaned:
        return PredictResponse(
            sugar_g=0, category="Low", explanation="Please enter a recipe or food description.",
            raw_prediction=0,
        )

    enc = tokenizer(
        cleaned,
        truncation=True,
        padding="max_length",
        max_length=MAX_LENGTH,
        return_tensors="pt",
    )

    with torch.no_grad():
        pred_z = model(**enc).logits.squeeze().item()

    distilbert_ms = (time.time() - t0) * 1000

    sugar_g = pred_z * STD_SUGAR + MEAN_SUGAR
    sugar_g = max(0, sugar_g)
    category = get_category(sugar_g)

    explanation = ""
    try:
        t1 = time.time()
        explanation = generate_explanation(cleaned, sugar_g, category)
        explain_s = time.time() - t1
    except Exception as e:
        print(f"[ERROR] Failed to generate explanation: {e}")
        explanation = f"Sugar content: {sugar_g:.1f}g per serving ({category}). Please consult a healthcare professional for dietary advice."
        explain_s = 0

    print(f"[PREDICT] distilbert={distilbert_ms:.0f}ms explain={explain_s:.1f}s")

    return PredictResponse(
        sugar_g=round(sugar_g, 2),
        category=category,
        explanation=explanation,
        raw_prediction=round(pred_z, 4),
    )


class GenerateRequest(BaseModel):
    dish_name: str


class GenerateResponse(BaseModel):
    dish_name: str
    recipe: str


@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    if not request.dish_name.strip():
        raise ValueError("Dish name is required")

    try:
        t0 = time.time()
        recipe = generate_recipe(request.dish_name)
        print(f"[GENERATE] total={time.time()-t0:.1f}s")
    except Exception as e:
        print(f"[ERROR] Failed to generate recipe: {e}")
        raise RuntimeError("Recipe generation failed. Make sure Ollama is running.")

    return GenerateResponse(dish_name=request.dish_name, recipe=recipe)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
