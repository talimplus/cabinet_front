import router from '@/router/index';
import axios from 'axios';

const http = axios.create({
        baseURL: 'http://95.130.227.101:3011',
});

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
        if (error.status === 401) {
                localStorage.removeItem('token');
                router.push('/login')
        }
        return Promise.reject(error);
});


export default http
