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

// Toggle Dropdown
const toggleDropdown = (e) => {
    e.stopPropagation();
    const menu = document.getElementById('user-dropdown');
    if (menu) menu.classList.toggle('active');
};

// Close Dropdown when clicking outside
document.addEventListener('click', () => {
    const menu = document.getElementById('user-dropdown');
    if (menu) menu.classList.remove('active');
});

// Update navbar based on auth state
const updateNavbar = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const authButtons = document.getElementById('auth-buttons');
    const userInfo = document.getElementById('user-info');

    if (user) {
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        
        // Inject Dropdown HTML
        userInfo.innerHTML = `
            <div class="user-trigger" onclick="toggleDropdown(event)">
                <div style="width: 28px; height: 28px; background: var(--primary-main); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 0.8rem;">
                    ${user.name.charAt(0).toUpperCase()}
                </div>
                <span class="font-medium text-sm">${user.name.split(' ')[0]}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </div>
            
            <div id="user-dropdown" class="dropdown-menu">
                <div class="dropdown-item" onclick="showPage('${user.role === 'hospital' ? 'hospital-dashboard' : 'donor-dashboard'}')">
                    <span style="font-size: 1.1rem;">📊</span> Dashboard
                </div>
                <div class="dropdown-item">
                    <span style="font-size: 1.1rem;">⚙️</span> Settings
                </div>
                <div style="height: 1px; background: var(--border-subtle); margin: 4px 0;"></div>
                <div class="dropdown-item danger" onclick="handleLogout()">
                    <span style="font-size: 1.1rem;">🚪</span> Sign Out
                </div>
            </div>
        `;
    } else {
        authButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});
