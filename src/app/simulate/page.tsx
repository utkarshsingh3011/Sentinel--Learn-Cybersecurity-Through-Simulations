"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal, Bot, Layers, Play, CheckCircle2,
  ArrowLeft, RefreshCw, Cpu, Database, Network, ArrowRight, X
} from "lucide-react";
import JourneyStepper from "../../components/JourneyStepper";
import Footer from "../../components/Footer";

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
  // Field states initialized to null for validation
  const [industry, setIndustry] = useState<string | null>(null);
  const [actor, setActor] = useState<string | null>(null);
  const [attack, setAttack] = useState<string | null>(null);
  const [security, setSecurity] = useState<string | null>(null);

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
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
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

    // Save configuration in session storage so a future '/attack-viewer' page can read it directly!
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sentinel_campaign_config", JSON.stringify(config));
      sessionStorage.setItem("sentinel_max_unlocked_step", "2");
      window.dispatchEvent(new Event("sentinel_progress_update"));
    }

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
          setSimState("completed");
        }
      }, (index + 1) * 450);
    });
  };

  const resetForm = () => {
    setSimState("idle");
    setLogs([]);
    setActiveConfig(null);
    setIndustry(null);
    setActor(null);
    setAttack(null);
    setSecurity(null);
    setShowValidationErrors(false);
  };

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

        {/* How It Works - Onboarding */}
        {simState === "idle" && (
          <div className="mb-12 mx-auto max-w-[850px] w-full p-6 md:p-8 rounded-xl bg-cyber-surface/40 border border-cyber-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-pulse" />
            
            <h2 className="text-white text-center text-sm md:text-base font-bold font-mono tracking-wider uppercase mb-6 flex items-center justify-center gap-2">
              <Layers className="w-4 h-4 text-cyber-cyan animate-pulse" />
              How to Build Your Story
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[90px] group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🏥</span>
                <div className="text-[9px] text-white font-mono font-bold uppercase tracking-wider">1. Select Target</div>
                <span className="text-[8px] text-slate-450 leading-tight">Choose a system to defend</span>
              </div>
              
              <div className="p-3 rounded bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[90px] group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🕵️</span>
                <div className="text-[9px] text-white font-mono font-bold uppercase tracking-wider">2. Choose Attacker</div>
                <span className="text-[8px] text-slate-450 leading-tight">Pick the attacker's motive</span>
              </div>
              
              <div className="p-3 rounded bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[90px] group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">📧</span>
                <div className="text-[9px] text-white font-mono font-bold uppercase tracking-wider">3. Pick Entry Method</div>
                <span className="text-[8px] text-slate-450 leading-tight">Select how they attempt entry</span>
              </div>
              
              <div className="p-3 rounded bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-1.5 min-h-[90px] group">
                <span className="text-xl group-hover:scale-110 transition-transform duration-200">🛡️</span>
                <div className="text-[9px] text-white font-mono font-bold uppercase tracking-wider">4. Set Defenses</div>
                <span className="text-[8px] text-slate-450 leading-tight">Configure security setups</span>
              </div>
            </div>
            
            <div className="text-center mt-5 font-mono text-[8px] text-cyber-cyan uppercase tracking-widest animate-pulse">
              ▲ Configure all four sections and start the simulation to see the outcome ▲
            </div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Parameter Selection Forms */}
          <div className="lg:col-span-8 space-y-8">

            <AnimatePresence mode="wait">
              {simState === "idle" ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                  key="form-selectors"
                >
                  {/* 1. Environment Segment */}
                  <div className={`space-y-4 p-4 rounded-xl border transition-all duration-300 ${
                    showValidationErrors && !industry
                      ? "border-rose-500/30 bg-rose-500/[0.02] shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                      : "border-transparent"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${
                        showValidationErrors && !industry ? "text-rose-455 font-extrabold animate-pulse" : "text-slate-500"
                      }`}>
                        Step 1: Choose Target System to Protect
                      </span>
                      {showValidationErrors && !industry && (
                        <span className="text-[9px] font-mono text-rose-550 uppercase tracking-wider font-bold animate-pulse">
                          ⚠️ Selection Required
                        </span>
                      )}
                    </div>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {INDUSTRIES.map((ind) => (
                        <motion.button
                          key={ind.id}
                          variants={cardVariants}
                          onClick={() => setIndustry(ind.id)}
                          className={`p-4 rounded-lg border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${industry === ind.id
                            ? "bg-electric-blue/15 border-electric-blue shadow-[0_0_15px_rgba(37,99,235,0.1)] text-white"
                            : "bg-cyber-surface/40 border-cyber-border hover:border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                        >
                          <div>
                            <div className="text-xs font-bold font-sans uppercase tracking-wider">{ind.name}</div>
                            <div className="text-[10px] opacity-60 mt-1.5 font-sans leading-relaxed">{ind.desc}</div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* 2. Attacker Profile */}
                  <div className={`space-y-4 p-4 rounded-xl border transition-all duration-300 ${
                    showValidationErrors && !actor
                      ? "border-rose-500/30 bg-rose-500/[0.02] shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                      : "border-transparent"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${
                        showValidationErrors && !actor ? "text-rose-455 font-extrabold animate-pulse" : "text-slate-500"
                      }`}>
                        Step 2: Choose Your Attacker Type
                      </span>
                      {showValidationErrors && !actor && (
                        <span className="text-[9px] font-mono text-rose-550 uppercase tracking-wider font-bold animate-pulse">
                          ⚠️ Selection Required
                        </span>
                      )}
                    </div>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {ACTORS.map((act) => (
                        <motion.button
                          key={act.id}
                          variants={cardVariants}
                          onClick={() => setActor(act.id)}
                          className={`p-4 rounded-lg border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${actor === act.id
                            ? "bg-electric-blue/15 border-electric-blue shadow-[0_0_15px_rgba(37,99,235,0.1)] text-white"
                            : "bg-cyber-surface/40 border-cyber-border hover:border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                        >
                          <div>
                            <div className="text-xs font-bold font-sans uppercase tracking-wider">{act.name}</div>
                            <div className="text-[10px] opacity-60 mt-1.5 font-sans leading-relaxed">{act.desc}</div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* 3. Attack Type */}
                  <div className={`space-y-4 p-4 rounded-xl border transition-all duration-300 ${
                    showValidationErrors && !attack
                      ? "border-rose-500/30 bg-rose-500/[0.02] shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                      : "border-transparent"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${
                        showValidationErrors && !attack ? "text-rose-455 font-extrabold animate-pulse" : "text-slate-500"
                      }`}>
                        Step 3: Select the Attack Method
                      </span>
                      {showValidationErrors && !attack && (
                        <span className="text-[9px] font-mono text-rose-550 uppercase tracking-wider font-bold animate-pulse">
                          ⚠️ Selection Required
                        </span>
                      )}
                    </div>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {ATTACK_TYPES.map((type) => (
                        <motion.button
                          key={type.id}
                          variants={cardVariants}
                          onClick={() => setAttack(type.id)}
                          className={`p-4 rounded-lg border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${attack === type.id
                            ? "bg-electric-blue/15 border-electric-blue shadow-[0_0_15px_rgba(37,99,235,0.1)] text-white"
                            : "bg-cyber-surface/40 border-cyber-border hover:border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                        >
                          <div>
                            <div className="text-xs font-bold font-sans uppercase tracking-wider">{type.name}</div>
                            <div className="text-[10px] opacity-60 mt-1.5 font-sans leading-relaxed">{type.desc}</div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* 4. Security Setup */}
                  <div className={`space-y-4 p-4 rounded-xl border transition-all duration-300 ${
                    showValidationErrors && !security
                      ? "border-rose-500/30 bg-rose-500/[0.02] shadow-[0_0_15px_rgba(244,63,94,0.05)]"
                      : "border-transparent"
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-mono uppercase tracking-widest block font-bold ${
                        showValidationErrors && !security ? "text-rose-455 font-extrabold animate-pulse" : "text-slate-500"
                      }`}>
                        Step 4: Configure Your Defenses
                      </span>
                      {showValidationErrors && !security && (
                        <span className="text-[9px] font-mono text-rose-550 uppercase tracking-wider font-bold animate-pulse">
                          ⚠️ Selection Required
                        </span>
                      )}
                    </div>
                    <motion.div
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
                      variants={containerVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {SECURITY_LEVELS.map((lvl) => (
                        <motion.button
                          key={lvl.id}
                          variants={cardVariants}
                          onClick={() => setSecurity(lvl.id)}
                          className={`p-4 rounded-lg border text-left transition-all duration-300 relative flex flex-col justify-between cursor-pointer ${security === lvl.id
                            ? "bg-electric-blue/15 border-electric-blue shadow-[0_0_15px_rgba(37,99,235,0.1)] text-white"
                            : "bg-cyber-surface/40 border-cyber-border hover:border-slate-800 text-slate-400 hover:text-slate-200"
                            }`}
                        >
                          <div>
                            <div className="text-xs font-bold font-sans uppercase tracking-wider">{lvl.name}</div>
                            <div className="text-[10px] opacity-60 mt-1.5 font-sans leading-relaxed">{lvl.desc}</div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-cyber-border/40 w-full">
                            <div className="flex justify-between items-center text-[9px] font-mono text-cyber-cyan uppercase">
                              <span>Block Rate: {lvl.detection}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="text-[8px] font-mono text-slate-500 uppercase">Difficulty:</span>
                              <div className="flex gap-0.5">
                                {Array.from({ length: 4 }).map((_, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-2.5 h-1.5 rounded-sm ${
                                      idx < lvl.level
                                        ? lvl.id === "Low"
                                          ? "bg-rose-500"
                                          : lvl.id === "Medium"
                                          ? "bg-amber-500"
                                          : lvl.id === "High"
                                          ? "bg-cyber-green"
                                          : "bg-cyber-cyan"
                                        : "bg-slate-800"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-[8px] font-bold font-mono ${
                                lvl.id === "Low" ? "text-rose-500" :
                                lvl.id === "Medium" ? "text-amber-500" :
                                lvl.id === "High" ? "text-emerald-500" : "text-cyan-400"
                              }`}>
                                {lvl.difficulty}
                              </span>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </motion.div>
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

          {/* Right Column: Scenario Setup Sidebar Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-cyber-border pointer-events-none" />

              <div className="border-b border-cyber-border/40 pb-4 mb-6">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">
                  SCENARIO OVERVIEW
                </span>
                <span className="text-[8px] font-mono text-slate-650 uppercase mt-0.5 block">
                  CURRENT CONFIGURATION
                </span>
                <div className="mt-4 p-3 rounded bg-cyber-cyan/5 border border-cyber-cyan/35 text-xs text-white leading-relaxed font-sans shadow-[0_0_10px_rgba(6,182,212,0.05)] border-l-2">
                  {getDynamicSummarySentence()}
                </div>
              </div>

              {/* Selection summary items */}
              <div className="space-y-5 font-mono text-[10px]">

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">You're Protecting</div>
                    <div className={`font-bold uppercase mt-0.5 ${industry ? "text-white" : "text-rose-400/80 animate-pulse"}`}>
                      {industry ? (INDUSTRIES.find(i => i.id === industry)?.name.split(" ").slice(1).join(" ") || industry) : "Not Selected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Who's Attacking</div>
                    <div className={`font-bold uppercase mt-0.5 ${actor ? "text-white" : "text-rose-400/80 animate-pulse"}`}>
                      {actor ? (ACTORS.find(a => a.id === actor)?.name.split(" ").slice(1).join(" ") || actor) : "Not Selected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Attack Method</div>
                    <div className={`font-bold uppercase mt-0.5 ${attack ? "text-white" : "text-rose-400/80 animate-pulse"}`}>
                      {attack ? (ATTACK_TYPES.find(t => t.id === attack)?.name.split(" ").slice(1).join(" ") || attack) : "Not Selected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Current Protection</div>
                    <div className={`font-bold uppercase mt-0.5 ${security ? "text-white" : "text-rose-400/80 animate-pulse"}`}>
                      {security ? (SECURITY_LEVELS.find(l => l.id === security)?.name || security) : "Not Selected"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Estimated Success Rate</div>
                    <div className="text-white font-bold uppercase mt-0.5">
                      {security ? `${getExpectedOutcome(security).likelihood}%` : "—"}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <RefreshCw className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Estimated Learning Time</div>
                    <div className="text-white font-bold uppercase mt-0.5">
                      3–5 minutes
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 border-t border-cyber-border/40 pt-6">
                {/* Expected Outcome Card */}
                <div className={`p-4 rounded-lg border ${getExpectedOutcome(security).color} font-sans mb-6`}>
                  <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                    <span className="text-[9px] font-mono uppercase tracking-wider font-bold">What We Predict</span>
                    <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-current font-bold uppercase text-[7px]">
                      {getExpectedOutcome(security).rating}
                    </span>
                  </div>
                  {security && (
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-lg font-bold font-mono text-white">{getExpectedOutcome(security).likelihood}%</div>
                      <div className="flex-grow">
                        <div className="text-[8px] font-mono uppercase text-slate-555">Attack Exposure Chance</div>
                        <div className="w-full h-1.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full ${getExpectedOutcome(security).barColor}`} 
                            style={{ width: `${getExpectedOutcome(security).likelihood}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    {getExpectedOutcome(security).prediction}
                  </p>
                </div>

                {simState === "idle" && (
                  <>
                    {/* Validation Error Message */}
                    {showValidationErrors && (!industry || !actor || !attack || !security) && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded bg-rose-500/10 border border-rose-500/30 text-[10px] text-rose-455 leading-relaxed font-mono uppercase font-semibold text-center"
                      >
                        ⚠️ Almost there! Please complete all four selections before starting your simulation.
                      </motion.div>
                    )}

                    <button
                      onClick={handleVerifyAndConfirm}
                      className="w-full py-3.5 rounded bg-electric-blue hover:bg-blue-650 text-white font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 cursor-pointer border border-electric-blue/40"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      ▶ Run This Scenario
                    </button>
                    <p className="text-[8px] text-center text-slate-500 font-mono uppercase tracking-wider mt-3 leading-relaxed">
                      Prepares the step-by-step educational walk-through.
                    </p>
                  </>
                )}
              </div>

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
