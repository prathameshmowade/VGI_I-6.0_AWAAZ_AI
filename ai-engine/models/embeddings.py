def compute_text_embedding(text):
    words = text.lower().split()
    return [hash(w) % 100 / 100.0 for w in words[:10]]
