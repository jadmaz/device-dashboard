import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ConfigureDevices from "./ConfigureDevices";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* English Routes */}
        <Route path="/en">
          <Route path="login" element={<Login setUser={setUser} lang="en" />} />
          <Route path="configure-devices" element={<ConfigureDevices user={user} lang="en" />} />
          <Route path="dashboard" element={<Dashboard user={user} lang="en" />} />
        </Route>
        
        {/* French Routes */}
        <Route path="/fr">
          <Route path="login" element={<Login setUser={setUser} lang="fr" />} />
          <Route path="configure-devices" element={<ConfigureDevices user={user} lang="fr" />} />
          <Route path="dashboard" element={<Dashboard user={user} lang="fr" />} />
        </Route>

        {/* Redirect root to preferred language */}
        <Route path="/" element={<Navigate to="/en/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
