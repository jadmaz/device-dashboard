import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function ConfigureDevices({ user, lang }) {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ name: "", ip: "", user: "", pass: "" });
  const navigate = useNavigate();

  // Language specific content
  const content = {
    en: {
      title: "Device Setup",
      addedDevices: "Added Devices",
      addDevice: "Add Device",
      name: "Name",
      ip: "IP Address",
      username: "Username",
      password: "Password",
      complete: "Complete"
    },
    fr: {
      title: "Configuration des Appareils",
      addedDevices: "Appareils Ajoutés",
      addDevice: "Ajouter un Appareil",
      name: "Nom",
      ip: "Adresse IP",
      username: "Nom d'utilisateur",
      password: "Mot de passe",
      complete: "Terminer"
    }
  }[lang];

  const handleAdd = () => {
    if (!form.name || !form.ip) return;
    setDevices([...devices, form]);
    setForm({ name: "", ip: "", user: "", pass: "" });
  };

  const handleRemove = (nameToRemove) => {
    setDevices(devices.filter((d) => d.name !== nameToRemove));
  };

  const handleComplete = async () => {
    try {
      // Save each device to the backend
      for (const device of devices) {
        const response = await fetch("/api/add-device", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            username: user,
            device: device
          })
        });

        const data = await response.json();
        if (!data.success) {
          alert(`Failed to save device ${device.name}`);
          return;
        }
      }

      // Navigate to dashboard with language prefix
      navigate(`/${lang}/dashboard`, { state: { devices } });
    } catch (err) {
      console.error("Error saving devices:", err);
      alert("Failed to save devices");
    }
  };

  return (
    <div style={styles.page}>
      <Link 
        to={`/${lang === 'en' ? 'fr' : 'en'}/configure-devices`} 
        style={styles.langButton}
      >
        {lang === 'en' ? 'FR' : 'EN'}
      </Link>
      <div style={styles.container}>
        <h2 style={styles.heading}>{content.title}</h2>

        <section>
          <h3>{content.addedDevices}</h3>
          <ul style={styles.deviceList}>
            {devices.map((d, i) => (
              <li key={i} style={styles.deviceItem}>
                <b>{d.name}</b> — {d.ip}{" "}
                <button onClick={() => handleRemove(d.name)} style={styles.removeButton}>
                  ✖
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>{content.addDevice}</h3>
          <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder={content.name}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder={content.ip}
              value={form.ip}
              onChange={(e) => setForm({ ...form, ip: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder={content.username}
              value={form.user}
              onChange={(e) => setForm({ ...form, user: e.target.value })}
              style={styles.input}
            />
            <input
              placeholder={content.password}
              value={form.pass}
              onChange={(e) => setForm({ ...form, pass: e.target.value })}
              type="password"
              style={styles.input}
            />
            <button onClick={handleAdd} style={styles.button}>{content.addDevice}</button>
          </form>
        </section>

        <button onClick={handleComplete} style={{ ...styles.button, backgroundColor: "#007bff", marginTop: 20 }}>
          {content.complete}
        </button>
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
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "20px",
  },
  langToggle: {
    textDecoration: "none",
    color: "#007bff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  heading: {
    textAlign: "center",
    marginBottom: "30px",
    color: "#333",
  },
  deviceList: {
    listStyle: "none",
    paddingLeft: "0",
    marginBottom: "20px",
  },
  deviceItem: {
    marginBottom: "10px",
    fontSize: "16px",
  },
  removeButton: {
    background: "transparent",
    border: "none",
    color: "#dc3545",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "18px",
    marginLeft: "10px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "10px",
    fontSize: "14px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "6px",
  }
};