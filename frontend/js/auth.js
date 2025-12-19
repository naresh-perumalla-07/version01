// --- AUTHENTICATION LOGIC ---

document.addEventListener('DOMContentLoaded', () => {
    // Handle login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            try {
                const data = await authAPI.login({ email, password });
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showNotification('✅ Login Successful!', 'success');
                if(typeof updateNavbar === 'function') updateNavbar();

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
    }

    // Handle register
    const regForm = document.getElementById('register-form');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
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
                if(typeof updateNavbar === 'function') updateNavbar();

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
    }

    // Initialize Navbar on load (if not done by app.js)
    if(typeof updateNavbar === 'function') updateNavbar();
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

// Handle logout
const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if(typeof updateNavbar === 'function') updateNavbar();
    if(typeof showPage === 'function') showPage('home');
    if(typeof showNotification === 'function') showNotification('👋 Logged out successfully', 'success');
};
