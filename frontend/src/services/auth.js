import axios from 'axios';
export const loginApi = (email, password) => axios.post('/api/auth/login', { email, password }).then(r=>r.data);
