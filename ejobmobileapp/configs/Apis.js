import axios from "axios";

const BASE_URL = 'https://tuongou.pythonanywhere.com/';

export const endpoints = {
    'industries': '/industries/',
    'jobs': '/jobs/',
    'companies': '/companies/',
    'applications': '/applications/',
    'register': '/users/',
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'job-detail': (jobId) => `/jobs/${jobId}/`,
    'company-detail': (companyId) => `/companies/${companyId}/`,
    'apply-job': '/applications/apply/',
    'my-applications': '/applications/',
    'follow-status': (companyId) => `/follows/status/${companyId}/`,
    'follow': '/follows/',
    // 'unfollow': (followId) => `/follows/${followId}/`,
    'unfollow': (id) => `/follows/${id}/`,  // ví dụ: id = 3 => /follows/3/


};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export default axios.create({
    baseURL: BASE_URL
});
