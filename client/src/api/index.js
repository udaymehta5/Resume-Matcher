import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
});

export const analyzeResumeAPI = async (file, jobDescription) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobDescription', jobDescription);

  const response = await api.post('/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const analyzeBatchResumesAPI = async (files, jobDescription) => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }
  formData.append('jobDescription', jobDescription);

  const response = await api.post('/analyze/batch', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchHistoryAPI = async () => {
  const response = await api.get('/history');
  return response.data;
};

export const fetchHistoryItemAPI = async (id) => {
  const response = await api.get(`/history/${id}`);
  return response.data;
};

export const deleteHistoryItemAPI = async (id) => {
  const response = await api.delete(`/history/${id}`);
  return response.data;
};

export default api;
