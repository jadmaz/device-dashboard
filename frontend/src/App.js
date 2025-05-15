import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* English Route */}
        <Route path="/en/dashboard" element={<Dashboard lang="en" />} />
        
        {/* French Route */}
        <Route path="/fr/dashboard" element={<Dashboard lang="fr" />} />

        {/* Redirect root to dashboard */}
        <Route path="*" element={<Navigate to="/en/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
