import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

// Language specific content
const content = {
  en: {
    title: "Device Dashboard",
    ipAddress: "IP Address",
  },
  fr: {
    title: "Tableau de Bord",
    ipAddress: "Adresse IP",
  }
};

export default function Dashboard({ user, lang }) {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(`/${lang}/login`);
      return;
    }

    fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user }),
    })
      .then((res) => res.json())
      .then((data) => setDevices(data.devices || []))
      .catch((err) => console.error("Error fetching devices:", err));
  }, [user, lang]);

  const handleOpenDevice = async (e, device) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/open-device", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: device.ip,
          username: device.user,
          password: device.pass,
        }),
      });
      // ... rest of your handleOpenDevice logic
    } catch (err) {
      console.error("Error:", err);
    }
  };

  return (
    <div style={styles.page}>
      <Link 
        to={`/${lang === 'en' ? 'fr' : 'en'}/dashboard`} 
        style={styles.langButton}
      >
        {lang === 'en' ? 'FR' : 'EN'}
      </Link>
      <div style={styles.container}>
        <img 
          src="https://eneria.ca/wp-content/uploads/2021/07/ENERIA-cover-02-scaled.jpg"
          alt="Eneria"
          style={styles.logo}
        />
        <h2 style={styles.heading}>{content[lang].title}</h2>
        <div style={styles.grid}>
          {devices.map((d, i) => (
            <div key={i} style={styles.card} onClick={(e) => handleOpenDevice(e, d)}>
              <div style={styles.cardHeader}>
                <span style={styles.deviceName}>{d.name}</span>
                <span style={styles.status}></span>
              </div>
              <div style={styles.cardBody}>
                <div style={styles.ipAddress}>
                  <span style={styles.label}>{content[lang].ipAddress}</span>
                  <span style={styles.value}>{d.ip}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#fff'
  },
  langButton: {
    position: 'absolute',
    top: '20px',
    right: '40px',
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '2px solid #1a1a1a',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#1a1a1a'
  },
  container: {
    maxWidth: "1200px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  logo: {
    width: '400px', // Increased from 200px
    height: 'auto',
    marginBottom: '40px', // Increased margin to maintain spacing
    display: 'block', // Ensure proper centering
    margin: '0 auto 40px', // Center horizontally and add bottom margin
  },
  heading: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "40px",
    textAlign: "left",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    padding: "20px 0",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
    border: "1px solid #eee",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 8px 12px rgba(0, 0, 0, 0.1)",
    },
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  deviceName: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a1a",
  },
  status: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#4CAF50",
  },
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  ipAddress: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  metadata: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "12px",
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  value: {
    fontSize: "14px",
    color: "#333",
    fontWeight: "500",
  },
};