import axios from "axios";

const BASE_URL = 'https://tuongou.pythonanywhere.com/';

export const endpoints = {
    'industries': '/industries/',
    'jobs': '/jobs/',
    'companies': '/companies/',
    'my-company': '/companies/my_company/',
    "register-company": "/companies/register/",
    "update-company-info": "/companies/update_info/",
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
    'unfollow': (id) => `/follows/${id}/`,
    "notifications": "/notifications/",
    "reviews": "/reviews/",
    "create-room": "/chatrooms/",
    "messages": "/messages/",
};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
}

export const getFullMediaUrl = (path) => {
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
};

export const getCompanyLogo = (company) => {
    return getFullMediaUrl(company.images[0].image);
};

export const getCompanyImages = (company) => {
  return company.images.map(imgObj => 
    imgObj.image.startsWith("http") ? imgObj.image : `${BASE_URL}${imgObj.image}`
  );
};

export default axios.create({
    baseURL: BASE_URL
});
