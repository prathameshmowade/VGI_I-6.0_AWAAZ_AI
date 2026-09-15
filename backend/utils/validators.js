const validateComplaintInput = (body) => { const errors = []; if(!body.title || body.title.length < 5) errors.push('Title too short'); if(!body.description || body.description.length < 10) errors.push('Description too short'); return { isValid: errors.length === 0, errors }; };
module.exports = { validateComplaintInput };
