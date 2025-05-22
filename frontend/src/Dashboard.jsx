import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_BASE_URL } from './config';
import EneriaLogo from './assets/eneria.png';
import './Dashboard.css';

const content = {
  en: {
    title: "Device Dashboard",
    ipAddress: "IP Address",
    deviceName: "Device Name",
    error: "Error loading devices",
    deviceUnavailable: "Device is currently unavailable"
  },
  fr: {
    title: "Tableau de Bord",
    ipAddress: "Adresse IP",
    deviceName: "Nom de l'appareil",
    error: "Erreur lors du chargement des appareils",
    deviceUnavailable: "L'appareil n'est pas disponible actuellement"
  }
};


export default function Dashboard({ lang }) {
  const [devices, setDevices] = useState([]);
  const [deviceStatus, setDeviceStatus] = useState({});
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/devices`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setDevices(data.devices);
      } catch (err) {
        console.error("Error fetching devices:", err);
        setError(content[lang].error);
      }
    };

    fetchDevices();
  }, [lang]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/devices/status`, {
          method: "GET",
          headers: { "Content-Type": "application/json" }
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setDeviceStatus(data.status);
      } catch (err) {
        console.error("Error checking status:", err);
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleOpenDevice = async (e, device) => {
    e.preventDefault();
    
    if (!deviceStatus[device.ip]) {
      setPopupMessage(content[lang].deviceUnavailable);
      setShowPopup(true);
      return;
    }

    try {
      await fetch(`${API_BASE_URL}/api/open-device`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: device.ip
        }),
      });
    } catch (err) {
      console.error("Error:", err);
      setPopupMessage("An error occurred while trying to open the device.");
      setShowPopup(true);
    }
  };

  const getStatusStyle = (ip) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: deviceStatus[ip] ? "#4CAF50" : "#dc3545"
  });

  return (
    <div style={styles.page}>
      <Link
        to={`/${lang === 'en' ? 'fr' : 'en'}/dashboard`}
        className="langButton"
      >
        {lang === 'en' ? 'FR' : 'EN'}
      </Link>
      <div style={styles.container}>
        <img 
          src={EneriaLogo}
          alt="Eneria"
          style={styles.logo}
        />
        <h2 style={styles.heading}>{content[lang].title}</h2>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.grid}>
          {devices.map((d, i) => (
            <div key={i} className="card" onClick={(e) => handleOpenDevice(e, d)}>
              <div style={styles.cardHeader}>
                <span style={styles.deviceName}>{d.name}</span>
                <span style={{...styles.status, ...getStatusStyle(d.ip)}}></span>
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

      {showPopup && (
        <div style={styles.popupOverlay}>
          <div style={styles.popup}>
            <p>{popupMessage}</p>
            <button style={styles.popupButton} onClick={() => setShowPopup(false)}>OK</button>
          </div>
        </div>
      )}
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
  container: {
    maxWidth: "1200px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  logo: {
    width: '400px',
    height: 'auto',
    marginBottom: '40px',
    display: 'block',
    margin: '0 auto 40px',
  },
  heading: {
    fontSize: "28px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "40px",
    textAlign: "left",
  },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    marginBottom: "20px",
  },
  addForm: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px",
  },
  input: {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "16px",
    width: "100%",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    padding: "20px 0",
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
  error: {
    color: '#dc3545',
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '4px',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    textAlign: 'center'
  },
  popupOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#fff',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
    textAlign: 'center',
    minWidth: '300px',
    maxWidth: '90%',
  },
  popupButton: {
    backgroundColor: '#f3a412',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '15px',
  }
};