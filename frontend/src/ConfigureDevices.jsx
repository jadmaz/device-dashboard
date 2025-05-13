import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ name: "", ip: "", user: "", pass: "" });
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!form.name || !form.ip) return;
    setDevices([...devices, form]);
    setForm({ name: "", ip: "", user: "", pass: "" });
  };

  const handleRemove = (nameToRemove) => {
    setDevices(devices.filter((d) => d.name !== nameToRemove));
  };

  const handleComplete = () => {
    navigate("/dashboard", { state: { devices } });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Device Setup</h2>

      <section>
        <h3>Added Devices</h3>
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
        <h3>Add Device</h3>
        <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="IP"
            value={form.ip}
            onChange={(e) => setForm({ ...form, ip: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Username"
            value={form.user}
            onChange={(e) => setForm({ ...form, user: e.target.value })}
            style={styles.input}
          />
          <input
            placeholder="Password"
            value={form.pass}
            onChange={(e) => setForm({ ...form, pass: e.target.value })}
            type="password"
            style={styles.input}
          />
          <button onClick={handleAdd} style={styles.button}>Add Device</button>
        </form>
      </section>

      <button onClick={handleComplete} style={{ ...styles.button, backgroundColor: "#007bff", marginTop: 20 }}>
        Complete
      </button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "600px",
    margin: "50px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
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
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
