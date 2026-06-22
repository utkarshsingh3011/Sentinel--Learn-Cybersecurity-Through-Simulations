"use client";

import React, { useState, useRef } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { Globe, ShieldAlert, Database, ServerCrash, ChevronRight, Activity } from "lucide-react";

const STAGES = [
  {
    id: 1,
    title: "Initial Entry",
    desc: "This shows how attackers get their first foothold, like through a phishing email or a weak password. Why it matters: Preventing initial entry is the first line of defense. What you'll learn: How to identify entry points and block unauthorized access.",
    tech: "Initial Access (MITRE ATT&CK T1566)",
    icon: Globe,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    title: "Bypassing Security",
    desc: "This demonstrates how attackers bypass firewalls and security checks by mimicking real users or exploiting system weaknesses. Why it matters: Strong defenses must detect attackers even if they sneak past the outer perimeter. What you'll learn: How firewalls work and where security rules might fail.",
    tech: "Defense Evasion (MITRE ATT&CK T1078)",
    icon: ShieldAlert,
    color: "from-cyan-500 to-yellow-500",
  },
  {
    id: 3,
    title: "Spreading Through the Network",
    desc: "This shows the attacker moving from one computer to another, searching for valuable databases or admin credentials. Why it matters: If the initial entry point is compromised, you must contain the threat so it cannot spread. What you'll learn: How network segmentation keeps systems isolated and safe.",
    tech: "Lateral Movement (MITRE ATT&CK T1021)",
    icon: Database,
    color: "from-yellow-500 to-rose-500",
  },
  {
    id: 4,
    title: "Taking Data & Lockout",
    desc: "This illustrates the final stage where attackers steal sensitive files or lock them up with ransomware. Why it matters: This is where direct damage occurs, resulting in stolen data or system downtime. What you'll learn: How to detect abnormal data transfers and recover systems using backups.",
    tech: "Exfiltration & Impact (MITRE ATT&CK T1048)",
    icon: ServerCrash,
    color: "from-rose-500 to-red-600",
  },
];

export default function ThreatEmergence() {
  const [activeStage, setActiveStage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set up scroll hooks bound to the section container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Animate path drawing length along the scroll progress
  const pathLength = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  // Dynamically highlight active stage according to scroll percentage
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest < 0.22) {
      setActiveStage(1);
    } else if (latest < 0.48) {
      setActiveStage(2);
    } else if (latest < 0.74) {
      setActiveStage(3);
    } else {
      setActiveStage(4);
    }
  });

  const pathProgress = (activeStage - 1) / 3;

  return (
    <section 
      id="threats" 
      ref={containerRef}
      className="relative py-28 bg-cyber-bg overflow-hidden border-t border-cyber-border/40"
    >
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[50vw] h-[50vh] bg-cyber-red/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-20">
          <div className="inline-flex items-center gap-2 text-cyber-red text-[10px] font-mono tracking-widest uppercase mb-4">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Understanding the Attack Path
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            How Cyber Attacks Work
          </h2>
          <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
            Cyber attacks happen in stages rather than all at once. Scroll down to see an attack unfold step-by-step through a virtual network, and learn how to stop it.
          </p>
        </div>

        {/* Interactive Simulation Flow Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Stage Details Column */}
          <div className="lg:col-span-5 space-y-4">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              const isActive = activeStage === stage.id;
              
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveStage(stage.id)}
                  className={`w-full text-left p-6 rounded-lg border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                    isActive
                      ? "bg-cyber-surface/90 border-cyber-border-active/60 shadow-[0_0_20px_rgba(37,99,235,0.06)]"
                      : "bg-cyber-surface/30 border-cyber-border/30 hover:border-slate-800"
                  }`}
                >
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stage.color} bg-opacity-20 text-white flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">STAGE 0{stage.id}</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                      <span className="text-[10px] font-mono text-cyber-cyan">{stage.tech}</span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">{stage.title}</h3>
                    
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: isActive ? "auto" : 0, 
                        opacity: isActive ? 1 : 0 
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                        {stage.desc}
                      </p>
                    </motion.div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive SVG Diagram Column */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="w-full max-w-[600px] h-[420px] glassmorphism-card rounded-xl p-6 relative flex flex-col justify-between overflow-hidden border border-cyber-border shadow-[0_0_30px_rgba(244,63,94,0.02)]">
              {/* Overlay grid inside map */}
              <div className="absolute inset-0 cyber-grid-fine opacity-20 pointer-events-none" />

              <div className="flex justify-between items-center border-b border-cyber-border/40 pb-3 mb-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyber-red"></span>
                  </span>
                  Vector Propagation Path (SCROLL DRIVEN)
                </span>
                <span className="text-[9px] font-mono text-slate-400 border border-cyber-border px-1.5 py-0.5 rounded">
                  MODEL ACTIVE
                </span>
              </div>

              {/* Graphic container */}
              <div className="relative flex-grow flex items-center justify-between px-10">
                {/* SVG connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: "visible" }}>
                  {/* Base path background */}
                  <path
                    d="M 50,210 C 150,110 250,310 350,210 C 450,110 500,210 550,210"
                    fill="none"
                    stroke="rgba(30, 41, 59, 0.4)"
                    strokeWidth="2.5"
                  />
                  {/* Scroll-driven dynamic path draw */}
                  <motion.path
                    d="M 50,210 C 150,110 250,310 350,210 C 450,110 500,210 550,210"
                    fill="none"
                    stroke="url(#attackGradient)"
                    strokeWidth="3.5"
                    style={{ pathLength }}
                    strokeLinecap="round"
                  />
                  {/* Active stage path draw (smooth transition on stage change) */}
                  <motion.path
                    d="M 50,210 C 150,110 250,310 350,210 C 450,110 500,210 550,210"
                    fill="none"
                    stroke="url(#activeAttackGradient)"
                    strokeWidth="4"
                    animate={{ pathLength: pathProgress }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                  />
                  {/* Traveling light pulse animation */}
                  <circle r="4" fill="#ffffff" className="drop-shadow-[0_0_6px_#ffffff]">
                    <animateMotion
                      path="M 50,210 C 150,110 250,310 350,210 C 450,110 500,210 550,210"
                      dur="4s"
                      repeatCount="indefinite"
                    />
                  </circle>
                  {/* Running dash line on top of path for active look */}
                  <motion.path
                    d="M 50,210 C 150,110 250,310 350,210 C 450,110 500,210 550,210"
                    fill="none"
                    stroke="rgba(255,255,255,0.7)"
                    strokeWidth="1.5"
                    strokeDasharray="8, 12"
                    animate={{
                      strokeDashoffset: [0, -40],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "linear",
                    }}
                  />
                  <defs>
                    <linearGradient id="attackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                      <stop offset="35%" stopColor="#06b6d4" stopOpacity="0.3" />
                      <stop offset="70%" stopColor="#f59e0b" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.3" />
                    </linearGradient>
                    <linearGradient id="activeAttackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="35%" stopColor="#06b6d4" />
                      <stop offset="70%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Interactive diagram nodes */}
                {STAGES.map((stage) => {
                  const Icon = stage.icon;
                  const isActive = activeStage >= stage.id;
                  const isCurrent = activeStage === stage.id;

                  // Define absolute positions relative to parent mapping for clean alignment
                  const getPosition = (id: number) => {
                    switch (id) {
                      case 1: return "left-[5%] top-[45%]";
                      case 2: return "left-[32%] top-[17%]";
                      case 3: return "left-[60%] top-[68%]";
                      case 4: return "left-[85%] top-[45%]";
                      default: return "";
                    }
                  };

                  return (
                    <div
                      key={stage.id}
                      onClick={() => setActiveStage(stage.id)}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer ${getPosition(
                        stage.id
                      )}`}
                    >
                      <div className="relative group">
                        {/* Sliding/pulsing glow layer behind active node */}
                        {isCurrent && (
                          <motion.div
                            layoutId="activeGlow"
                            className={`absolute -inset-4 rounded-full blur-[12px] opacity-60 pointer-events-none ${
                              stage.id === 4 ? "bg-cyber-red/80" : "bg-cyber-cyan/80"
                            }`}
                            animate={{
                              scale: [0.95, 1.15, 0.95],
                              opacity: [0.4, 0.7, 0.4]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                        )}
                        {/* Node status rings */}
                        <motion.div
                          animate={isCurrent ? { scale: [1, 1.4, 1] } : {}}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className={`absolute -inset-2.5 rounded-full blur-[4px] opacity-40 transition-colors duration-300 ${
                            isCurrent
                              ? stage.id === 4 ? "bg-cyber-red" : "bg-cyber-cyan"
                              : isActive
                              ? "bg-slate-700"
                              : "bg-transparent"
                          }`}
                        />
                        
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                            isCurrent
                              ? "bg-black border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                              : isActive
                              ? "bg-cyber-surface border-slate-700 text-slate-300"
                              : "bg-slate-950 border-slate-900 text-slate-600"
                          }`}
                        >
                          <Icon className="w-5.5 h-5.5" />
                        </div>

                        {/* Text labels below icons */}
                        <div className="absolute top-14 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
                          <span className={`text-[9px] font-mono font-bold tracking-wider block ${
                            isCurrent ? "text-white" : isActive ? "text-slate-400" : "text-slate-600"
                          }`}>
                            STAGE 0{stage.id}
                          </span>
                          <span className={`text-[8px] font-mono block mt-0.5 ${
                            isCurrent ? "text-cyber-cyan font-semibold" : "text-slate-500"
                          }`}>
                            {stage.title.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Console logs output */}
              <div className="bg-black/60 border border-cyber-border/40 p-3 rounded font-mono text-[9px] text-slate-400 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-cyber-cyan mr-1.5">[MONITOR]</span>
                  {activeStage === 1 && "Phishing email clicked. Attacker gains access to a single user device."}
                  {activeStage === 2 && "Firewall bypassed. Attacker mimics an employee log-in to access the network."}
                  {activeStage === 3 && "Attacker moves from the user device to the main server to look for data."}
                  {activeStage === 4 && "Attacker steals database files and locks the server with ransomware."}
                </div>
                <div className={`font-semibold ${activeStage === 4 ? "text-cyber-red" : "text-cyber-cyan"}`}>
                  {activeStage === 4 ? "COMPROMISED" : "MONITORING"}
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
