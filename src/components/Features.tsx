"use client";

import React from "react";
import { Bot, Clapperboard, Network, GitFork, ShieldAlert, Cpu, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    id: "scenario-gen",
    title: "AI Scenario Builder",
    desc: "Create custom attack simulations using simple text. Learn how different attack styles and targets are structured, helping you understand how scenarios are planned.",
    icon: Bot,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]",
    borderColor: "hover:border-blue-500/50",
    badge: "Scenario Engine",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 space-y-1">
        <div className="text-[8px] text-slate-500">{"// PROMPT"}</div>
        <div className="text-white">&quot;Simulate a key-theft campaign on cloud storage...&quot;</div>
        <div className="text-[8px] text-slate-500 mt-2">{"// OUTPUT COMPILED"}</div>
        <div className="text-cyber-cyan">✓ T1530: Data from Cloud Storage Object</div>
      </div>
    ),
  },
  {
    id: "movie-engine",
    title: "Simulation Playback",
    desc: "Watch simulations step-by-step with play, pause, and rewind controls. Inspect network activity and logs at each point to see how security issues unfold.",
    icon: Clapperboard,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    borderColor: "hover:border-cyan-500/50",
    badge: "Simulation Core",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 space-y-2">
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>CAMPAIGN PLAYBACK</span>
          <span className="text-cyber-cyan animate-pulse">04:12 / 10:00</span>
        </div>
        <div className="w-full bg-slate-900 h-1 rounded overflow-hidden relative">
          <div className="bg-cyber-cyan h-full w-[42%]" />
          <div className="absolute left-[42%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_5px_#fff]" />
        </div>
        <div className="text-center text-slate-300 text-[8px]">FRAME #249: Lateral Movement to HOST-20</div>
      </div>
    ),
  },
  {
    id: "twin-infra",
    title: "Virtual Network Model",
    desc: "Model network layouts and firewalls without touching real systems. Gain hands-on practice configuring safety rules and testing defenses in a safe sandbox.",
    icon: Network,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(10,185,129,0.15)]",
    borderColor: "hover:border-emerald-500/50",
    badge: "Topology Twin",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 flex justify-between items-center gap-2">
        <div className="space-y-1">
          <div className="text-[8px] text-slate-500">ASSET INGESTION</div>
          <div className="text-white flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyber-green" /> 1,420 Active Nodes
          </div>
        </div>
        <div className="px-2 py-1 rounded bg-cyber-green/5 border border-cyber-green/30 text-cyber-green font-bold text-[8px]">
          100% SYNCED
        </div>
      </div>
    ),
  },
  {
    id: "mitre-mapping",
    title: "Security Mapping (MITRE ATT&CK)",
    desc: "Map simulated attacks to standard security frameworks. Learn how real-world professionals categorize attack tactics and identify defense weaknesses.",
    icon: GitFork,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    borderColor: "hover:border-amber-500/50",
    badge: "Matrix Compliance",
    widget: (
      <div className="mt-4 grid grid-cols-3 gap-1 font-mono text-[8px] text-center">
        <div className="p-1 rounded bg-cyber-green/10 border border-cyber-green/20 text-cyber-green">T1566<br />Phishing</div>
        <div className="p-1 rounded bg-cyber-red/10 border border-cyber-red/20 text-cyber-red">T1078<br />Accounts</div>
        <div className="p-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500">T1021<br />RDP</div>
      </div>
    ),
  },
  {
    id: "defense-simulator",
    title: "Security Rule Tester",
    desc: "Test firewall rules and security controls against incoming threats. See how changing defense settings can successfully stop attacks from spreading.",
    icon: ShieldAlert,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    borderColor: "hover:border-rose-500/50",
    badge: "Policy Hardening",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 space-y-1.5">
        <div className="text-[8px] text-slate-500">RESPONSE TRIGGER</div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Block C2 IP 192.168.4.15</span>
          <span className="text-cyber-green font-bold">ACTIVE</span>
        </div>
        <div className="flex justify-between items-center text-slate-300">
          <span>Revoke Domain Admin Token</span>
          <span className="text-cyber-green font-bold">ACTIVE</span>
        </div>
      </div>
    ),
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function Features() {
  return (
    <section id="features" className="relative py-28 bg-cyber-surface/10 overflow-hidden border-t border-cyber-border/40">
      {/* Background gradients */}
      <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vh] bg-cyber-cyan/5 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">

        {/* Core Educational Modules */}
        <div>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-4">
              <Cpu className="w-3.5 h-3.5 text-cyber-cyan" />
              Simulation Modules
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Core Educational Modules
            </h2>
            <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
              SENTINEL houses five modular components designed to customize scenarios, visualize playbacks, model network environments, verify security compliance, and automate defenses.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map((feat) => {
              const Icon = feat.icon;

              return (
                <motion.div
                  key={feat.id}
                  variants={cardVariants}
                  className={`group glassmorphism-card rounded-xl p-6 border border-cyber-border relative flex flex-col justify-between overflow-hidden transition-all duration-300 ${feat.borderColor} ${feat.glowColor}`}
                >
                  {/* Tech card header grid highlights */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-cyber-border group-hover:border-cyber-border-active/40 transition-colors pointer-events-none" />

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                        {feat.badge}
                      </span>
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyber-cyan transition-colors" />
                    </div>

                    <h3 className="text-base font-bold text-white tracking-tight mt-6 flex items-center gap-1 group-hover:text-cyber-cyan transition-colors">
                      {feat.title}
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>

                    <p className="mt-3 text-xs text-slate-400 leading-relaxed font-sans">
                      {feat.desc}
                    </p>
                  </div>

                  {feat.widget}
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* What You Can Learn Section */}
        <div className="mt-28">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-4">
              <ShieldAlert className="w-3.5 h-3.5 text-cyber-cyan" />
              Educational Curriculum
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              What You Can Learn
            </h2>
            <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
              Explore hands-on concepts that model real-world cybersecurity attacks and organizational defense procedures.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                title: "Phishing Attacks",
                desc: "Learn how phishing emails work, how users are tricked, and how to spot malicious links.",
                topic: "Initial Access",
              },
              {
                title: "Ransomware Operations",
                desc: "Understand how ransomware locks files, why attackers do it, and how to recover using backups.",
                topic: "Impact & Mitigation",
              },
              {
                title: "Supply Chain Compromise",
                desc: "See how untrusted code can slip into software updates, and how developers verify third-party libraries.",
                topic: "Software Security",
              },
              {
                title: "Credential Theft",
                desc: "Learn how passwords and login tokens are stolen from computer memory, and how to protect them.",
                topic: "Access Control",
              },
              {
                title: "Network Compromise",
                desc: "Understand how attackers move between computers in a network, and how to segment networks to contain them.",
                topic: "Internal Defenses",
              },
              {
                title: "Security Best Practices",
                desc: "Explore modern defense rules like multi-factor authentication (MFA) and zero-trust policies.",
                topic: "Preventative Controls",
              },
            ].map((learn, i) => (
              <motion.div
                key={i}
                variants={cardVariants}
                className="bg-black/30 border border-cyber-border rounded-xl p-5 hover:border-cyber-cyan/30 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 px-2 py-0.5 bg-cyber-cyan/10 border-b border-l border-cyber-cyan/20 rounded-bl text-[8px] font-mono text-cyber-cyan uppercase font-bold">
                  {learn.topic}
                </div>
                <h3 className="text-white text-sm font-bold uppercase font-mono tracking-wider mb-2">
                  {learn.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {learn.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
