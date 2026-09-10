import React, { useState } from "react";
import LoginPage from "./LoginPage.jsx";
import UserApp from "./UserApp.jsx";
import AdminApp from "./AdminApp.jsx";

export default function App() {
  const [session, setSession] = useState(null); // { role, email } | null

  function handleLogin(role, email) {
    setSession({ role, email });
  }

  function handleLogout() {
    setSession(null);
  }

  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (session.role === "admin") {
    return <AdminApp onLogout={handleLogout} />;
  }

  return <UserApp email={session.email} onLogout={handleLogout} />;
}
