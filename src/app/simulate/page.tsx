"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal, Bot, Layers, Play, CheckCircle2,
  ArrowLeft, RefreshCw, Cpu, Database, Network, ArrowRight, X,
  ShieldCheck, AlertTriangle, ChevronRight, Activity, Lock, Zap,
} from "lucide-react";
import JourneyStepper from "../../components/JourneyStepper";
import Footer from "../../components/Footer";
import { getFriendlySimulationName } from "../../components/campaignStore";
import {
  useProgression,
  unlockStage,
  resetSimulationProgression,
  hasActiveCampaignConfig,
} from "../../components/progressionStore";

// Types matching the architectural requirements
interface CampaignStage {
  title: string;
  description: string;
  log: string;
  status: "evaded" | "blocked" | "alerted";
  severity: "low" | "medium" | "high" | "critical";
}

interface CampaignConfig {
  industry: string;
  threatActor: string;
  attackType: string;
  securityLevel: string;
  timestamp: string;
  riskFactor: number;
  compromiseChance: number;
  primaryTarget: string;
  stages: CampaignStage[];
}

const INDUSTRIES = [
  { id: "Healthcare", name: "🏥 Hospital System", desc: "Patient records, appointments, and medical databases.", target: "EMR-Patient-DB" },
  { id: "Banking", name: "🏦 Online Banking Platform", desc: "Money transfers, customer accounts, and payment services.", target: "Swift-Transfer-Core" },
  { id: "Government", name: "🏛 Government Portal", desc: "Citizen records and public service systems.", target: "Fed-Registry-SRV" },
  { id: "University", name: "🎓 University Network", desc: "Student information, research systems, and academic services.", target: "Research-NAS-Share" },
  { id: "Startup", name: "🚀 Startup Infrastructure", desc: "Cloud applications, APIs, and internal services.", target: "Kube-Master-Prod" },
];

const ACTORS = [
  { id: "APT29", name: "🎭 Data Spy", desc: "Attempts to secretly collect information without being detected.", focus: "Evasion", techName: "APT29 (CozyBear)" },
  { id: "Lazarus", name: "💰 Financial Criminal", desc: "Focused on stealing money and sensitive financial data.", focus: "Financial Theft", techName: "Lazarus Group" },
  { id: "LockBit", name: "🔒 Ransomware Operator", desc: "Locks files and systems to demand payment.", focus: "File Locking", techName: "LockBit 3.0" },
  { id: "Anonymous", name: "📢 Hacktivist", desc: "Attempts to disrupt services to spread a message.", focus: "Service Disruption", techName: "Anonymous" },
  { id: "FIN7", name: "🕵 Insider Threat", desc: "Someone with legitimate access misusing their privileges.", focus: "Data Theft", techName: "FIN7" },
];

const ATTACK_TYPES = [
  { id: "Phishing", name: "📧 Fake Email Scam", desc: "A convincing email tricks users into revealing credentials.", tech: "T1566.002" },
  { id: "Ransomware", name: "🔒 File Encryption Attack", desc: "Malicious software encrypts important files and systems.", tech: "T1486" },
  { id: "DDoS", name: "🌐 Traffic Overload Attack", desc: "Massive fake traffic overwhelms online services.", tech: "T1498" },
  { id: "SQL Injection", name: "💉 Database Attack", desc: "An attacker manipulates inputs to access hidden data.", tech: "T1190" },
  { id: "Supply Chain", name: "🧩 Malicious Software Installation", desc: "A user unknowingly installs harmful software.", tech: "T1195.002" },
];

const SECURITY_LEVELS = [
  { id: "Low", name: "Basic Setup", desc: "Minimal security controls.", detection: "10% Block Chance", difficulty: "Very Easy", level: 1 },
  { id: "Medium", name: "Standard Setup", desc: "Common security measures enabled.", detection: "45% Block Chance", difficulty: "Moderate", level: 2 },
  { id: "High", name: "Advanced Setup", desc: "Multiple layers of modern cybersecurity defenses.", detection: "78% Block Chance", difficulty: "Hard", level: 3 },
  { id: "Enterprise", name: "Enterprise Setup", desc: "Automated response configurations, hardware security keys, and active monitoring.", detection: "95% Block Chance", difficulty: "Extreme", level: 4 },
];

// Helper to dynamically build campaign data configs based on parameters
const compileCampaignConfig = (
  industry: string,
  actor: string,
  attack: string,
  security: string
): CampaignConfig => {
  const chosenIndustry = INDUSTRIES.find(i => i.id === industry) || INDUSTRIES[0];
  const chosenAttack = ATTACK_TYPES.find(t => t.id === attack) || ATTACK_TYPES[0];

  // Calculate compromise chance and risk factors based on security level
  let compromiseChance = 85;
  let riskFactor = 75;

  // Set stage statuses (evaded vs blocked) based on security level
  let status1: "evaded" | "blocked" = "evaded";
  let status2: "evaded" | "blocked" = "evaded";
  let status3: "evaded" | "blocked" = "evaded";
  let status4: "evaded" | "blocked" = "evaded";
  let status5: "evaded" | "blocked" = "evaded";
  let status6: "evaded" | "blocked" = "evaded";

  if (security === "Medium") {
    compromiseChance = 55;
    riskFactor = 55;
    status1 = "blocked";
    status3 = "blocked";
  } else if (security === "High") {
    compromiseChance = 25;
    riskFactor = 30;
    status1 = "blocked";
    status2 = "blocked";
    status4 = "blocked";
  } else if (security === "Enterprise") {
    compromiseChance = 5;
    riskFactor = 12;
    status1 = "blocked";
    status2 = "blocked";
    status3 = "blocked";
    status4 = "blocked";
    status5 = "blocked";
    status6 = "blocked";
  }

  return {
    industry,
    threatActor: actor,
    attackType: attack,
    securityLevel: security,
    timestamp: new Date().toISOString(),
    compromiseChance,
    riskFactor,
    primaryTarget: chosenIndustry.target,
    stages: [
      {
        title: "Looking for Weak Points (Reconnaissance)",
        description: `Attacker ${actor} initiated active scans mapping the target subnets for ${chosenIndustry.name}.`,
        log: `[RECON] Mapping subnets on segment 10.0.4.x. Found open ports: 443, 8080. Defense Check: ${status1 === "blocked" ? "BLOCKED" : "BYPASSED"}`,
        status: status1,
        severity: "low",
      },
      {
        title: "Trying to Get In (Initial Access)",
        description: `Foothold vector established using ${chosenAttack.name} to bypass gateway filtering.`,
        log: `[INGRESS] Entry payload dispatched. Channel established with target client. Defense Check: ${status2 === "blocked" ? "BLOCKED" : "BYPASSED"}`,
        status: status2,
        severity: "medium",
      },
      {
        title: "Trying to Steal Passwords (Credential Access)",
        description: `Searching local memory dumps and active directory tables for active session tokens and admin keys.`,
        log: `[CREDENTIALS] LSASS memory dump initiated / credential extraction requested. Defense Check: ${status3 === "blocked" ? "BLOCKED" : "BYPASSED"}`,
        status: status3,
        severity: "medium",
      },
      {
        title: "Moving Through the Network (Lateral Movement)",
        description: `Pivoting from compromised host endpoints to servers. Internal target segment reached: ${chosenIndustry.target}.`,
        log: `[LATERAL] Remote session hijacked to cross network subnets. Target node reached: ${chosenIndustry.target}. Defense Check: ${status4 === "blocked" ? "BLOCKED" : "BYPASSED"}`,
        status: status4,
        severity: "high",
      },
      {
        title: "Taking Control (Privilege Escalation)",
        description: `Attempting admin privilege elevation via token impersonation on Active Directory controller nodes.`,
        log: `[ESCALATION] Token impersonation executed. Root credentials retrieved. Defense Check: ${status5 === "blocked" ? "BLOCKED" : "BYPASSED"}`,
        status: status5,
        severity: "high",
      },
      {
        title: "Attempting to Steal Data (Data Exfiltration)",
        description: `Executing final payload actions on database target ${chosenIndustry.target}. Archiving core customer tables.`,
        log: `[EXFILTRATION] Compressing database files. Transmitting out of band over port 443. Defense Check: ${status6 === "blocked" ? "BLOCKED" : "BYPASSED"}`,
        status: status6,
        severity: "critical",
      },
    ],
  };
};

export default function SimulatePage() {
  const router = useRouter();
  const { maxUnlocked, latestValidPath } = useProgression(1);

  // Field states initialized to null for validation
  const [industry, setIndustry] = useState<string | null>(null);
  const [actor, setActor] = useState<string | null>(null);
  const [attack, setAttack] = useState<string | null>(null);
  const [security, setSecurity] = useState<string | null>(null);

  // Active campaign resume states
  const [activeCampaignExists, setActiveCampaignExists] = useState(false);
  const [activeCampaignName, setActiveCampaignName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sentinel_campaign_config");
      if (saved && maxUnlocked > 1) {
        try {
          const parsed = JSON.parse(saved);
          setActiveCampaignExists(true);
          setActiveCampaignName(getFriendlySimulationName(parsed.attackType));
        } catch (e) {}
      } else {
        setActiveCampaignExists(false);
      }
    }
  }, [maxUnlocked]);

  // Tech Mode toggle (kept for compatibility)
  const [showTechnicalIntel, setShowTechnicalIntel] = useState(false);

  // Validation and Modal states
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Simulation execution states
  const [simState, setSimState] = useState<"idle" | "compiling" | "completed">("idle");
  const [logs, setLogs] = useState<string[]>([]);
  const [activeConfig, setActiveConfig] = useState<CampaignConfig | null>(null);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const getExpectedOutcome = (level: string | null) => {
    if (!level) {
      return {
        likelihood: 0,
        rating: "NO SETUP SELECTED",
        color: "text-slate-500 border-slate-800/40 bg-slate-900/10",
        barColor: "bg-slate-850",
        prediction: "Choose a security setup to see our prediction of the attack's outcome."
      };
    }
    switch (level) {
      case "Low":
        return {
          likelihood: 85,
          rating: "HIGH EXPOSURE RISK",
          color: "text-rose-500 border-rose-500/30 bg-rose-500/5",
          barColor: "bg-rose-500",
          prediction: "With only basic security setup, there are no internal boundaries or advanced filters. The attacker will likely bypass perimeter checks, gather credentials, move laterally, and lock or copy sensitive files without triggering any alarms. Let's see if this prediction matches what actually happens."
        };
      case "Medium":
        return {
          likelihood: 55,
          rating: "MODERATE EXPOSURE RISK",
          color: "text-amber-500 border-amber-500/30 bg-amber-500/5",
          barColor: "bg-amber-500",
          prediction: "A standard setup will trigger alerts for suspicious login behaviors or simple file scans, but lacks the deep segmentation rules needed to block pivot attacks once the perimeter is crossed. The attacker stands a fair chance of reaching core databases. Let's see if this prediction matches what actually happens."
        };
      case "High":
        return {
          likelihood: 25,
          rating: "LOW EXPOSURE RISK",
          color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
          barColor: "bg-emerald-500",
          prediction: "Advanced defenses deploy multi-factor checks and active network monitors. They are highly effective at detecting credential theft or early lateral movement, containing the intrusion before it reaches core assets. Let's see if this prediction matches what actually happens."
        };
      case "Enterprise":
      default:
        return {
          likelihood: 5,
          rating: "NEGLIGIBLE EXPOSURE RISK",
          color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
          barColor: "bg-cyan-400",
          prediction: "Enterprise controls feature hardware security keys and automatic quarantine actions. The intrusion will be isolated immediately at the initial access stage before any foothold is established. Let's see if this prediction matches what actually happens."
        };
    }
  };

  const getDynamicSummarySentence = () => {
    if (!industry || !actor || !attack || !security) {
      return "Start building your cybersecurity story by selecting a target system, an attacker motive, an entry method, and defenses.";
    }

    const targetMap: Record<string, string> = {
      Healthcare: "hospital system that stores patient medical files",
      Banking: "online banking platform that processes financial transfers",
      Government: "public portal holding citizen registry databases",
      University: "university network storing academic research and student details",
      Startup: "startup's cloud application and core server APIs"
    };
    const actorMap: Record<string, string> = {
      APT29: "A stealthy data spy is targeting the network, hoping to silently copy data without leaving a trace.",
      Lazarus: "A financially motivated criminal group is planning an intrusion, seeking to siphon funds and compromise transaction records.",
      LockBit: "A dangerous ransomware operator is looking for a foothold, aiming to lock up systems and demand a payout.",
      Anonymous: "A public hacktivist is launching an assault, wanting to disrupt operations to spread a political message.",
      FIN7: "A rogue insider threat is misusing their login access, attempting to leak internal files from within."
    };
    const attackMap: Record<string, string> = {
      Phishing: "They are planning to send a convincing fake email scam to trick an unsuspecting employee into exposing login credentials.",
      Ransomware: "They plan to execute a file encryption attack, spreading malicious software to lock up the primary servers.",
      DDoS: "They will launch a massive traffic overload attack, flooding the system to disrupt public access.",
      "SQL Injection": "They aim to exploit a database vulnerability, injecting malicious inputs to steal records.",
      "Supply Chain": "They are injecting malicious code into third-party software updates to compromise the server background."
    };
    const defenseMap: Record<string, string> = {
      Low: "Basic defenses are in place, meaning there are few checks to stop the intrusion.",
      Medium: "A standard setup is deployed, offering common detection rules but leaving internal segments exposed.",
      High: "An advanced multi-layered cybersecurity defense is active, ready to trigger alerts and quarantine files.",
      Enterprise: "An enterprise-grade defense is running, featuring hardware security keys, automated threat response, and constant active logs."
    };

    const targetDesc = targetMap[industry] || "target environment";
    const actorStory = actorMap[actor] || "An attacker is planning an intrusion.";
    const attackStory = attackMap[attack] || "They plan to compromise the system.";
    const defenseStory = defenseMap[security] || "Basic defenses are deployed.";

    return `${actorStory} ${attackStory} Their target is a ${targetDesc}. ${defenseStory}`;
  };

  const getDidYouKnowFact = (method: string | null) => {
    const facts: Record<string, string> = {
      Phishing: "Over 90% of all cyber intrusions begin with a phishing email. Attackers exploit human psychology rather than software bugs to gain their initial foothold.",
      Ransomware: "The first ransomware attack occurred in 1989 (the AIDS Trojan), distributed via physical floppy disks. Today, ransomware is a multi-billion dollar illicit industry.",
      DDoS: "The term DDoS stands for Distributed Denial of Service. It works like a sudden highway traffic jam—millions of compromised computers are instructed to access a site at the same time to overload it.",
      "SQL Injection": "SQL Injection (SQLi) has remained on the OWASP Top 10 list of web vulnerabilities for decades. It occurs when databases mistake user inputs (like usernames) for database command code.",
      "Supply Chain": "Supply chain attacks target weak vendor links. In famous real-world breaches, attackers compromised small vendor accounts (like an HVAC supplier) to bypass the target's primary firewalls."
    };
    return facts[method || "Phishing"] || "Cybersecurity is a continuous game of cat-and-mouse between defenders updating protection filters and threat actors searching for new loopholes.";
  };

  const handleVerifyAndConfirm = () => {
    if (!industry || !actor || !attack || !security) {
      setShowValidationErrors(true);
      return;
    }
    setShowValidationErrors(false);
    setShowConfirmModal(true);
  };

  const handleGenerate = () => {
    if (simState === "compiling") return;
    if (!industry || !actor || !attack || !security) return;

    setSimState("compiling");
    setLogs([]);

    // Compile dynamic structured data payload
    const config = compileCampaignConfig(industry, actor, attack, security);
    setActiveConfig(config);

    const compileLogs = [
      `[INFO] Loading your selected environment...`,
      `[INFO] Preparing attacker profile...`,
      `[INFO] Configuring security defenses...`,
      `[INFO] Building attack timeline...`,
      `[INFO] Creating learning walkthrough...`,
      `[INFO] Generating investigation report...`,
      `[SUCCESS] Scenario ready`
    ];

    compileLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === compileLogs.length - 1) {
          // Genuinely save and unlock stage 2 ONLY when compilation is finished
          if (typeof window !== "undefined") {
            sessionStorage.setItem("sentinel_campaign_config", JSON.stringify(config));
            unlockStage(2);
          }
          setSimState("completed");
        }
      }, (index + 1) * 450);
    });
  };

  const resetForm = () => {
    resetSimulationProgression();
    setSimState("idle");
    setLogs([]);
    setActiveConfig(null);
    setIndustry(null);
    setActor(null);
    setAttack(null);
    setSecurity(null);
    setShowValidationErrors(false);
    setActiveCampaignExists(false);
  };

  // Derived readiness
  const filledCount = [industry, actor, attack, security].filter(Boolean).length;
  const isReady = filledCount === 4;
  const outcome = getExpectedOutcome(security);

  // Section step state helper
  const stepState = (value: string | null, idx: number) => {
    if (value) return "done";
    if (showValidationErrors) return "error";
    return "pending";
  };

  const sectionHeaderClass = (state: string) =>
    state === "done"
      ? "text-cyber-green"
      : state === "error"
      ? "text-rose-400"
      : "text-slate-500";

  return (
    <div className="relative min-h-screen bg-cyber-bg overflow-x-hidden pt-28 pb-16 flex flex-col justify-between selection:bg-electric-blue/30 selection:text-white font-sans">

      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-electric-blue/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[30vw] h-[30vh] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Cyber Grid Decorator */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid-fine opacity-50 pointer-events-none z-0" />

      {/* CRT Scanline filters */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10" />
      <div className="fixed inset-0 pointer-events-none z-50 animate-scanline bg-gradient-to-b from-transparent via-cyber-cyan/[0.012] to-transparent h-16 w-full" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex-grow">

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 hover:text-white uppercase mb-8 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Return to Home Page
        </Link>

        {/* Journey Progress Indicator */}
        <JourneyStepper currentStep={1} />

        {/* Header */}
        <div className="mb-10 max-w-4xl mx-auto text-center flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-4 font-bold">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
            {simState === "idle" ? "Simulation Builder" : "Mission Briefing"}
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
            {simState === "idle" ? "Design Your Cybersecurity Story" : "Getting Your Simulation Ready"}
          </h1>
          <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed font-sans max-w-2xl mx-auto">
            {simState === "idle"
              ? "Build a safe learning scenario. Select a target system to protect, an attacker's profile, their entry method, and your defenses to see how they interact."
              : "Sentinel is preparing a custom, fictional cybersecurity case study. You will watch the simulation unfold, investigate the threat actor's steps, and analyze how defenses respond."}
          </p>
        </div>

        {/* Active Investigation Resume Banner */}
        {simState === "idle" && activeCampaignExists && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 p-4 rounded-xl border border-electric-blue/30 bg-electric-blue/5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-[850px] mx-auto relative overflow-hidden backdrop-blur-sm shadow-[0_0_15px_rgba(37,99,235,0.05)] text-left"
          >
            <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-electric-blue" />
            <div className="flex items-center gap-3">
              <span className="text-xl">🕵️</span>
              <div className="text-left">
                <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">Active Investigation Detected</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed font-sans">
                  You have an ongoing simulation: <strong className="text-cyber-cyan">{activeCampaignName}</strong>.
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 w-full sm:w-auto justify-end">
              <button
                onClick={() => { router.push(latestValidPath); }}
                className="px-4 py-2 rounded bg-electric-blue hover:bg-blue-600 text-[10px] font-mono text-white font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer shadow-[0_0_10px_rgba(37,99,235,0.3)]"
              >
                Resume Investigation →
              </button>
              <button
                onClick={() => {
                  resetSimulationProgression();
                  setActiveCampaignExists(false);
                }}
                className="px-3 py-2 rounded border border-slate-800 bg-transparent text-[10px] font-mono text-slate-400 hover:text-white hover:border-slate-650 transition-all duration-300 cursor-pointer"
              >
                Reset
              </button>
            </div>
          </motion.div>
        )}

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Parameter Selection Forms */}
          <div className="lg:col-span-8 space-y-2">

            <AnimatePresence mode="wait">
              {simState === "idle" ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-1"
                  key="form-selectors"
                >

                  {/* ── SECTION 1: Target System ── */}
                  <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    showValidationErrors && !industry
                      ? "border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.08)]"
                      : industry
                      ? "border-cyber-green/20"
                      : "border-cyber-border/50"
                  }`}>
                    {/* Section header */}
                    <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                      showValidationErrors && !industry
                        ? "border-rose-500/20 bg-rose-500/[0.03]"
                        : industry
                        ? "border-cyber-green/15 bg-cyber-green/[0.03]"
                        : "border-cyber-border/30 bg-cyber-surface/20"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${
                          industry
                            ? "border-cyber-green bg-cyber-green/15 text-cyber-green"
                            : showValidationErrors && !industry
                            ? "border-rose-500/60 bg-rose-500/10 text-rose-400"
                            : "border-slate-700 bg-slate-900/60 text-slate-500"
                        }`}>
                          {industry ? "✓" : "1"}
                        </div>
                        <div>
                          <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                            industry ? "text-cyber-green" : showValidationErrors && !industry ? "text-rose-400" : "text-slate-400"
                          }`}>
                            Step 1: Target System
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider mt-0.5">
                            {industry ? `Selected: ${INDUSTRIES.find(i => i.id === industry)?.name.replace(/^[^\s]+ /, "") || industry}` : "Choose a system to protect"}
                          </div>
                        </div>
                      </div>
                      {showValidationErrors && !industry && (
                        <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Required
                        </span>
                      )}
                    </div>

                    {/* Cards */}
                    <div className="p-5">
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {INDUSTRIES.map((ind) => {
                          const isSelected = industry === ind.id;
                          return (
                            <motion.button
                              key={ind.id}
                              variants={cardVariants}
                              onClick={() => setIndustry(ind.id)}
                              className={`p-4 rounded-lg border text-left transition-all duration-200 relative flex flex-col gap-2 cursor-pointer group ${
                                isSelected
                                  ? "bg-electric-blue/10 border-electric-blue/70 shadow-[0_0_12px_rgba(37,99,235,0.12)]"
                                  : "bg-cyber-surface/30 border-cyber-border/60 hover:border-slate-600 hover:bg-cyber-surface/50"
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-electric-blue flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                </span>
                              )}
                              <div className={`text-[11px] font-bold font-mono uppercase tracking-wide leading-tight pr-5 ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                                {ind.name}
                              </div>
                              <div className={`text-[10px] leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>
                                {ind.desc}
                              </div>
                              <div className={`text-[9px] font-mono pt-1.5 border-t mt-auto ${isSelected ? "border-electric-blue/20 text-electric-blue/80" : "border-cyber-border/30 text-slate-600"}`}>
                                TARGET: {ind.target}
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>

                  {/* ── SECTION 2: Threat Actor ── */}
                  <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    showValidationErrors && !actor
                      ? "border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.08)]"
                      : actor
                      ? "border-cyber-green/20"
                      : "border-cyber-border/50"
                  }`}>
                    <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                      showValidationErrors && !actor
                        ? "border-rose-500/20 bg-rose-500/[0.03]"
                        : actor
                        ? "border-cyber-green/15 bg-cyber-green/[0.03]"
                        : "border-cyber-border/30 bg-cyber-surface/20"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${
                          actor
                            ? "border-cyber-green bg-cyber-green/15 text-cyber-green"
                            : showValidationErrors && !actor
                            ? "border-rose-500/60 bg-rose-500/10 text-rose-400"
                            : "border-slate-700 bg-slate-900/60 text-slate-500"
                        }`}>
                          {actor ? "✓" : "2"}
                        </div>
                        <div>
                          <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                            actor ? "text-cyber-green" : showValidationErrors && !actor ? "text-rose-400" : "text-slate-400"
                          }`}>
                            Step 2: Threat Actor
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider mt-0.5">
                            {actor ? `Selected: ${ACTORS.find(a => a.id === actor)?.techName || actor}` : "Choose attacker's motive & profile"}
                          </div>
                        </div>
                      </div>
                      {showValidationErrors && !actor && (
                        <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Required
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {ACTORS.map((act) => {
                          const isSelected = actor === act.id;
                          return (
                            <motion.button
                              key={act.id}
                              variants={cardVariants}
                              onClick={() => setActor(act.id)}
                              className={`p-4 rounded-lg border text-left transition-all duration-200 relative flex flex-col gap-2 cursor-pointer group ${
                                isSelected
                                  ? "bg-electric-blue/10 border-electric-blue/70 shadow-[0_0_12px_rgba(37,99,235,0.12)]"
                                  : "bg-cyber-surface/30 border-cyber-border/60 hover:border-slate-600 hover:bg-cyber-surface/50"
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-electric-blue flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                </span>
                              )}
                              <div className={`text-[11px] font-bold font-mono uppercase tracking-wide leading-tight pr-5 ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                                {act.name}
                              </div>
                              <div className={`text-[10px] leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>
                                {act.desc}
                              </div>
                              <div className={`flex items-center justify-between text-[9px] font-mono pt-1.5 border-t mt-auto ${isSelected ? "border-electric-blue/20" : "border-cyber-border/30"}`}>
                                <span className={isSelected ? "text-electric-blue/80" : "text-slate-600"}>FOCUS: {act.focus}</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider ${isSelected ? "bg-electric-blue/20 text-electric-blue" : "bg-slate-900 text-slate-600"}`}>
                                  {act.techName}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>

                  {/* ── SECTION 3: Attack Method ── */}
                  <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    showValidationErrors && !attack
                      ? "border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.08)]"
                      : attack
                      ? "border-cyber-green/20"
                      : "border-cyber-border/50"
                  }`}>
                    <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                      showValidationErrors && !attack
                        ? "border-rose-500/20 bg-rose-500/[0.03]"
                        : attack
                        ? "border-cyber-green/15 bg-cyber-green/[0.03]"
                        : "border-cyber-border/30 bg-cyber-surface/20"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${
                          attack
                            ? "border-cyber-green bg-cyber-green/15 text-cyber-green"
                            : showValidationErrors && !attack
                            ? "border-rose-500/60 bg-rose-500/10 text-rose-400"
                            : "border-slate-700 bg-slate-900/60 text-slate-500"
                        }`}>
                          {attack ? "✓" : "3"}
                        </div>
                        <div>
                          <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                            attack ? "text-cyber-green" : showValidationErrors && !attack ? "text-rose-400" : "text-slate-400"
                          }`}>
                            Step 3: Attack Method
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider mt-0.5">
                            {attack ? `Selected: ${ATTACK_TYPES.find(t => t.id === attack)?.name.replace(/^[^\s]+ /, "") || attack}` : "Select the entry technique"}
                          </div>
                        </div>
                      </div>
                      {showValidationErrors && !attack && (
                        <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Required
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {ATTACK_TYPES.map((type) => {
                          const isSelected = attack === type.id;
                          return (
                            <motion.button
                              key={type.id}
                              variants={cardVariants}
                              onClick={() => setAttack(type.id)}
                              className={`p-4 rounded-lg border text-left transition-all duration-200 relative flex flex-col gap-2 cursor-pointer group ${
                                isSelected
                                  ? "bg-electric-blue/10 border-electric-blue/70 shadow-[0_0_12px_rgba(37,99,235,0.12)]"
                                  : "bg-cyber-surface/30 border-cyber-border/60 hover:border-slate-600 hover:bg-cyber-surface/50"
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-electric-blue flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                </span>
                              )}
                              <div className={`text-[11px] font-bold font-mono uppercase tracking-wide leading-tight pr-5 ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                                {type.name}
                              </div>
                              <div className={`text-[10px] leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>
                                {type.desc}
                              </div>
                              <div className={`flex items-center justify-between text-[9px] font-mono pt-1.5 border-t mt-auto ${isSelected ? "border-electric-blue/20" : "border-cyber-border/30"}`}>
                                <span className={isSelected ? "text-slate-400" : "text-slate-600"}>MITRE ATT&CK</span>
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider ${isSelected ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : "bg-slate-900 text-slate-600 border border-slate-800"}`}>
                                  {type.tech}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>

                  {/* ── SECTION 4: Security Setup ── */}
                  <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    showValidationErrors && !security
                      ? "border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.08)]"
                      : security
                      ? "border-cyber-green/20"
                      : "border-cyber-border/50"
                  }`}>
                    <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                      showValidationErrors && !security
                        ? "border-rose-500/20 bg-rose-500/[0.03]"
                        : security
                        ? "border-cyber-green/15 bg-cyber-green/[0.03]"
                        : "border-cyber-border/30 bg-cyber-surface/20"
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${
                          security
                            ? "border-cyber-green bg-cyber-green/15 text-cyber-green"
                            : showValidationErrors && !security
                            ? "border-rose-500/60 bg-rose-500/10 text-rose-400"
                            : "border-slate-700 bg-slate-900/60 text-slate-500"
                        }`}>
                          {security ? "✓" : "4"}
                        </div>
                        <div>
                          <div className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                            security ? "text-cyber-green" : showValidationErrors && !security ? "text-rose-400" : "text-slate-400"
                          }`}>
                            Step 4: Security Setup
                          </div>
                          <div className="text-[9px] text-slate-600 font-mono uppercase tracking-wider mt-0.5">
                            {security ? `Selected: ${SECURITY_LEVELS.find(l => l.id === security)?.name || security}` : "Configure your defenses"}
                          </div>
                        </div>
                      </div>
                      {showValidationErrors && !security && (
                        <span className="text-[9px] font-mono text-rose-400 uppercase tracking-wider font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Required
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {SECURITY_LEVELS.map((lvl) => {
                          const isSelected = security === lvl.id;
                          const levelColor =
                            lvl.id === "Low" ? "rose" :
                            lvl.id === "Medium" ? "amber" :
                            lvl.id === "High" ? "emerald" : "cyan";
                          const levelTextClass =
                            lvl.id === "Low" ? "text-rose-400" :
                            lvl.id === "Medium" ? "text-amber-400" :
                            lvl.id === "High" ? "text-emerald-400" : "text-cyan-400";
                          const levelBarClass =
                            lvl.id === "Low" ? "bg-rose-500" :
                            lvl.id === "Medium" ? "bg-amber-500" :
                            lvl.id === "High" ? "bg-emerald-500" : "bg-cyan-400";
                          return (
                            <motion.button
                              key={lvl.id}
                              variants={cardVariants}
                              onClick={() => setSecurity(lvl.id)}
                              className={`p-4 rounded-lg border text-left transition-all duration-200 relative flex flex-col gap-2.5 cursor-pointer group ${
                                isSelected
                                  ? "bg-electric-blue/10 border-electric-blue/70 shadow-[0_0_12px_rgba(37,99,235,0.12)]"
                                  : "bg-cyber-surface/30 border-cyber-border/60 hover:border-slate-600 hover:bg-cyber-surface/50"
                              }`}
                            >
                              {isSelected && (
                                <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-electric-blue flex items-center justify-center">
                                  <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
                                </span>
                              )}
                              <div className={`text-[11px] font-bold font-mono uppercase tracking-wide pr-5 ${isSelected ? "text-white" : "text-slate-300 group-hover:text-white"}`}>
                                {lvl.name}
                              </div>
                              <div className={`text-[10px] leading-relaxed ${isSelected ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"}`}>
                                {lvl.desc}
                              </div>
                              {/* Defense strength bar */}
                              <div className="mt-auto pt-2 border-t border-cyber-border/30 space-y-1.5">
                                <div className="flex justify-between items-center">
                                  <span className={`text-[8px] font-mono uppercase ${isSelected ? "text-slate-400" : "text-slate-600"}`}>Block Rate</span>
                                  <span className={`text-[8px] font-mono font-bold ${isSelected ? levelTextClass : "text-slate-500"}`}>{lvl.detection.split(" ")[0]}</span>
                                </div>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${levelBarClass} ${isSelected ? "opacity-100" : "opacity-40"}`}
                                    style={{ width: lvl.id === "Low" ? "10%" : lvl.id === "Medium" ? "45%" : lvl.id === "High" ? "78%" : "95%" }}
                                  />
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <div className="flex gap-0.5">
                                    {Array.from({ length: 4 }).map((_, idx) => (
                                      <div
                                        key={idx}
                                        className={`w-2 h-1 rounded-sm ${
                                          idx < lvl.level
                                            ? `${levelBarClass} ${isSelected ? "opacity-100" : "opacity-50"}`
                                            : "bg-slate-800"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className={`text-[8px] font-bold font-mono ${isSelected ? levelTextClass : "text-slate-600"}`}>
                                    {lvl.difficulty}
                                  </span>
                                </div>
                              </div>
                            </motion.button>
                          );
                        })}
                      </motion.div>
                    </div>
                  </div>

                </motion.div>
              ) : (
                /* Compile / Load Terminal Screen */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                  key="compiling-terminal"
                >
                  {/* Console Terminal Card */}
                  <div className="glassmorphism-card rounded-xl border border-cyber-border overflow-hidden glow-blue animate-pulse-subtle">
                    {/* Console Top bar */}
                    <div className="bg-cyber-surface px-4 py-3 border-b border-cyber-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 ml-1">simulation-setup-wizard</span>
                      </div>
                      <div className="text-[9px] font-mono text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded bg-cyber-cyan/5">
                        {simState === "compiling" ? "BUILDING SCENARIO..." : "READY"}
                      </div>
                    </div>

                    {/* Console Output logs */}
                    <div className="p-6 bg-black/80 font-mono text-xs text-slate-400 min-h-[380px] flex flex-col justify-between">
                      <div className="space-y-2 overflow-y-auto max-h-[300px] pr-2">
                        {logs.map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="leading-relaxed text-[11px]"
                          >
                            <span className="text-slate-700 mr-2">&gt;</span>
                            {log}
                          </motion.div>
                        ))}
                        {simState === "compiling" && (
                          <div className="flex items-center gap-1.5 text-cyber-cyan text-[11px] font-bold mt-2">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Applying setup configuration...
                          </div>
                        )}
                      </div>

                      {simState === "completed" && activeConfig && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-6 p-5 rounded-lg bg-cyber-surface/60 border border-cyber-green/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl mt-0.5">🎉</span>
                            <div>
                              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">🎉 Your Scenario Is Ready</h4>
                              <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-sans max-w-md">
                                Everything has been prepared. You're about to investigate a fictional cyber attack and discover how different security decisions influence the outcome.
                              </p>
                              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-3 rounded border border-cyber-green/20 bg-cyber-green/5 text-[8px] font-mono text-cyber-green font-bold uppercase tracking-wider">
                                ✓ Ready to Explore
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 w-full md:w-auto justify-end items-center md:items-end flex-shrink-0">
                            <div className="flex gap-2.5">
                              <button
                                onClick={resetForm}
                                className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-cyber-border text-[10px] font-mono text-slate-355 uppercase tracking-widest transition-all duration-300 hover:cursor-pointer"
                              >
                                Create New Scenario
                              </button>

                              <Link
                                href="/attack-viewer"
                                title="Continue to the Attack Viewer"
                                className="px-5 py-2 rounded bg-electric-blue hover:bg-blue-650 text-[10px] font-mono text-white font-bold uppercase tracking-widest flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 hover:cursor-pointer"
                              >
                                Begin Investigation
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider mt-1 font-semibold text-center md:text-right">
                              Estimated walk-through: 3–5 minutes
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Console footer info */}
                    <div className="bg-cyber-surface/70 px-4 py-2 border-t border-cyber-border text-[9px] font-mono text-slate-650 flex justify-between">
                      <div>JOURNEY STATUS: MISSION BRIEFING PREPARATION</div>
                      <div className="text-cyber-green">● READY TO EXPLORE</div>
                    </div>
                  </div>

                  {/* Educational Context Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* What Happens Next */}
                    <div className="p-5 rounded-xl bg-cyber-surface/30 border border-cyber-border/60">
                      <h3 className="text-white text-xs font-mono font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span>👀</span> What Happens Next?
                      </h3>
                      <ul className="space-y-3.5 text-slate-400 text-xs">
                        <li className="flex items-start gap-2.5">
                          <span className="text-electric-blue text-sm mt-[-1px]">👀</span>
                          <span><strong>Watch the attack unfold:</strong> Observe stage-by-stage how the threat actor attempts to breach the system.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-cyber-cyan text-sm mt-[-1px]">🧠</span>
                          <span><strong>Understand why it worked:</strong> Read breakdown analysis files for each phase of the intrusion campaign.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-cyber-green text-sm mt-[-1px]">🛡</span>
                          <span><strong>Learn how defenses respond:</strong> Verify how firewall filters, security keys, or automated monitoring blocks threats.</span>
                        </li>
                        <li className="flex items-start gap-2.5">
                          <span className="text-amber-500 text-sm mt-[-1px]">📖</span>
                          <span><strong>Review key lessons:</strong> Consolidate takeaways at the end to learn how to mitigate similar real-world risks.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Did You Know Fact */}
                    <div className="p-5 rounded-xl bg-cyber-surface/30 border border-cyber-border/60 flex flex-col justify-between">
                      <div>
                        <h3 className="text-cyber-cyan text-xs font-mono font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span>💡</span> Did You Know?
                        </h3>
                        <p className="text-slate-350 text-xs leading-relaxed italic">
                          "{getDidYouKnowFact(attack)}"
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-cyber-border/40 text-[9px] font-mono text-slate-500 uppercase tracking-widest flex justify-between">
                        <span>CONTEXT: {attack || "PHISHING"} ATTACK</span>
                        <span>EDUCATIONAL INFO</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: Scenario Setup Sidebar */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="glassmorphism-card rounded-xl border border-cyber-border flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />

              {/* Panel header */}
              <div className="px-5 py-4 border-b border-cyber-border/40">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Scenario Preview</div>
                    <div className="text-[9px] font-mono text-slate-600 uppercase tracking-wider mt-0.5">Live configuration</div>
                  </div>
                  {/* Readiness indicator */}
                  <div className="flex items-center gap-1">
                    {[industry, actor, attack, security].map((val, i) => (
                      <div
                        key={i}
                        className={`w-5 h-1.5 rounded-full transition-all duration-300 ${val ? "bg-cyber-green" : "bg-slate-800"}`}
                      />
                    ))}
                  </div>
                </div>
                {/* Completion label */}
                <div className={`mt-2 text-[9px] font-mono uppercase tracking-widest font-bold transition-colors ${
                  filledCount === 4 ? "text-cyber-green" : filledCount > 0 ? "text-amber-500" : "text-slate-600"
                }`}>
                  {filledCount === 4 ? "✓ ALL PARAMETERS CONFIGURED — READY" : `${filledCount}/4 PARAMETERS CONFIGURED`}
                </div>
              </div>

              {/* Attack Chain Visual */}
              <div className="px-5 pt-5 pb-4 border-b border-cyber-border/30">
                <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-3">Attack Chain</div>

                {/* Chain nodes */}
                <div className="space-y-1">
                  {/* Threat Actor */}
                  <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
                    actor ? "border-rose-500/25 bg-rose-500/[0.04]" : "border-slate-800/50 bg-transparent"
                  }`}>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      actor ? "border-rose-500/40 bg-rose-500/10 text-rose-400" : "border-slate-800 text-slate-700"
                    }`}>
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">Threat Actor</div>
                      <div className={`text-[10px] font-mono font-bold uppercase truncate ${actor ? "text-rose-300" : "text-slate-700"}`}>
                        {actor ? ACTORS.find(a => a.id === actor)?.techName : "— not selected —"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className={`w-3 h-3 rotate-90 ${actor && attack ? "text-slate-600" : "text-slate-800"}`} />
                  </div>

                  {/* Attack Method */}
                  <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
                    attack ? "border-amber-500/25 bg-amber-500/[0.04]" : "border-slate-800/50 bg-transparent"
                  }`}>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      attack ? "border-amber-500/40 bg-amber-500/10 text-amber-400" : "border-slate-800 text-slate-700"
                    }`}>
                      <Zap className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">Entry Method</div>
                      <div className={`text-[10px] font-mono font-bold uppercase truncate ${attack ? "text-amber-300" : "text-slate-700"}`}>
                        {attack ? attack : "— not selected —"}
                      </div>
                    </div>
                    {attack && (
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/10 text-amber-500 font-bold flex-shrink-0">
                        {ATTACK_TYPES.find(t => t.id === attack)?.tech}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className={`w-3 h-3 rotate-90 ${attack && industry ? "text-slate-600" : "text-slate-800"}`} />
                  </div>

                  {/* Target System */}
                  <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
                    industry ? "border-electric-blue/25 bg-electric-blue/[0.04]" : "border-slate-800/50 bg-transparent"
                  }`}>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      industry ? "border-electric-blue/40 bg-electric-blue/10 text-electric-blue" : "border-slate-800 text-slate-700"
                    }`}>
                      <Database className="w-3 h-3" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">Target System</div>
                      <div className={`text-[10px] font-mono font-bold uppercase truncate ${industry ? "text-blue-300" : "text-slate-700"}`}>
                        {industry ? (INDUSTRIES.find(i => i.id === industry)?.target || industry) : "— not selected —"}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <ChevronRight className={`w-3 h-3 rotate-90 ${industry && security ? "text-slate-600" : "text-slate-800"}`} />
                  </div>

                  {/* Defense Layer */}
                  <div className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
                    security ? "border-cyber-green/25 bg-cyber-green/[0.04]" : "border-slate-800/50 bg-transparent"
                  }`}>
                    <div className={`w-6 h-6 rounded border flex items-center justify-center flex-shrink-0 ${
                      security ? "border-cyber-green/40 bg-cyber-green/10 text-cyber-green" : "border-slate-800 text-slate-700"
                    }`}>
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[8px] font-mono text-slate-600 uppercase tracking-wider">Defense Layer</div>
                      <div className={`text-[10px] font-mono font-bold uppercase truncate ${security ? "text-emerald-300" : "text-slate-700"}`}>
                        {security ? (SECURITY_LEVELS.find(l => l.id === security)?.name || security) : "— not selected —"}
                      </div>
                    </div>
                    {security && (
                      <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border font-bold flex-shrink-0 ${
                        security === "Low" ? "border-rose-500/20 bg-rose-500/10 text-rose-400" :
                        security === "Medium" ? "border-amber-500/20 bg-amber-500/10 text-amber-400" :
                        security === "High" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" :
                        "border-cyan-400/20 bg-cyan-400/10 text-cyan-400"
                      }`}>
                        {outcome.likelihood}% risk
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Narrative summary */}
              {(industry || actor || attack || security) && (
                <div className="px-5 py-4 border-b border-cyber-border/30">
                  <div className="text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">Scenario Narrative</div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {getDynamicSummarySentence()}
                  </p>
                </div>
              )}

              {/* Threat index and outcome */}
              <div className="px-5 py-4 border-b border-cyber-border/30">
                {/* Exploitability warning */}
                {actor && security && (() => {
                  const isDangerousActor = ["LockBit", "Lazarus", "APT29"].includes(actor);
                  const isWeakDefense = ["Low", "Medium"].includes(security);
                  if (isDangerousActor && isWeakDefense) {
                    return (
                      <div className="mb-3 p-2.5 rounded border border-cyber-red/30 bg-cyber-red/5 font-mono text-[9px] text-cyber-red uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span>🔥</span> CRITICAL: High-risk actor with weak defenses
                      </div>
                    );
                  } else if (!isWeakDefense) {
                    return (
                      <div className="mb-3 p-2.5 rounded border border-cyber-green/30 bg-cyber-green/5 font-mono text-[9px] text-cyber-green uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <span>🛡️</span> Secure mitigation active
                      </div>
                    );
                  }
                  return (
                    <div className="mb-3 p-2.5 rounded border border-amber-500/30 bg-amber-500/5 font-mono text-[9px] text-amber-500 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                      <span>⚠️</span> Detectable pathway exposed
                    </div>
                  );
                })()}

                {/* Outcome prediction */}
                <div className={`p-3.5 rounded-lg border ${outcome.color}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Predicted Outcome</span>
                    <span className="text-[7px] font-mono px-1.5 py-0.5 rounded border border-current font-bold uppercase">
                      {outcome.rating}
                    </span>
                  </div>
                  {security && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-base font-bold font-mono text-white">{outcome.likelihood}%</div>
                      <div className="flex-grow">
                        <div className="text-[8px] font-mono uppercase text-slate-500 mb-1">Attack Success Chance</div>
                        <div className="w-full h-1.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${outcome.barColor} transition-all duration-500`}
                            style={{ width: `${outcome.likelihood}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-[9px] text-slate-400 leading-relaxed font-sans">
                    {outcome.prediction}
                  </p>
                </div>
              </div>

              {/* CTA area */}
              {simState === "idle" && (
                <div className="p-5">
                  {/* Validation error */}
                  {showValidationErrors && !isReady && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-400 leading-relaxed font-mono uppercase font-semibold text-center"
                    >
                      ⚠️ Complete all 4 selections to run
                    </motion.div>
                  )}

                  <button
                    onClick={handleVerifyAndConfirm}
                    className={`w-full py-3.5 rounded font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer border ${
                      isReady
                        ? "bg-electric-blue hover:bg-blue-600 text-white border-electric-blue/50 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_28px_rgba(37,99,235,0.5)]"
                        : "bg-slate-900/80 text-slate-500 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <Play className={`w-3.5 h-3.5 fill-current ${isReady ? "" : "opacity-50"}`} />
                    {isReady ? "▶ Run This Scenario" : `Configure ${4 - filledCount} More ${4 - filledCount === 1 ? "Parameter" : "Parameters"}`}
                  </button>

                  <p className="text-[8px] text-center text-slate-600 font-mono uppercase tracking-wider mt-3 leading-relaxed">
                    {isReady ? "Prepares a 3–5 min educational walk-through." : "Select all parameters above to continue."}
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Dark glass backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="relative w-full max-w-lg bg-cyber-surface/90 border border-cyber-cyan/30 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.15)] z-10 backdrop-blur-xl"
            >
              {/* Top border glowing stripe */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent" />

              {/* Close Button */}
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-all cursor-pointer animate-pulse-subtle"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="p-6 border-b border-cyber-border/40">
                <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-1.5 font-bold">
                  <Terminal className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                  Mission Dispatch
                </div>
                <h3 className="text-xl font-extrabold text-white uppercase tracking-tight">
                  Review Your Learning Scenario
                </h3>
              </div>

              {/* Content body */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 font-mono text-[11px]">
                  <div className="p-3 rounded bg-black/35 border border-cyber-border">
                    <span className="text-slate-500 text-[9px] uppercase tracking-wider block">System</span>
                    <span className="text-white font-bold block mt-1 uppercase">
                      {industry ? (INDUSTRIES.find(i => i.id === industry)?.name || industry) : ""}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-black/35 border border-cyber-border">
                    <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Attacker</span>
                    <span className="text-white font-bold block mt-1 uppercase">
                      {actor ? (ACTORS.find(a => a.id === actor)?.name || actor) : ""}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-black/35 border border-cyber-border">
                    <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Attack</span>
                    <span className="text-white font-bold block mt-1 uppercase">
                      {attack ? (ATTACK_TYPES.find(t => t.id === attack)?.name || attack) : ""}
                    </span>
                  </div>
                  <div className="p-3 rounded bg-black/35 border border-cyber-border">
                    <span className="text-slate-500 text-[9px] uppercase tracking-wider block">Protection</span>
                    <span className="text-white font-bold block mt-1 uppercase">
                      {security ? (SECURITY_LEVELS.find(l => l.id === security)?.name || security) : ""}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans pt-2">
                  Please review your selections before starting the simulation. You can still go back and make changes if you'd like.
                </p>
              </div>

              {/* Action buttons */}
              <div className="p-6 bg-black/20 border-t border-cyber-border/40 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-5 py-2.5 rounded bg-slate-900 hover:bg-slate-800 border border-cyber-border text-xs font-mono text-slate-350 uppercase tracking-widest transition-all duration-300 hover:cursor-pointer flex items-center justify-center gap-1.5"
                >
                  ← Continue Editing
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleGenerate();
                  }}
                  className="px-5 py-2.5 rounded bg-electric-blue hover:bg-blue-600 text-xs font-mono text-white font-bold uppercase tracking-widest transition-all duration-300 hover:cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                >
                  ▶ Start Simulation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />

    </div>
  );
}
