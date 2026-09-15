KEYWORDS = {'Road Damage': ['pothole','road','crack'], 'Water Supply': ['water','pipe','leak'], 'Sanitation': ['garbage','waste','trash'], 'Electrical': ['light','electricity','pole'], 'Parks': ['park','garden','tree']}
DEPTS = {'Road Damage': 'DEPT_ROAD', 'Water Supply': 'DEPT_WATER', 'Sanitation': 'DEPT_SAN', 'Electrical': 'DEPT_ELEC', 'Parks': 'DEPT_PARK'}
def classify_complaint(title, desc):
    text = (title+' '+desc).lower()
    scores = {c: sum(1 for k in kw if k in text) for c,kw in KEYWORDS.items()}
    best = max(scores, key=scores.get) if max(scores.values()) > 0 else 'Road Damage'
    return {'category': best, 'department': DEPTS.get(best,'DEPT_ROAD'), 'urgency': 'High', 'confidenceScore': min(96, 70+scores[best]*8), 'reasoning': [f'Matched keywords in {best}']}

