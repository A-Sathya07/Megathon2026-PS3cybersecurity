import React, { useState, useRef, useEffect } from "react";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  LayoutDashboard,
  FolderOpen,
  Building2,
  Users,
  Bot,
  ScrollText,
  Crosshair,
  Settings,
  ChevronDown,
  Menu,
  X,
  Send,
  FileText,
  FileWarning,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Server,
  Database,
  Cpu,
  Search,
  MessageCircle,
  ArrowRight,
  Clock,
  LogOut,
  UserCog,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Mock data                                                           */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, description: "" },
  { label: "Documents", icon: FolderOpen, description: "Browse, search, and manage every document ingested across all tenants." },
  { label: "Security Center", icon: ShieldAlert, description: "Configure threat-detection rules, poisoning thresholds, and response policies." },
  { label: "Tenants", icon: Building2, description: "Manage tenant boundaries, isolation rules, and cross-tenant access policies." },
  { label: "Users", icon: Users, description: "Manage admin and end-user accounts, roles, and permissions." },
  { label: "RAG Assistant", icon: Bot, description: "Configure retrieval sources, grounding rules, and the assistant's tone." },
  { label: "Audit Logs", icon: ScrollText, description: "Full immutable audit trail of every security-relevant action in your environment." },
  { label: "Attack Simulator", icon: Crosshair, description: "Run simulated prompt-injection and document-poisoning attacks to test your defenses." },
  { label: "Settings", icon: Settings, description: "Configure organization-wide security policies and platform preferences." },
];

const ORGS = ["Acme Corp", "Globex Inc.", "Initech", "Umbrella Corp"];

const METRICS = [
  { label: "Total Documents", value: "127", sub: "+12 this week", icon: FileText, tone: "blue" },
  { label: "Safe Documents", value: "119", sub: "94% of total", icon: CheckCircle2, tone: "green" },
  { label: "Quarantined", value: "8", sub: "6% of total", icon: FileWarning, tone: "red" },
  { label: "Threats Detected", value: "15", sub: "+2 from yesterday", icon: AlertTriangle, tone: "amber" },
  { label: "Access Blocks", value: "7", sub: "Cross-tenant attempts", icon: Ban, tone: "red" },
  { label: "Active Tenants", value: "4", sub: "All protected", icon: Building2, tone: "blue" },
];

const SECURITY_STAGES = [
  { label: "Ingestion Security", status: "Protected" },
  { label: "Retrieval Security", status: "Active" },
  { label: "Tenant Isolation", status: "Active" },
  { label: "Output Security", status: "Active" },
  { label: "Audit Logging", status: "Enabled" },
];

const THREAT_DIST = [
  { label: "Prompt Injection", value: 8, max: 8 },
  { label: "Cross-Tenant Access", value: 4, max: 8 },
  { label: "Malicious Output", value: 3, max: 8 },
  { label: "Anomaly Detection", value: 2, max: 8 },
];

const PIPELINE_STEPS = [
  { label: "Document Upload", icon: FileText },
  { label: "Secure Ingestion", icon: ShieldCheck },
  { label: "Tenant-Scoped Retrieval", icon: Search },
  { label: "LLM", icon: Cpu },
  { label: "Output Security", icon: ShieldAlert },
  { label: "Safe Response", icon: CheckCircle2 },
];

const SECURITY_EVENTS = [
  { event: "Poisoned document detected", severity: "High", tenant: "Company A", user: "John Doe", time: "10:45 AM", action: "Quarantined" },
  { event: "Cross-tenant access blocked", severity: "Medium", tenant: "Company A", user: "Sarah", time: "10:41 AM", action: "Blocked" },
  { event: "Malicious output detected", severity: "High", tenant: "Company B", user: "Mike", time: "10:35 AM", action: "Blocked" },
  { event: "Document uploaded successfully", severity: "Low", tenant: "Company A", user: "John Doe", time: "10:15 AM", action: "Approved" },
];

const SECURITY_EVENTS_EXTRA = [
  { event: "Prompt injection attempt blocked", severity: "High", tenant: "Company B", user: "Priya", time: "9:58 AM", action: "Blocked" },
  { event: "Anomalous retrieval pattern flagged", severity: "Medium", tenant: "Company A", user: "System", time: "9:40 AM", action: "Quarantined" },
  { event: "Document uploaded successfully", severity: "Low", tenant: "Company C", user: "Wei", time: "9:12 AM", action: "Approved" },
  { event: "Tenant isolation policy updated", severity: "Low", tenant: "Company A", user: "John Doe", time: "8:50 AM", action: "Approved" },
];

const RECENT_DOCS = [
  { name: "HR_Policy.pdf", by: "john@acme.com", tenant: "Company A", status: "Safe", score: "0.12", date: "Oct 26" },
  { name: "Leave_Guidelines.docx", by: "sarah@acme.com", tenant: "Company A", status: "Safe", score: "0.05", date: "Oct 26" },
  { name: "Confidential_Salary.pdf", by: "attacker@malicious.com", tenant: "Company A", status: "Quarantined", score: "0.94", date: "Oct 25" },
  { name: "IT_Security_Policy.pdf", by: "mike@acme.com", tenant: "Company A", status: "Safe", score: "0.18", date: "Oct 24" },
];

const RECENT_DOCS_EXTRA = [
  { name: "Vendor_Contract_Draft.docx", by: "legal@acme.com", tenant: "Company B", status: "Quarantined", score: "0.87", date: "Oct 23" },
  { name: "Onboarding_Checklist.pdf", by: "hr@acme.com", tenant: "Company A", status: "Safe", score: "0.09", date: "Oct 22" },
  { name: "Q3_Roadmap.pptx", by: "pm@acme.com", tenant: "Company C", status: "Safe", score: "0.14", date: "Oct 22" },
  { name: "Internal_Memo_Q3.pdf", by: "ops@acme.com", tenant: "Company A", status: "Quarantined", score: "0.81", date: "Oct 21" },
];

const SYSTEM_HEALTH = [
  { label: "API Server", icon: Server },
  { label: "Database", icon: Database },
  { label: "Vector Search", icon: Search },
  { label: "Embedding Service", icon: Cpu },
  { label: "LLM", icon: Bot },
  { label: "Security Engine", icon: Shield },
];

const SUGGESTED_QUESTIONS = [
  "What are the working hours?",
  "How do I apply for remote work?",
  "What is the expense reimbursement policy?",
];

const RAG_RESPONSES = {
  "what is our leave policy?": {
    answer: "Employees should submit leave requests at least 7 days before the planned leave date.",
    source: "HR_Policy.pdf (p. 3)",
  },
  "what are the working hours?": {
    answer: "Standard working hours are 9:30 AM to 6:30 PM, Monday through Friday, with a flexible one-hour window for start time.",
    source: "HR_Policy.pdf (p. 5)",
  },
  "how do i apply for remote work?": {
    answer: "Submit a remote work request through your manager at least 3 business days in advance, noting the dates and reason.",
    source: "Leave_Guidelines.docx (p. 2)",
  },
  "what is the expense reimbursement policy?": {
    answer: "Approved business expenses are reimbursed within 10 business days of submitting an itemized receipt.",
    source: "IT_Security_Policy.pdf (p. 7)",
  },
};

const QUARANTINE_POOL = [
  { name: "Confidential_Salary.pdf", threat: "Prompt Injection", score: "0.94", tenant: "Company A" },
  { name: "Vendor_Contract_Draft.docx", threat: "Document Poisoning", score: "0.87", tenant: "Company B" },
  { name: "Internal_Memo_Q3.pdf", threat: "Prompt Injection", score: "0.81", tenant: "Company A" },
];

/* ------------------------------------------------------------------ */
/* Small shared UI helpers                                             */
/* ------------------------------------------------------------------ */

const toneClasses = {
  blue: { bg: "bg-blue-50", text: "text-blue-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600" },
  red: { bg: "bg-red-50", text: "text-red-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600" },
};

function StatusDot({ color = "green" }) {
  const map = { green: "bg-emerald-500", red: "bg-red-500", amber: "bg-amber-500" };
  return (
    <span className="relative flex h-2 w-2">
      <span className={`absolute inline-flex h-full w-full rounded-full ${map[color]} opacity-60 animate-ping`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${map[color]}`} />
    </span>
  );
}

function SeverityBadge({ level }) {
  const styles = {
    High: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    Medium: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
    Low: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[level]}`}>{level}</span>;
}

function ActionBadge({ action }) {
  const styles = {
    Quarantined: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    Blocked: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
    Approved: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[action]}`}>{action}</span>;
}

function StatusBadge({ status }) {
  const styles = {
    Safe: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
    Quarantined: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  };
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${styles[status]}`}>{status}</span>;
}

function Card({ title, action, children, className = "" }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}


function ToastStack({ toasts }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-72 flex-col gap-2 sm:right-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-lg animate-[fadeIn_0.15s_ease-out]"
        >
          <div className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full ${t.tone === "danger" ? "bg-red-50" : "bg-emerald-50"}`}>
            <Check className={`h-3 w-3 ${t.tone === "danger" ? "text-red-600" : "text-emerald-600"}`} />
          </div>
          <p className="text-xs font-medium leading-snug text-slate-700">{t.message}</p>
        </div>
      ))}
    </div>
  );
}

function Modal({ title, subtitle, onClose, children, widthClass = "max-w-2xl" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div className={`relative w-full ${widthClass} max-h-[85vh] overflow-hidden rounded-xl bg-white shadow-2xl`}>
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}


function Sidebar({ open, onClose, activeNav, onSelectNav }) {
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px]" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 shadow-2xl transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
            <Shield className="h-5 w-5 text-white" strokeWidth={2.25} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">RAGShield</p>
            <p className="text-[11px] leading-tight text-slate-400">Secure RAG for a Safer Tomorrow</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-0.5 px-3">
          {NAV_ITEMS.map((item) => {
            const active = item.label === activeNav;
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => {
                  onSelectNav(item.label);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                  active ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} strokeWidth={2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mx-3 mb-4 rounded-lg bg-slate-800/70 p-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-400" />
            <p className="text-xs font-semibold text-white">Protection Active</p>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 pl-6">
            <StatusDot color="green" />
            <p className="text-[11px] text-slate-400">All systems operational</p>
          </div>
        </div>
      </aside>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Header                                                               */
/* ------------------------------------------------------------------ */

function Header({ onMenuClick, activeNav, selectedOrg, onSelectOrg, addToast, onLogout }) {
  const [orgOpen, setOrgOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  const isDashboard = activeNav === "Dashboard";

  return (
    <header className="relative flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 pl-16 sm:px-6 sm:pl-16">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          title="Open navigation"
          className="fixed left-4 top-4 z-30 flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900 sm:text-xl">
            {isDashboard ? "Welcome back!" : activeNav}
          </h1>
          <p className="text-xs text-slate-500 sm:text-sm">
            {isDashboard ? "Your RAG environment is protected and ready." : "Demo view · full functionality is part of the complete platform."}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Organization selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => {
              setOrgOpen((o) => !o);
              setAvatarOpen(false);
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            {selectedOrg}
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${orgOpen ? "rotate-180" : ""}`} />
          </button>
          {orgOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOrgOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                {ORGS.map((org) => (
                  <button
                    key={org}
                    onClick={() => {
                      onSelectOrg(org);
                      setOrgOpen(false);
                      addToast(`Switched organization to ${org}`);
                    }}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    {org}
                    {org === selectedOrg && <Check className="h-3.5 w-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Avatar / profile */}
        <div className="relative">
          <button
            onClick={() => {
              setAvatarOpen((o) => !o);
              setOrgOpen(false);
            }}
            className="flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">JD</div>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-sm font-medium text-slate-800">John Doe</p>
              <p className="text-xs text-slate-500">admin@acme.com</p>
            </div>
          </button>
          {avatarOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAvatarOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                <button
                  onClick={() => {
                    setAvatarOpen(false);
                    addToast("Opening profile settings");
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <UserCog className="h-3.5 w-3.5 text-slate-400" />
                  Profile settings
                </button>
                <button
                  onClick={() => {
                    setAvatarOpen(false);
                    onLogout && onLogout();
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


function MetricCard({ label, value, sub, icon: Icon, tone }) {
  const t = toneClasses[tone];
  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.bg}`}>
          <Icon className={`h-4 w-4 ${t.text}`} strokeWidth={2.25} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Security Overview                                                    */
/* ------------------------------------------------------------------ */

function SecurityOverview() {
  return (
    <Card title="Security Overview">
      <ul className="space-y-3">
        {SECURITY_STAGES.map((s) => (
          <li key={s.label} className="flex items-center justify-between">
            <span className="text-sm text-slate-600">{s.label}</span>
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <StatusDot color="green" />
              {s.status}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-center gap-1.5 border-t border-slate-100 pt-3 text-xs text-slate-400">
        <Clock className="h-3.5 w-3.5" />
        Last security scan: 2 minutes ago
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Threat Distribution                                                  */
/* ------------------------------------------------------------------ */

function ThreatDistribution() {
  return (
    <Card title="Threat Distribution">
      <div className="space-y-3.5">
        {THREAT_DIST.map((t) => (
          <div key={t.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-slate-600">{t.label}</span>
              <span className="font-medium text-slate-800">{t.value}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-blue-500" style={{ width: `${(t.value / t.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Protection Pipeline                                                  */
/* ------------------------------------------------------------------ */

function ProtectionPipeline() {
  return (
    <Card title="Protection Pipeline">
      <div className="flex flex-col items-stretch gap-1 sm:flex-row sm:items-center sm:gap-0">
        {PIPELINE_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-1 flex-col items-center gap-1.5 rounded-lg px-2 py-2 text-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Icon className="h-4 w-4 text-blue-600" strokeWidth={2.25} />
                </div>
                <p className="text-[11px] font-medium leading-tight text-slate-600">{step.label}</p>
              </div>
              {i < PIPELINE_STEPS.length - 1 && (
                <div className="flex items-center justify-center px-1 text-slate-300">
                  <ArrowRight className="hidden h-4 w-4 sm:block" />
                  <div className="block h-4 w-px bg-slate-200 sm:hidden" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Recent Security Events                                               */
/* ------------------------------------------------------------------ */

function EventsTable({ rows }) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-400">
            <th className="px-5 py-2 font-medium">Event</th>
            <th className="px-5 py-2 font-medium">Severity</th>
            <th className="px-5 py-2 font-medium">Tenant</th>
            <th className="px-5 py-2 font-medium">User</th>
            <th className="px-5 py-2 font-medium">Time</th>
            <th className="px-5 py-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-5 py-2.5 font-medium text-slate-700">{e.event}</td>
              <td className="px-5 py-2.5"><SeverityBadge level={e.severity} /></td>
              <td className="px-5 py-2.5 text-slate-500">{e.tenant}</td>
              <td className="px-5 py-2.5 text-slate-500">{e.user}</td>
              <td className="px-5 py-2.5 text-slate-500">{e.time}</td>
              <td className="px-5 py-2.5"><ActionBadge action={e.action} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SecurityEvents({ onViewAll }) {
  return (
    <Card
      title="Recent Security Events"
      action={
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
          View all <ArrowRight className="h-3 w-3" />
        </button>
      }
    >
      <EventsTable rows={SECURITY_EVENTS} />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Recent Documents                                                     */
/* ------------------------------------------------------------------ */

function DocsTable({ rows }) {
  return (
    <div className="-mx-5 overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs text-slate-400">
            <th className="px-5 py-2 font-medium">Document</th>
            <th className="px-5 py-2 font-medium">Uploaded By</th>
            <th className="px-5 py-2 font-medium">Tenant</th>
            <th className="px-5 py-2 font-medium">Status</th>
            <th className="px-5 py-2 font-medium">Threat Score</th>
            <th className="px-5 py-2 font-medium">Date</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d, i) => (
            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="px-5 py-2.5 font-medium text-slate-700">{d.name}</td>
              <td className="px-5 py-2.5 text-slate-500">{d.by}</td>
              <td className="px-5 py-2.5 text-slate-500">{d.tenant}</td>
              <td className="px-5 py-2.5"><StatusBadge status={d.status} /></td>
              <td className="px-5 py-2.5 text-slate-500">{d.score}</td>
              <td className="px-5 py-2.5 text-slate-500">{d.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentDocuments({ onViewAll }) {
  return (
    <Card
      title="Recent Documents"
      action={
        <button onClick={onViewAll} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
          View all <ArrowRight className="h-3 w-3" />
        </button>
      }
    >
      <DocsTable rows={RECENT_DOCS} />
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Quarantine Queue                                                     */
/* ------------------------------------------------------------------ */

function QuarantineQueue({ remaining, currentItem, onReview, onKeep }) {
  return (
    <Card title="Quarantine Queue">
      {currentItem ? (
        <>
          <p className="mb-3 text-xs text-slate-500">{remaining} document{remaining === 1 ? "" : "s"} awaiting review</p>
          <div className="rounded-lg border border-red-100 bg-red-50/60 p-3.5">
            <div className="flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium text-slate-800">{currentItem.name}</p>
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
              <div>
                <dt className="text-slate-400">Threat</dt>
                <dd className="mt-0.5 font-medium text-slate-700">{currentItem.threat}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Threat Score</dt>
                <dd className="mt-0.5 font-medium text-red-600">{currentItem.score}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Tenant</dt>
                <dd className="mt-0.5 font-medium text-slate-700">{currentItem.tenant}</dd>
              </div>
            </dl>
            <div className="mt-3.5 flex gap-2">
              <button
                onClick={onReview}
                className="flex-1 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Review
              </button>
              <button
                onClick={onKeep}
                className="flex-1 rounded-md border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Keep Quarantined
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 py-8 text-center">
          <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          <p className="text-sm font-medium text-slate-700">Queue cleared</p>
          <p className="text-xs text-slate-500">All quarantined documents have been reviewed.</p>
        </div>
      )}
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* System Health                                                        */
/* ------------------------------------------------------------------ */

function SystemHealth() {
  return (
    <Card title="System Health">
      <ul className="space-y-3">
        {SYSTEM_HEALTH.map((s) => {
          const Icon = s.icon;
          return (
            <li key={s.label} className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-600">
                <Icon className="h-3.5 w-3.5 text-slate-400" />
                {s.label}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <StatusDot color="green" />
                Online
              </span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-400">Last checked: 30 sec ago</p>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/* Placeholder for non-dashboard nav sections                          */
/* ------------------------------------------------------------------ */

function PlaceholderView({ item, onBack }) {
  const Icon = item.icon;
  return (
    <div className="flex min-h-[60vh] flex-1 flex-col items-center justify-center px-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
        <Icon className="h-7 w-7 text-blue-600" strokeWidth={2} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{item.label}</h2>
      <p className="mt-1.5 max-w-sm text-center text-sm text-slate-500">{item.description}</p>
      <p className="mt-1 max-w-sm text-center text-xs text-slate-400">
        This section lives in the full RAGShield platform. This demo focuses on the Dashboard.
      </p>
      <button
        onClick={onBack}
        className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Floating RAG Assistant                                               */
/* ------------------------------------------------------------------ */

function RAGChatPanel({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "user", text: "What is our leave policy?" },
    { role: "ai", text: RAG_RESPONSES["what is our leave policy?"].answer, source: RAG_RESPONSES["what is our leave policy?"].source },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  function respondTo(question) {
    const key = question.trim().toLowerCase();
    const found = RAG_RESPONSES[key];
    setMessages((m) => [
      ...m,
      { role: "user", text: question },
      found ? { role: "ai", text: found.answer, source: found.source } : { role: "ai", text: "I couldn't find a confident, grounded answer to that in your trusted documents.", source: null },
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
      style={{ width: "min(400px, calc(100vw - 2rem))", height: "min(560px, calc(100vh - 8rem))" }}
    >
      <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-900 px-4 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">RAG Assistant</p>
          <p className="text-[11px] text-slate-400">Ask about your trusted documents</p>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[85%] rounded-lg rounded-br-sm bg-blue-600 px-3 py-2 text-sm text-white">{m.text}</div>
            </div>
          ) : (
            <div key={i} className="flex justify-start">
              <div className="max-w-[85%] space-y-1.5">
                <div className="rounded-lg rounded-bl-sm bg-slate-100 px-3 py-2 text-sm text-slate-700">{m.text}</div>
                {m.source && (
                  <p className="flex items-center gap-1 pl-1 text-[11px] text-slate-400">
                    <FileText className="h-3 w-3" />
                    Source: {m.source}
                  </p>
                )}
              </div>
            </div>
          )
        )}

        {messages.length <= 2 && (
          <div className="pt-1">
            <p className="mb-1.5 text-[11px] font-medium text-slate-400">Suggested Questions</p>
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
          <button onClick={handleSend} className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white hover:bg-blue-700">
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] leading-snug text-slate-400">Responses are scanned for security and grounded in your documents.</p>
      </div>
    </div>
  );
}

function FloatingRAGAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`transition-all duration-200 ${open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0 translate-y-2"}`}>
        {open && <RAGChatPanel onClose={() => setOpen(false)} />}
      </div>

      <div className="group fixed bottom-6 right-4 z-50 sm:right-6">
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-blue-700"
        >
          {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          {!open && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />}
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

/* ------------------------------------------------------------------ */
/* Root layout                                                          */
/* ------------------------------------------------------------------ */

export default function AdminApp({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedOrg, setSelectedOrg] = useState(ORGS[0]);

  const [toasts, setToasts] = useState([]);
  function addToast(message, tone = "success") {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }

  const [showEventsModal, setShowEventsModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);

  const [remaining, setRemaining] = useState(8);
  const [poolIndex, setPoolIndex] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const currentItem = remaining > 0 ? QUARANTINE_POOL[poolIndex % QUARANTINE_POOL.length] : null;

  function resolveQuarantine(message, tone) {
    setRemaining((r) => Math.max(0, r - 1));
    setPoolIndex((i) => i + 1);
    addToast(message, tone);
  }

  function handleKeep() {
    if (!currentItem) return;
    resolveQuarantine(`${currentItem.name} kept in quarantine`, "danger");
  }

  function handleReviewOpen() {
    if (!currentItem) return;
    setReviewOpen(true);
  }

  function handleRelease() {
    resolveQuarantine(`${currentItem.name} released back to the index`, "success");
    setReviewOpen(false);
  }

  function handleConfirmQuarantine() {
    resolveQuarantine(`${currentItem.name} confirmed as quarantined`, "danger");
    setReviewOpen(false);
  }

  const activeNavItem = NAV_ITEMS.find((n) => n.label === activeNav);
  const isDashboard = activeNav === "Dashboard";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ToastStack toasts={toasts} />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        onSelectNav={setActiveNav}
      />

      <div className="flex min-h-screen flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          activeNav={activeNav}
          selectedOrg={selectedOrg}
          onSelectOrg={setSelectedOrg}
          addToast={addToast}
          onLogout={onLogout}
        />

        {isDashboard ? (
          <main className="flex-1 space-y-5 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-6">
              {METRICS.map((m) => (
                <MetricCard key={m.label} {...m} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <SecurityOverview />
              <ThreatDistribution />
              <div className="xl:col-span-1">
                <SystemHealth />
              </div>
            </div>

            <ProtectionPipeline />

            <SecurityEvents onViewAll={() => setShowEventsModal(true)} />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
              <div className="xl:col-span-2">
                <RecentDocuments onViewAll={() => setShowDocsModal(true)} />
              </div>
              <QuarantineQueue
                remaining={remaining}
                currentItem={currentItem}
                onReview={handleReviewOpen}
                onKeep={handleKeep}
              />
            </div>
          </main>
        ) : (
          <PlaceholderView item={activeNavItem} onBack={() => setActiveNav("Dashboard")} />
        )}
      </div>

      <FloatingRAGAssistant />

      {showEventsModal && (
        <Modal
          title="All Security Events"
          subtitle="Complete list of recent security activity across your tenants."
          onClose={() => setShowEventsModal(false)}
        >
          <EventsTable rows={[...SECURITY_EVENTS, ...SECURITY_EVENTS_EXTRA]} />
        </Modal>
      )}

      {showDocsModal && (
        <Modal
          title="All Documents"
          subtitle="Complete list of recently ingested documents across your tenants."
          onClose={() => setShowDocsModal(false)}
        >
          <DocsTable rows={[...RECENT_DOCS, ...RECENT_DOCS_EXTRA]} />
        </Modal>
      )}

      {reviewOpen && currentItem && (
        <Modal
          title="Review Document"
          subtitle={currentItem.name}
          onClose={() => setReviewOpen(false)}
          widthClass="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50/60 p-3">
              <FileWarning className="h-4 w-4 flex-none text-red-500" />
              <p className="text-sm font-medium text-slate-800">{currentItem.name}</p>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-slate-400">Detected Threat</dt>
                <dd className="mt-0.5 font-medium text-slate-700">{currentItem.threat}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Threat Score</dt>
                <dd className="mt-0.5 font-medium text-red-600">{currentItem.score}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Tenant</dt>
                <dd className="mt-0.5 font-medium text-slate-700">{currentItem.tenant}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Status</dt>
                <dd className="mt-0.5 font-medium text-slate-700">Awaiting decision</dd>
              </div>
            </dl>
            <p className="text-xs text-slate-500">
              Releasing this document will restore it to the retrieval index. Confirming quarantine will keep it isolated and log the decision to the audit trail.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleRelease}
                className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Release Document
              </button>
              <button
                onClick={handleConfirmQuarantine}
                className="flex-1 rounded-md border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Confirm Quarantine
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
