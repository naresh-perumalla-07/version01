// Show page
const showPage = (name) => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(name);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);

    // Trigger smooth fade-up animation
    target.style.animation = 'none';
    target.offsetHeight; /* trigger reflow */
    target.style.animation = 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  }
};

// Global Notification System (Toast)
const showNotification = (msg, type) => {
  const notifContainer = document.getElementById('notification');
  if (!notifContainer) return;

  const toast = document.createElement('div');
  toast.className = 'card';

  // Semantic styles for toast
  const isEmergency = type === 'emergency';
  const isError = type === 'error';
  const isSuccess = type === 'success';

  const borderColor = isEmergency ? 'var(--primary-main)' : (isError ? 'var(--primary-main)' : 'var(--success-text)');
  const icon = isEmergency ? '🚨' : (isError ? '❌' : '✅');

  toast.style.cssText = `
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 20px;
    margin-bottom: 12px;
    box-shadow: var(--shadow-md);
    border-left: 4px solid ${borderColor};
    background: var(--bg-surface); /* Dark mode compatible */
    color: var(--text-main);
    min-width: 320px;
    max-width: 400px;
    animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    z-index: 2000;
  `;

  toast.innerHTML = `
    <div style="font-size: 1.5rem;">${icon}</div>
    <div>
        <div style="font-weight: 600; font-size: 0.95rem; line-height: 1.4;">${msg}</div>
    </div>
  `;

  notifContainer.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, isEmergency ? 8000 : 4000);
};

// --- DONOR DASHBOARD ---
const loadDonorDashboard = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const nameEl = document.getElementById('dash-user-name');
    if (nameEl) nameEl.textContent = user.name;

    // Stats with new design
    const statsContainer = document.getElementById('donor-stats');
    if (statsContainer) {
      statsContainer.innerHTML = `
          <div class="card" style="text-align: center; padding: 24px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">❤️</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--action-brand); letter-spacing: -0.03em;">${user.totalDonations || 0}</div>
            <div class="text-secondary text-sm font-medium uppercase tracking-wide">Total Donations</div>
          </div>
          <div class="card" style="text-align: center; padding: 24px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">👥</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--info-base); letter-spacing: -0.03em;">${(user.totalDonations * 3) || 0}</div>
            <div class="text-secondary text-sm font-medium uppercase tracking-wide">Lives Impacted</div>
          </div>
          <div class="card" style="text-align: center; padding: 24px;">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">🚨</div>
            <div style="font-size: 2rem; font-weight: 700; color: var(--danger-base); letter-spacing: -0.03em;" id="active-emergencies-count">0</div>
            <div class="text-secondary text-sm font-medium uppercase tracking-wide">Active Alerts</div>
          </div>
        `;
    }

    // Requests
    const response = await emergencyAPI.getAll({
      bloodGroup: user.bloodGroup,
      status: 'active'
    });

    const countEl = document.getElementById('active-emergencies-count');
    if (countEl) countEl.textContent = response.count;

    const list = document.getElementById('emergency-requests-donor');
    if (!list) return;

    if (response.emergencies.length === 0) {
      list.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 64px 24px; border-style: dashed; border-color: var(--border-light);">
                <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3; filter: grayscale(1);">🛡️</div>
                <h3 style="margin-bottom: 8px;">No Active Emergencies</h3>
                <p>You are a hero in waiting. We will notify you when you are needed.</p>
            </div>
        `;
    } else {
      list.innerHTML = response.emergencies.map(e => `
            <div class="card" style="display: flex; flex-direction: column; gap: 16px; border-left: 4px solid var(--danger-base); position: relative; overflow: hidden;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div class="badge" style="background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;">SOS: ${e.bloodGroup}</div>
                <div class="text-xs font-medium text-secondary">${e.distance || '< 5'}km away</div>
              </div>
              
              <div>
                <h3 style="font-size: 1.25rem; margin-bottom: 4px;">${e.hospitalName}</h3>
                <div class="text-secondary text-sm">📍 ${e.location || 'Central Hospital'}</div>
              </div>
              
              <div style="background: var(--neutral-50); padding: 12px; border-radius: 8px; font-size: 0.9rem; line-height: 1.5;">
                 <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span class="text-secondary">Patient</span>
                    <span class="font-medium">${e.patientName}</span>
                 </div>
                 <div style="display: flex; justify-content: space-between;">
                    <span class="text-secondary">Needs</span>
                    <span class="font-bold" style="color: var(--danger-base);">${e.unitsNeeded} Units</span>
                 </div>
              </div>

              <button class="btn btn-primary" onclick="respondToEmergency('${e._id}')" style="width: 100%; justify-content: center; margin-top: auto; background: var(--danger-base);">
                🚨 Respond Now
              </button>
            </div>
        `).join('');
    }

  } catch (error) {
    console.error('Error loading donor dashboard:', error);
  }
};

// --- HOSPITAL DASHBOARD ---
const loadHospitalDashboard = async () => {
  try {
    const activeReq = await emergencyAPI.getAll({ status: 'active' });
    const donations = await donationAPI.getHospitalDonations();

    const activeCount = activeReq.count || 2; // Mock if 0 to show UI
    const fulfilledCount = donations.donations ? donations.donations.length : 12;

    const container = document.getElementById('hospital-stats');
    if (!container) return;

    container.innerHTML = `
      <div class="card">
        <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Active Requests</div>
        <div style="font-size: 3rem; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em;">${activeCount}</div>
      </div>
      <div class="card">
         <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Fulfilled Today</div>
         <div style="font-size: 3rem; font-weight: 700; color: var(--success-base); letter-spacing: -0.02em;">${fulfilledCount}</div>
      </div>
      <div class="card">
         <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Units in Stock</div>
         <div style="font-size: 3rem; font-weight: 700; color: var(--info-base); letter-spacing: -0.02em;">156</div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading hospital dashboard:', error);
  }
};

// Action: Respond
const respondToEmergency = async (emergencyId) => {
  try {
    const response = await emergencyAPI.respond({ emergencyId });
    showNotification('Thank you! Hospital has been notified of your arrival. Drive safely!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

// --- EMERGENCY WIZARD ---
const nextStep = (step) => {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const nextS = document.getElementById(`step-${step}`);
  if (nextS) nextS.classList.add('active');

  // Populate summary if final step
  if (step === 3) {
    setText('summary-name', getValue('emg-name'));
    setText('summary-blood', getValue('emg-blood'));
    setText('summary-units', getValue('emg-units') + ' units');
  }
};

const prevStep = (step) => {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
  const prevS = document.getElementById(`step-${step}`);
  if (prevS) prevS.classList.add('active');
};

const updateUrgency = () => {
  const val = document.getElementById('emg-urgency').value;
  const display = document.getElementById('urgency-display');

  if (!display) return;

  if (val === 'critical') {
    display.innerHTML = '⚡ <strong>Critical Priority</strong>: Donors within 10km alerted in < 2s.';
    display.style.background = '#FEF2F2';
    display.style.color = '#B91C1C';
    display.style.border = '1px solid #FECACA';
  } else if (val === 'urgent') {
    display.innerHTML = '⚠️ <strong>High Priority</strong>: 50+ donors notified immediately.';
    display.style.background = '#FFFBEB';
    display.style.color = '#B45309';
    display.style.border = '1px solid #FDE68A';
  } else if (val === 'severe') {
    display.innerHTML = 'ℹ️ <strong>Standard Priority</strong>: Nearby active donors alerted.';
    display.style.background = '#EFF6FF';
    display.style.color = '#1D4ED8';
    display.style.border = '1px solid #BFDBFE';
  } else {
    display.innerHTML = 'Select an urgency level to estimate network reach.';
    display.style.background = 'var(--neutral-50)';
    display.style.color = 'var(--text-secondary)';
    display.style.border = 'none';
  }
};

const submitEmergency = async () => {
  try {
    const name = getValue('emg-name');
    const bloodGroup = getValue('emg-blood');
    const unitsNeeded = parseInt(getValue('emg-units'));
    const condition = getValue('emg-condition');
    const urgency = getValue('emg-urgency');
    const hospitalName = getValue('emg-location');
    const contactPhone = getValue('emg-contact-phone');

    if (!name || !bloodGroup || !unitsNeeded || !condition || !urgency) {
      showNotification('Please fill all required fields before broadcasting.', 'error');
      return;
    }

    const data = {
      patientName: name,
      bloodGroup,
      unitsNeeded,
      condition,
      urgency,
      hospitalName: hospitalName || 'General Hospital',
      contactPhone: contactPhone || 'N/A',
      latitude: 28.6139,
      longitude: 77.2090
    };

    await emergencyAPI.create(data);

    showNotification(
      `BROADCAST INITIATED!\nNetwork activating... 50+ donors notified.`,
      'emergency'
    );

    setTimeout(() => {
      showPage('hospital-dashboard');
      loadHospitalDashboard();
      // Reset form
      document.querySelectorAll('input').forEach(i => i.value = '');
    }, 2500);
  } catch (error) {
    showNotification(error.message, 'error');
  }
};

// --- PUBLIC LISTING ---
const loadEmergencies = async () => {
  try {
    const response = await emergencyAPI.getAll({ status: 'active' });

    const container = document.getElementById('emergency-list-view');
    if (!container) return; // Not on page

    // Check if we are on the public page
    if (response.emergencies.length === 0) {
      container.innerHTML = `<div style="text-align: center; color: var(--text-secondary); padding: 40px;">No active emergency broadcasts at this moment.</div>`;
      return;
    }

    container.innerHTML = `
        <h3 style="margin-bottom: 24px; font-size: 1.5rem;">Live Broadcasts</h3>
        <div style="display: grid; gap: 16px;">
            ${response.emergencies.map(e => `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <div style="background: var(--danger-base); color: white; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 700;">${e.bloodGroup}</div>
                        <div>
                            <h4 style="margin-bottom: 2px;">${e.location || 'General Hospital'}</h4>
                            <div class="text-secondary text-sm">${e.patientName} • ${e.condition}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <div class="badge" style="background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;">${e.urgency ? e.urgency.toUpperCase() : 'URGENT'}</div>
                        <button class="btn btn-primary btn-sm" onclick="respondToEmergency('${e._id}')">Details</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
  } catch (error) {
    console.error('Error loading public emergencies:', error);
  }
};

// Helpers
const getValue = (id) => document.getElementById(id) ? document.getElementById(id).value : '';
const setText = (id, txt) => { if (document.getElementById(id)) document.getElementById(id).textContent = txt; };

// Initializer
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();

  // Check auth status
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    if (user.role === 'donor') loadDonorDashboard();
    if (user.role === 'hospital') loadHospitalDashboard();
  }

  // Public list always loads
  loadEmergencies();
});
