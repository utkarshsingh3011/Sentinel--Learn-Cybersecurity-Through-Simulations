"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Terminal, Activity, ShieldCheck, ShieldAlert,
  Database, RefreshCw, Brain, ChevronRight, Flame, Lock
} from "lucide-react";
import {
  getCampaignHistory, StoredCampaign, getActorName,
  getAttackName, getIndustryName
} from "../../components/campaignStore";
import AnimatedCounter from "../../components/AnimatedCounter";
import JourneyStepper from "../../components/JourneyStepper";
import Footer from "../../components/Footer";

function SecurityTipCard({ title, desc }: { title: string; desc: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="glassmorphism-card rounded-xl p-4 border border-cyber-border bg-black/20 hover:bg-black/40 transition-all duration-300 relative overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <span className="text-cyber-green font-bold">✓</span>
        <span className="text-white text-xs font-mono font-bold uppercase">{title}</span>
      </div>
      <motion.div
        initial={{ height: 0, opacity: 0, marginTop: 0 }}
        animate={{
          height: isHovered ? "auto" : 0,
          opacity: isHovered ? 1 : 0,
          marginTop: isHovered ? 8 : 0
        }}
        transition={{ duration: 0.25 }}
        className="overflow-hidden"
      >
        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
          {desc}
        </p>
      </motion.div>
    </div>
  );
}

export default function CommandCenterPage() {
  const [history, setHistory] = useState<StoredCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<StoredCampaign | null>(null);
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "blocked" | "successful">("all");
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const maxUnlocked = parseInt(sessionStorage.getItem("sentinel_max_unlocked_step") || "1", 10);
      if (maxUnlocked < 4) {
        setIsLocked(true);
      }
    }
  }, []);

  useEffect(() => {
    setHistory(getCampaignHistory());

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

  // Helper functions for learning insights
  const getMostExploredAttack = () => {
    if (history.length === 0) return "None yet";
    const counts: Record<string, number> = {};
    history.forEach(c => {
      counts[c.attackType] = (counts[c.attackType] || 0) + 1;
    });
    let maxType = "";
    let maxCount = -1;
    Object.entries(counts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxType = type;
      }
    });
    return getAttackName(maxType);
  };

  const getStrongestDefense = () => {
    if (history.length === 0) return "None simulated yet";
    const levelMap: Record<string, number> = { "Basic": 1, "Standard": 2, "High": 3, "Enterprise": 4 };
    let maxLevelVal = 0;
    let maxLevelName = "None";
    history.forEach(c => {
      const val = levelMap[c.securityLevel] || 0;
      if (val > maxLevelVal) {
        maxLevelVal = val;
        maxLevelName = c.securityLevel;
      }
    });
    return `${maxLevelName} Protection`;
  };

  const getBiggestWeakness = () => {
    if (history.length === 0) return "None yet";
    const totals: Record<string, number> = {};
    const blocked: Record<string, number> = {};
    history.forEach(c => {
      totals[c.attackType] = (totals[c.attackType] || 0) + 1;
      if (c.status === "Blocked") {
        blocked[c.attackType] = (blocked[c.attackType] || 0) + 1;
      } else {
        blocked[c.attackType] = blocked[c.attackType] || 0;
      }
    });

    let minRate = 1.1;
    let minType = "";
    Object.entries(totals).forEach(([type, total]) => {
      const rate = blocked[type] / total;
      if (rate < minRate) {
        minRate = rate;
        minType = type;
      }
    });
    return minType ? `${getAttackName(minType)} (${Math.round(minRate * 100)}% Defended)` : "None yet";
  };

  const getRecommendedNextScenario = () => {
    const allTypes = ["Phishing", "Ransomware", "DDoS", "SQL Injection", "Supply Chain"];
    const simulatedTypes = new Set(history.map(c => c.attackType));
    
    // Check for unsimulated first
    for (const type of allTypes) {
      if (!simulatedTypes.has(type)) {
        return `Simulate ${getAttackName(type)}`;
      }
    }
    
    // Otherwise return the lowest success rate type
    const totals: Record<string, number> = {};
    const blocked: Record<string, number> = {};
    history.forEach(c => {
      totals[c.attackType] = (totals[c.attackType] || 0) + 1;
      if (c.status === "Blocked") {
        blocked[c.attackType] = (blocked[c.attackType] || 0) + 1;
      } else {
        blocked[c.attackType] = blocked[c.attackType] || 0;
      }
    });

    let minRate = 1.1;
    let minType = "Phishing";
    Object.entries(totals).forEach(([type, total]) => {
      const rate = blocked[type] / total;
      if (rate < minRate) {
        minRate = rate;
        minType = type;
      }
    });
    return `Test defenses against ${getAttackName(minType)}`;
  };

  const getDefenderRank = (blockedCount: number) => {
    if (blockedCount < 2) {
      return {
        rankName: "Beginner Defender",
        badgeColor: "text-cyber-green border-cyber-green/30 bg-cyber-green/5",
        nextRank: "Intermediate Defender",
        needed: 2 - blockedCount,
        percent: Math.min(100, Math.round((blockedCount / 2) * 100))
      };
    } else if (blockedCount < 5) {
      return {
        rankName: "Intermediate Defender",
        badgeColor: "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5",
        nextRank: "Advanced Guardian",
        needed: 5 - blockedCount,
        percent: Math.min(100, Math.round(((blockedCount - 2) / 3) * 100))
      };
    } else {
      return {
        rankName: "Advanced Guardian",
        badgeColor: "text-purple-400 border-purple-500/30 bg-purple-500/5",
        nextRank: "Elite Security Specialist",
        needed: 10 - blockedCount,
        percent: Math.min(100, Math.round((blockedCount / 10) * 100))
      };
    }
  };
 
  const getAchievements = (blockedCount: number, successfulCount: number) => {
    const simulatedTypes = new Set(history.map(c => c.attackType));
    const hasHighRiskBlocked = history.some(c => c.status === "Blocked" && c.riskScore >= 70);
    
    return [
      { id: "ACH-1", icon: "🏆", title: "First Simulation", desc: "Launched your first simulation.", unlocked: history.length > 0 },
      { id: "ACH-2", icon: "🛡️", title: "First Successful Defense", desc: "Blocked a threat actor from breaching.", unlocked: blockedCount > 0 },
      { id: "ACH-3", icon: "🔥", title: "Five Simulations Completed", desc: "Built and ran five scenarios.", unlocked: history.length >= 5 },
      { id: "ACH-4", icon: "⚡", title: "Defended High-Risk Attack", desc: "Contained an attack with a risk >= 70%.", unlocked: hasHighRiskBlocked },
      { id: "ACH-5", icon: "🎯", title: "Perfect Defense", desc: "Zero successful breaches on history.", unlocked: history.length > 0 && successfulCount === 0 },
      { id: "ACH-6", icon: "🧠", title: "Learned All Attack Types", desc: "Tested all five threat vectors.", unlocked: simulatedTypes.size >= 5 }
    ];
  };
 
  const generateActivityHeatmap = () => {
    const days = 112; // 16 weeks
    const result = [];
    const now = new Date();
    
    const counts: Record<string, number> = {};
    history.forEach(c => {
      const dStr = new Date(c.timestamp).toDateString();
      counts[dStr] = (counts[dStr] || 0) + 1;
    });
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dStr = d.toDateString();
      const count = counts[dStr] || 0;
      result.push({
        dateStr: dStr,
        dateLabel: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        count
      });
    }
    
    return result;
  };
 
  const getTimelineSteps = () => {
    const count = history.length;
    return [
      { sim: "Simulation 1", concept: "Learned Phishing", active: count >= 1 },
      { sim: "Simulation 2", concept: "Learned SQL Injection", active: count >= 2 },
      { sim: "Simulation 3", concept: "Learned Ransomware", active: count >= 3 },
      { sim: "Simulation 4", concept: "Learned Insider Threat", active: count >= 4 }
    ];
  };

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
    if (activeTab === "blocked" && c.status !== "Blocked") return false;
    if (activeTab === "successful" && c.status !== "Successful") return false;

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchActor = getActorName(c.threatActor).toLowerCase().includes(q);
      const matchAttack = getAttackName(c.attackType).toLowerCase().includes(q);
      const matchIndustry = c.industry.toLowerCase().includes(q) || getIndustryName(c.industry).toLowerCase().includes(q);
      const matchId = c.id.toLowerCase().includes(q);
      return matchActor || matchAttack || matchIndustry || matchId;
    }

    return true;
  });

  const displayedHistory = searchQuery.trim() !== "" ? filteredHistory : filteredHistory.slice(0, 5);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (isLocked) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden bg-cyber-bg text-slate-100">
        {/* Background Decors */}
        <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
        <div className="absolute inset-0 cyber-grid-fine opacity-50 pointer-events-none z-0" />
        <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg mx-auto px-6 text-center"
        >
          {/* Lock icon glow */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full border border-cyber-red/40 bg-cyber-red/10 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.2)]">
              <Lock className="w-8 h-8 text-cyber-red" />
            </div>
          </div>

          <span className="text-[10px] font-mono text-cyber-red uppercase tracking-widest block font-bold mb-3">
            [ STEP 3 INCOMPLETE ]
          </span>

          <h1 className="text-2xl font-extrabold text-white uppercase tracking-tight font-sans mb-3">
            Complete the AI Analyst First
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed font-sans mb-8 max-w-md mx-auto">
            The <strong className="text-white">Key Lessons Learning Journal</strong> is unlocked after you complete the <strong className="text-white">Understand What Happened</strong> step. This ensures you understand the attack before reviewing your learning progress.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 font-mono">
            <Link
              href="/ai-analyst"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-cyber-red hover:bg-cyber-red/90 text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] cursor-pointer"
            >
              Go to AI Analyst →
            </Link>
            <Link
              href="/attack-viewer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-600 text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
            >
              ← Back to Attack Viewer
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
              YOUR PROGRESS
            </span>
          </div>
        </div>

        <JourneyStepper currentStep={4} />
 
        {/* Hero Section */}
        <div className="mb-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-3">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
            Your Cybersecurity Journey
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase font-sans">
            Your Cybersecurity Journey
          </h1>
        </div>
 
        {/* 4 Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/20"
          >
            <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold">✓ Simulations Completed</span>
            <div className="text-3xl font-extrabold font-mono text-white mt-2 flex items-baseline gap-1.5">
              <AnimatedCounter value={totalSimulations} />
            </div>
          </motion.div>
 
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/20"
          >
            <span className="text-[9px] font-mono text-slate-555 uppercase tracking-widest block font-bold">✓ Defended Attacks</span>
            <div className="text-3xl font-extrabold font-mono text-cyber-green mt-2 flex items-baseline gap-1.5">
              <AnimatedCounter value={blockedAttacks} />
            </div>
          </motion.div>
 
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/20"
          >
            <span className="text-[9px] font-mono text-slate-555 uppercase tracking-widest block font-bold">✓ Learning Score</span>
            <div className="text-3xl font-extrabold font-mono text-cyber-cyan mt-2 flex items-baseline gap-1.5">
              <AnimatedCounter value={securityScore} />%
            </div>
          </motion.div>
 
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/20"
          >
            <span className="text-[9px] font-mono text-slate-555 uppercase tracking-widest block font-bold">✓ Next Challenge</span>
            <div className="text-3xl font-extrabold font-mono text-purple-400 mt-2 flex items-baseline gap-1.5">
              Level <AnimatedCounter value={history.some(c => c.attackType === "SQL Injection") ? 4 : 3} />
            </div>
          </motion.div>
        </div>
 
        <div className="space-y-8">
          {/* Row 1: Achievement Rank & Skills badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Learning Progress Achievement Card (5 cols) */}
            {(() => {
              const rank = getDefenderRank(blockedAttacks);
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-5 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/35 to-transparent" />
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-4">
                      Learning Progress
                    </span>
                    <div className={`py-1.5 px-3 rounded border text-xs font-mono font-bold tracking-widest uppercase inline-block ${rank.badgeColor}`}>
                      🟢 {rank.rankName}
                    </div>
                    <div className="text-4xl font-extrabold font-mono text-white mt-4">{securityScore}%</div>
                    <p className="text-[11px] text-slate-400 mt-3 font-sans leading-relaxed">
                      Only {rank.needed} more successful simulation{rank.needed === 1 ? "" : "s"} until {rank.nextRank}.
                    </p>
                  </div>
                  <div className="w-full mt-4">
                    <div className="h-1.5 bg-slate-900 border border-cyber-border/40 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rank.percent}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-cyber-green"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })()}
 
            {/* Skills You've Practiced (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold mb-4">
                  Skills You've Practiced
                </span>
                <p className="text-[11px] text-slate-400 mb-6 font-sans leading-relaxed">
                  Colored badges show skills you have run in simulation. Grey badges represent unpracticed areas.
                </p>
                
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { id: "Phishing", label: "Phishing", check: () => history.some(c => c.attackType === "Phishing") },
                    { id: "SQLi", label: "SQL Injection", check: () => history.some(c => c.attackType === "SQL Injection") },
                    { id: "DDoS", label: "DDoS", check: () => history.some(c => c.attackType === "DDoS") },
                    { id: "Malware", label: "Malware", check: () => history.some(c => c.attackType === "Ransomware") },
                    { id: "CredTheft", label: "Credential Theft", check: () => history.some(c => c.attackType === "Phishing" || c.attackType === "Ransomware") },
                    { id: "Insider", label: "Insider Threat", check: () => history.some(c => c.attackType === "Supply Chain") },
                  ].map((skill) => {
                    const completed = skill.check();
                    return (
                      <div
                        key={skill.id}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold tracking-wider uppercase transition-all duration-300 ${
                          completed
                            ? "border-cyber-cyan/45 bg-cyber-cyan/10 text-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                            : "border-slate-800/80 bg-slate-950/40 text-slate-500"
                        }`}
                      >
                        {completed ? "✓ " : "○ "}
                        {skill.label}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="text-[9px] font-mono text-slate-550 uppercase mt-4">
                PRACTICAL APPLICATION CHECKS
              </div>
            </motion.div>
          </div>
 
          {/* Row 2: Timeline & Achievements */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Learning Timeline (6 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-6 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold mb-4">
                  Learning Timeline
                </span>
                <p className="text-[11px] text-slate-400 mb-6 font-sans leading-relaxed">
                  Your visual roadmap showing concepts practiced in chronological order.
                </p>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative py-2">
                  {getTimelineSteps().map((step, idx, arr) => (
                    <React.Fragment key={idx}>
                      <div className={`flex flex-col items-center text-center ${step.active ? "opacity-100" : "opacity-35"}`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-colors duration-300 ${
                          step.active ? "border-cyber-cyan bg-cyber-cyan/15 text-cyber-cyan" : "border-slate-800 bg-slate-950 text-slate-655"
                        }`}>
                          {idx + 1}
                        </div>
                        <span className="text-white text-[9px] font-bold mt-2 font-mono uppercase">{step.sim}</span>
                        <span className="text-[9px] text-cyber-cyan font-mono uppercase mt-0.5">{step.concept.split(" ")[1]}</span>
                      </div>
                      {idx < arr.length - 1 && (
                        <div className="flex-1 h-[2px] bg-slate-800 min-w-[20px] hidden md:block relative">
                          <div className={`absolute inset-y-0 left-0 transition-all duration-500 bg-cyber-cyan ${
                            step.active && arr[idx+1].active ? "w-full" : "w-0"
                          }`} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </motion.div>
 
            {/* Achievements Grid (6 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-6 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold mb-4">
                  Achievements
                </span>
                <div className="grid grid-cols-2 gap-4">
                  {getAchievements(blockedAttacks, successfulAttacks).map((ach) => (
                    <div
                      key={ach.id}
                      className={`p-3 rounded-lg border font-sans transition-all duration-300 flex items-center gap-2.5 ${
                        ach.unlocked
                          ? "border-cyber-cyan/35 bg-cyber-cyan/5 text-slate-200"
                          : "border-slate-800/80 bg-slate-950/30 text-slate-500 opacity-50"
                      }`}
                    >
                      <span className="text-xl select-none">{ach.icon}</span>
                      <div className="text-left">
                        <h4 className="text-[10px] font-bold uppercase font-mono leading-tight">{ach.title}</h4>
                        <p className="text-[8.5px] text-slate-400 mt-0.5 leading-normal">{ach.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
 
          {/* Row 3: Activity & Recommended Next Challenge */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Weekly Learning Activity (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold mb-4">
                  Weekly Learning Activity
                </span>
                <p className="text-[11px] text-slate-400 mb-6 font-sans leading-relaxed">
                  Brighter squares represent days with more simulations executed.
                </p>
                
                {(() => {
                  const heatmapData = generateActivityHeatmap();
                  const weeks = [];
                  for (let i = 0; i < 16; i++) {
                    weeks.push(heatmapData.slice(i * 7, (i + 1) * 7));
                  }
                  return (
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                      {weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-1.5">
                          {week.map((day, dIdx) => {
                            const intensity = day.count === 0 ? "bg-slate-900/60 border-cyber-border/20"
                                            : day.count === 1 ? "bg-cyber-cyan/20 border-cyber-cyan/30"
                                            : day.count === 2 ? "bg-cyber-cyan/50 border-cyber-cyan/50 shadow-[0_0_8px_rgba(6,182,212,0.25)]"
                                            : "bg-cyber-cyan border-white shadow-[0_0_12px_rgba(6,182,212,0.4)]";
                            return (
                              <div
                                key={dIdx}
                                className={`w-3 h-3 rounded-sm border ${intensity} transition-all duration-300`}
                                title={`${day.dateLabel}: ${day.count} simulations`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-4">
                <span>LAST 16 WEEKS ACTIVITY GRAPH</span>
                <div className="flex items-center gap-1">
                  <span>Less</span>
                  <div className="w-2 h-2 rounded-sm bg-slate-900 border border-cyber-border/20" />
                  <div className="w-2 h-2 rounded-sm bg-cyber-cyan/20 border border-cyber-cyan/30" />
                  <div className="w-2 h-2 rounded-sm bg-cyber-cyan/50 border border-cyber-cyan/50" />
                  <div className="w-2 h-2 rounded-sm bg-cyber-cyan border border-white" />
                  <span>More</span>
                </div>
              </div>
            </motion.div>
 
            {/* Recommended Next Challenge (5 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-5 glassmorphism-card rounded-xl p-6 border border-cyber-cyan/45 bg-cyber-cyan/5 relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyber-cyan" />
              <div className="space-y-3 font-sans">
                <span className="text-[9px] font-mono text-cyber-cyan uppercase tracking-widest block font-bold">
                  Recommended Next Simulation
                </span>
                <h3 className="text-md font-bold text-white uppercase font-mono">
                  {history.some(c => c.attackType === "SQL Injection") ? "Ransomware Defense" : "SQL Injection Probe"}
                </h3>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    Difficulty: <span className="text-amber-500">⭐⭐⭐⭐☆</span>
                  </span>
                  <span>•</span>
                  <span>5 mins</span>
                </div>
                <div className="space-y-1.5 pt-1 text-[11px] text-slate-300">
                  <div className="text-slate-400">You'll practice:</div>
                  <div className="flex items-center gap-1.5 text-cyber-cyan">
                    <span>✓</span>
                    <span>{history.some(c => c.attackType === "SQL Injection") ? "Immutable Backups" : "SQL Parameterization"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-cyber-cyan">
                    <span>✓</span>
                    <span>{history.some(c => c.attackType === "SQL Injection") ? "Workstation Isolation" : "Web Application Firewall"}</span>
                  </div>
                </div>
              </div>
 
              <div className="pt-4">
                <Link
                  href="/simulate"
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-cyber-cyan text-[10px] font-mono font-bold tracking-widest text-black uppercase hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 cursor-pointer"
                >
                  Start Challenge →
                </Link>
              </div>
            </motion.div>
          </div>
 
          {/* Row 4: History & Security Tips */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Simulation History (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-7 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center border-b border-cyber-border/40 pb-4 mb-4">
                  <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold">
                    Simulation History (Last 5 Runs)
                  </span>
 
                  {/* Filters */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1 border border-cyber-border rounded text-[8px] font-mono">
                    {["all", "blocked", "successful"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-2 py-0.5 rounded cursor-pointer uppercase ${
                          activeTab === tab 
                            ? tab === "blocked" ? "bg-cyber-green text-black font-bold" 
                              : tab === "successful" ? "bg-cyber-red text-white" 
                              : "bg-electric-blue text-white"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
 
                {/* Search and Clear Actions Controls */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4 pb-2 border-b border-cyber-border/20">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs (e.g. SQL, Lazarus, Hospital)..."
                    className="w-full sm:max-w-xs bg-slate-950 border border-cyber-border rounded px-2.5 py-1.5 font-mono text-[9px] text-slate-300 focus:outline-none focus:border-cyber-cyan/50 placeholder-slate-600 transition-colors"
                  />
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={refreshHistory}
                      className="px-2.5 py-1.5 rounded border border-cyber-border bg-slate-900/60 hover:bg-slate-900 text-slate-400 hover:text-white font-mono text-[8px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Refresh
                    </button>
                    
                    {history.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear all simulation history logs? This cannot be undone.")) {
                            try {
                              sessionStorage.removeItem("sentinel_campaign_history");
                              sessionStorage.setItem("sentinel_max_unlocked_step", "1");
                              sessionStorage.removeItem("sentinel_campaign_config");
                              window.dispatchEvent(new Event("sentinel_progress_update"));
                              setHistory([]);
                              setSelectedCampaign(null);
                            } catch (e) {
                              console.error(e);
                            }
                          }
                        }}
                        className="px-2.5 py-1.5 rounded border border-cyber-red/35 bg-cyber-red/5 hover:bg-cyber-red/10 text-cyber-red font-mono text-[8px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Clear Logs
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {displayedHistory.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 uppercase font-mono text-[9px]">
                      {searchQuery.trim() !== "" ? "No matching simulations found." : "No simulations recorded."}
                    </div>
                  ) : (
                    displayedHistory.map((camp) => {
                      const isBlocked = camp.status === "Blocked";
                      const dateStr = new Date(camp.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      
                      return (
                        <div
                          key={camp.id}
                          className="border border-cyber-border/80 bg-black/35 hover:bg-slate-900/40 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-200"
                        >
                          <div className="font-sans text-[11px] leading-relaxed">
                            <div className="flex items-center gap-2">
                              <span className="text-xs">{isBlocked ? "🟢" : "🔴"}</span>
                              <span className="font-bold text-white uppercase font-mono text-[10px]">{camp.id.split("-")[0]}</span>
                              <span className="text-slate-505 font-mono text-[9px]">{dateStr}</span>
                            </div>
                            <p className="text-slate-350 mt-1">
                              {getActorName(camp.threatActor)} targeted {camp.primaryTarget} via {getAttackName(camp.attackType)}.
                            </p>
                          </div>
 
                          <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0 font-mono">
                            <span className={`px-2 py-0.5 rounded border text-[8px] font-bold uppercase ${
                              isBlocked ? "border-cyber-green/30 bg-cyber-green/10 text-cyber-green" : "border-cyber-red/30 bg-cyber-red/10 text-cyber-red"
                            }`}>
                              {isBlocked ? "Defended" : "Bypassed"}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedCampaign(camp)}
                                className="px-2 py-1 rounded border border-cyber-cyan/35 bg-cyber-cyan/10 hover:bg-cyber-cyan/25 text-cyber-cyan text-[8.5px] font-bold uppercase transition-colors cursor-pointer"
                              >
                                Review
                              </button>
                              <Link
                                href="/simulate"
                                className="px-2 py-1 rounded border border-cyber-border bg-cyber-surface hover:bg-cyber-surface-brighter text-slate-300 text-[8.5px] font-bold uppercase transition-colors cursor-pointer"
                              >
                                Again
                              </Link>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
              
              <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mt-4 pt-4 border-t border-cyber-border/40">
                <span>HISTORY LIMITED TO LAST 5 SCENARIOS</span>
                <button onClick={refreshHistory} className="hover:text-white flex items-center gap-1 uppercase font-bold cursor-pointer">
                  <RefreshCw className="w-3 h-3" /> Reload
                </button>
              </div>
            </motion.div>
 
            {/* Security Tips You've Learned (5 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-5 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between"
            >
              <div>
                <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold mb-4">
                  Security Tips You've Learned
                </span>
                <p className="text-[11px] text-slate-400 mb-4 font-sans leading-relaxed">
                  Hover over a security tip card to view the educational explanation.
                </p>
                
                <div className="space-y-3">
                  {[
                    { id: "TIP-1", title: "MFA prevents password theft", desc: "Enforcing Multi-Factor Authentication prevents attackers from logging in even if they manage to compromise administrator passwords." },
                    { id: "TIP-2", title: "WAF blocks common web attacks", desc: "Web Application Firewalls filter malicious database query syntax (like SQL Injection) at the web boundary before it hits databases." },
                    { id: "TIP-3", title: "Backups reduce ransomware damage", desc: "Storing offline, read-only backups ensures files can be restored without paying hackers in a ransomware scenario." },
                    { id: "TIP-4", title: "Network segmentation limits movement", desc: "Splitting internal networks into isolated subnets prevents threat actors from pivoting easily from workstations to database servers." }
                  ].map((tip) => (
                    <SecurityTipCard key={tip.id} title={tip.title} desc={tip.desc} />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
 
          {/* Advanced Analytics Toggle Button */}
          <div className="flex justify-center pt-4 mb-6">
            <button
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-cyber-cyan/40 bg-cyber-cyan/5 hover:bg-cyber-cyan/15 text-cyber-cyan text-xs font-bold uppercase transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer"
            >
              <span>{showAdvancedAnalytics ? "Hide" : "Show"} Advanced Metrics</span>
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
                className="overflow-hidden space-y-8 pt-4 pb-8"
              >
                {/* Historical stats cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/25">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Simulations Launched</span>
                    <h3 className="text-2xl font-extrabold font-mono text-white mt-1.5">{totalSimulations}</h3>
                  </div>
                  <div className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/25">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">High Risk Scenarios</span>
                    <h3 className="text-2xl font-extrabold font-mono text-cyber-red mt-1.5">{criticalThreats}</h3>
                  </div>
                  <div className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/25">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Defensive Successes</span>
                    <h3 className="text-2xl font-extrabold font-mono text-cyber-green mt-1.5">{blockedAttacks}</h3>
                  </div>
                  <div className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/25">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Bypasses Identified</span>
                    <h3 className="text-2xl font-extrabold font-mono text-cyber-red mt-1.5">{successfulAttacks}</h3>
                  </div>
                </div>
 
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Industry Target Sectors */}
                  <div className="lg:col-span-5 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold mb-4">
                        Target Sectors & Attack Frequency
                      </span>
                      <div className="space-y-4">
                        {industryCounts.map((ind) => {
                          const percentage = maxIndustryCount > 0 ? (ind.count / maxIndustryCount) * 100 : 0;
                          const getBarColor = (cnt: number) => {
                            if (cnt >= 3) return "bg-cyber-red";
                            if (cnt >= 1) return "bg-electric-blue";
                            return "bg-slate-800";
                          };
                          return (
                            <div key={ind.name} className="space-y-2">
                              <div className="flex justify-between items-center text-[9px] font-mono">
                                <span className="text-white font-bold uppercase">{ind.name}</span>
                                <span className="text-slate-400">{ind.count} Runs</span>
                              </div>
                              <div className="h-1.5 bg-slate-950 border border-cyber-border/40 rounded-full overflow-hidden">
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
                  </div>
 
                  {/* MITRE success rates */}
                  <div className="lg:col-span-7 glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-550 uppercase tracking-widest block font-bold mb-4">
                        Attack Coverage & Success Ratios
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {techniqueCoverage.map((tech) => {
                          const getCoverageBadge = (cov: number) => {
                            if (cov >= 75) return { text: "MITIGATED", style: "text-cyber-green border-cyber-green/30 bg-cyber-green/5" };
                            if (cov >= 35) return { text: "MONITORED", style: "text-amber-500 border-amber-500/30 bg-amber-500/5" };
                            return { text: "VULNERABLE", style: "text-cyber-red border-cyber-red/30 bg-cyber-red/5" };
                          };
                          const badge = getCoverageBadge(tech.coverage);
                          return (
                            <div key={tech.code} className="bg-black/35 p-3 rounded border border-cyber-border/40 flex flex-col justify-between text-left font-mono">
                              <div>
                                <div className="flex justify-between items-start">
                                  <span className="text-cyber-cyan text-[9px] font-bold">{tech.code}</span>
                                  <span className={`px-1.5 py-0.5 rounded border text-[7px] font-bold ${badge.style}`}>
                                    {badge.text}
                                  </span>
                                </div>
                                <h4 className="text-white text-[11px] font-bold mt-2 uppercase truncate">{tech.name}</h4>
                              </div>
                              <div className="mt-4 space-y-1">
                                <div className="flex justify-between text-[8px] text-slate-400">
                                  <span>Defended Success Ratio</span>
                                  <span>{tech.coverage}%</span>
                                </div>
                                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${tech.coverage >= 75 ? "bg-cyber-green" : tech.coverage >= 35 ? "bg-amber-500" : "bg-cyber-red"}`}
                                    style={{ width: `${tech.coverage}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
 
          {/* End Page Celebratory Panel */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-8 border border-cyber-green/45 bg-cyber-green/5 relative overflow-hidden text-center max-w-2xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)] mt-12"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyber-green" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider font-mono">
              🎉 Great Work!
            </h2>
            <div className="my-6 space-y-2 text-sm text-slate-350 font-sans">
              <p>You have completed <strong className="text-white font-mono">{totalSimulations} simulations</strong> and successfully defended <strong className="text-cyber-green font-mono">{blockedAttacks} attacks</strong>.</p>
              <p>You've learned <strong className="text-cyber-cyan font-mono">{new Set(history.map(c => c.attackType)).size * 2} cybersecurity concepts</strong>.</p>
              <p className="text-slate-400 mt-2">You're becoming better at recognizing and mitigating real-world threat actors.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-cyber-green/10 font-mono">
              <Link
                href="/simulate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-cyber-green text-xs font-bold tracking-widest text-black uppercase hover:bg-cyber-green/90 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 cursor-pointer"
              >
                Run Another Simulation
              </Link>
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: "smooth" });
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded border border-cyber-border bg-cyber-surface hover:bg-cyber-surface-brighter text-xs font-bold tracking-widest text-slate-300 uppercase transition-all duration-300 cursor-pointer"
              >
                View Previous Reports
              </button>
            </div>
          </motion.div>
 
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
                    Understand What Happened (Simulation Review)
                  </Link>
                  <span className="text-[8px] text-cyber-green text-center block mt-2 font-semibold">
                    REVIEW READY - CLICK TO UNDERSTAND ATTACK
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      <Footer />
    </div>
  );
}
