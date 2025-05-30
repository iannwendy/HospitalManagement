import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHospitalInfo = async () => {
  try {
    const response = await api.get('/hospital-info');
    return response.data;
  } catch (error) {
    console.error('Error fetching hospital info:', error);
    throw error;
  }
};

export const checkApiStatus = async () => {
  try {
    const response = await api.get('/status');
    return response.data;
  } catch (error) {
    console.error('Error checking API status:', error);
    throw error;
  }
};

export default api; 