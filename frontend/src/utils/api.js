import axios from 'axios';
const api = axios.create({ baseURL: 'https://calculator-g6ve.onrender.com/api' });
export default api;