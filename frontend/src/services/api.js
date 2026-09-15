import axios from 'axios';

// Dynamically set API base URL from environment or default to local proxy
const API_BASE = import.meta.env.VITE_API_URL || '';
if (API_BASE) {
  axios.defaults.baseURL = API_BASE;
}

export const fetchComplaints = () => axios.get('/api/complaints').then(r => r.data);
export const submitComplaint = (data) => axios.post('/api/complaints', data).then(r => r.data);
