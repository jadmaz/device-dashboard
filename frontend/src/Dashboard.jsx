import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user }) {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    fetch("/api/devices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user }), // ✅ match backend naming
    })
      .then((res) => res.json())
      .then((data) => setDevices(data.devices || []))
      .catch((err) => console.error("Error fetching devices:", err));
  }, [user]);

  const handleOpenDevice = async (device) => {
    const res = await fetch("/api/open-device", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ip: device.ip,
        username: device.user,
        password: device.pass,
      }),
    });

    const data = await res.json();
    if (data.success) {
        const proxyUrl = `http://127.0.0.1:5000/proxy/${device.ip}/sdcard/cpt/app/graphic.php?gr=trend&dataType=analog&id=2&token=${data.token}`;
      window.open(proxyUrl, "_blank");
    } else {
      alert("Login failed: " + (data.error || "Unknown error"));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>All Devices</h2>
      <ul style={styles.deviceList}>
        {devices.map((d, i) => (
          <li key={i} style={styles.deviceItem}>
            <b>{d.name}</b> @{" "}
            <a href="#" onClick={() => handleOpenDevice(d)} style={styles.link}>
              {d.ip}
            </a>
          </li>
        ))}
      </ul>
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
    marginBottom: "40px",
  },
  deviceItem: {
    marginBottom: "10px",
    fontSize: "16px",
  },
  link: {
    color: "#007bff",
    textDecoration: "none",
    cursor: "pointer",
    marginRight: "10px",
  },
};