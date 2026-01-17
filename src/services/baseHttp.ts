import router from '@/router/index';
import axios from 'axios';

const http = axios.create({
  // baseURL: 'https://api.talimplus.uz',
  baseURL: 'http://localhost:3004',
})

http.interceptors.request.use(function (config) {
        const token = localStorage.getItem('token');

        if (token) config.headers.Authorization = `Bearer ${token}`
        return config;
}, function (error) {
        return Promise.reject(error);
});

http.interceptors.response.use(function (response) {
        return response;
}, function (error) {
        if (error.response.status === 401) {
                localStorage.removeItem('token');
                router.push('/login')
        }
        return Promise.reject(error);
});


export default http
