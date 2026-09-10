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
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Enter an email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid login or role.");
        return;
      }

      // IMPORTANT:
      // Use the role returned by the BACKEND,
      // not the role selected by the user.
      onLogin(data);

    } catch (err) {
      console.error(err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
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

          <h1 className="text-lg font-semibold text-slate-900">
            RAGShield
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Secure RAG for a Safer Tomorrow
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">

          {/* ROLE SELECTION */}

          <div className="grid grid-cols-2 gap-1 bg-slate-100 rounded-lg p-1 mb-5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const active = role === r.key;

              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => {
                    setRole(r.key);
                    setError("");
                  }}
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

            {/* EMAIL */}

            <div>
              <label className="text-xs font-medium text-slate-600">
                Email
              </label>

              <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5">
                <Mail size={15} className="text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    role === "admin"
                      ? "admin@acme.com"
                      : "john@acme.com"
                  }
                  className="flex-1 text-sm text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* PASSWORD */}

            <div>
              <label className="text-xs font-medium text-slate-600">
                Password
              </label>

              <div className="mt-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2.5">
                <Lock size={15} className="text-slate-400" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="*******"
                  className="flex-1 text-sm text-slate-800 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff size={15} />
                  ) : (
                    <Eye size={15} />
                  )}
                </button>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">
                {error}
              </div>
            )}

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg py-2.5"
            >
              {loading
                ? "Checking..."
                : `Sign in as ${role === "admin" ? "Admin" : "User"}`}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}