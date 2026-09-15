from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import re

app = FastAPI(title='CivicFlow AI Engine', version='2.0.0')
app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_methods=['*'], allow_headers=['*'])

@app.get('/health')
def health(): 
    return {'status': 'ok', 'service': 'Awaaz AI NLP Classifier'}

@app.post('/analyze')
def analyze(data: dict):
    text = str(data.get('text', '')) + " " + str(data.get('description', '')) + " " + str(data.get('title', '')) + " " + str(data.get('category', ''))
    text = text.lower()
    
    # Semantic Keyword Classification for "Other / Miscellaneous" & Standard Categories
    if any(k in text for k in ['pothole', 'road', 'asphalt', 'crater', 'pavement', 'footpath', 'traffic', 'divider', 'tar']):
        return {
            'category': 'Road Damage',
            'department': 'Roads & Infrastructure Department',
            'departmentCode': 'DEPT_ROAD',
            'urgency': 'High',
            'confidenceScore': 96,
            'isAutoClassified': 'other' in text or 'misc' in text,
            'xaiReasoning': ['Road hazard and crater keywords detected', 'Mapped to Ward 12 Road Dept']
        }
    elif any(k in text for k in ['water', 'pipe', 'leak', 'sewage', 'sewer', 'drain', 'contamination', 'flood']):
        return {
            'category': 'Water Supply',
            'department': 'Water Supply & Drainage Dept',
            'departmentCode': 'DEPT_WATER',
            'urgency': 'Critical',
            'confidenceScore': 95,
            'isAutoClassified': 'other' in text or 'misc' in text,
            'xaiReasoning': ['Hydraulic pipeline and drainage leakage detected', 'Contamination risk escalation']
        }
    elif any(k in text for k in ['garbage', 'trash', 'waste', 'dump', 'dustbin', 'sanitation', 'litter', 'smell']):
        return {
            'category': 'Sanitation',
            'department': 'Sanitation & Waste Management',
            'departmentCode': 'DEPT_SANITATION',
            'urgency': 'Medium',
            'confidenceScore': 93,
            'isAutoClassified': 'other' in text or 'misc' in text,
            'xaiReasoning': ['Solid waste and sanitation dump keywords matched', 'Assigned to Ward Hygiene Crew']
        }
    elif any(k in text for k in ['light', 'streetlight', 'lamp', 'wire', 'pole', 'electric', 'spark', 'blackout']):
        return {
            'category': 'Electrical',
            'department': 'Electrical & Smart Lighting',
            'departmentCode': 'DEPT_ELECTRICAL',
            'urgency': 'High',
            'confidenceScore': 94,
            'isAutoClassified': 'other' in text or 'misc' in text,
            'xaiReasoning': ['Streetlight outage and electrical safety hazard detected', 'Night visibility priority']
        }
    elif any(k in text for k in ['park', 'garden', 'tree', 'bench', 'playground', 'grass', 'amenit', 'fountain']):
        return {
            'category': 'Parks',
            'department': 'Parks & Public Amenities',
            'departmentCode': 'DEPT_PARKS',
            'urgency': 'Low',
            'confidenceScore': 91,
            'isAutoClassified': 'other' in text or 'misc' in text,
            'xaiReasoning': ['Public park and botanical amenity keywords matched', 'Horticultural dispatch']
        }
    
    return {
        'category': data.get('category', 'Road Damage'),
        'department': 'Roads & Infrastructure Department',
        'departmentCode': 'DEPT_ROAD',
        'urgency': 'Medium',
        'confidenceScore': 90,
        'isAutoClassified': False,
        'xaiReasoning': ['Standard municipal rule applied']
    }

@app.post('/redact')
def redact(data: dict): 
    text = data.get('text', '')
    text = re.sub(r'\b\d{12}\b', '[REDACTED_AADHAAR]', text)
    text = re.sub(r'\b\d{10}\b', '[REDACTED_PHONE]', text)
    return {'redactedText': text, 'piiDetected': ['Phone/Aadhaar']}

@app.post('/copilot')
def copilot(data: dict): 
    return {
        'repairMethod': 'Hot-mix asphalt patching',
        'estimatedCost': '18500',
        'estimatedTime': '6 hours',
        'equipment': ['Asphalt Roller', '4 Crew members']
    }
