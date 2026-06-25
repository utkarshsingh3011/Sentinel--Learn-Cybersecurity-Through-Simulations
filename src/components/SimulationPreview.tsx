"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, ShieldCheck, HardDrive, Network, Flame, ShieldAlert } from "lucide-react";

interface TimelineEvent {
  time: string;
  phase: string;
  name: string;
  technique: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "evaded" | "blocked" | "alerted";
  desc: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: "T+00:00:00",
    phase: "Initial Entry",
    name: "Phishing Link Clicked",
    technique: "T1566.002",
    severity: "low",
    status: "alerted",
    desc: "A simulated phishing email link was clicked on a user's computer (HOST-102).",
  },
  {
    time: "T+00:02:14",
    phase: "Running Code",
    name: "Unauthorized Script Executed",
    technique: "T1059.001",
    severity: "medium",
    status: "evaded",
    desc: "A script bypassed local restrictions and established a connection to an external control server.",
  },
  {
    time: "T+00:05:40",
    phase: "Stealing Passwords",
    name: "Password Stealing Attempt",
    technique: "T1003.001",
    severity: "high",
    status: "blocked",
    desc: "An attempt to steal passwords from system memory was successfully blocked.",
  },
  {
    time: "T+00:08:12",
    phase: "Finding Systems",
    name: "Network Scanning",
    technique: "T1087.002",
    severity: "medium",
    status: "evaded",
    desc: "The attacker scanned the network to locate administrator accounts and server nodes.",
  },
  {
    time: "T+00:12:35",
    phase: "Moving in Network",
    name: "Server Access Requested",
    technique: "T1558.003",
    severity: "high",
    status: "evaded",
    desc: "The attacker requested access tickets to crack administrative passwords.",
  },
  {
    time: "T+00:18:50",
    phase: "Gaining Admin Access",
    name: "Admin Account Compromised",
    technique: "T1078.002",
    severity: "critical",
    status: "evaded",
    desc: "An unauthorized login occurred on the main network controller server (AD-SRV-01).",
  },
  {
    time: "T+00:22:15",
    phase: "Taking Data & Lockout",
    name: "Data Encryption Started",
    technique: "T1486",
    severity: "critical",
    status: "evaded",
    desc: "File encryption started on the main database (DB-FIN-SQL).",
  },
];

export default function SimulationPreview() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1); // multiplier
  const [eventLog, setEventLog] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isPlaying) {
      const runTimeline = () => {
        if (currentEventIndex < TIMELINE_EVENTS.length - 1) {
          const nextIndex = currentEventIndex + 1;
          setCurrentEventIndex(nextIndex);
          setEventLog(prev => [...prev, TIMELINE_EVENTS[nextIndex]]);
          
          // Speed scale: base delay is 2500ms, reduced by multiplier
          const nextDelay = 2500 / playbackSpeed;
          timer = setTimeout(runTimeline, nextDelay);
        } else {
          setIsPlaying(false);
        }
      };
      
      timer = setTimeout(runTimeline, 1000 / playbackSpeed);
    }
    
    return () => clearTimeout(timer);
  }, [isPlaying, currentEventIndex, playbackSpeed]);

  const togglePlayback = () => {
    if (currentEventIndex === TIMELINE_EVENTS.length - 1) {
      resetPlayback();
      setTimeout(() => setIsPlaying(true), 100);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentEventIndex(-1);
    setEventLog([]);
  };

  // Aggregated status counters based on current timeline index
  const activeEvadedCount = eventLog.filter(e => e.status === "evaded").length;
  const activeBlockedCount = eventLog.filter(e => e.status === "blocked").length;
  const activeAlertedCount = eventLog.filter(e => e.status === "alerted").length;

  const currentRiskScore = eventLog.length === 0 
    ? 12 
    : Math.min(99, 12 + eventLog.reduce((acc, curr) => {
        if (curr.severity === "low") return acc + 5;
        if (curr.severity === "medium") return acc + 10;
        if (curr.severity === "high") return acc + 20;
        if (curr.severity === "critical") return acc + 30;
        return acc;
      }, 0));

  return (
    <section id="preview" className="relative py-28 bg-cyber-bg overflow-hidden border-t border-cyber-border/40">
      {/* Glow overlays */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-electric-blue/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 text-electric-blue text-[10px] font-mono tracking-widest uppercase mb-4">
            <Network className="w-3.5 h-3.5 text-electric-blue" />
            Simulation Builder
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Interactive Attack Simulation
          </h2>
          <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
            See how an attack progresses across a virtual network while learning how security controls respond.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Panel: Simulation Controls & Log Feed (7 cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between glassmorphism-card rounded-xl p-6 border border-cyber-border">
            
            {/* Header controls bar */}
            <div className="flex flex-wrap items-center justify-between border-b border-cyber-border/40 pb-5 gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlayback}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    isPlaying 
                      ? "bg-amber-500 text-black hover:bg-amber-400" 
                      : "bg-electric-blue text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                  }`}
                >
                  {isPlaying ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
                </button>
                <button
                  onClick={resetPlayback}
                  className="w-10 h-10 rounded-full bg-cyber-surface border border-cyber-border hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase ml-2">
                  {isPlaying ? "Simulation Streaming" : "Ready to Begin"}
                </span>
              </div>

              {/* Playback speed selector */}
              <div className="flex items-center gap-1.5 bg-black/60 border border-cyber-border rounded px-2.5 py-1.5 font-mono text-[9px]">
                <span className="text-slate-500">SPEED:</span>
                {[1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-1.5 py-0.5 rounded font-bold transition-all duration-200 ${
                      playbackSpeed === speed
                        ? "bg-electric-blue/20 text-cyber-cyan border border-electric-blue/40"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Event Timeline Logs */}
            <div className="flex-grow my-6 min-h-[350px] max-h-[420px] overflow-y-auto space-y-4 pr-2">
              <AnimatePresence>
                {eventLog.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 font-sans">
                    <ShieldCheck className="w-10 h-10 text-cyber-cyan mb-3 animate-pulse" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Press Play to start the simulation.</span>
                    <span className="text-[11px] text-slate-400 mt-2 max-w-sm leading-relaxed">
                      You'll watch each stage of the attack and learn what is happening in real time.
                    </span>
                  </div>
                ) : (
                  eventLog.map((event, index) => {
                    const isLast = index === eventLog.length - 1;
                    const getSeverityColor = (sev: string) => {
                      switch (sev) {
                        case "critical": return "text-cyber-red border-cyber-red/30 bg-cyber-red/5";
                        case "high": return "text-rose-500 border-rose-500/30 bg-rose-500/5";
                        case "medium": return "text-amber-500 border-amber-500/30 bg-amber-500/5";
                        default: return "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5";
                      }
                    };

                    const getStatusBadge = (status: string) => {
                      switch (status) {
                        case "blocked":
                          return <span className="px-1.5 py-0.5 rounded border border-cyber-green/30 bg-cyber-green/10 text-cyber-green text-[8px] font-mono font-bold uppercase">BLOCKED</span>;
                        case "alerted":
                          return <span className="px-1.5 py-0.5 rounded border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan text-[8px] font-mono font-bold uppercase">ALERTED</span>;
                        default:
                          return <span className="px-1.5 py-0.5 rounded border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-[8px] font-mono font-bold uppercase">EVADED</span>;
                      }
                    };

                    return (
                      <motion.div
                        key={event.time}
                        initial={{ opacity: 0, x: -10, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          isLast 
                            ? "bg-cyber-surface border-cyber-border-active/60 shadow-[0_0_15px_rgba(37,99,235,0.05)]" 
                            : "bg-cyber-surface/30 border-cyber-border/30"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500">{event.time}</span>
                            <span className="text-slate-700">|</span>
                            <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold uppercase ${getSeverityColor(event.severity)}`}>
                              {event.severity}
                            </span>
                            <span className="text-slate-700">|</span>
                            <span className="text-xs font-mono font-bold text-white uppercase">{event.phase}</span>
                          </div>
                          {getStatusBadge(event.status)}
                        </div>

                        <h4 className="text-xs font-bold text-slate-200 mt-2 font-mono flex items-center gap-2">
                          {event.name}
                          <span className="text-[9px] text-slate-500 font-normal">({event.technique})</span>
                        </h4>
                        
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {event.desc}
                        </p>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Playback progress bar */}
            <div className="border-t border-cyber-border/40 pt-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <div>COMPLETED EVENTS: {eventLog.length} / {TIMELINE_EVENTS.length}</div>
              <div className="w-48 h-1 rounded bg-slate-900 border border-cyber-border overflow-hidden">
                <motion.div
                  className="h-full bg-electric-blue"
                  animate={{ width: `${(eventLog.length / TIMELINE_EVENTS.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

          </div>

          {/* Right Panel: Risk Metrics & Threat Level Gauge (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 gap-6">
            
            {/* Risk Gauge Card */}
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-cyber-red/5 rounded-full blur-[50px] pointer-events-none" />
              
              <div className="flex flex-col border-b border-cyber-border/40 pb-3 mb-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyber-red" />
                  Attack Progress
                </span>
                <span className="text-[9px] text-slate-500 font-sans mt-0.5">
                  Tracks how far the simulation has progressed.
                </span>
              </div>

              {/* Radial Risk Dial */}
              <div className="flex flex-col items-center justify-center py-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background ring */}
                    <circle
                      cx="80"
                      cy="80"
                      r="65"
                      stroke="rgba(30, 41, 59, 0.5)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    {/* Glowing active ring */}
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="65"
                      stroke={currentRiskScore > 75 ? "#f43f5e" : currentRiskScore > 40 ? "#f59e0b" : "#3b82f6"}
                      strokeWidth="9"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 65}
                      animate={{ strokeDashoffset: (2 * Math.PI * 65) * (1 - currentRiskScore / 100) }}
                      transition={{ duration: 0.5 }}
                      strokeLinecap="round"
                    />
                  </svg>
                  
                  {/* Inside dial values */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
                      {currentRiskScore}%
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mt-1">
                      Current Network Risk
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    currentRiskScore > 75 
                      ? "text-cyber-red border-cyber-red/30 bg-cyber-red/5" 
                      : currentRiskScore > 40 
                      ? "text-amber-500 border-amber-500/30 bg-amber-500/5" 
                      : "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5"
                  }`}>
                    {currentRiskScore > 75 ? "HIGH RISK DETECTED" : currentRiskScore > 40 ? "ATTACK RUNNING" : "SECURE"}
                  </span>
                </div>
              </div>

              {/* Status details indicators */}
              <div className="grid grid-cols-3 gap-2.5 border-t border-cyber-border/40 pt-4 font-mono text-[9px] text-center">
                <div className="bg-cyber-surface/40 p-2 rounded border border-cyber-border">
                  <div className="text-slate-500 uppercase">Events Completed</div>
                  <div className="text-cyber-cyan text-xs font-bold mt-1">{eventLog.length}</div>
                </div>
                <div className="bg-cyber-surface/40 p-2 rounded border border-cyber-border">
                  <div className="text-slate-500 uppercase">Security Alerts</div>
                  <div className="text-amber-500 text-xs font-bold mt-1">{activeAlertedCount}</div>
                </div>
                <div className="bg-cyber-surface/40 p-2 rounded border border-cyber-border">
                  <div className="text-slate-500 uppercase">Attack Blocked</div>
                  <div className="text-cyber-green text-xs font-bold mt-1">{activeBlockedCount}</div>
                </div>
              </div>
            </div>

            {/* Target Asset Hardening Card */}
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border flex flex-col justify-between">
              <div className="flex justify-between items-center border-b border-cyber-border/40 pb-3 mb-4">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-cyber-cyan" />
                  Current Network Status
                </span>
              </div>

              <div className="space-y-3 font-mono text-[10px]">
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Email Server</span>
                    <span className="text-cyber-green font-bold">Protected</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 border border-cyber-border rounded overflow-hidden">
                    <div className="h-full bg-cyber-green w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Workstation</span>
                    <span className="text-amber-500 font-bold">Suspicious Activity</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 border border-cyber-border rounded overflow-hidden">
                    <div className={`h-full bg-amber-500 transition-all duration-500 ${eventLog.length > 1 ? "w-full" : "w-[30%]"}`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>File Server</span>
                    <span className="text-cyber-cyan font-bold">Monitoring</span>
                  </div>
                  <div className="w-full h-1 bg-slate-900 border border-cyber-border rounded overflow-hidden">
                    <div className="h-full bg-cyber-cyan w-full animate-pulse" />
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-cyber-surface/50 border border-cyber-border rounded font-mono text-[8px] text-slate-500 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                <span>Watch how each device changes as the simulation progresses.</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
