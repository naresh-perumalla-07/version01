import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-col">
                        <div className="logo" style={{ marginBottom: '24px' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.02em', color: 'white' }}>BloodBridge</span>
                        </div>
                        <p>The world's most advanced emergency blood response network. Connecting humanity through technology and compassion.</p>
                    </div>
                    <div className="footer-col">
                        <h4>Platform</h4>
                        <a href="#" className="footer-link">Find Blood</a>
                        <a href="#" className="footer-link">For Hospitals</a>
                        <a href="#" className="footer-link">Live Map</a>
                        <a href="#" className="footer-link">Success Stories</a>
                    </div>
                    <div className="footer-col">
                        <h4>Company</h4>
                        <a href="#" className="footer-link">About Us</a>
                        <a href="#" className="footer-link">Careers</a>
                        <a href="#" className="footer-link">Privacy Policy</a>
                        <a href="#" className="footer-link">Terms of Service</a>
                    </div>
                    <div className="footer-col">
                        <h4>Connect</h4>
                        <a href="#" className="footer-link">Twitter</a>
                        <a href="#" className="footer-link">Instagram</a>
                        <a href="#" className="footer-link">LinkedIn</a>
                        <a href="#" className="footer-link">Contact Support</a>
                    </div>
                </div>
                <div className="footer-bottom">
                    <div>&copy; 2025 Blood Bridge Inc. All rights reserved.</div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <span>Made with ❤️ for Humanity</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
