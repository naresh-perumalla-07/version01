import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import LiveMap from '../components/LiveMap';

const Home = () => {
    const canvasRef = useRef(null);

    // Particle Animation Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let width, height;
        let particles = [];
        let animationFrameId;

        const resize = () => {
            if(canvas.parentElement) {
                width = canvas.width = canvas.parentElement.offsetWidth;
                height = canvas.height = canvas.parentElement.offsetHeight;
            }
        };
        
        window.addEventListener('resize', resize);
        resize();

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.color = Math.random() > 0.8 ? '#E11D48' : '#334155';
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
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

        const initParticles = () => {
             particles = [];
             for (let i = 0; i < 50; i++) particles.push(new Particle());
        };
        initParticles();

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach((p, index) => {
                p.update();
                p.draw();
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
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <section id="home" className="page active" style={{ paddingTop: '120px', minHeight: '100vh', position: 'relative' }}>
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}></canvas>
            <div className="hero-glow"></div>
            
            <div className="container">
                <div className="hero-split" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="hero-content">
                        <div className="badge badge-brand" style={{ marginBottom: '24px' }}>🔴 Emergency Response Network v2.0</div>
                        <h1 style={{ fontSize: '4rem', marginBottom: '24px' }}>Every Second Counts. <span className="text-gradient">Save a Life Today.</span></h1>
                        <p style={{ fontSize: '1.25rem', marginBottom: '40px', lineHeight: 1.8, color: 'var(--text-body)' }}>
                            The intelligent platform bridging hospitals directly with nearby verified donors. 
                            No middlemen. Zero delays. 100% transparent impact.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <Link to="/register" className="btn btn-primary" style={{ height: '56px', padding: '0 40px', fontSize: '1.1rem', borderRadius: '16px', textDecoration: 'none' }}>
                                🌍 Join as Donor
                            </Link>
                            <Link to="/find-blood" className="btn btn-secondary" style={{ height: '56px', padding: '0 32px', fontSize: '1.1rem', borderRadius: '16px', textDecoration: 'none' }}>
                                🚑 Find Blood
                            </Link>
                        </div>

                        {/* Dynamic Stats Bar */}
                        <div style={{ marginTop: '80px', padding: '24px', background: 'rgba(15, 23, 42, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: '20px', display: 'inline-flex', gap: '48px', backdropFilter: 'blur(8px)' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div className="font-bold text-gradient" style={{ fontSize: '2.5rem' }}>2,450+</div>
                                <div className="text-xs uppercase tracking-widest text-secondary" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Heroes Registered</div>
                            </div>
                            <div style={{ width: '1px', background: 'var(--border-subtle)' }}></div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="font-bold" style={{ fontSize: '2.5rem', color: 'var(--danger-text)' }}>12</div>
                                <div className="text-xs uppercase tracking-widest text-secondary" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Alerts</div>
                            </div>
                            <div style={{ width: '1px', background: 'var(--border-subtle)' }}></div>
                            <div style={{ textAlign: 'center' }}>
                                <div className="font-bold text-gradient" style={{ fontSize: '2.5rem' }}>&lt; 5m</div>
                                <div className="text-xs uppercase tracking-widest text-secondary" style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Avg Response</div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual" style={{ position: 'relative' }}>
                        {/* REPLACEMENT: Use the Live Map here instead of the static image, as it's the "V2.0" upgrade but keeps the layout */}
                         <div className="glass-card-premium" style={{ width: '100%', height: '500px', padding: '0', border: '1px solid var(--border-highlight)', overflow: 'hidden' }}>
                            <LiveMap />
                         </div>
                         {/* Glow behind visual */}
                         <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'var(--primary-main)', opacity: '0.15', filter: 'blur(80px)', borderRadius: '50%', zIndex: -1 }}></div>
                    </div>
                </div>

                {/* FEATURES / HOW IT WORKS */}
                <div className="features-section">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '3rem', marginBottom: '16px' }}>How BloodBridge Works</h2>
                        <p style={{ margin: '0 auto', fontSize: '1.2rem', color: 'var(--text-body)' }}>A seamless ecosystem designed for speed, trust, and saving lives.</p>
                    </div>

                    <div className="grid-features">
                        {/* Step 1 */}
                        <div className="feature-card">
                            <div className="step-number">01</div>
                            <div className="feature-icon">🏥</div>
                            <h3>Hospital Request</h3>
                            <p style={{ marginTop: '16px' }}>Institutions broadcast urgent blood requirements with specific blood group, location, and urgency level.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="feature-card">
                            <div className="step-number">02</div>
                            <div className="feature-icon">📡</div>
                            <h3>Smart Notification</h3>
                            <p style={{ marginTop: '16px' }}>Our algorithm instantly alerts nearby verified donors matching the blood type via SMS and App notifications.</p>
                        </div>

                         {/* Step 3 */}
                         <div className="feature-card">
                            <div className="step-number">03</div>
                            <div className="feature-icon">❤️</div>
                            <h3>Life Saved</h3>
                            <p style={{ marginTop: '16px' }}>Donors accept the request, navigate to the hospital, and complete the donation. Lives impacted +1.</p>
                        </div>
                    </div>
                </div>

                <div className="grid-features" style={{ marginTop: '96px' }}>
                    <div className="glass-card-premium">
                        <div style={{ width: '40px', height: '40px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            ❤️</div>
                        <h3>For Donors</h3>
                        <p style={{ fontSize: '0.95rem', marginTop: '8px' }}>Receive instant alerts when your blood type is
                            needed nearby. Track your donations and impact.</p>
                    </div>
                    <div className="glass-card-premium">
                         <div style={{ width: '40px', height: '40px', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            🏥</div>
                        <h3>For Hospitals</h3>
                        <p style={{ fontSize: '0.95rem', marginTop: '8px' }}>Broadcast requests with geolocation. Manage
                            inventory and track response times in real-time.</p>
                    </div>
                    <div className="glass-card-premium">
                        <div style={{ width: '40px', height: '40px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            ⚡</div>
                        <h3>Speed Matters</h3>
                        <p style={{ fontSize: '0.95rem', marginTop: '8px' }}>Our algorithm ensures the closest donors are
                            notified first, reducing transport time significantly.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Home;
