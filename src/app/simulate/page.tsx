"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Terminal, Bot, Layers, Play, CheckCircle2,
  ArrowLeft, RefreshCw, Cpu, Database, Network, ArrowRight
} from "lucide-react";

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
  { id: "Low", name: "🟥 Basic Protection", desc: "Minimal security controls.", detection: "10% Block Chance", difficulty: "Very Easy", level: 1 },
  { id: "Medium", name: "🟨 Standard Protection", desc: "Common security measures enabled.", detection: "45% Block Chance", difficulty: "Moderate", level: 2 },
  { id: "High", name: "🟩 Advanced Protection", desc: "Multiple layers of modern cybersecurity defenses.", detection: "78% Block Chance", difficulty: "Hard", level: 3 },
  { id: "Enterprise", name: "💎 Enterprise Security", desc: "Automated response playbooks, hardware security keys, and 24/7 security team.", detection: "95% Block Chance", difficulty: "Extreme", level: 4 },
];

// Helper to dynamically build campaign data configs based on parameters
// Extensible for future Gemini API scenario synthesizer integration
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
        title: "Reconnaissance & Port Scan",
        description: `Attacker ${actor} initiated active reconnaissance scans mapping the target subnets for ${chosenIndustry.name}.`,
        log: `[RECON] Mapping subnets on segment 10.0.4.x. Found open ports: 443, 8080. EDR status: ${status1 === "blocked" ? "BLOCKED" : "EVADED"}`,
        status: status1,
        severity: "low",
      },
      {
        title: "Initial Access Foothold",
        description: `Foothold vector established using ${chosenAttack.name} (${chosenAttack.tech}) to bypass gateway filtering.`,
        log: `[INGRESS] Exploit payload dispatched. Channel established with target client. EDR status: ${status2 === "blocked" ? "BLOCKED" : "EVADED"}`,
        status: status2,
        severity: "medium",
      },
      {
        title: "Credential Swipe",
        description: `Searching local memory dumps and active directory tables for active session tokens and admin keys.`,
        log: `[CREDENTIALS] LSASS memory dump initiated / credential extraction requested. EDR status: ${status3 === "blocked" ? "BLOCKED" : "EVADED"}`,
        status: status3,
        severity: "medium",
      },
      {
        title: "Lateral Subnet Propagation",
        description: `Pivoting from compromised host endpoints to jump servers. Internal target segment reached: ${chosenIndustry.target}.`,
        log: `[LATERAL] Remote session hijacked to cross network subnets. Target node reached: ${chosenIndustry.target}. EDR status: ${status4 === "blocked" ? "BLOCKED" : "EVADED"}`,
        status: status4,
        severity: "high",
      },
      {
        title: "Privilege Domain Escalation",
        description: `Attempting admin privilege elevation via token impersonation on Active Directory controller nodes.`,
        log: `[ESCALATION] Token impersonation executed. Root credentials retrieved. EDR status: ${status5 === "blocked" ? "BLOCKED" : "EVADED"}`,
        status: status5,
        severity: "high",
      },
      {
        title: "Data Exfiltration & Impact",
        description: `Executing final payload actions on database target ${chosenIndustry.target}. Archiving core customer tables.`,
        log: `[EXFILTRATION] Compressing database files. Transmitting out of band over port 443. EDR status: ${status6 === "blocked" ? "BLOCKED" : "EVADED"}`,
        status: status6,
        severity: "critical",
      },
    ],
  };
};

export default function SimulatePage() {
  const router = useRouter();
  // Field states
  const [industry, setIndustry] = useState("Healthcare");
  const [actor, setActor] = useState("APT29");
  const [attack, setAttack] = useState("Phishing");
  const [security, setSecurity] = useState("Medium");

  // Tech Mode toggle
  const [showTechnicalIntel, setShowTechnicalIntel] = useState(false);

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

  const getExpectedOutcome = (level: string) => {
    switch (level) {
      case "Low":
        return {
          likelihood: 85,
          rating: "CRITICAL RISK",
          color: "text-rose-500 border-rose-500/30 bg-rose-500/5",
          barColor: "bg-rose-500",
          prediction: "Defenses are minimal. The attacker will easily compromise credentials, move laterally through network subnets, and successfully encrypt/exfiltrate core database tables without triggering alerts."
        };
      case "Medium":
        return {
          likelihood: 55,
          rating: "MODERATE RISK",
          color: "text-amber-500 border-amber-500/30 bg-amber-500/5",
          barColor: "bg-amber-500",
          prediction: "Defenses will flag the initial port scanning and credential swipe, but lacking network segmentation, the attacker is likely to establish lateral channels and complete exfiltration."
        };
      case "High":
        return {
          likelihood: 25,
          rating: "LOW RISK",
          color: "text-emerald-500 border-emerald-500/30 bg-emerald-500/5",
          barColor: "bg-emerald-500",
          prediction: "Zero Trust architecture and multi-factor authentication are highly likely to contain the threat. The attack is expected to be intercepted during credential access or lateral movement."
        };
      case "Enterprise":
      default:
        return {
          likelihood: 5,
          rating: "NEGLIGIBLE RISK",
          color: "text-cyan-400 border-cyan-400/30 bg-cyan-400/5",
          barColor: "bg-cyan-400",
          prediction: "Automated response playbooks, hardware security keys, and active monitoring will immediately contain the threat. The intrusion attempt will be blocked at the perimeter before any foothold is established."
        };
    }
  };

  const getDynamicSummarySentence = () => {
    const targetMap: Record<string, string> = {
      Healthcare: "hospital system",
      Banking: "online banking platform",
      Government: "government portal",
      University: "university network",
      Startup: "startup infrastructure"
    };
    const actorMap: Record<string, string> = {
      APT29: "data spy",
      Lazarus: "financial criminal",
      LockBit: "ransomware operator",
      Anonymous: "hacktivist",
      FIN7: "insider threat"
    };
    const attackMap: Record<string, string> = {
      Phishing: "fake email scam",
      Ransomware: "file encryption attack",
      DDoS: "traffic overload attack",
      "SQL Injection": "database attack",
      "Supply Chain": "malicious software installation"
    };
    const defenseMap: Record<string, string> = {
      Low: "basic protection",
      Medium: "standard protection",
      High: "advanced protection",
      Enterprise: "enterprise security"
    };

    const targetName = targetMap[industry] || "target environment";
    const actorName = actorMap[actor] || "attacker";
    const attackName = attackMap[attack] || "cyberattack";
    const defenseName = defenseMap[security] || "standard protection";

    const aAn = ["a", "e", "i", "o", "u"].includes(actorName.charAt(0)) ? "An" : "A";

    return `${aAn} ${actorName} is attempting a ${attackName} against a ${targetName} protected by ${defenseName}.`;
  };

  const handleGenerate = () => {
    if (simState === "compiling") return;

    setSimState("compiling");
    setLogs([]);

    // Compile dynamic structured data payload
    const config = compileCampaignConfig(industry, actor, attack, security);
    setActiveConfig(config);

    // Save configuration in session storage so a future '/attack-viewer' page can read it directly!
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sentinel_campaign_config", JSON.stringify(config));
    }

    const compileLogs = [
      `[SYS] Initializing Sentinel Sandbox Environment...`,
      `[INFO] Preparing the target environment...`,
      `[INFO] Analyzing attacker behavior...`,
      `[INFO] Attempting initial access...`,
      `[INFO] Security systems are responding...`,
      `[INFO] Evaluating attack impact...`,
      `[INFO] Generating simulation results...`,
      `[SUCCESS] Simulation compiled successfully. Launching viewer...`
    ];

    compileLogs.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === compileLogs.length - 1) {
          setSimState("completed");
          // Automatically redirect to attack-viewer after 1.5 seconds!
          setTimeout(() => {
            router.push("/attack-viewer");
          }, 1500);
        }
      }, (index + 1) * 450);
    });
  };

  const resetForm = () => {
    setSimState("idle");
    setLogs([]);
    setActiveConfig(null);
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

        {/* Header */}
        <div className="mb-10 max-w-4xl flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-4">
              <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
              Simulation Builder: simulation-builder.exe
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
              Attack Simulation Builder
            </h1>
            <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed font-sans">
              Explore how different cyberattacks work and see how security defenses respond in a safe, interactive environment.
            </p>
          </div>

          {/* Global Threat Intel Mode Toggle */}
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowTechnicalIntel(!showTechnicalIntel)}
              className={`px-4 py-2 rounded border font-mono text-[9px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 hover:cursor-pointer ${
                showTechnicalIntel 
                  ? "bg-cyber-cyan/15 border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                  : "bg-cyber-surface/40 border-cyber-border hover:border-slate-800 text-slate-450 hover:text-white"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              {showTechnicalIntel ? "Hide Threat Intel (Friendly Mode)" : "Show Threat Intel & MITRE IDs"}
            </button>
          </div>
        </div>

        {/* How It Works - Centered Onboarding Card */}
        {simState === "idle" && (
          <div className="mb-12 mx-auto max-w-[800px] w-full p-6 md:p-8 rounded-xl bg-cyber-surface/40 border border-cyber-cyan/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] relative overflow-hidden backdrop-blur-sm">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent animate-pulse" />
            {/* Ambient glows */}
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyber-cyan/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-electric-blue/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-white text-center text-sm md:text-base font-bold font-mono tracking-wider uppercase mb-6 flex items-center justify-center gap-2">
              <Layers className="w-4 h-4 text-cyber-cyan animate-pulse" />
              How This Simulation Works
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              <div className="p-3 rounded-lg bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[90px] group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🏥</span>
                <span className="text-[10px] text-slate-300 font-medium leading-tight font-sans">Choose a target environment</span>
              </div>
              
              <div className="p-3 rounded-lg bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[90px] group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🕵️</span>
                <span className="text-[10px] text-slate-300 font-medium leading-tight font-sans">Select an attacker profile</span>
              </div>
              
              <div className="p-3 rounded-lg bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[90px] group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">⚠️</span>
                <span className="text-[10px] text-slate-300 font-medium leading-tight font-sans">Choose an attack type</span>
              </div>
              
              <div className="p-3 rounded-lg bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[90px] group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🛡️</span>
                <span className="text-[10px] text-slate-300 font-medium leading-tight font-sans">Select defense strength</span>
              </div>
              
              <div className="p-3 rounded-lg bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[90px] group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">▶️</span>
                <span className="text-[10px] text-slate-300 font-medium leading-tight font-sans">Run the simulation</span>
              </div>
              
              <div className="p-3 rounded-lg bg-black/40 border border-cyber-border hover:border-cyber-cyan/40 transition-all duration-300 flex flex-col items-center justify-center gap-2 min-h-[90px] group">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-200">🧠</span>
                <span className="text-[10px] text-slate-300 font-medium leading-tight font-sans">Review the outcome</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Parameter Selection Forms (8 cols) */}
          <div className="lg:col-span-8 space-y-8">

            <AnimatePresence mode="wait">
              {simState === "idle" ? (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-8"
                >
                  {/* Parameter Selection Cards */}

                  {/* 1. Environment Segment */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Step 1: Where is the attack happening?
                    </span>
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
                          {showTechnicalIntel && (
                            <div className="text-[9px] font-mono text-cyber-cyan mt-3 pt-2 border-t border-cyber-border/40 w-full uppercase">
                              Target ID: {ind.target}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* 2. Attacker Profile */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Step 2: Who is launching the attack?
                    </span>
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
                          {showTechnicalIntel && (
                            <div className="text-[9px] font-mono text-cyber-cyan mt-3 pt-2 border-t border-cyber-border/40 w-full uppercase">
                              Intel: {act.techName}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* 3. Attack Type */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Step 3: What type of attack is being attempted?
                    </span>
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
                          {showTechnicalIntel && (
                            <div className="text-[9px] font-mono text-cyber-cyan mt-3 pt-2 border-t border-cyber-border/40 w-full uppercase">
                              MITRE ID: {type.tech}
                            </div>
                          )}
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* 4. Security Level */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Step 4: How strong are the defenses?
                    </span>
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
                                          ? "bg-emerald-500"
                                          : "bg-cyan-400"
                                        : "bg-slate-800"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-[8px] font-bold font-mono ${
                                lvl.id === "Low" ? "text-rose-500" :
                                lvl.id === "Medium" ? "text-amber-500" :
                                lvl.id === "High" ? "text-emerald-500" : "text-cyan-455"
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
                  className="glassmorphism-card rounded-xl border border-cyber-border overflow-hidden glow-blue animate-pulse-subtle"
                >
                  {/* Console Top bar */}
                  <div className="bg-cyber-surface px-4 py-3 border-b border-cyber-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 ml-1">sentinel-simulation-daemon.sh</span>
                    </div>
                    <div className="text-[9px] font-mono text-cyber-cyan border border-cyber-cyan/30 px-2 py-0.5 rounded bg-cyber-cyan/5">
                      {simState === "compiling" ? "PREPARING RUNTIME..." : "READY"}
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
                          Streaming environment matrices...
                        </div>
                      )}
                    </div>

                    {simState === "completed" && activeConfig && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 p-4 rounded bg-cyber-surface/60 border border-cyber-border flex flex-col md:flex-row items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-8 h-8 text-cyber-green flex-shrink-0" />
                          <div>
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Attack Simulation Ready</h4>
                            <p className="text-[10px] text-slate-500 mt-1 font-sans">
                              Scenario settings successfully applied. Redirecting to visualization screen.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={resetForm}
                            className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 border border-cyber-border text-[10px] font-mono text-slate-300 uppercase tracking-widest transition-all duration-300 hover:cursor-pointer"
                          >
                            Reset
                          </button>

                          {/* Ready to route to future /attack-viewer page */}
                          <Link
                            href="/attack-viewer"
                            className="px-4 py-2 rounded bg-electric-blue hover:bg-blue-600 text-[10px] font-mono text-white uppercase tracking-widest flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300"
                          >
                            Proceed
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Console footer SSL info */}
                  <div className="bg-cyber-surface/70 px-4 py-2 border-t border-cyber-border text-[9px] font-mono text-slate-650 flex justify-between">
                    <div>COMPILER_NODE: build-srv-77.sentinel.local</div>
                    <div className="text-cyber-green">● AUTH_SSL_ESTABLISHED</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: Scenario Setup Sidebar Summary (4 cols) */}
          <div className="lg:col-span-4">
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-cyber-border pointer-events-none" />

              <div className="border-b border-cyber-border/40 pb-4 mb-6">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                  YOUR SCENARIO
                </span>
                <span className="text-[8px] font-mono text-slate-600 uppercase mt-0.5 block">
                  ACTIVE SPECIFICATION STATE
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
                    <div className="text-slate-500 text-[9px] uppercase">Target</div>
                    <div className="text-white font-bold uppercase mt-0.5">
                      {INDUSTRIES.find(i => i.id === industry)?.name.split(" ").slice(1).join(" ") || industry}
                    </div>
                    {showTechnicalIntel && (
                      <div className="text-cyber-cyan text-[8px] mt-0.5">ID: {INDUSTRIES.find(i => i.id === industry)?.target}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Attacker</div>
                    <div className="text-white font-bold uppercase mt-0.5">
                      {ACTORS.find(a => a.id === actor)?.name.split(" ").slice(1).join(" ") || actor}
                    </div>
                    {showTechnicalIntel && (
                      <div className="text-cyber-cyan text-[8px] mt-0.5">ID: {ACTORS.find(a => a.id === actor)?.techName}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Network className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Attack Type</div>
                    <div className="text-white font-bold uppercase mt-0.5">
                      {ATTACK_TYPES.find(t => t.id === attack)?.name.split(" ").slice(1).join(" ") || attack}
                    </div>
                    {showTechnicalIntel && (
                      <div className="text-cyber-cyan text-[8px] mt-0.5">MITRE ID: {ATTACK_TYPES.find(t => t.id === attack)?.tech}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded border border-cyber-border bg-cyber-surface/40 flex items-center justify-center flex-shrink-0 text-slate-400">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-slate-500 text-[9px] uppercase">Protection Level</div>
                    <div className="text-white font-bold uppercase mt-0.5">
                      {SECURITY_LEVELS.find(l => l.id === security)?.name.split(" ").slice(1).join(" ") || security}
                    </div>
                    {showTechnicalIntel && (
                      <div className="text-cyber-cyan text-[8px] mt-0.5">Rate: {SECURITY_LEVELS.find(l => l.id === security)?.detection}</div>
                    )}
                  </div>
                </div>

              </div>

              {simState === "idle" && (
                <div className="mt-8 border-t border-cyber-border/40 pt-6">
                  {/* Expected Outcome Card */}
                  <div className={`p-4 rounded-lg border ${getExpectedOutcome(security).color} font-sans mb-6`}>
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Expected Outcome</span>
                      <span className="text-[8px] font-mono px-1.5 py-0.5 rounded border border-current font-bold uppercase">
                        {getExpectedOutcome(security).rating}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="text-lg font-bold font-mono text-white">{getExpectedOutcome(security).likelihood}%</div>
                      <div className="flex-grow">
                        <div className="text-[8px] font-mono uppercase text-slate-550">Attack Success Chance</div>
                        <div className="w-full h-1.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full ${getExpectedOutcome(security).barColor}`} 
                            style={{ width: `${getExpectedOutcome(security).likelihood}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                      {getExpectedOutcome(security).prediction}
                    </p>
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full py-3.5 rounded bg-electric-blue hover:bg-blue-650 text-white font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 cursor-pointer border border-electric-blue/40"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    ▶ Run Simulation
                  </button>
                  <p className="text-[8px] text-center text-slate-500 font-mono uppercase tracking-wider mt-3 leading-relaxed">
                    Compiles environment parameters and threat logic.
                  </p>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Retro-futuristic Status Info Bar */}
      <footer className="max-w-7xl mx-auto px-6 w-full text-slate-650 font-mono text-[9px] tracking-wider border-t border-cyber-border/20 pt-6 mt-12 flex justify-between items-center z-10">
        <div>NODE: simulation-studio.sentinel.local</div>
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
          <span>STATUS: SECURE STANDBY</span>
        </div>
      </footer>

    </div>
  );
}
