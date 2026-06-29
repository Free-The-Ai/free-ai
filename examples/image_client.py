#!/usr/bin/env python3
import base64
from pathlib import Path

import requests

API_BASE = "https://api.freetheai.xyz/v1"
KEY_FILE = Path("key.txt")


def get_api_key():
    """
    var: none
    type: str
    desc: Load a saved API key or prompt once and cache it in key.txt.
    """
    if KEY_FILE.exists():
        key = KEY_FILE.read_text(encoding="utf-8").strip()
        if key:
            return key

    key = input("Paste your FreeTheAi API key: ").strip()
    if not key:
        raise RuntimeError("No API key entered.")

    KEY_FILE.write_text(key + "\n", encoding="utf-8")
    print("Saved API key to key.txt for next time.")
    return key


def read_multiline_prompt():
    """
    var: none
    type: str
    desc: Read a prompt from stdin until the user enters a blank line.
    """
    print("Enter your prompt. Paste multiple lines if needed.")
    print("Press Enter on a blank line when finished.")
    lines = []
    while True:
        line = input()
        if line == "":
            break
        lines.append(line)

    prompt = "\n".join(lines).strip()
    if not prompt:
        raise RuntimeError("No prompt entered.")
    return prompt


def post_json(path, payload, api_key):
    """
    var: path, payload, api_key
    type: str, dict, str
    desc: Send a JSON request to the FreeTheAi API and return decoded JSON.
    """
    response = requests.post(
        API_BASE + path,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json=payload,
        timeout=180,
    )

    try:
        data = response.json()
    except Exception:
        raise RuntimeError(f"HTTP {response.status_code}: {response.text[:500]}")

    if response.status_code != 200:
        raise RuntimeError(f"HTTP {response.status_code}: {data}")

    return data


def save_image_result(result, output_path):
    """
    var: result, output_path
    type: dict, str
    desc: Save either a base64 image response or a URL image response to disk.
    """
    item = (result.get("data") or [{}])[0]

    if item.get("b64_json"):
        image_bytes = base64.b64decode(item["b64_json"])
        Path(output_path).write_bytes(image_bytes)
        return

    if item.get("url"):
        response = requests.get(item["url"], timeout=120)
        response.raise_for_status()
        Path(output_path).write_bytes(response.content)
        return

    raise RuntimeError(f"No image found in response: {result}")


def generate(api_key):
    """
    var: api_key
    type: str
    desc: Prompt for generation options and save the generated image.
    """
    print("Recommended models:")
    print("1. eve/gpt-image-2")
    print("2. eve/gpt-image-2-low")
    print("3. eve/gpt-image-2-medium")
    model = input("Model [eve/gpt-image-2]: ").strip() or "eve/gpt-image-2"
    prompt = read_multiline_prompt()
    output = input("Output file [generated.png]: ").strip() or "generated.png"

    result = post_json(
        "/images/generations",
        {
            "model": model,
            "prompt": prompt,
        },
        api_key,
    )
    save_image_result(result, output)
    print(f"Saved image to {output}")


def main():
    """
    var: none
    type: None
    desc: Run the interactive image generation client.
    """
    api_key = get_api_key()
    generate(api_key)


if __name__ == "__main__":
    main()
