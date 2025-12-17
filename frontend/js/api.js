const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

const authAPI = {
    login: async (credentials) => {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }
        return response.json();
    },
    register: async (data) => {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }
        return response.json();
    }
};

const emergencyAPI = {
    create: async (data) => {
        const response = await fetch(`${API_URL}/emergencies`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create emergency');
        }
        return response.json();
    },
    getAll: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_URL}/emergencies?${queryString}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch emergencies');
        return response.json();
    },
    respond: async (data) => {
        const response = await fetch(`${API_URL}/emergencies/respond`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to respond');
        }
        return response.json();
    }
};

const donationAPI = {
    getHospitalDonations: async () => {
        const response = await fetch(`${API_URL}/donations/hospital`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch hospital stats');
        return response.json();
    }
};
