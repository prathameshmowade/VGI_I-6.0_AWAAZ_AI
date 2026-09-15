const sendSMS = (phone, msg) => { console.log(`[SMS] To ${phone}: ${msg}`); return true; };
const sendEmail = (email, subject, body) => { console.log(`[Email] To ${email}: ${subject}`); return true; };
module.exports = { sendSMS, sendEmail };
