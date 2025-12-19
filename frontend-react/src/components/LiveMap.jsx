import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import api from '../api';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const LiveMap = () => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [emergencies, setEmergencies] = useState([]);

    useEffect(() => {
        if (map.current) return; // Initialize only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11', // Premium Dark Mode
            center: [78.4867, 17.3850], // Default: Hyderabad
            zoom: 11,
            pitch: 45, // 3D effect
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

        // Fetch Initial Emergencies
        const fetchEmergencies = async () => {
            try {
                const { data } = await api.get('/emergencies?status=active');
                setEmergencies(data.emergencies);
            } catch (err) {
                console.error("Failed to load map data", err);
            }
        };
        fetchEmergencies();

    }, []);

    // Update Markers when emergencies change
    useEffect(() => {
        if (!map.current) return;

        emergencies.forEach(emergency => {
            if (emergency.location && emergency.location.coordinates) {
                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundImage = 'url(/pin-red.png)'; // We need to ensure this asset exists or use CSS
                el.style.width = '30px';
                el.style.height = '30px';
                el.style.borderRadius = '50%';
                el.style.backgroundColor = '#E11D48';
                el.style.boxShadow = '0 0 20px #E11D48'; // Pulse effect handled by CSS ideally, but inline for now

                // Create a pulsing dot
                const pulse = document.createElement('div');
                pulse.style.position = 'absolute';
                pulse.style.width = '100%';
                pulse.style.height = '100%';
                pulse.style.borderRadius = '50%';
                pulse.style.backgroundColor = '#E11D48';
                pulse.style.opacity = '0.7';
                pulse.style.animation = 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite';
                el.appendChild(pulse);

                new mapboxgl.Marker(el)
                    .setLngLat([emergency.location.coordinates[1], emergency.location.coordinates[0]]) // GeoJSON is Lng,Lat. Our backend might differ.
                    // Assuming Backend supports Lng/Lat standard.
                    // If backend is strictly Lat/Lng, we swap.
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
                        `<div style="color:black; font-weight:bold;">${emergency.bloodGroup} Blood Needed</div>
                         <div style="color:#333;">${emergency.hospitalName}</div>`
                    ))
                    .addTo(map.current);
            }
        });
    }, [emergencies]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '500px', borderRadius: '24px', overflow: 'hidden' }}>
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                background: 'rgba(15, 23, 42, 0.9)',
                padding: '8px 16px',
                borderRadius: '50px',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{ width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 8px #EF4444' }}></span>
                Live Global Network
            </div>
        </div>
    );
};

export default LiveMap;
