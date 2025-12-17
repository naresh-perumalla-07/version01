// Handle login
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await authAPI.login({ email, password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showNotification('✅ Login Successful!', 'success');
        updateNavbar();

        // Redirect based on role
        if (data.user.role === 'donor') {
            showPage('donor-dashboard');
            loadDonorDashboard();
        } else {
            showPage('hospital-dashboard');
            loadHospitalDashboard();
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
});

// Handle register
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const phone = document.getElementById('reg-phone').value;
    const city = document.getElementById('reg-city').value;
    const role = document.getElementById('reg-role').value;
    const bloodGroup = document.getElementById('reg-blood').value;

    try {
        const data = await authAPI.register({
            name, email, password, phone, city, role, bloodGroup
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        showNotification('✅ Registration Successful!', 'success');
        updateNavbar();

        if (data.user.role === 'donor') {
            showPage('donor-dashboard');
            loadDonorDashboard();
        } else {
            showPage('hospital-dashboard');
            loadHospitalDashboard();
        }
    } catch (error) {
        showNotification(`❌ ${error.message}`, 'error');
    }
});

// Update navbar based on auth state
const updateNavbar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');

    if (user) {
        authButtons.style.display = 'none';
        userInfo.style.display = 'flex';
        userName.textContent = `Hi, ${user.name.split(' ')[0]}`;
    } else {
        authButtons.style.display = 'flex';
        userInfo.style.display = 'none';
    }
};

// Handle logout
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    updateNavbar();
    showPage('home');
    showNotification('👋 Logged out successfully', 'success');
};
