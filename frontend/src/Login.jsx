import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const translations = {
  en: {
    title: "Login",
    username: "Username",
    password: "Password",
    submit: "Login",
    errors: {
      invalid: "Invalid credentials",
      failed: "Login failed",
      network: "Network error"
    },
    switchToFr: "FR"
  },
  fr: {
    title: "Connexion",
    username: "Nom d'utilisateur",
    password: "Mot de passe",
    submit: "Se connecter",
    errors: {
      invalid: "Identifiants invalides",
      failed: "Échec de la connexion",
      network: "Erreur réseau"
    },
    switchToEn: "EN"
  }
};

export default function Login({ setUser, lang }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const t = translations[lang];

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        setUser(username);
        navigate(`/${lang}/configure-devices`);
      } else {
        // Map backend error to translated message
        setError(t.errors.invalid);
      }
    } catch (err) {
      setError(t.errors.network);
    }
  };

  return (
    <div style={styles.page}>
      <Link 
        to={`/${lang === 'en' ? 'fr' : 'en'}/login`} 
        style={{
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
        }}
      >
        {lang === 'en' ? 'FR' : 'EN'}
      </Link>
      <div style={styles.container}>
        <img 
          src="https://eneria.ca/wp-content/uploads/2021/07/ENERIA-cover-02-scaled.jpg"
          alt="Eneria"
          style={styles.logo}
        />
        <h2 style={styles.title}>{t.title}</h2>
        {error && <p style={styles.error}>{error}</p>}
        <form onSubmit={handleLogin} style={styles.form}>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={t.username}
            type="text"
            style={styles.input}
          />
          <input
            value={password}
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.password}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>{t.submit}</button>
        </form>
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
  container: {
    maxWidth: "400px",
    margin: "50px auto",
    padding: "40px",
    borderRadius: "12px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    fontFamily: "Arial, sans-serif",
  },
  title: {
    textAlign: "center",
    marginBottom: "24px",
    color: "#333",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20px',
  },
  langButton: {
    padding: '8px 16px',
    backgroundColor: '#fff',
    border: '2px solid #1a1a1a',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#1a1a1a',
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: '#1a1a1a',
      color: '#fff',
    },
  },
  logo: {
    width: '400px',
    height: 'auto',
    marginBottom: '40px',
  },
  topRight: {
    position: 'absolute',
    top: '20px',
    right: '40px',
    zIndex: 1000,
  },
};
