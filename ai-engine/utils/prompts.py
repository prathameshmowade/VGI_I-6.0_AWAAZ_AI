CLASSIFICATION_PROMPT = """Analyze this civic complaint and output JSON with category, urgency, department, confidence score, reasoning. Title: {title} Description: {description}"""
RESOLUTION_PROMPT = """Recommend repair plan for: Title: {title} Category: {category} Output: repair method, cost, time."""


