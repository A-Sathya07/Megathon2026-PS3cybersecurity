import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  X,
  Shield,
  ShieldCheck,
  LayoutDashboard,
  FolderOpen,
  MessageCircle,
  Activity,
  Settings,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Lock,
  Eye,
  Database,
  ScanLine,
  Fingerprint,
  Search as SearchIcon,
  ShieldAlert,
  Bot,
  LogOut,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const METRICS = [
  {
    label: "My Documents",
    value: "127",
    sub: "+12 this week",
    tone: "neutral",
  },
  { label: "Safe Documents", value: "119", sub: "94% protected", tone: "safe" },
  { label: "Quarantined", value: "8", sub: "Requires review", tone: "warning" },
  {
    label: "Security Blocks",
    value: "7",
    sub: "Threats prevented",
    tone: "blocked",
  },
];

const SECURITY_LAYERS = [
  { name: "Secure Ingestion", status: "Protected" },
  { name: "Tenant Isolation", status: "Active" },
  { name: "Secure Retrieval", status: "Active" },
  { name: "Output Security", status: "Active" },
  { name: "Audit Logging", status: "Enabled" },
];

const DOCUMENTS = [
  {
    id: 1,
    name: "Employee Leave Policy.pdf",
    source: "HR Department",
    uploaded: "Today",
    status: "SAFE",
  },
  {
    id: 2,
    name: "Security Guidelines.pdf",
    source: "Security Team",
    uploaded: "Yesterday",
    status: "SAFE",
  },
  {
    id: 3,
    name: "Q3 Benefits Summary.pdf",
    source: "HR Department",
    uploaded: "2 days ago",
    status: "SAFE",
  },
  {
    id: 4,
    name: "Unknown Policy.docx",
    source: "External Upload",
    uploaded: "Today",
    status: "QUARANTINED",
  },
  {
    id: 5,
    name: "Malicious Instructions.pdf",
    source: "External Upload",
    uploaded: "Today",
    status: "BLOCKED",
  },
];

const SECURITY_EVENTS = [
  { time: "10:42 AM", event: "Document scanned", status: "SAFE" },
  {
    time: "10:31 AM",
    event: "Unauthorized document request",
    status: "BLOCKED",
  },
  {
    time: "09:54 AM",
    event: "Suspicious document detected",
    status: "QUARANTINED",
  },
  { time: "09:10 AM", event: "Document scanned", status: "SAFE" },
];

const ACTIVITY = [
  {
    day: "Today",
    items: [
      {
        time: "11:20 AM",
        title: "Asked RAGShield",
        detail: "\u201CWhat is our leave policy?\u201D",
        icon: MessageCircle,
      },
      {
        time: "11:05 AM",
        title: "Uploaded document",
        detail: "Employee Leave Policy.pdf",
        icon: Upload,
      },
      {
        time: "10:42 AM",
        title: "Document security scan completed",
        detail: "Employee Leave Policy.pdf \u2014 Safe",
        icon: ScanLine,
      },
      {
        time: "10:31 AM",
        title: "Security block triggered",
        detail: "Unauthorized document request",
        icon: ShieldAlert,
      },
    ],
  },
];

const SECURITY_CARDS = [
  {
    icon: Lock,
    title: "Secure Ingestion",
    desc: "Documents are scanned before entering the knowledge base.",
  },
  {
    icon: Database,
    title: "Tenant Isolation",
    desc: "Your organization can only access authorized documents.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Retrieval",
    desc: "Unauthorized documents are blocked before retrieval.",
  },
  {
    icon: Eye,
    title: "Output Security",
    desc: "LLM responses are scanned before reaching the user.",
  },
];

// Same shape/content style as the admin dashboard's assistant, scoped to the user's own documents.
const SUGGESTED_QUESTIONS = [
  "What is the leave policy?",
  "What are the working hours?",
  "How do I apply for remote work?",
];

const RAG_RESPONSES = {
  "what is the leave policy?": {
    answer:
      "Employees should submit leave requests at least 7 days before the planned leave date.",
    source: "Employee Leave Policy.pdf (p. 2)",
  },
  "what is our leave policy?": {
    answer:
      "Employees should submit leave requests at least 7 days before the planned leave date.",
    source: "Employee Leave Policy.pdf (p. 2)",
  },
  "what are the working hours?": {
    answer:
      "Standard working hours are 9:30 AM to 6:30 PM, Monday through Friday, with a flexible one-hour window for start time.",
    source: "Employee Leave Policy.pdf (p. 5)",
  },
  "how do i apply for remote work?": {
    answer:
      "Submit a remote work request through your manager at least 3 business days in advance, noting the dates and reason.",
    source: "Security Guidelines.pdf (p. 4)",
  },
  "summarize our security policy": null, // triggers a blocked response, same as the admin demo
};

// ---------------------------------------------------------------------------
// Small shared bits
// ---------------------------------------------------------------------------

function StatusBadge({ status }) {
  const map = {
    SAFE: "bg-green-50 text-green-700 border-green-200",
    QUARANTINED: "bg-amber-50 text-amber-700 border-amber-200",
    BLOCKED: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${map[status]}`}
    >
      {status === "SAFE" && <CheckCircle2 size={12} className="mr-1" />}
      {status === "QUARANTINED" && <AlertTriangle size={12} className="mr-1" />}
      {status === "BLOCKED" && <X size={12} className="mr-1" />}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function Dot({ color }) {
  const map = {
    green: "bg-green-500",
    amber: "bg-amber-500",
    red: "bg-red-500",
    blue: "bg-blue-500",
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${map[color]} mr-2`} />
  );
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

function Sidebar({
  open,
  onClose,
  page,
  setPage,
  openAssistant,
  email,
  onLogout,
}) {
  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "documents", label: "My Documents", icon: FolderOpen },
    {
      key: "ask",
      label: "Ask RAGShield",
      icon: MessageCircle,
      action: openAssistant,
    },
    { key: "security", label: "Security", icon: Shield },
    { key: "activity", label: "Activity", icon: Activity },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-slate-900 bg-opacity-30 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className="fixed top-0 left-0 h-full w-72 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ease-out"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
      >
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center">
              <Shield size={18} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900 text-lg tracking-tight">
              RAGShield
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Secure RAG for a Safer Tomorrow
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  if (item.action) {
                    item.action();
                    onClose();
                    return;
                  }
                  setPage(item.key);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-3 mx-3 mb-3 rounded-lg bg-green-50 border border-green-100">
          <div className="flex items-center text-sm font-medium text-green-700">
            <Dot color="green" /> Protection Active
          </div>
          <p className="text-xs text-green-600 mt-1 ml-4">
            Your organization is protected
          </p>
        </div>

        <div className="px-4 py-4 border-t border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-800 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
            JD
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              John Doe
            </p>
            <p className="text-xs text-slate-500 truncate">
              {email || "john@acme.com"}
            </p>
          </div>
          <button
            onClick={() => {
              sessionStorage.removeItem("access_token");
              sessionStorage.removeItem("user");
              onLogout();
            }}
            title="Sign out"
            className="ml-auto text-slate-400 hover:text-red-600 flex-shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function Header({ onMenuClick, title, subtitle }) {
  return (
    <header className="sticky top-0 z-30 bg-white bg-opacity-90 backdrop-blur border-b border-slate-200">
      <div className="flex items-center gap-4 px-4 sm:px-8 py-4">
        <button
          onClick={onMenuClick}
          className="w-9 h-9 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-slate-900 truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-slate-500 truncate">{subtitle}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-100 rounded-full px-3 py-1.5 flex-shrink-0">
          <Dot color="green" /> Protected
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Metric card
// ---------------------------------------------------------------------------

function MetricCard({ label, value, sub, tone }) {
  const subColor = {
    neutral: "text-slate-500",
    safe: "text-green-600",
    warning: "text-amber-600",
    blocked: "text-red-600",
  }[tone];
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
      <p className={`text-xs mt-1 ${subColor}`}>{sub}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Security status card
// ---------------------------------------------------------------------------

function SecurityStatusCard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-900">
          Security Status
        </h2>
        <span className="text-xs text-slate-400">
          Last security scan: 2 minutes ago
        </span>
      </div>
      <div className="space-y-3">
        {SECURITY_LAYERS.map((layer) => (
          <div
            key={layer.name}
            className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0"
          >
            <span className="text-sm text-slate-700">{layer.name}</span>
            <span className="flex items-center text-xs font-medium text-green-700">
              <Dot color="green" /> {layer.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document table
// ---------------------------------------------------------------------------

function DocumentTable({ documents, onView }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="hidden md:grid grid-cols-12 px-5 py-3 text-xs font-medium text-slate-500 border-b border-slate-100">
        <span className="col-span-5">Document</span>
        <span className="col-span-3">Source</span>
        <span className="col-span-2">Uploaded</span>
        <span className="col-span-1">Status</span>
        <span className="col-span-1 text-right">Actions</span>
      </div>
      <div className="divide-y divide-slate-50">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="px-5 py-3 md:grid md:grid-cols-12 md:items-center flex flex-col gap-1.5"
          >
            <div className="col-span-5 flex items-center gap-2 min-w-0">
              <FileText size={15} className="text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-800 truncate">
                {doc.name}
              </span>
            </div>
            <span className="col-span-3 text-sm text-slate-500">
              {doc.source}
            </span>
            <span className="col-span-2 text-sm text-slate-500">
              {doc.uploaded}
            </span>
            <div className="col-span-1">
              <StatusBadge status={doc.status} />
            </div>
            <div className="col-span-1 md:text-right">
              <button
                onClick={() => onView(doc)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Document details modal
// ---------------------------------------------------------------------------

function DocumentDetails({ doc, onClose }) {
  if (!doc) return null;
  const isSafe = doc.status === "SAFE";
  const isQuarantined = doc.status === "QUARANTINED";
  const isBlocked = doc.status === "BLOCKED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900 bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Document Details
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-slate-900">{doc.name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {doc.source} &middot; Uploaded {doc.uploaded}
            </p>
          </div>

          {(isQuarantined || isBlocked) && (
            <div
              className={`rounded-lg border p-4 ${isBlocked ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}
            >
              <div
                className={`flex items-center gap-2 text-sm font-semibold ${isBlocked ? "text-red-700" : "text-amber-700"}`}
              >
                <AlertTriangle size={16} />
                {isBlocked ? "Document Blocked" : "Document Quarantined"}
              </div>
              <dl className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Threat</dt>
                  <dd className="text-slate-800 font-medium">
                    Prompt Injection Detected
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Security Score</dt>
                  <dd className="text-slate-800 font-medium">87%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Action</dt>
                  <dd className="text-slate-800 font-medium">
                    Blocked from knowledge base
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-slate-600 mt-3">
                The document contains suspicious instructions that could attempt
                to manipulate the RAG system.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-500 mb-3">
              Security Scan
            </p>
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-slate-500">SHA-256</dt>
                <dd className="text-slate-800 font-mono">a84f&hellip;91c2</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Provenance</dt>
                <dd className="text-slate-800">Verified</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Prompt Injection Score</dt>
                <dd className={isSafe ? "text-green-700" : "text-red-700"}>
                  {isSafe ? "2%" : "87%"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Anomaly Score</dt>
                <dd className="text-slate-800">{isSafe ? "Low" : "High"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Vector Database Status</dt>
                <dd className="text-slate-800">
                  {isSafe ? "Stored securely" : "Not stored"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Tenant</dt>
                <dd className="text-slate-800">Acme Corp</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Upload modal
// ---------------------------------------------------------------------------

function UploadModal({ onClose }) {
  const [stage, setStage] = useState("idle");
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const checks = [
    { label: "Hash Verification", icon: Fingerprint },
    { label: "Provenance Check", icon: SearchIcon },
    { label: "Prompt Injection Scan", icon: ScanLine },
    { label: "Anomaly Detection", icon: Eye },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    if (extension !== "pdf") {
      setError("Only PDF files are allowed.");
      setSelectedFile(null);
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      setError("Please select a document first.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setStage("scanning");
      setResult(null);

      const accessToken = sessionStorage.getItem("access_token");

      if (!accessToken) {
        throw new Error("Session expired. Please login again.");
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        "http://localhost:5000/api/documents/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      console.log("Upload response:", data);

      if (data.status === "quarantined") {
        setResult({
          status: "quarantined",
          filename: data.filename,
          threatScore: data.threat_score,
          threats: data.threats || [],
          message: data.message,
        });

        setStage("result");
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult({
        status: "safe",
        filename: data.filename,
        threatScore: data.threat_score || 0,
        threats: [],
        message: data.message,
      });

      setStage("result");
    } catch (error) {
      console.error("Upload error:", error);

      setResult({
        status: "error",
        filename: selectedFile?.name,
        threatScore: 0,
        threats: [],
        message: error.message || "Unable to upload document.",
      });

      setStage("result");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900 bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Upload your document
          </h3>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {stage === "idle" && (
            <>
              <input
                id="document-upload"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />

              <label
                htmlFor="document-upload"
                className="border-2 border-dashed border-slate-200 rounded-lg py-8 px-4 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition"
              >
                <Upload size={22} className="text-slate-400 mb-2" />

                <p className="text-sm text-slate-600">
                  {selectedFile
                    ? selectedFile.name
                    : "Click to select a document"}
                </p>

                <p className="text-xs text-slate-400 mt-1">Supported: PDF</p>
              </label>

              {error && <p className="text-xs text-red-600">{error}</p>}

              {selectedFile && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-3">
                  <FileText size={16} className="text-blue-600 flex-shrink-0" />

                  <div className="min-w-0">
                    <p className="text-sm text-slate-700 truncate">
                      {selectedFile.name}
                    </p>

                    <p className="text-xs text-slate-400">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs font-medium text-slate-500">
                Security process
              </p>

              <div className="grid grid-cols-2 gap-2">
                {checks.map((c) => (
                  <div
                    key={c.label}
                    className="flex items-center gap-2 text-xs text-slate-600 border border-slate-100 rounded-md px-2.5 py-2"
                  >
                    <c.icon size={14} className="text-slate-400" />

                    {c.label}
                  </div>
                ))}
              </div>

              <button
                onClick={uploadFile}
                disabled={!selectedFile || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg py-2.5"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </button>
            </>
          )}

          {stage === "scanning" && (
            <div className="py-10 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />

              <p className="text-sm font-medium text-slate-700">
                Document Status: Uploading...
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Sending document securely to RAGShield
              </p>
            </div>
          )}

          {stage === "result" && result?.status === "safe" && (
            <div className="mt-6 rounded-lg border border-gray-300 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Document Safe
              </h3>

              <p className="mt-1 text-sm text-gray-600">{result.filename}</p>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-green-600">
                  Security Scan Passed
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  No ingestion vulnerabilities were detected.
                </p>
              </div>
            </div>
          )}

          {stage === "result" && result?.status === "error" && (
            <div className="mt-6 rounded-lg border border-gray-300 bg-white p-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Failed
              </h3>
              <p className="mt-2 text-sm text-gray-600">{result.message}</p>
            </div>
          )}

          {stage === "result" && result?.status === "quarantined" && (
            <div className="mt-6 rounded-lg border border-gray-300 bg-white p-5">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Document Quarantined
                </h3>

                <p className="mt-1 text-sm text-gray-600">{result.filename}</p>
              </div>

              <div className="mb-4 flex justify-between border-b border-gray-200 pb-3">
                <span className="text-sm text-gray-700">Threat Score</span>

                <span className="text-sm font-semibold text-red-600">
                  {Number(result.threatScore).toFixed(2)}
                </span>
              </div>

              <p className="mb-3 text-sm font-semibold text-gray-900">
                Threats Detected
              </p>

              <div className="space-y-3">
                {result.threats.map((threat, index) => (
                  <div key={index} className="border-b border-gray-200 pb-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {threat.threat_type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (char) => char.toUpperCase())}
                      </span>

                      <span className="text-xs text-gray-500">
                        Page {threat.page_number}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-gray-700">
                      "{threat.matched_text}"
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-sm font-medium text-red-600">
                  Upload Blocked
                </p>

                <p className="mt-1 text-sm text-gray-600">
                  This document was blocked before entering the RAG knowledge
                  base.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// ---------------------------------------------------------------------------
// RAG Assistant \u2014 ported to match the admin dashboard's assistant exactly:
// dark header with a boxed bot icon, plain bubbles with a "Source:" line,
// suggested-question chips, and a circular floating launcher with a
// notification dot and hover tooltip.
// ---------------------------------------------------------------------------

function RAGChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "user", text: "What is the leave policy?" },
    {
      role: "ai",
      text: RAG_RESPONSES["what is the leave policy?"].answer,
      source: RAG_RESPONSES["what is the leave policy?"].source,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function respondTo(question) {
    const key = question.trim().toLowerCase();
    const found = RAG_RESPONSES[key];
    if (key.includes("security") && key.includes("summar")) {
      setMessages((m) => [
        ...m,
        { role: "user", text: question },
        { role: "ai", blocked: true },
      ]);
      return;
    }
    setMessages((m) => [
      ...m,
      { role: "user", text: question },
      found
        ? {
            role: "ai",
            text: found.answer,
            source: found.source,
          }
        : {
            role: "ai",
            text: "I couldn't find relevant information.",
          },
    ]);
  }

  function handleSend() {
    if (!input.trim()) return;
    respondTo(input.trim());
    setInput("");
  }

  return (
    <div
      className="fixed bottom-24 right-4 z-50 flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:right-6"
      style={{
        width: "min(400px, calc(100vw - 2rem))",
        height: "min(560px, calc(100vh - 8rem))",
      }}
    >
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-900 px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">RAG Assistant</p>
          <p className="text-[11px] text-slate-400">
            Ask about your trusted documents
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.map((m, i) => {
          if (m.role === "user") {
            return (
              <div key={i} className="flex justify-end">
                <div className="max-w-[85%] rounded-lg rounded-br-sm bg-blue-600 px-3 py-2 text-sm text-white">
                  {m.text}
                </div>
              </div>
            );
          }
          if (m.blocked) {
            return (
              <div key={i} className="flex justify-start">
                <div className="max-w-[85%] rounded-lg rounded-bl-sm border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <p className="flex items-center gap-1 font-medium">
                    <ShieldAlert className="h-3.5 w-3.5" /> Response Blocked
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    RAGShield detected potentially malicious instructions in the
                    retrieved content. Your data remains protected.
                  </p>
                </div>
              </div>
            );
          }
          return (
            <div key={i} className="flex justify-start">
              <div className="max-w-[85%] space-y-1.5">
                <div className="rounded-lg rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700">
                  {m.text}
                </div>
                {m.source && (
                  <p className="flex items-center gap-1 pl-1 text-[11px] text-slate-400">
                    <FileText className="h-3 w-3" />
                    Source: {m.source}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {messages.length <= 2 && (
          <div className="pt-1">
            <p className="mb-1.5 text-[11px] font-medium text-slate-400">
              Suggested Questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => respondTo(q)}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask something..."
            className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={handleSend}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] leading-snug text-slate-400">
          Responses are scanned for security and grounded in your documents.
        </p>
      </div>
    </div>
  );
}

function FloatingRAGAssistant({ open, setOpen }) {
  return (
    <>
      <div
        className={`transition-all duration-200 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 translate-y-2"}`}
      >
        {open && <RAGChatPanel onClose={() => setOpen(false)} />}
      </div>

      <div className="group fixed bottom-6 right-4 z-50 sm:right-6">
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          {!open && (
            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>
        {!open && (
          <span className="pointer-events-none absolute bottom-1/2 right-full mr-3 translate-y-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Ask RAGShield
          </span>
        )}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------

function DashboardPage({ onView, onUpload }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Welcome back, John
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Your RAG environment is protected and ready &middot; Acme Corp
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {METRICS.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      <SecurityStatusCard />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Recent Documents
          </h2>
          <button
            onClick={onUpload}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg px-3 py-2"
          >
            <Upload size={14} /> Upload Document
          </button>
        </div>
        <DocumentTable documents={DOCUMENTS} onView={onView} />
      </div>
    </div>
  );
}

function DocumentsPage({ onView, onUpload }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">My Documents</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            All documents you've uploaded to RAGShield
          </p>
        </div>
        <button
          onClick={onUpload}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-3.5 py-2.5 flex-shrink-0"
        >
          <Upload size={15} /> Upload Document
        </button>
      </div>
      <DocumentTable documents={DOCUMENTS} onView={onView} />
    </div>
  );
}

function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">
          Your Environment
        </h2>
        <div className="flex items-center gap-2 mt-1.5 text-sm font-medium text-green-700">
          <Dot color="green" /> Protection Status: PROTECTED
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {SECURITY_CARDS.map((c) => (
          <div
            key={c.title}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <c.icon size={17} className="text-blue-600" />
            </div>
            <p className="text-sm font-semibold text-slate-900">{c.title}</p>
            <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      <SecurityStatusCard />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">
            Security Events
          </h2>
        </div>
        <div className="divide-y divide-slate-50">
          {SECURITY_EVENTS.map((ev, i) => (
            <div
              key={i}
              className="px-5 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Clock size={14} className="text-slate-400 flex-shrink-0" />
                <span className="text-xs text-slate-400 w-16 flex-shrink-0">
                  {ev.time}
                </span>
                <span className="text-sm text-slate-700 truncate">
                  {ev.event}
                </span>
              </div>
              <StatusBadge status={ev.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Activity</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          A timeline of what's happened in your account
        </p>
      </div>

      {ACTIVITY.map((group) => (
        <div key={group.day}>
          <p className="text-xs font-medium text-slate-400 mb-3">{group.day}</p>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm divide-y divide-slate-50">
            {group.items.map((it, i) => (
              <div key={i} className="px-5 py-3.5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <it.icon size={14} className="text-slate-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-slate-800">{it.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{it.detail}</p>
                </div>
                <span className="ml-auto text-xs text-slate-400 flex-shrink-0">
                  {it.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsPage({ email }) {
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">Settings</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your account preferences
        </p>
      </div>
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 space-y-4">
        <div>
          <p className="text-xs font-medium text-slate-500">Full name</p>
          <p className="text-sm text-slate-800 mt-1">John Doe</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Email</p>
          <p className="text-sm text-slate-800 mt-1">
            {email || "john@acme.com"}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Organization</p>
          <p className="text-sm text-slate-800 mt-1">Acme Corp</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500">Role</p>
          <p className="text-sm text-slate-800 mt-1">User</p>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: null },
  documents: { title: "My Documents", subtitle: null },
  security: { title: "Security", subtitle: null },
  activity: { title: "Activity", subtitle: null },
  settings: { title: "Settings", subtitle: null },
};

export default function UserApp({ email, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        page={page}
        setPage={setPage}
        openAssistant={() => setAssistantOpen(true)}
        email={email}
        onLogout={onLogout}
      />

      <Header
        onMenuClick={() => setSidebarOpen(true)}
        title={PAGE_META[page].title}
        subtitle={PAGE_META[page].subtitle}
      />

      <main className="px-4 sm:px-8 py-6 max-w-6xl mx-auto">
        {page === "dashboard" && (
          <DashboardPage
            onView={setSelectedDoc}
            onUpload={() => setUploadOpen(true)}
          />
        )}
        {page === "documents" && (
          <DocumentsPage
            onView={setSelectedDoc}
            onUpload={() => setUploadOpen(true)}
          />
        )}
        {page === "security" && <SecurityPage />}
        {page === "activity" && <ActivityPage />}
        {page === "settings" && <SettingsPage email={email} />}
      </main>

      <FloatingRAGAssistant open={assistantOpen} setOpen={setAssistantOpen} />

      {selectedDoc && (
        <DocumentDetails
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
      {uploadOpen && <UploadModal onClose={() => setUploadOpen(false)} />}
    </div>
  );
}
