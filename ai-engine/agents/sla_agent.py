SLA_RULES = {('Road Damage','Critical'): 24, ('Road Damage','High'): 48, ('Water Supply','Critical'): 24}
def calculate_sla(cat, urg): return {'slaHours': SLA_RULES.get((cat,urg), 72)}
