import React, { useState } from "react";

import LoginPage from "./LoginPage.jsx";
import UserApp from "./UserApp.jsx";
import AdminApp from "./AdminApp.jsx";

export default function App() {
  const [session, setSession] = useState(() => {
    const accessToken = sessionStorage.getItem("access_token");
    const storedUser = sessionStorage.getItem("user");

    if (!accessToken || !storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser);

      return {
        role: user.role,
        email: user.email,
      };
    } catch (error) {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("user");
      return null;
    }
  });

  function handleLogin(data) {
    sessionStorage.setItem("access_token", data.access_token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    setSession({
      role: data.user.role,
      email: data.user.email,
    });
  }

  function handleLogout() {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");

    setSession(null);
  }

  // No login data → show login page
  if (!session) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const role = String(session.role).toLowerCase();

  // Admin
  if (role === "admin") {
    return (
      <AdminApp
        email={session.email}
        onLogout={handleLogout}
      />
    );
  }

  // Normal user
  if (role === "user") {
    return (
      <UserApp
        email={session.email}
        onLogout={handleLogout}
      />
    );
  }

  // Invalid/unknown role
  handleLogout();
  return null;
}1