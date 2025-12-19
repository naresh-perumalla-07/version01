// Mobile Menu Toggle
console.log('BloodBridge App v3.0 Loaded - Visuals Active');
const toggleMobileMenu = () => {
    const nav = document.getElementById('nav-links-container');
    nav.classList.toggle('active');
};

// Show page
const showPage = (name) => {
  // 1. Handle Pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(name);
  if (target) {
    target.classList.add('active');
    window.scrollTo(0, 0);

    // 2. Handle Nav Links Active State
    document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`nav-${name}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Close mobile menu if open
    document.getElementById('nav-links-container').classList.remove('active');

    // Trigger smooth fade-up animation
    target.style.animation = 'none';
    target.offsetHeight; /* trigger reflow */
    target.style.animation = 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';

    // Lazy load data based on page
    if (name === 'donor-dashboard') loadDonorDashboard();
    if (name === 'hospital-dashboard') loadHospitalDashboard();
    if (name === 'home') loadHomeStats();
  }
};

// --- PARTICLE NETWORK ANIMATION ---
const initParticles = () => {
    const canvas = document.getElementById('hero-particles');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Resize Handler
    const resize = () => {
        width = canvas.width = canvas.parentElement.offsetWidth;
        height = canvas.height = canvas.parentElement.offsetHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.8 ? '#E11D48' : '#334155'; // Red or Slate
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Bounce
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Init Particles
    for (let i = 0; i < 50; i++) particles.push(new Particle());

    // Animation Loop
    const animate = () => {
        ctx.clearRect(0, 0, width, height);
        
        particles.forEach((p, index) => {
            p.update();
            p.draw();
            
            // Connect Particles
            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(148, 163, 184, ${0.1 - dist/1500})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    };
    animate();
};

// --- HOME PAGE STATS ---
const loadHomeStats = async () => {
    // Start Visuals
    initParticles();

    const heroStatusEl = document.getElementById('hero-live-status');

    try {
        const response = await emergencyAPI.getAll({ status: 'active' });
        
        // Update Active Alerts Count
        const alertEl = document.getElementById('stat-alerts');
        if (alertEl) {
             const count = response.count || 0;
             alertEl.textContent = count;
        }

        // Simulate Donor Growth (Mock for UI feel)
        const donorEl = document.getElementById('stat-donors');
        if (donorEl) {
             const base = 2500;
             const random = Math.floor(Math.random() * 50);
             donorEl.textContent = (base + random) + "+";
        }

        // --- RENDER DYNAMIC HERO STATUS ---
        if (heroStatusEl) {
           heroStatusEl.innerHTML = ''; // Removed per user request
           heroStatusEl.style.display = 'none';
        }

    } catch (e) {
        console.log("Stats load silent error", e);
        if (heroStatusEl) heroStatusEl.innerHTML = getSystemOnlineBadge(); // Fallback
    }

    // Also load the list if needed, but home page is mostly visual
    loadEmergencies();
};

// Helper for the System Badge (reused)
const getSystemOnlineBadge = () => `
    <div class="glass-card-premium" style="position: absolute; bottom: -20px; right: -20px; padding: 12px 20px; border-radius: 16px; border: 1px solid rgba(34, 197, 94, 0.2); background: #0f172a; display: flex; align-items: center; gap: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 10;">
        <div style="position: relative; width: 10px; height: 10px;">
            <div style="position: absolute; inset: 0; background: #22c55e; border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite; opacity: 0.7;"></div>
            <div style="position: absolute; inset: 0; background: #22c55e; border-radius: 50%;"></div>
        </div>
        <div>
            <div style="font-weight: 700; font-size: 0.85rem; color: #4ade80; line-height: 1;">SYSTEM ONLINE</div>
            <div style="font-size: 0.7rem; color: var(--text-tertiary);">Latency: 12ms</div>
        </div>
    </div>
`;

// Global Notification System (Toast)
const showNotification = (msg, type) => {
  const notifContainer = document.getElementById('notification');
  if (!notifContainer) return;

  const toast = document.createElement('div');
  toast.className = 'glass-card-premium';

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
    
        // Initialize Sidebar
        const sidebar = document.querySelector('#donor-dashboard .sidebar');
        if (sidebar) {
            sidebar.innerHTML = `
                <div style="padding: 0 12px; margin-bottom: 12px; font-size: 0.75rem; color: var(--text-tertiary); font-weight: 700; text-transform: uppercase;">Donor Menu</div>
                <div class="sidebar-item active" onclick="switchDonorTab('overview', this)">Overview</div>
                <div class="sidebar-item" onclick="switchDonorTab('history', this)">My History</div>
                <div class="sidebar-item" onclick="switchDonorTab('badges', this)">Achievements</div>
            `;
        }

        const nameEl = document.getElementById('dash-user-name');
        if (nameEl) nameEl.textContent = user.name;

        // Load Data
        const [activeRequests, history] = await Promise.all([
             emergencyAPI.getAll({ status: 'active' }), // Get all active to filter by distance later (mock)
             donationAPI.getMyHistory().catch(e => ({ donations: [], totalDonations: 0 }))
        ]);

        const myDonations = history.donations || [];
        // Calculate Level based on donations
        const donationCount = user.totalDonations || myDonations.length;
        const level = donationCount > 10 ? 'Elite Hero' : donationCount > 5 ? 'Guardian' : 'Volunteer';

        // Render Content Container
        const contentDiv = document.querySelector('#donor-dashboard .content');
        
        // 1. Overview Tab
        contentDiv.innerHTML = `
        <div id="donor-view-overview">
            <div style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
                 <div>
                    <h2>Welcome back, <span style="color: var(--primary-main);">${user.name}</span></h2>
                    <p>Current Rank: <strong style="color: #FBBF24;">${level}</strong></p>
                 </div>
                 <button onclick="switchDonorTab('badges', document.querySelectorAll('#donor-dashboard .sidebar-item')[2])" class="btn btn-secondary btn-sm" style="background: rgba(251, 191, 36, 0.1); color: #FBBF24; border: 1px solid rgba(251, 191, 36, 0.2);">
                    View Badges
                 </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; margin-bottom: 48px;">
                <div class="glass-card-premium" style="text-align: center; padding: 24px;">
                    <div style="font-size: 2.5rem; margin-bottom: 12px;">❤️</div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--action-brand); letter-spacing: -0.03em;">${donationCount}</div>
                    <div class="text-secondary text-sm font-medium uppercase tracking-wide">Donations</div>
                </div>
                <div class="glass-card-premium" style="text-align: center; padding: 24px;">
                    <div style="font-size: 2.5rem; margin-bottom: 12px;">👥</div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--info-base); letter-spacing: -0.03em;">${donationCount * 3}</div>
                    <div class="text-secondary text-sm font-medium uppercase tracking-wide">Lives Saved</div>
                </div>
                <div class="glass-card-premium" style="text-align: center; padding: 24px;">
                    <div style="font-size: 2.5rem; margin-bottom: 12px;">🚨</div>
                    <div style="font-size: 2rem; font-weight: 700; color: var(--danger-base); letter-spacing: -0.03em;">${activeRequests.count || 0}</div>
                    <div class="text-secondary text-sm font-medium uppercase tracking-wide">Active Alerts</div>
                </div>
            </div>

            <h3 style="margin-bottom: 24px;">Urgent Needs Near You</h3>
            <div id="emergency-requests-donor" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px;">
                ${renderDonorEmergencies(activeRequests.emergencies)}
            </div>
        </div>

        <div id="donor-view-history" class="hidden">
            <h2 style="margin-bottom: 24px;">Donation History</h2>
            ${renderDonationHistory(myDonations)}
        </div>

        <div id="donor-view-badges" class="hidden">
             <div style="text-align: center; margin-bottom: 32px;">
                <h2>Your Trophy Components</h2>
                <p>Unlock badges by responding to SOS calls and maintaining regular donations.</p>
             </div>
             
             <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 24px;">
                ${renderBadges(donationCount)}
             </div>
        </div>
        `;

    } catch (error) {
        console.error('Error loading donor dashboard:', error);
    }
};

// --- DONOR HELPER FUNCTIONS ---

const renderDonorEmergencies = (emergencies) => {
    if (!emergencies || emergencies.length === 0) {
      return `
            <div class="glass-card-premium" style="grid-column: 1 / -1; text-align: center; padding: 64px 24px;">
                <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;">🛡️</div>
                <h3 style="margin-bottom: 8px;">No Active Emergencies</h3>
                <p>You are a hero in waiting. We will notify you when you are needed.</p>
            </div>
        `;
    }

    return emergencies.map(e => `
        <div class="glass-card-premium" style="display: flex; flex-direction: column; gap: 16px; border-top: 4px solid var(--danger-base);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div class="badge" style="background: rgba(220, 38, 38, 0.2); color: #F87171; border: 1px solid rgba(220, 38, 38, 0.3);">SOS: ${e.bloodGroup}</div>
            <div class="text-xs font-medium text-secondary">
                <span style="display: inline-block; width: 6px; height: 6px; background: #34D399; border-radius: 50%; margin-right: 4px;"></span>
                ${e.distance || '< 5'}km away
            </div>
          </div>
          
          <div>
            <h3 style="font-size: 1.25rem; margin-bottom: 4px;">${e.hospitalName}</h3>
            <div class="text-secondary text-sm">📍 ${e.location || 'Central Hospital'}</div>
          </div>
          
          <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; border: 1px solid rgba(255,255,255,0.05);">
             <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span class="text-secondary">Patient</span>
                <span class="font-medium">${e.patientName}</span>
             </div>
             <div style="display: flex; justify-content: space-between;">
                <span class="text-secondary">Needs</span>
                <span class="font-bold" style="color: var(--danger-text);">${e.unitsNeeded} Units</span>
             </div>
          </div>

          <button class="btn btn-primary" onclick="respondToEmergency('${e._id}')" style="width: 100%; justify-content: center; margin-top: auto; box-shadow: 0 4px 12px rgba(225, 29, 72, 0.4);">
             RESPOND NOW
          </button>
        </div>
    `).join('');
};

const renderDonationHistory = (donations) => {
    if(!donations || donations.length === 0) {
        return `<div class="glass-card-premium text-secondary" style="text-align: center; padding: 40px;">No donation history available yet.</div>`;
    }
    return `
    <div class="glass-card-premium" style="padding: 0;">
       <table style="width: 100%; text-align: left; border-collapse: collapse;">
         <thead style="background: rgba(0,0,0,0.2);">
            <tr>
                <th style="padding: 16px;">Date</th>
                <th style="padding: 16px;">Location</th>
                <th style="padding: 16px;">Units</th>
                <th style="padding: 16px;">Certificate</th>
            </tr>
         </thead>
         <tbody>
            ${donations.map(d => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 16px;">${new Date(d.date || Date.now()).toLocaleDateString()}</td>
                    <td style="padding: 16px; font-weight: 500;">${d.location || 'City Hospital'}</td>
                    <td style="padding: 16px;">1 Unit</td>
                    <td style="padding: 16px;"><button class="btn btn-secondary btn-sm">Download</button></td>
                </tr>
            `).join('')}
         </tbody>
       </table>
    </div>`;
};

const renderBadges = (count) => {
    const badges = [
        { name: 'First Blood', icon: '🩸', req: 1, desc: 'Your first step to saving lives.' },
        { name: 'Regular Hero', icon: '🎗️', req: 3, desc: 'Consistent commitment to the cause.' },
        { name: 'Life Saver', icon: '🦁', req: 5, desc: 'Five donations. 15 lives impacted.' },
        { name: 'Champion', icon: '🏆', req: 10, desc: 'Double digits! You are a legend.' },
        { name: 'Guardian', icon: '🛡️', req: 20, desc: 'A pillar of the community.' },
        { name: 'Immortal', icon: '⚡', req: 50, desc: 'Your legacy will live forever.' },
    ];

    return badges.map(b => {
        const locked = count < b.req;
        return `
        <div class="glass-card-premium" style="text-align: center; opacity: ${locked ? 0.5 : 1}; filter: ${locked ? 'grayscale(1)' : 'none'}; border: ${locked ? '1px solid var(--border-subtle)' : '1px solid rgba(251, 191, 36, 0.4)'}; background: ${locked ? '' : 'linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(0,0,0,0))'};">
            <div style="font-size: 3rem; margin-bottom: 12px;">${b.icon}</div>
            <div style="font-weight: 700; color: ${locked ? 'var(--text-secondary)' : '#FBBF24'}; margin-bottom: 4px;">${b.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 12px;">${b.desc}</div>
            ${locked 
                ? `<div class="badge" style="background: rgba(255,255,255,0.1); color: var(--text-muted);">Locked (${count}/${b.req})</div>`
                : `<div class="badge" style="background: rgba(251, 191, 36, 0.2); color: #FBBF24;">UNLOCKED</div>`
            }
        </div>
    `}).join('');
};

window.switchDonorTab = (tabName, el) => {
    document.querySelectorAll('#donor-dashboard .sidebar-item').forEach(i => i.classList.remove('active'));
    if(el) el.classList.add('active');

    document.getElementById('donor-view-overview').classList.add('hidden');
    document.getElementById('donor-view-history').classList.add('hidden');
    document.getElementById('donor-view-badges').classList.add('hidden');

    document.getElementById(`donor-view-${tabName}`).classList.remove('hidden');
};


// --- HOSPITAL DASHBOARD ---
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
            <div class="sidebar-item" onclick="switchHospitalTab('inventory', this)">Blood Inventory</div>
            <div class="sidebar-item" onclick="switchHospitalTab('analytics', this)">Analytics</div>
        `;
    }

    // Load Initial Data
    const [allActive, myRequests, inventoryData] = await Promise.all([
        emergencyAPI.getAll({ status: 'active' }),
        emergencyAPI.getAll({ createdBy: 'me' }),
        inventoryAPI.get().catch(e => ({ data: { bloodGroups: [] } })) // Safe fail
    ]);

    const activeCount = allActive.count || 0;
    const myActiveCount = myRequests.emergencies.filter(e => e.status === 'active').length;
    const inventory = inventoryData.data || { bloodGroups: [] };

    // Calculate total units
    const totalUnits = inventory.bloodGroups.reduce((acc, curr) => acc + curr.units, 0);

    // Render Views
    const contentDiv = document.querySelector('#hospital-dashboard .content');
    
    // 1. Overview View
    contentDiv.innerHTML = `
        <div id="view-overview">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <div>
                    <h2>Hospital Overview</h2>
                    <p>Real-time ecosystem command center.</p>
                </div>
                <button onclick="showPage('emergency')" class="btn btn-primary" style="box-shadow: 0 0 20px rgba(225, 29, 72, 0.4);">
                    <span style="font-size: 1.2rem;">📡</span> Broadcast SOS
                </button>
            </div>
            
            <!-- Quick Stats -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 24px; margin-bottom: 40px;">
                 <div class="glass-card-premium" style="background: linear-gradient(145deg, rgba(15, 23, 42, 0.6), rgba(34, 197, 94, 0.1));">
                    <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">My Active Alerts</div>
                    <div style="font-size: 3rem; font-weight: 800; color: #4ADE80; letter-spacing: -0.02em;">${myActiveCount}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Donors responding...</div>
                  </div>
                  <div class="glass-card-premium" style="background: linear-gradient(145deg, rgba(15, 23, 42, 0.6), rgba(225, 29, 72, 0.1));">
                     <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Total Inventory</div>
                     <div style="font-size: 3rem; font-weight: 800; color: var(--danger-text); letter-spacing: -0.02em;">${totalUnits} <span style="font-size: 1rem; color: var(--text-muted);">Units</span></div>
                     <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Across all groups</div>
                  </div>
                  <div class="glass-card-premium">
                     <div class="text-secondary text-sm font-medium uppercase tracking-wider mb-2">Lives Impacted</div>
                     <div style="font-size: 3rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.02em;">${(myRequests.count || 0) * 3}</div>
                     <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">Estimated impact</div>
                  </div>
            </div>

            <!-- Recent Activity / Visuals -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
                <div class="glass-card-premium">
                    <h3 style="margin-bottom: 20px; font-size: 1.25rem;">Recent Activity</h3>
                    <div style="display: flex; flex-direction: column; gap: 16px;">
                        ${myRequests.emergencies.slice(0, 3).map(e => `
                            <div style="display: flex; align-items: center; gap: 16px; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.03);">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: ${e.status === 'active' ? 'rgba(225, 29, 72, 0.2)' : 'rgba(34, 197, 94, 0.1)'}; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                                    ${e.status === 'active' ? '🚨' : '✅'}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-weight: 600; font-size: 0.95rem;">${e.patientName} (${e.bloodGroup})</div>
                                    <div style="color: var(--text-secondary); font-size: 0.8rem;">${new Date(e.createdAt).toLocaleDateString()} • ${e.unitsNeeded} Units</div>
                                </div>
                                <div class="badge" style="font-size: 0.7rem;">${e.status.toUpperCase()}</div>
                            </div>
                        `).join('') || '<div class="text-secondary">No recent activity</div>'}
                    </div>
                </div>
                
                <!-- Quick Inventory Preview -->
                <div class="glass-card-premium" style="display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 20px; font-size: 1.25rem;">Inventory Status</h3>
                    <div style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        ${renderMiniInventory(inventory.bloodGroups)}
                    </div>
                    <button onclick="switchHospitalTab('inventory', document.querySelectorAll('.sidebar-item')[2])" class="btn btn-secondary" style="width: 100%; margin-top: 16px; font-size: 0.85rem;">Manage Inventory</button>
                </div>
            </div>
        </div>

        <div id="view-requests" class="hidden">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <div>
                    <h2>Manage Broadcasts</h2>
                    <p>Track live emergencies and donor responses.</p>
                </div>
                <button onclick="showPage('emergency')" class="btn btn-primary">New Broadcast</button>
            </div>
            <div id="my-broadcasts-list" style="display: grid; gap: 16px;">
                ${myRequests.emergencies.length === 0 
                    ? `<div class="glass-card-premium text-secondary" style="text-align: center; padding: 60px;">
                        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">📡</div>
                        No broadcasts history found. Make your first request to alert donors.
                      </div>`
                    : myRequests.emergencies.map(e => `
                        <div class="glass-card-premium" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; border-left: 4px solid ${e.status === 'active' ? 'var(--primary-main)' : 'var(--success-text)'};">
                            <div style="display: flex; gap: 20px; align-items: center;">
                                <div style="width: 56px; height: 56px; background: var(--bg-surface); border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px solid var(--border-subtle);">
                                    <span style="font-weight: 800; font-size: 1.2rem; color: var(--danger-text);">${e.bloodGroup}</span>
                                    <span style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-secondary);">Group</span>
                                </div>
                                <div>
                                    <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 4px;">
                                        <h3 style="margin: 0; font-size: 1.1rem;">${e.patientName}</h3>
                                        <span class="badge" style="${e.status === 'active' ? 'background: rgba(225, 29, 72, 0.15); color: #F87171;' : 'background: rgba(34, 197, 94, 0.2); color: #4ADE80;'}">${e.status.toUpperCase()}</span>
                                    </div>
                                    <div class="text-secondary text-sm">
                                        Requested: ${new Date(e.createdAt).toLocaleDateString()} • Needed: <strong style="color: white;">${e.unitsNeeded} Units</strong>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 24px;">
                                <div style="text-align: right;">
                                    <div style="font-weight: 700; font-size: 1.2rem;">${e.respondents ? e.respondents.length : 0}</div>
                                    <div class="text-sm text-secondary">Responders</div>
                                </div>
                                <div style="width: 1px; height: 40px; background: var(--border-subtle);"></div>
                                ${e.status === 'active' 
                                    ? `<button onclick="markFulfilled('${e._id}')" class="btn btn-secondary btn-sm" style="border-color: var(--success-text); color: var(--success-text); gap: 8px;">
                                        <span style="font-size: 1.1rem;">✅</span> Mark Done
                                       </button>`
                                    : `<button class="btn btn-ghost btn-sm" disabled>Archived</button>`
                                }
                            </div>
                        </div>
                    `).join('')
                }
            </div>
        </div>

        <div id="view-inventory" class="hidden">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <div>
                   <h2 style="margin-bottom: 8px;">Bank Inventory</h2>
                   <p>Live tracking of blood units. Updates propagate instantly.</p>
                </div>
                <div class="badge" style="background: rgba(225, 29, 72, 0.1); border: 1px solid rgba(225, 29, 72, 0.2); color: #FDA4AF;">
                    Last Updated: ${inventory.lastUpdated ? new Date(inventory.lastUpdated).toLocaleTimeString() : 'Just now'}
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;" id="inventory-grid">
                ${renderFullInventory(inventory.bloodGroups)}
            </div>
        </div>
        
        <div id="view-analytics" class="hidden">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <div>
                    <h2>Performance Analytics</h2>
                    <p>Weekly demand vs supply analysis.</p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem;">
                        <span style="width: 12px; height: 12px; background: var(--primary-main); border-radius: 2px;"></span> Broadcasts
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; font-size: 0.8rem;">
                        <span style="width: 12px; height: 12px; background: #34D399; border-radius: 2px;"></span> Fulfilled
                    </div>
                </div>
             </div>

             <!-- CSS Only Bar Chart -->
             <div class="glass-card-premium" style="padding: 32px; height: 400px; display: flex; align-items: flex-end; justify-content: space-between; gap: 16px;">
                <!-- Mon -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 8px;">
                     <div style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 80%;">
                        <div style="width: 12px; height: 40%; background: var(--primary-main); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                        <div style="width: 12px; height: 35%; background: #34D399; border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                     </div>
                     <div style="font-size: 0.8rem; color: var(--text-secondary);">Mon</div>
                </div>
                <!-- Tue -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 8px;">
                     <div style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 80%;">
                        <div style="width: 12px; height: 65%; background: var(--primary-main); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                        <div style="width: 12px; height: 50%; background: #34D399; border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                     </div>
                     <div style="font-size: 0.8rem; color: var(--text-secondary);">Tue</div>
                </div>
                <!-- Wed -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 8px;">
                     <div style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 80%;">
                        <div style="width: 12px; height: 85%; background: var(--primary-main); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                        <div style="width: 12px; height: 80%; background: #34D399; border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                     </div>
                     <div style="font-size: 0.8rem; color: var(--text-secondary);">Wed</div>
                </div>
                <!-- Thu -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 8px;">
                     <div style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 80%;">
                        <div style="width: 12px; height: 55%; background: var(--primary-main); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                        <div style="width: 12px; height: 45%; background: #34D399; border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                     </div>
                     <div style="font-size: 0.8rem; color: var(--text-secondary);">Thu</div>
                </div>
                <!-- Fri -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 8px;">
                     <div style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 80%;">
                        <div style="width: 12px; height: 90%; background: var(--primary-main); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                        <div style="width: 12px; height: 88%; background: #34D399; border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                     </div>
                     <div style="font-size: 0.8rem; color: var(--text-secondary);">Fri</div>
                </div>
                <!-- Sat -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 8px;">
                     <div style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 80%;">
                        <div style="width: 12px; height: 30%; background: var(--primary-main); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                        <div style="width: 12px; height: 30%; background: #34D399; border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                     </div>
                     <div style="font-size: 0.8rem; color: var(--text-secondary);">Sat</div>
                </div>
                <!-- Sun -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; height: 100%; gap: 8px;">
                     <div style="width: 100%; display: flex; align-items: flex-end; justify-content: center; gap: 4px; height: 80%;">
                        <div style="width: 12px; height: 20%; background: var(--primary-main); border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                        <div style="width: 12px; height: 15%; background: #34D399; border-radius: 4px 4px 0 0; opacity: 0.8;"></div>
                     </div>
                     <div style="font-size: 0.8rem; color: var(--text-secondary);">Sun</div>
                </div>
             </div>
             
             <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-top: 24px;">
                <div class="glass-card-premium" style="display: flex; flex-direction: column; gap: 8px;">
                    <div class="text-secondary text-sm">Response Rate</div>
                    <div style="font-size: 2rem; font-weight: 800; color: #34D399;">92%</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">+4% vs last week</div>
                </div>
                <div class="glass-card-premium" style="display: flex; flex-direction: column; gap: 8px;">
                    <div class="text-secondary text-sm">Avg. Response Time</div>
                    <div style="font-size: 2rem; font-weight: 800; color: #60A5FA;">12m</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">-2m vs last week</div>
                </div>
                <div class="glass-card-premium" style="display: flex; flex-direction: column; gap: 8px;">
                    <div class="text-secondary text-sm">Critical Shortages</div>
                    <div style="font-size: 2rem; font-weight: 800; color: #F87171;">2</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">O+, B-</div>
                </div>
             </div>
        </div>
    `;

  } catch (error) {
    console.error('Error loading hospital dashboard:', error);
    showNotification('Failed to load dashboard data', 'error');
  }
};

// --- HELPER FUNCTIONS FOR INVENTORY ---

const renderMiniInventory = (groups) => {
    // Show top 4 most critical (lowest) or just first 4
    // Make sure we have mock data if empty
    if(!groups || groups.length === 0) return '<div class="text-secondary text-sm">No data</div>';
    
    // Sort logic could go here, for now just slice
    return groups.slice(0, 4).map(g => `
        <div style="padding: 8px; border-radius: 8px; background: rgba(255,255,255,0.03); border: 1px solid var(--border-subtle);">
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 4px;">${g.type}</div>
            <div style="font-weight: 700; color: ${g.units < 5 ? 'var(--danger-text)' : 'white'};">
                ${g.units} <span style="font-size: 0.7rem; font-weight: 400; opacity: 0.7;">units</span>
            </div>
        </div>
    `).join('');
};

const renderFullInventory = (groups) => {
    if(!groups || groups.length === 0) return '<div>No inventory initialized</div>';

    return groups.map(g => {
        // Visual Level Calculation (Max assumption 50 units for visual)
        const percentage = Math.min(100, (g.units / 50) * 100);
        const isCritical = g.units < 5;
        const colorVar = isCritical ? 'var(--danger-base)' : 'var(--primary-main)';
        
        return `
        <div class="glass-card-premium" style="position: relative; overflow: hidden; padding: 0;">
            <!-- Content -->
            <div style="padding: 24px; position: relative; z-index: 2;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; background: ${isCritical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(225, 29, 72, 0.1)'}; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; font-weight: 800; color: ${isCritical ? '#F87171' : '#FB7185'}; border: 1px solid ${isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(225, 29, 72, 0.2)'};">
                        ${g.type}
                    </div>
                    ${isCritical ? `<div class="badge" style="background: rgba(239, 68, 68, 0.2); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3);">CRITICAL</div>` : ''}
                </div>
                
                <div style="margin-bottom: 24px;">
                    <div style="font-size: 2.5rem; font-weight: 800; line-height: 1; margin-bottom: 4px;">${g.units}</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary);">Units Available</div>
                </div>

                <!-- Controls -->
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button onclick="updateInventory('${g.type}', 1, 'remove')" class="btn btn-secondary btn-sm" style="width: 32px; height: 32px; padding: 0; border-radius: 8px;">-</button>
                    <button onclick="updateInventory('${g.type}', 1, 'add')" class="btn btn-secondary btn-sm" style="width: 32px; height: 32px; padding: 0; border-radius: 8px;">+</button>
                    <button onclick="editInventory('${g.type}', ${g.units})" class="btn btn-secondary btn-sm" style="flex: 1; font-size: 0.8rem;">Edit</button>
                </div>
            </div>

            <!-- Liquid/Graph Background Effect -->
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${Math.max(5, percentage)}%; background: ${colorVar}; opacity: 0.1; transition: height 1s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1;"></div>
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; height: 4px; background: ${colorVar}; opacity: 0.3; z-index: 1;"></div>
        </div>
    `}).join('');
};

window.updateInventory = async (type, units, action) => {
    try {
        await inventoryAPI.update({ bloodGroup: type, units, action });
        // Refresh just the inventory tab or data
        // For smoothness, we re-fetch and re-render
        // Ideally we update local state, but full reload is safer for now
        const resp = await inventoryAPI.get();
        const grid = document.getElementById('inventory-grid');
        if(grid) {
            grid.innerHTML = renderFullInventory(resp.data.bloodGroups);
        }
        showNotification(`${type} updated successfully`, 'success');
    } catch(e) {
        showNotification(e.message, 'error');
    }
}

window.editInventory = async (type, current) => {
    const newVal = prompt(`Set total units for ${type}:`, current);
    if(newVal === null) return;
    const units = parseInt(newVal);
    if(isNaN(units) || units < 0) {
        showNotification('Invalid number', 'error');
        return;
    }
    
    // Direct set
    window.updateInventory(type, units, 'set');
}

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
/*******************************************************
 * WIZARD & EMERGENCY LOGIC
 *******************************************************/

// Global state for wizard inputs (since we use custom divs now)
let wizardState = {
    blood: 'O+',
    urgency: 'critical'
};

// Functions to handle custom selection
window.selectBlood = (btn, type) => {
   // distinct types
   wizardState.blood = type;
   document.getElementById('emg-blood').value = type; // hidden input

   // UI Update
   document.querySelectorAll('.blood-selector').forEach(el => el.classList.remove('active'));
   btn.classList.add('active');
};

window.selectUrgency = (div, level) => {
    wizardState.urgency = level;
    document.getElementById('emg-urgency').value = level; // hidden input

    // UI Update
    document.querySelectorAll('.urgency-option').forEach(el => el.classList.remove('active'));
    div.classList.add('active');

    // Display update
    const display = document.getElementById('urgency-display');
    if (level === 'critical') display.innerHTML = "network: <strong>Critical Priority</strong>. 150+ donors within 10km will be alerted instantly.";
    if (level === 'urgent') display.innerHTML = "network: <strong>High Priority</strong>. Donors within 20km will be notified.";
    if (level === 'severe') display.innerHTML = "network: <strong>Standard Priority</strong>. Donors within 50km will be notified.";
}

// Stepper Logic
window.nextStep = (step) => {
    // Validation before moving
    if(step === 2) {
        const name = document.getElementById('emg-name').value;
        const cond = document.getElementById('emg-condition').value;
        if(!name || !cond) {
            showNotification('Please fill in all details', 'error');
            return;
        }
        
        // Update Step 1 Indicator
        document.getElementById('step-ind-1').classList.remove('active');
        document.getElementById('step-ind-1').style.opacity = '1'; // Completed state
        document.getElementById('step-ind-2').classList.add('active');
        document.getElementById('wizard-progress').style.width = '50%';
    }

    if(step === 3) {
         const loc = document.getElementById('emg-location').value;
         const phone = document.getElementById('emg-contact-phone').value;
         if(!loc || !phone) {
            showNotification('Please fill in location & contact', 'error');
            return;
         }

        // Update Step 2 Indicator
        document.getElementById('step-ind-2').classList.remove('active');
        document.getElementById('step-ind-2').style.opacity = '1';
        document.getElementById('step-ind-3').classList.add('active');
        document.getElementById('wizard-progress').style.width = '100%';

         const payload = {
            patientName: document.getElementById('emg-name').value,
            bloodGroup: wizardState.blood, // Used global state
            unitsRequired: parseInt(document.getElementById('emg-units').value),
            condition: document.getElementById('emg-condition').value,
            urgency: wizardState.urgency, // Used global state
            hospitalName: document.getElementById('emg-location').value,
            contactNumber: document.getElementById('emg-contact-phone').value,
            landmark: document.getElementById('emg-landmark').value,
            contactPerson: document.getElementById('emg-contact-name').value
        };

         // Populate Summary
         document.getElementById('summary-name').textContent = document.getElementById('emg-name').value;
         document.getElementById('summary-blood').textContent = wizardState.blood;
         document.getElementById('summary-units').textContent = document.getElementById('emg-units').value;
         document.getElementById('summary-location').textContent = loc;
         document.getElementById('summary-urgency').textContent = wizardState.urgency.toUpperCase();
    }

    // Switch Views
    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
};

window.prevStep = (step) => {
    // Reverse Progress
    if(step === 1) {
         document.getElementById('step-ind-2').classList.remove('active');
         document.getElementById('step-ind-1').classList.add('active');
         document.getElementById('wizard-progress').style.width = '0%';
    }
    if(step === 2) {
         document.getElementById('step-ind-3').classList.remove('active');
         document.getElementById('step-ind-2').classList.add('active');
         document.getElementById('wizard-progress').style.width = '50%';
    }

    document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
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
                <div class="glass-card-premium" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
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


// --- MAP FUNCTIONS ---
let mapInstance = null;

const initMap = (containerId, emergencies) => {
    const container = document.getElementById(containerId);
    if (!container || !window.L) return;

    // Reset if exists
    if (mapInstance) {
        mapInstance.remove();
        mapInstance = null;
    }

    // Default Center (Approx India Center or Custom)
    // For demo, we center on the first emergency or a default city (Hyderabad/Bangalore)
    const defaultCenter = [17.3850, 78.4867]; // Hyderabad
    
    mapInstance = L.map(containerId, {
        zoomControl: false,
        attributionControl: false
    }).setView(defaultCenter, 12);

    // Dark/Night Mode Tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy;OpenStreetMap, &copy;CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapInstance);

    // Add Markers
    if (emergencies && emergencies.length > 0) {
        const bounds = [];
        emergencies.forEach(e => {
            // Mock Geocoding: Add random offset to default center if no real coords
            // In real app, e.location would have lat/lng
            const offsetLat = (Math.random() - 0.5) * 0.1;
            const offsetLng = (Math.random() - 0.5) * 0.1;
            const lat = defaultCenter[0] + offsetLat;
            const lng = defaultCenter[1] + offsetLng;

            bounds.push([lat, lng]);

            // Custom Pulse Icon
            const pulseIcon = L.divIcon({
                className: 'map-pulse-icon',
                html: `<div style="width: 20px; height: 20px; background: rgba(239, 68, 68, 0.8); border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); animation: pulse-red 2s infinite;"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const marker = L.marker([lat, lng], { icon: pulseIcon }).addTo(mapInstance);
            
            // Popup
            marker.bindPopup(`
                <div style="font-family: inherit; min-width: 200px; color: #1e293b;">
                    <div style="font-weight: 700; color: #EF4444; margin-bottom: 4px;">SOS: ${e.bloodGroup}</div>
                    <div style="font-size: 0.9rem; margin-bottom: 4px;">${e.hospitalName}</div>
                    <div style="font-size: 0.8rem; color: #64748B;">${e.unitsNeeded} Units Needed</div>
                    <button onclick="respondToEmergency('${e._id}')" class="btn btn-primary" style="margin-top: 8px; width: 100%; height: 32px; font-size: 0.8rem;">Respond</button>
                </div>
            `);
        });
        
        // Fit bounds if we have points
        if (bounds.length > 0) {
            mapInstance.fitBounds(bounds, { padding: [50, 50] });
        }
    }
};

// Add global pulse animation for map if not exists
const style = document.createElement('style');
style.innerHTML = `
@keyframes pulse-red {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }
    70% {
        transform: scale(1);
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
    }
    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
}
.map-pulse-icon {
    background: transparent;
    border: none;
}
.leaflet-popup-content-wrapper {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(4px);
    border-radius: 12px;
    padding: 0;
}
.leaflet-popup-tip {
    background: rgba(255, 255, 255, 0.95);
}
`;
document.head.appendChild(style);


// --- CHATBOT WIDGET ---
const initChatbot = () => {
    // 1. Inject Styles
    if (document.getElementById('chatbot-style')) return; 
    
    const style = document.createElement('style');
    style.id = 'chatbot-style';
    style.innerHTML = `
        #bb-chatbot-fab {
            position: fixed;
            bottom: 32px;
            right: 32px;
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
            border-radius: 50%;
            box-shadow: 0 10px 25px rgba(225, 29, 72, 0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9999;
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            animation: float-y 3s ease-in-out infinite;
        }
        #bb-chatbot-fab:hover {
            transform: scale(1.1) translateY(-4px);
        }
        #bb-chatbot-window {
            position: fixed;
            bottom: 110px;
            right: 32px;
            width: 350px;
            height: 500px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            z-index: 9999;
            opacity: 0;
            pointer-events: none;
            transform: translateY(20px) scale(0.95);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #bb-chatbot-window.visible {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0) scale(1);
        }
        .chat-header {
            padding: 20px;
            background: linear-gradient(to right, rgba(225, 29, 72, 0.1), transparent);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .chat-msg {
            max-width: 80%;
            padding: 12px 16px;
            border-radius: 12px;
            font-size: 0.9rem;
            line-height: 1.5;
            animation: slide-up 0.3s ease-out;
        }
        .chat-msg.bot {
            background: rgba(255, 255, 255, 0.1);
            align-self: flex-start;
            border-bottom-left-radius: 4px;
        }
        .chat-msg.user {
            background: #e11d48;
            color: white;
            align-self: flex-end;
            border-bottom-right-radius: 4px;
        }
        .chat-options {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        .chat-option-btn {
            background: transparent;
            border: 1px solid rgba(225, 29, 72, 0.5);
            color: #e11d48;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
        }
        .chat-option-btn:hover {
            background: rgba(225, 29, 72, 0.1);
        }
        @keyframes float-y { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);

    // 2. Inject DOM
    const fab = document.createElement('div');
    fab.id = 'bb-chatbot-fab';
    fab.innerHTML = `<span style="font-size: 2rem;">🤖</span>`; 
    
    const win = document.createElement('div');
    win.id = 'bb-chatbot-window';
    win.innerHTML = `
        <div class="chat-header">
            <div style="width: 10px; height: 10px; background: #34D399; border-radius: 50%; box-shadow: 0 0 5px #34D399;"></div>
            <div>
                <div style="font-weight: 700; font-size: 0.95rem;">Bridge Assistant</div>
                <div style="font-size: 0.75rem; color: var(--text-secondary);">Always online</div>
            </div>
            <button onclick="toggleChat()" style="margin-left: auto; background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.2rem;">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages">
            <!-- Dynamic Content -->
        </div>
        <div style="padding: 12px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 0.7rem; color: var(--text-secondary); text-align: center;">
            AI-powered triage support
        </div>
    `;

    document.body.appendChild(fab);
    document.body.appendChild(win);

    // 3. Interaction Logic
    fab.onclick = toggleChat;

    // Initial Greeting
    setTimeout(() => {
        addBotMessage("Hi! I'm your Blood Bridge assistant. How can I help you today?", [
            { text: "I need blood ASAP", action: "need_blood" },
            { text: "I want to donate", action: "donate" },
            { text: "Am I eligible?", action: "check_eligibility" }
        ]);
    }, 1000);
}

window.toggleChat = () => {
    const win = document.getElementById('bb-chatbot-window');
    win.classList.toggle('visible');
}

const addBotMessage = (text, options = []) => {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg bot';
    msgDiv.innerHTML = text;
    container.appendChild(msgDiv);

    if (options.length > 0) {
        const optDiv = document.createElement('div');
        optDiv.className = 'chat-options';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option-btn';
            btn.textContent = opt.text;
            btn.onclick = () => handleChatAction(opt.action, opt.text);
            optDiv.appendChild(btn);
        });
        container.appendChild(optDiv);
    }
    
    container.scrollTo(0, container.scrollHeight);
}

const addUserMessage = (text) => {
    const container = document.getElementById('chat-messages');
    if(!container) return;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg user';
    msgDiv.textContent = text;
    container.appendChild(msgDiv);
    container.scrollTo(0, container.scrollHeight);
}

const handleChatAction = (action, text) => {
    addUserMessage(text);
    
    // Simulate Typing
    setTimeout(() => {
        switch(action) {
            case 'need_blood':
                addBotMessage("🚨 I understand this is urgent. To request blood, you need to broadcast an SOS signal.", [
                    { text: "Start Broadcast", action: "goto_broadcast" },
                    { text: "Back to menu", action: "reset" }
                ]);
                break;
            case 'goto_broadcast':
                showPage('emergency');
                toggleChat();
                break;
            case 'donate':
                addBotMessage("Heroes are always welcome! You can register as a donor to get alerted for nearby emergencies.", [
                    { text: "Register Now", action: "goto_register" },
                    { text: "I'm already registered", action: "goto_login" }
                ]);
                break;
            case 'goto_register':
                showPage('register');
                toggleChat();
                break;
             case 'goto_login':
                showPage('login');
                toggleChat();
                break;
            case 'check_eligibility':
                addBotMessage("Let's check quickly. Are you over 18 years old?", [
                    { text: "Yes", action: "elig_yes_age" },
                    { text: "No", action: "elig_fail" }
                ]);
                break;
            case 'elig_yes_age':
                addBotMessage("Great. Do you weigh more than 50kg?", [
                    { text: "Yes", action: "elig_success" },
                    { text: "No", action: "elig_fail" }
                ]);
                break;
            case 'elig_success':
                addBotMessage("✅ You are likely eligible to save lives! Please register immediately.", [
                    { text: "Register Now", action: "goto_register" }
                ]);
                break;
            case 'elig_fail':
                 addBotMessage("⚠️ You might not meet the medical criteria right now. Check back later or consult a doctor.", [
                    { text: "Back to menu", action: "reset" }
                ]);
                break;
            case 'reset':
                addBotMessage("How else can I assist?", [
                    { text: "I need blood", action: "need_blood" },
                    { text: "Donate", action: "donate" }
                 ]);
                 break;
        }
    }, 600);
}


// Initializer
document.addEventListener('DOMContentLoaded', () => {
  initChatbot(); // Launch Chatbot
  
  updateNavbar();

  // Check auth status
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    if (user.role === 'donor') loadDonorDashboard();
    if (user.role === 'hospital') loadHospitalDashboard();
  }

  // Public list always loads
  loadEmergencies();
  
  // Load Home Stats (Particles & Numbers)
  loadHomeStats();
});
