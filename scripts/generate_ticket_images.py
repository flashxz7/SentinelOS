import argparse
import base64
import json
import os
import sys
import time
from pathlib import Path

import requests

API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "google/gemini-3-pro-image-preview"
DEFAULT_MODALITIES = ["image", "text"]
DEFAULT_ASPECT_RATIO = "16:9"
DEFAULT_IMAGE_SIZE = "1K"


def load_prompts(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def ensure_dir(path: Path):
    path.mkdir(parents=True, exist_ok=True)


def decode_b64_to_file(b64_data: str, out_path: Path):
    out_path.write_bytes(base64.b64decode(b64_data))


def download_to_file(url: str, out_path: Path):
    resp = requests.get(url, timeout=120)
    resp.raise_for_status()
    out_path.write_bytes(resp.content)


def parse_modalities(value: str):
    if not value:
        return list(DEFAULT_MODALITIES)
    items = [item.strip() for item in value.split(",")]
    return [item for item in items if item]


def generate_image(prompt: str, model: str, headers: dict, modalities: list, image_config: dict):
    payload = {
        "model": model,
        "messages": [
            {
                "role": "user",
                "content": prompt,
            }
        ],
        "modalities": modalities,
        "image_config": image_config,
        "stream": False,
    }
    resp = requests.post(API_URL, headers=headers, json=payload, timeout=180)
    if resp.status_code != 200:
        raise RuntimeError(f"OpenRouter error {resp.status_code}: {resp.text}")
    data = resp.json()
    choices = data.get("choices") or []
    if not choices:
        raise RuntimeError("No choices returned from OpenRouter")
    message = choices[0].get("message") or {}
    images = message.get("images") or []
    if not images:
        raise RuntimeError("No images returned from OpenRouter; check model and modalities")
    image_entry = images[0]
    image_url = None
    if isinstance(image_entry, dict):
        image_url = (image_entry.get("image_url") or {}).get("url")
        if not image_url:
            image_url = (image_entry.get("imageUrl") or {}).get("url")
        if not image_url:
            image_url = image_entry.get("url")
    if not image_url:
        raise RuntimeError("Unexpected image format from OpenRouter")
    if image_url.startswith("data:"):
        _, b64_data = image_url.split(",", 1)
        return {"b64": b64_data}
    return {"url": image_url}


def main():
    parser = argparse.ArgumentParser(description="Generate ticket images using OpenRouter")
    parser.add_argument("--overwrite", action="store_true", help="Regenerate images even if files exist")
    parser.add_argument("--limit", type=int, default=0, help="Generate only the first N images")
    args = parser.parse_args()

    api_key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        print("Missing OPENROUTER_API_KEY environment variable", file=sys.stderr)
        sys.exit(1)

    model = os.environ.get("OPENROUTER_MODEL", DEFAULT_MODEL).strip() or DEFAULT_MODEL
    modalities = parse_modalities(os.environ.get("OPENROUTER_MODALITIES", "").strip())
    aspect_ratio = os.environ.get("OPENROUTER_ASPECT_RATIO", DEFAULT_ASPECT_RATIO).strip() or DEFAULT_ASPECT_RATIO
    image_size = os.environ.get("OPENROUTER_IMAGE_SIZE", DEFAULT_IMAGE_SIZE).strip() or DEFAULT_IMAGE_SIZE
    root = Path(__file__).resolve().parents[1]
    prompts_path = Path(__file__).with_name("ticket_prompts.json")
    out_dir = root / "assets"

    ensure_dir(out_dir)
    prompts = load_prompts(prompts_path)
    if args.limit > 0:
        prompts = prompts[: args.limit]

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "SentinelOS Ticket Generator",
    }

    image_config = {
        "aspect_ratio": aspect_ratio,
        "image_size": image_size,
    }

    for idx, item in enumerate(prompts, start=1):
        filename = item.get("file")
        prompt = item.get("prompt")
        if not filename or not prompt:
            print(f"Skipping invalid prompt at index {idx}")
            continue
        out_path = out_dir / filename
        if out_path.exists() and not args.overwrite:
            print(f"Skipping existing {out_path.name}")
            continue
        print(f"[{idx}/{len(prompts)}] Generating {out_path.name}...")
        result = generate_image(prompt, model, headers, modalities, image_config)
        if "b64" in result:
            decode_b64_to_file(result["b64"], out_path)
        elif "url" in result:
            download_to_file(result["url"], out_path)
        else:
            raise RuntimeError("No image data returned")
        time.sleep(1.2)

    print("Done. Images saved to assets/")


if __name__ == "__main__":
    main()
