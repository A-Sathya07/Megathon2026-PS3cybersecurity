import React, { useState } from "react";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
} from "lucide-react";

const ROLES = [
  { key: "user", label: "User", icon: User },
  { key: "admin", label: "Admin", icon: ShieldCheck },
];

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter an email and password to continue.");
      return;
    }

    setError("");

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: role,
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      console.log("Login successful:", data);

      sessionStorage.setItem("access_token", data.access_token);

      sessionStorage.setItem("user", JSON.stringify(data.user));

      onLogin(data);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    }
  }

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center px-4"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center mb-3">
            <Shield size={22} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            RAGShield
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Secure RAG for a Safer Tomorrow
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-1 mb-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`flex items-center justify-center gap-1.5 text-xs font-medium rounded-md py-2 transition-colors ${
                    active
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  <Icon size={13} />
                  {r.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">
                Email
              </label>
              <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Mail size={15} className="text-slate-400 flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "admin" ? "admin@acme.com" : "john@acme.com"
                  }
                  className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">
                Password
              </label>
              <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                <Lock size={15} className="text-slate-400 flex-shrink-0" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*******"
                  className="flex-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg py-2.5"
            >
              Sign in as {role === "admin" ? "Admin" : "User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
