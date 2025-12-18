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

    // Lazy load data based on page
    if (name === 'donor-dashboard') loadDonorDashboard();
    if (name === 'hospital-dashboard') loadHospitalDashboard();
    if (name === 'home') loadEmergencies();
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
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Default Tab
    let activeTab = 'overview';
    
    // Render Sidebar Layout
    const sidebar = document.querySelector('#hospital-dashboard .sidebar');
    if(sidebar) {
        sidebar.innerHTML = `
            <div style="padding: 0 12px; margin-bottom: 12px; font-size: 0.75rem; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase;">Hospital Menu</div>
            <div class="sidebar-item active" onclick="switchHospitalTab('overview', this)">Overview</div>
            <div class="sidebar-item" onclick="switchHospitalTab('requests', this)">Active Requests</div>
            <div class="sidebar-item" onclick="switchHospitalTab('inventory', this)">Inventory</div>
            <div class="sidebar-item" onclick="switchHospitalTab('analytics', this)">Analytics</div>
        `;
    }

    // Load Data
    const [allActive, myRequests] = await Promise.all([
        emergencyAPI.getAll({ status: 'active' }),
        emergencyAPI.getAll({ createdBy: 'me' })
    ]);

    const activeCount = allActive.count || 0;
    const myActiveCount = myRequests.emergencies.filter(e => e.status === 'active').length;

    // Render Views
    const contentDiv = document.querySelector('#hospital-dashboard .content');
    
    // 1. Overview View
    contentDiv.innerHTML = `
        <div id="view-overview">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <div>
                    <h2>Hospital Overview</h2>
                    <p>Real-time view of emergency responses.</p>
                </div>
                <button onclick="showPage('emergency')" class="btn btn-primary">Create New Request</button>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 48px;">
                 <div class="card">
                    <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Network Active</div>
                    <div style="font-size: 3rem; font-weight: 700; color: var(--danger-base); letter-spacing: -0.02em;">${activeCount}</div>
                  </div>
                  <div class="card">
                     <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">My Broadcasts</div>
                     <div style="font-size: 3rem; font-weight: 700; color: var(--primary-main); letter-spacing: -0.02em;">${myActiveCount}</div>
                  </div>
                  <div class="card">
                     <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Total History</div>
                     <div style="font-size: 3rem; font-weight: 700; color: var(--text-main); letter-spacing: -0.02em;">${myRequests.count || 0}</div>
                  </div>
            </div>
        </div>

        <div id="view-requests" class="hidden">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <h2>Manage Broadcasts</h2>
                <button onclick="showPage('emergency')" class="btn btn-primary">New Broadcast</button>
            </div>
            <div id="my-broadcasts-list" style="display: grid; gap: 16px;">
                ${myRequests.emergencies.length === 0 
                    ? `<div class="card text-secondary" style="text-align: center; padding: 40px;">No broadcasts history found.</div>`
                    : myRequests.emergencies.map(e => `
                        <div class="card" style="display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${e.status === 'active' ? 'var(--success-text)' : 'var(--border-subtle)'}; opacity: ${e.status === 'active' ? '1' : '0.7'};">
                            <div>
                                <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 4px;">
                                    <span class="badge" style="${e.status === 'active' ? 'background: var(--success-bg); color: var(--success-text);' : 'background: var(--bg-surface-hover); color: var(--text-muted);'}">${e.status.toUpperCase()}</span>
                                    <h4 style="margin: 0;">${e.patientName} (${e.bloodGroup})</h4>
                                </div>
                                <div class="text-secondary text-sm">
                                    ${new Date(e.createdAt).toLocaleDateString()} • Units: ${e.unitsNeeded} • Responses: ${e.respondents ? e.respondents.length : 0}
                                </div>
                            </div>
                            <div>
                                ${e.status === 'active' 
                                    ? `<button onclick="markFulfilled('${e._id}')" class="btn btn-secondary btn-sm" style="border-color: var(--success-text); color: var(--success-text);">✅ Mark Completed</button>`
                                    : `<span class="text-secondary text-sm">Archived</span>`
                                }
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>

        <div id="view-inventory" class="hidden">
            <h2 style="margin-bottom: 24px;">Blood Inventory</h2>
            <div class="card">
                <table style="width: 100%; border-collapse: collapse; color: var(--text-body);">
                    <thead>
                        <tr style="border-bottom: 1px solid var(--border-subtle); text-align: left;">
                            <th style="padding: 12px;">Group</th>
                            <th style="padding: 12px;">Units Available</th>
                            <th style="padding: 12px;">Status</th>
                            <th style="padding: 12px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr><td style="padding: 12px; font-weight: bold;">A+</td><td style="padding: 12px;">45</td><td style="padding: 12px; color: var(--success-text);">Good</td><td style="padding: 12px;"><button class="btn btn-secondary btn-sm" style="padding: 4px 12px;">Update</button></td></tr>
                        <tr><td style="padding: 12px; font-weight: bold;">O+</td><td style="padding: 12px;">12</td><td style="padding: 12px; color: var(--danger-text);">Low</td><td style="padding: 12px;"><button class="btn btn-secondary btn-sm" style="padding: 4px 12px;">Update</button></td></tr>
                        <tr><td style="padding: 12px; font-weight: bold;">B-</td><td style="padding: 12px;">8</td><td style="padding: 12px; color: var(--danger-text);">Critical</td><td style="padding: 12px;"><button class="btn btn-secondary btn-sm" style="padding: 4px 12px;">Update</button></td></tr>
                        <tr><td style="padding: 12px; font-weight: bold;">AB+</td><td style="padding: 12px;">22</td><td style="padding: 12px; color: var(--text-muted);">Stable</td><td style="padding: 12px;"><button class="btn btn-secondary btn-sm" style="padding: 4px 12px;">Update</button></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="view-analytics" class="hidden">
             <div class="card" style="text-align: center; padding: 40px;">
                <h3>Analytics Module</h3>
                <p>Detailed reports coming in v2.1</p>
             </div>
        </div>
    `;

  } catch (error) {
    console.error('Error loading hospital dashboard:', error);
  }
};

// Tab Switcher Logic
window.switchHospitalTab = (tabName, el) => {
    // Update Sidebar UI
    document.querySelectorAll('#hospital-dashboard .sidebar-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    // Hide all views
    document.getElementById('view-overview').classList.add('hidden');
    document.getElementById('view-requests').classList.add('hidden');
    document.getElementById('view-inventory').classList.add('hidden');
    document.getElementById('view-analytics').classList.add('hidden');

    // Show selected view
    document.getElementById(`view-${tabName}`).classList.remove('hidden');
};

const markFulfilled = async (id) => {
    if(!confirm('Are you sure the need is met? This will stop the broadcast.')) return;
    try {
        await emergencyAPI.updateStatus(id, 'fulfilled');
        showNotification('Broadcast marked as fulfilled!', 'success');
        loadHospitalDashboard(); // Reload
    } catch (error) {
        showNotification(error.message, 'error');
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
      landmark: getValue('emg-landmark') || 'Main Entrance',
      contactPerson: getValue('emg-contact-name') || 'Hospital Staff',
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
