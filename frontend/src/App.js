import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ConfigureDevices from "./ConfigureDevices";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/configure-devices" element={<ConfigureDevices user={user} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />}/>
      </Routes>
    </Router>
  );
}

export default App;
