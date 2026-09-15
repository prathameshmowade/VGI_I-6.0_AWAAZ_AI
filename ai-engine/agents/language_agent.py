HINDI = ['hai','ka','ki','ko','mein']
MARATHI = ['aahe','mhanun','kahi','tar','pan']
def detect_and_translate(text):
    words = text.lower().split()
    hi = sum(1 for w in words if w in HINDI)
    mr = sum(1 for w in words if w in MARATHI)
    return text
