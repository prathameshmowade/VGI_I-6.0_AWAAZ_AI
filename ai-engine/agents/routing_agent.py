OFFICERS = {'DEPT_ROAD': {'id': 'OFF-01', 'name': 'Er. Rajesh Sharma'}, 'DEPT_WATER': {'id': 'OFF-02', 'name': 'Er. Anita Deshmukh'}}
def route_complaint(classification):
    dept = classification.get('department', 'DEPT_ROAD')
    off = OFFICERS.get(dept, OFFICERS['DEPT_ROAD'])
    return {'assignedOfficer': off['name'], 'officerId': off['id'], 'department': dept, 'confidence': classification.get('confidenceScore', 90)}


