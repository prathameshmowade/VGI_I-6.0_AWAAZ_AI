RESOLUTIONS = {'Road Damage': {'method': 'Hot-mix asphalt patching', 'cost': '15000-45000', 'time': '4-8 hours', 'crew': 6}}
def generate_resolution(title, category): return {'title': title, 'plan': RESOLUTIONS.get(category, RESOLUTIONS['Road Damage'])}
