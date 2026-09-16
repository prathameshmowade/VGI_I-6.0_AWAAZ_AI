import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './services/api'; // Initialize axios.defaults.baseURL globally
ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
