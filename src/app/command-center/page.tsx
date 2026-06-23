"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Terminal, Activity, ShieldCheck, ShieldAlert,
  Database, RefreshCw, Brain, ChevronRight, Flame
} from "lucide-react";
import {
  getCampaignHistory, StoredCampaign, getActorName,
  getAttackName
} from "../../components/campaignStore";
import AnimatedCounter from "../../components/AnimatedCounter";

export default function CommandCenterPage() {
  const [history, setHistory] = useState<StoredCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<StoredCampaign | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "blocked" | "successful">("all");
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setHistory(getCampaignHistory());
    }, 0);

    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setCurrentTime(timeStr);
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const refreshHistory = () => {
    setHistory(getCampaignHistory());
  };

  // Calculations
  const totalSimulations = history.length;
  const criticalThreats = history.filter(c => c.riskScore >= 70).length;
  const blockedAttacks = history.filter(c => c.status === "Blocked").length;
  const successfulAttacks = history.filter(c => c.status === "Successful").length;

  const avgRisk = totalSimulations > 0
    ? Math.round(history.reduce((acc, curr) => acc + curr.riskScore, 0) / totalSimulations)
    : 0;

  // Security Posture Score: 100 - average risk
  const securityScore = Math.max(0, Math.min(100, 100 - avgRisk));

  // Security status label
  const getSecurityStatus = (score: number) => {
    if (score >= 75) return { label: "DEFENSE OPTIMAL", color: "text-cyber-green", border: "border-cyber-green/30", bg: "bg-cyber-green/5" };
    if (score >= 45) return { label: "DEGRADED STATE", color: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/5" };
    return { label: "COMPROMISE RISK", color: "text-cyber-red", border: "border-cyber-red/30", bg: "bg-cyber-red/5" };
  };

  const statusInfo = getSecurityStatus(securityScore);

  // MITRE ATT&CK Coverage
  // List of techniques to show
  const mitreTechniquesList = [
    { code: "T1566.002", name: "Spearphishing Link", category: "Initial Access", typeId: "Phishing" },
    { code: "T1486", name: "Data Encrypted", category: "Impact / Ransomware", typeId: "Ransomware" },
    { code: "T1498", name: "Volumetric Exhaustion", category: "Impact / DDoS", typeId: "DDoS" },
    { code: "T1195.002", name: "Dependency Poisoning", category: "Initial Access / Supply Chain", typeId: "Supply Chain" },
    { code: "T1190", name: "Blind SQL Injection", category: "Initial Access / SQLi", typeId: "SQL Injection" },
  ];

  // Calculate dynamic coverage per technique
  const techniqueCoverage = mitreTechniquesList.map(tech => {
    const matchingCampaigns = history.filter(c => c.attackType === tech.typeId);
    let coverage = 50; // base fallback

    if (matchingCampaigns.length > 0) {
      const blocked = matchingCampaigns.filter(c => c.status === "Blocked").length;
      coverage = Math.round((blocked / matchingCampaigns.length) * 100);
    } else {
      // Mock defaults if no emulations yet
      if (tech.typeId === "Phishing") coverage = 66;
      if (tech.typeId === "Ransomware") coverage = 33;
      if (tech.typeId === "DDoS") coverage = 50;
      if (tech.typeId === "Supply Chain") coverage = 40;
      if (tech.typeId === "SQL Injection") coverage = 80;
    }

    return {
      ...tech,
      coverage
    };
  });

  // Threat Heatmap: count attacks per industry
  const industries = ["Banking", "Healthcare", "Government", "University", "Startup"];
  const industryCounts = industries.map(ind => {
    const count = history.filter(c => c.industry === ind).length;
    return { name: ind, count };
  });
  const maxIndustryCount = Math.max(...industryCounts.map(i => i.count), 1);

  // Security Recommendations
  const getDynamicRecommendations = () => {
    const recs = [];
    const successfulPhishing = history.some(c => c.attackType === "Phishing" && c.status === "Successful");
    const successfulRansomware = history.some(c => c.attackType === "Ransomware" && c.status === "Successful");
    const successfulSQLi = history.some(c => c.attackType === "SQL Injection" && c.status === "Successful");
    const successfulDDoS = history.some(c => c.attackType === "DDoS" && c.status === "Successful");
    const successfulSupplyChain = history.some(c => c.attackType === "Supply Chain" && c.status === "Successful");

    if (successfulPhishing) {
      recs.push({
        id: "REC-PHISH",
        title: "Require Multi-Factor Authentication (MFA)",
        description: "Simulations show that attackers bypassed password security. Enforcing physical security keys or authenticator apps blocks 99% of phishing and password-theft attempts.",
        severity: "critical",
      });
    }
    if (successfulRansomware) {
      recs.push({
        id: "REC-RANSOM",
        title: "Secure Off-site Backup Vaults",
        description: "Attackers successfully encrypted data and systems. Creating secure, read-only backups that are physically separated from the network prevents ransom leverage and enables quick recovery.",
        severity: "critical",
      });
    }
    if (successfulSQLi) {
      recs.push({
        id: "REC-SQLI",
        title: "Deploy a Web Application Firewall (WAF)",
        description: "Database vulnerabilities allowed attackers to run unauthorized queries. Setting up a firewall prevents malicious database commands from reaching your servers.",
        severity: "high",
      });
    }
    if (successfulDDoS) {
      recs.push({
        id: "REC-DDOS",
        title: "Enable Traffic Limiters & CDN Caching",
        description: "Simulated traffic overloads crashed the network. Restricting how many requests a user can make at once keeps your website accessible during high-traffic surges.",
        severity: "medium",
      });
    }
    if (successfulSupplyChain) {
      recs.push({
        id: "REC-SUPPLY",
        title: "Scan Third-Party Software Packages",
        description: "Attackers injected malicious code into standard developer dependencies. Scanning and verifying third-party packages before installing them ensures no backdoors are introduced.",
        severity: "high",
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: "REC-OK",
        title: "Regular Cybersecurity Audits",
        description: "All simulations were successfully defended! Keep running regular test attacks and update software regularly to maintain this strong posture.",
        severity: "low",
      });
    }

    return recs;
  };

  const recommendations = getDynamicRecommendations();

  // Filtered History
  const filteredHistory = history.filter(c => {
    if (activeTab === "blocked") return c.status === "Blocked";
    if (activeTab === "successful") return c.status === "Successful";
    return true;
  });

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-cyber-bg text-slate-100 selection:bg-electric-blue/30 selection:text-white">
      {/* Background Decors */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid-fine opacity-50 pointer-events-none z-0" />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10" />
      <div className="fixed inset-0 pointer-events-none z-50 animate-scanline bg-gradient-to-b from-transparent via-cyber-cyan/[0.012] to-transparent h-16 w-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 relative z-10 w-full flex-grow pt-8 pb-12"
      >
        {/* Navigation back and telemetry stats */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <Link
            href="/simulate"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 hover:text-white uppercase transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Simulation Builder
          </Link>

          <div className="flex items-center gap-4 text-[10px] font-mono tracking-wider text-slate-400">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyber-border bg-black/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
              </span>
              SYS MONITOR ACTIVE
            </span>
            <span className="text-cyber-cyan">{currentTime || "00:00:00"} UTC</span>
          </div>
        </div>

        {/* Top Human-Readable Explanation */}
        <div className="mb-8 p-5 rounded bg-cyber-surface/60 border border-cyber-border/80 text-xs text-slate-300 leading-relaxed max-w-4xl relative overflow-hidden space-y-3">
          <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
          <div>
            <strong className="text-white block mb-0.5">Welcome to Mission Control</strong>
            This panel aggregates data from all attack simulations run on SENTINEL. It acts as an educational dashboard designed to show how different defense strategies stand up to simulated hackers in real time.
          </div>
          <div>
            <strong className="text-white block mb-0.5">How this helps you</strong>
            Whether you are a student, recruiter, or professor, you can instantly see which threat types (like Phishing or Ransomware) successfully penetrated our systems and which defense levels (from Basic to Enterprise) stopped them.
          </div>
          <div>
            <strong className="text-white block mb-0.5">Key Insights to Gain</strong>
            Monitor the overall Security Health Score, inspect plain-English story cards for completed simulations, and apply dynamically recommended security improvements.
          </div>
        </div>

        {/* Dashboard Title Header */}
        <div className="mb-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-4">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
            Cybersecurity Mission Control: mission-control.exe
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
            Cybersecurity Mission Control
          </h1>
          <p className="text-sm text-slate-400 mt-2 font-mono">
            See how your simulated organization performs against cyberattacks and track your overall learning progress.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="space-y-8">
          {/* Row 1: Security Posture & Threat Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Posture Card (4 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-4 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/35 to-transparent" />

              <div className="w-full text-left">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-2">
                  [01] SECURITY HEALTH SCORE
                </span>
              </div>

              {/* Animated circular gauge */}
              <div className="relative my-6 flex items-center justify-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    className="stroke-slate-900"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke={securityScore >= 75 ? "#10b981" : securityScore >= 45 ? "#f59e0b" : "#f43f5e"}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 68}
                    initial={{ strokeDashoffset: 2 * Math.PI * 68 }}
                    animate={{ strokeDashoffset: (2 * Math.PI * 68) * (1 - securityScore / 100) }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-extrabold font-mono text-white"
                  >
                    {securityScore}%
                  </motion.span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-1">
                    SECURITY INDEX
                  </span>
                </div>
              </div>

              <div className="w-full mt-2">
                <div className={`py-1.5 px-3 rounded border text-xs font-mono font-bold tracking-widest uppercase inline-block ${statusInfo.color} ${statusInfo.border} ${statusInfo.bg}`}>
                  {statusInfo.label}
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-3 leading-relaxed text-left">
                  <strong>Security Health Score</strong>: The percentage of simulated attacks that were successfully blocked. A higher score means a more secure network.
                </p>
              </div>
            </motion.div>

            {/* Statistics Cards (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
                className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Total Simulations Completed
                    </span>
                    <h3 className="text-4xl font-extrabold font-mono text-white mt-2">
                      <AnimatedCounter value={totalSimulations} />
                    </h3>
                  </div>
                  <div className="p-3 bg-slate-950 border border-cyber-border rounded text-cyber-cyan">
                    <Activity className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-4 border-t border-cyber-border/40 pt-4 leading-relaxed">
                  The total number of cybersecurity simulations launched to test our systems.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      High Threat Scenarios Checked
                    </span>
                    <h3 className="text-4xl font-extrabold font-mono text-cyber-red mt-2">
                      <AnimatedCounter value={criticalThreats} />
                    </h3>
                  </div>
                  <div className="p-3 bg-slate-950 border border-cyber-border rounded text-cyber-red">
                    <Flame className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-4 border-t border-cyber-border/40 pt-4 leading-relaxed">
                  Simulations where the attack was highly dangerous due to the combination of threat severity and vulnerability.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Defended Attacks
                    </span>
                    <h3 className="text-4xl font-extrabold font-mono text-cyber-green mt-2">
                      <AnimatedCounter value={blockedAttacks} />
                    </h3>
                  </div>
                  <div className="p-3 bg-slate-950 border border-cyber-border rounded text-cyber-green">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-4 border-t border-cyber-border/40 pt-4 leading-relaxed">
                  Attacks where our security systems successfully detected and stopped the intruder before they could reach critical data.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                      Bypassed Attacks
                    </span>
                    <h3 className="text-4xl font-extrabold font-mono text-cyber-red mt-2">
                      <AnimatedCounter value={successfulAttacks} />
                    </h3>
                  </div>
                  <div className="p-3 bg-slate-950 border border-cyber-border rounded text-cyber-red">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-sans mt-4 border-t border-cyber-border/40 pt-4 leading-relaxed">
                  Attacks that managed to break through our defenses. These reveal key security weaknesses that need to be fixed.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Row 2: Campaign History Narrative Cards & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Campaign History Cards (8 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="lg:col-span-8 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-cyber-border/40 pb-4 mb-6">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                    [04] SIMULATION HISTORY & OUTCOMES
                  </span>

                  {/* Filters */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1 border border-cyber-border rounded text-[9px] font-mono">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${activeTab === "all" ? "bg-electric-blue text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      ALL
                    </button>
                    <button
                      onClick={() => setActiveTab("blocked")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${activeTab === "blocked" ? "bg-cyber-green text-black font-bold" : "text-slate-400 hover:text-white"}`}
                    >
                      DEFENDED
                    </button>
                    <button
                      onClick={() => setActiveTab("successful")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${activeTab === "successful" ? "bg-cyber-red text-white" : "text-slate-400 hover:text-white"}`}
                    >
                      BYPASSED
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {filteredHistory.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 uppercase font-mono text-[10px]">
                      No simulations recorded matching filter parameters.
                    </div>
                  ) : (
                    filteredHistory.map((camp) => {
                      const isBlocked = camp.status === "Blocked";
                      const dateStr = new Date(camp.timestamp).toLocaleDateString();
                      const timeStr = new Date(camp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div
                          key={camp.id}
                          onClick={() => setSelectedCampaign(camp)}
                          className="group border border-cyber-border hover:border-cyber-cyan/50 bg-black/35 hover:bg-slate-900/40 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-start md:items-center gap-3">
                            <span className="text-lg mt-0.5 md:mt-0 select-none">
                              {isBlocked ? "🟢" : "🔴"}
                            </span>
                            <div>
                              <p className="text-xs text-white font-medium leading-relaxed">
                                <span className="font-bold text-cyber-cyan group-hover:underline font-mono">
                                  {camp.id}
                                </span>{" "}
                                — {getActorName(camp.threatActor)} targeted the{" "}
                                <span className="font-semibold text-slate-200 uppercase">{camp.industry}</span> sector using a{" "}
                                <span className="font-semibold text-slate-200 uppercase">{getAttackName(camp.attackType)}</span> attempt.
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500 font-mono flex-wrap">
                                <span>{dateStr} {timeStr}</span>
                                <span>•</span>
                                <span>Defense Level: <span className="text-slate-400 font-bold uppercase">{camp.securityLevel}</span></span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 justify-between md:justify-end border-t md:border-t-0 border-cyber-border/20 pt-2 md:pt-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] text-slate-500 font-mono uppercase">Risk Score:</span>
                              <span className={`font-bold font-mono text-xs ${camp.riskScore >= 70 ? "text-cyber-red" : camp.riskScore >= 45 ? "text-amber-500" : "text-cyber-green"}`}>
                                {camp.riskScore}%
                              </span>
                            </div>
                            <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase ${isBlocked
                              ? "border-cyber-green/30 bg-cyber-green/10 text-cyber-green"
                              : "border-cyber-red/30 bg-cyber-red/10 text-cyber-red"
                              }`}>
                              {isBlocked ? "Defended" : "Bypassed"}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-6 pt-4 border-t border-cyber-border/40">
                <span>SELECT A CARD TO VIEW THE ATTACK STORY & PREVENTION STEPS</span>
                <button
                  onClick={refreshHistory}
                  className="flex items-center gap-1 hover:text-white cursor-pointer transition-colors uppercase font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reload Records
                </button>
              </div>
            </motion.div>

            {/* Recommendations Panel (4 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="lg:col-span-4 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-4">
                  [05] CRITICAL DEFENSE RECOMMENDATIONS
                </span>

                <motion.div
                  className="space-y-4 max-h-[480px] overflow-y-auto pr-1"
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {recommendations.map((rec) => {
                    const getRecHeaderStyle = (sev: string) => {
                      if (sev === "critical") return "text-cyber-red border-cyber-red/30 bg-cyber-red/5";
                      if (sev === "high") return "text-amber-500 border-amber-500/30 bg-amber-500/5";
                      return "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5";
                    };

                    return (
                      <motion.div key={rec.id} variants={cardVariants} className="border border-cyber-border bg-black/20 p-4 rounded text-left font-mono">
                        <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                          <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase ${getRecHeaderStyle(rec.severity)}`}>
                            {rec.severity} priority
                          </span>
                          <span className="text-[9px] text-slate-600 font-bold">{rec.id}</span>
                        </div>
                        <h4 className="text-white text-xs font-bold uppercase">{rec.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed font-sans">
                          {rec.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>

              <div className="text-[9px] font-mono text-slate-500 uppercase mt-6 pt-4 border-t border-cyber-border/40">
                DYNAMIC ACTIONS GENERATED FROM SIMULATION RESULTS
              </div>
            </motion.div>
          </div>

          {/* Advanced Analytics Toggle Button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/5 hover:bg-cyber-cyan/15 text-cyber-cyan text-xs font-bold uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
            >
              <span>{showAdvancedAnalytics ? "Hide" : "View"} Advanced Threat & Industry Metrics</span>
              <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${showAdvancedAnalytics ? "rotate-90" : "rotate-0"}`} />
            </button>
          </div>

          {/* Collapsible Advanced Analytics Container */}
          <AnimatePresence>
            {showAdvancedAnalytics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
                  {/* Industry Heatmap (5 cols) */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="lg:col-span-5 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-4">
                        [02] TARGET SECTORS & ATTACK FREQUENCY
                      </span>
                      <p className="text-xs text-slate-400 mb-6 font-mono">
                        Tracks how often different industry sectors were targeted in simulations.
                      </p>

                      <div className="space-y-4">
                        {industryCounts.map((ind) => {
                          const percentage = maxIndustryCount > 0 ? (ind.count / maxIndustryCount) * 100 : 0;

                          const getBarColor = (cnt: number) => {
                            if (cnt >= 3) return "bg-cyber-red";
                            if (cnt >= 1) return "bg-electric-blue";
                            return "bg-slate-800";
                          };

                          const getIntensityLabel = (cnt: number) => {
                            if (cnt >= 3) return "HIGH INTENSITY";
                            if (cnt >= 1) return "TARGETED";
                            return "MONITORED";
                          };

                          const getIntensityColor = (cnt: number) => {
                            if (cnt >= 3) return "text-cyber-red border-cyber-red/20 bg-cyber-red/5";
                            if (cnt >= 1) return "text-electric-blue border-electric-blue/20 bg-electric-blue/5";
                            return "text-slate-500 border-slate-800 bg-slate-950/20";
                          };

                          return (
                            <div key={ind.name} className="space-y-2">
                              <div className="flex justify-between items-center text-[10px] font-mono">
                                <span className="text-white font-bold uppercase">{ind.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-400">{ind.count} {ind.count === 1 ? "Attack" : "Attacks"}</span>
                                  <span className={`px-1 rounded border text-[8px] font-bold ${getIntensityColor(ind.count)}`}>
                                    {getIntensityLabel(ind.count)}
                                  </span>
                                </div>
                              </div>
                              <div className="h-2 bg-slate-950 border border-cyber-border rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 0.8, ease: "easeOut" }}
                                  className={`h-full ${getBarColor(ind.count)}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[9px] font-mono text-slate-500 uppercase mt-6 pt-4 border-t border-cyber-border/40">
                      ACTIVE FOCUS: DATABASE DIGITAL TWIN HOST TELEMETRY
                    </div>
                  </motion.div>

                  {/* MITRE ATT&CK Coverage (7 cols) */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-7 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-4">
                        [03] DEFENSIVE READINESS BREAKDOWN
                      </span>
                      <p className="text-xs text-slate-400 mb-6 font-mono">
                        The success rate of our defensive configurations against specific attack types.
                      </p>

                      <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                      >
                        {techniqueCoverage.map((tech) => {
                          const getCoverageBadge = (cov: number) => {
                            if (cov >= 75) return { text: "MITIGATED", style: "text-cyber-green border-cyber-green/30 bg-cyber-green/5" };
                            if (cov >= 35) return { text: "MONITORED", style: "text-amber-500 border-amber-500/30 bg-amber-500/5" };
                            return { text: "VULNERABLE", style: "text-cyber-red border-cyber-red/30 bg-cyber-red/5" };
                          };

                          const badge = getCoverageBadge(tech.coverage);

                          return (
                            <motion.div key={tech.code} variants={cardVariants} className="bg-black/35 p-3 rounded border border-cyber-border flex flex-col justify-between text-left font-mono">
                              <div>
                                <div className="flex justify-between items-start">
                                  <span className="text-cyber-cyan text-[10px] font-bold">{tech.code}</span>
                                  <span className={`px-1.5 py-0.5 rounded border text-[8px] font-bold ${badge.style}`}>
                                    {badge.text}
                                  </span>
                                </div>
                                <h4 className="text-white text-xs font-bold mt-2 uppercase truncate">{tech.name}</h4>
                                <span className="text-slate-500 text-[8px] uppercase tracking-wider block mt-1">{tech.category}</span>
                              </div>

                              <div className="mt-4 space-y-1">
                                <div className="flex justify-between text-[9px] text-slate-400">
                                  <span>Defensive Coverage</span>
                                  <span>{tech.coverage}%</span>
                                </div>
                                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${tech.coverage >= 75
                                      ? "bg-cyber-green"
                                      : tech.coverage >= 35
                                        ? "bg-amber-500"
                                        : "bg-cyber-red"
                                      }`}
                                    style={{ width: `${tech.coverage}%` }}
                                  />
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>

                    <div className="text-[10px] text-slate-400 font-sans mt-6 pt-4 border-t border-cyber-border/40 leading-relaxed text-left">
                      <strong>Attack Coverage</strong>: Measures defensive readiness against specific attack patterns mapped to the MITRE ATT&CK framework. It shows the percentage of simulations blocked for each attack type.
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Side Slide-Over Drawer for Campaign Details & Analysis */}
      <AnimatePresence>
        {selectedCampaign && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCampaign(null)}
              className="fixed inset-0 bg-black z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-lg bg-cyber-surface border-l border-cyber-border shadow-2xl z-50 overflow-y-auto p-6 font-mono"
            >
              <div className="flex justify-between items-center border-b border-cyber-border pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-cyber-bg border border-cyber-cyan rounded text-cyber-cyan">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm uppercase">Simulation Summary</h3>
                    <span className="text-[9px] text-slate-500 font-bold uppercase">{selectedCampaign.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs uppercase"
                >
                  [ Close ]
                </button>
              </div>

              <div className="space-y-6">
                {/* Meta summary */}
                <div className="grid grid-cols-2 gap-4 text-[10px]">
                  <div className="bg-black/40 p-3 rounded border border-cyber-border">
                    <div className="text-slate-500 uppercase">Target Environment</div>
                    <div className="text-white font-bold mt-1 uppercase">{selectedCampaign.industry}</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded border border-cyber-border">
                    <div className="text-slate-500 uppercase">Attacker Profile</div>
                    <div className="text-white font-bold mt-1 uppercase">{getActorName(selectedCampaign.threatActor)}</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded border border-cyber-border">
                    <div className="text-slate-500 uppercase">Attack Scenario</div>
                    <div className="text-white font-bold mt-1 uppercase">{getAttackName(selectedCampaign.attackType)}</div>
                  </div>
                  <div className="bg-black/40 p-3 rounded border border-cyber-border">
                    <div className="text-slate-500 uppercase">Security Strength</div>
                    <div className="text-white font-bold mt-1 uppercase">{selectedCampaign.securityLevel}</div>
                  </div>
                </div>

                {/* Score meters */}
                <div className="space-y-3 bg-black/25 p-4 rounded border border-cyber-border">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Simulation Risk Score</span>
                    <span className={`font-bold ${selectedCampaign.riskScore >= 70 ? "text-cyber-red" : selectedCampaign.riskScore >= 45 ? "text-amber-500" : "text-cyber-green"}`}>
                      {selectedCampaign.riskScore}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${selectedCampaign.riskScore >= 70
                        ? "bg-cyber-red"
                        : selectedCampaign.riskScore >= 45
                          ? "bg-amber-500"
                          : "bg-cyber-green"
                        }`}
                      style={{ width: `${selectedCampaign.riskScore}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-2">
                    <span className="text-slate-400">Simulation Status</span>
                    <span className={`font-bold ${selectedCampaign.status === "Blocked" ? "text-cyber-green" : "text-cyber-red"}`}>
                      {selectedCampaign.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Simulation movie stages */}
                <div className="space-y-4">
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">
                    [ ATTACK STORY TIMELINE ]
                  </span>
                  <p className="text-[10px] text-slate-400 -mt-2 leading-relaxed">
                    A step-by-step breakdown of how the attack unfolded and where defenses reacted.
                  </p>

                  <div className="border-l border-cyber-border pl-4 space-y-4 ml-2 text-[10px]">
                    {selectedCampaign.stages.map((stage, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot indicator */}
                        <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border ${stage.status === "blocked"
                          ? "bg-cyber-green border-cyber-green"
                          : "bg-cyber-red border-cyber-red"
                          }`} />

                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <span className="text-white font-bold uppercase">{stage.title}</span>
                          <span className={`px-1 rounded text-[8px] font-bold ${stage.status === "blocked"
                            ? "text-cyber-green border border-cyber-green/30 bg-cyber-green/5"
                            : "text-cyber-red border border-cyber-red/30 bg-cyber-red/5"
                            }`}>
                            {stage.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-slate-400 mt-1 text-[9px] leading-relaxed">{stage.description}</p>
                        <div className="bg-black/50 p-2 border border-cyber-border/40 rounded mt-1.5 text-[8px] text-slate-500 font-mono overflow-x-auto whitespace-pre-wrap">
                          {stage.log}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analyze Campaign Gemini Section */}
                <div className="border-t border-cyber-border/50 pt-6">
                  <div className="flex items-center gap-2 text-cyber-cyan text-[10px] uppercase font-bold mb-3">
                    <Brain className="w-3.5 h-3.5" />
                    Gemini AI Prevention Guide
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed mb-4 font-sans">
                    Generate a plain-English explanation of this attack and receive a step-by-step prevention guide using Gemini AI.
                  </p>

                  <Link
                    href={`/ai-analyst?campaignId=${selectedCampaign.id}`}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded border border-cyber-cyan bg-cyber-cyan/15 hover:bg-cyber-cyan/25 text-cyber-cyan text-xs font-bold uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] text-center cursor-pointer"
                  >
                    <Brain className="w-4 h-4 text-cyber-cyan animate-pulse" />
                    Generate AI Prevention Guide (Gemini)
                  </Link>
                  <span className="text-[8px] text-cyber-green text-center block mt-2 font-semibold">
                    AI ANALYSIS READY - CLICK TO VIEW GUIDE
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative bg-black border-t border-cyber-border/40 py-10 z-10 overflow-hidden mt-12">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 font-mono text-[9px] tracking-wider uppercase">
          <div>
            <span className="text-white font-bold tracking-[0.2em]">SENTINEL PLATFORM COMMAND</span>
            <span className="ml-2">© {new Date().getFullYear()} SENTINEL Cyber Inc.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span>SECURE CONSOLE LINK STATUS: OPERATIONAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
