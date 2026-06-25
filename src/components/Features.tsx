"use client";

import React from "react";
import { Bot, Play, BarChart3, BookOpen, Cpu, ArrowUpRight, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  {
    id: "attack-sims",
    title: "Interactive Simulations",
    desc: "Watch cyber attacks unfold step by step in a safe virtual environment.",
    icon: Play,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]",
    borderColor: "hover:border-cyan-500/50",
    badge: "Practice",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 space-y-2">
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Scenario</span>
          <span className="text-white font-bold">Spear Phishing</span>
        </div>
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Progress</span>
          <span className="text-cyber-cyan font-bold">Step 3 of 4</span>
        </div>
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Status</span>
          <span className="text-cyber-cyan animate-pulse font-bold">Simulation Running</span>
        </div>
      </div>
    ),
  },
  {
    id: "security-insights",
    title: "Attack Analysis",
    desc: "Review what happened after the simulation and understand why the attack succeeded or failed.",
    icon: BarChart3,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    borderColor: "hover:border-rose-500/50",
    badge: "Review",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 space-y-2">
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Detection Rate</span>
          <span className="text-cyber-green font-bold">94%</span>
        </div>
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Weak Areas</span>
          <span className="text-amber-500 font-bold">2 Found</span>
        </div>
      </div>
    ),
  },
  {
    id: "simulation-builder",
    title: "Scenario Builder",
    desc: "Customize attack scenarios by choosing the attack type, target, and security settings.",
    icon: Bot,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(37,99,235,0.15)]",
    borderColor: "hover:border-blue-500/50",
    badge: "Build",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 space-y-2">
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Attack</span>
          <span className="text-white font-bold">Spear Phishing</span>
        </div>
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Target</span>
          <span className="text-cyber-cyan font-bold">Hospital Network</span>
        </div>
      </div>
    ),
  },
  {
    id: "modules",
    title: "Learning Guides",
    desc: "Read short lessons that explain cybersecurity concepts behind every simulation.",
    icon: BookOpen,
    glowColor: "group-hover:shadow-[0_0_30px_rgba(10,185,129,0.15)]",
    borderColor: "hover:border-emerald-500/50",
    badge: "Understand",
    widget: (
      <div className="mt-4 p-3 bg-black/40 rounded border border-cyber-border font-mono text-[9px] text-slate-400 space-y-2">
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Current Lesson</span>
          <span className="text-white font-bold">Email Security Basics</span>
        </div>
        <div className="flex justify-between text-[8px] text-slate-500">
          <span>Estimated Time</span>
          <span className="text-cyber-green font-bold">8 min</span>
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
              Learning Workspace
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Everything You Need to Learn
            </h2>
            <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
              Explore interactive tools that let you build scenarios, watch attacks, analyze results, and strengthen your cybersecurity knowledge.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
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
              Explore hands-on concepts that model cybersecurity attacks and defensive policies in a safe, educational environment.
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
                title: "Attack Simulation Basics",
                desc: "Learn how attacks are structured and executed.",
                topic: "Simulations",
              },
              {
                title: "Network & System Security",
                desc: "Understand networks, systems, and common vulnerabilities.",
                topic: "Infrastructure",
              },
              {
                title: "Threat Techniques",
                desc: "Explore attacker methods and tactics.",
                topic: "Attacks",
              },
              {
                title: "Defensive Measures",
                desc: "Learn how to detect, respond, and defend.",
                topic: "Defense",
              },
              {
                title: "Security Analysis",
                desc: "Review logs, insights, and risk assessments.",
                topic: "Analysis",
              },
              {
                title: "Best Practices",
                desc: "Build strong security habits and awareness.",
                topic: "Prevention",
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
