CATS = ['Road Damage','Water Supply','Sanitation','Electrical','Parks']
def predict_category(text):
    tl = text.lower()
    if any(w in tl for w in ['road','pothole']): return {'category': 'Road Damage', 'confidence': 0.9}
    if any(w in tl for w in ['water','pipe']): return {'category': 'Water Supply', 'confidence': 0.9}
    return {'category': 'Road Damage', 'confidence': 0.5}
