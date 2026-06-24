"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Shield, ChevronRight, Database, User, ShieldAlert, ShieldCheck, Play, BarChart3 } from "lucide-react";

const FLOW_STEPS = [
  {
    id: "target",
    title: "1. Choose Target",
    desc: "Select which network environment to test (e.g., Hospital, Bank, or Startup).",
    icon: Database,
    color: "text-blue-500",
    glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]",
  },
  {
    id: "attacker",
    title: "2. Choose Threat Actor",
    desc: "Choose the threat actor profile to simulate their specific style and techniques.",
    icon: User,
    color: "text-cyber-cyan",
    glow: "shadow-[0_0_15px_rgba(6,182,212,0.2)]",
  },
  {
    id: "attack",
    title: "3. Choose Attack Method",
    desc: "Pick an attack vector (e.g., Phishing, SQL Injection, or Ransomware).",
    icon: ShieldAlert,
    color: "text-amber-500",
    glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]",
  },
  {
    id: "defense",
    title: "4. Choose Security Setup",
    desc: "Configure the security strength from Basic Protection up to Enterprise Security.",
    icon: ShieldCheck,
    color: "text-cyber-green",
    glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  },
  {
    id: "run",
    title: "5. Run Simulation",
    desc: "Launch the scenario to watch the attack path and security responses in real time.",
    icon: Play,
    color: "text-indigo-500",
    glow: "shadow-[0_0_15px_rgba(99,102,241,0.2)]",
  },
  {
    id: "results",
    title: "6. View Results",
    desc: "Read the AI Security Report, check standard mappings, and learn prevention strategies.",
    icon: BarChart3,
    color: "text-rose-500",
    glow: "shadow-[0_0_15px_rgba(244,63,94,0.2)]",
  },
];

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);

  // Set up scroll for parallax shifts
  const { scrollY } = useScroll();

  // Parallax offsets for a premium digital agency feel
  const yText = useTransform(scrollY, [0, 800], [0, 100]);
  const yCard = useTransform(scrollY, [0, 800], [0, -50]);
  const opacityFade = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-electric-blue/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[30vw] h-[30vh] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Cyber Grid Decorator */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid-fine opacity-50 pointer-events-none z-0" />

      {/* Crosshair accents on corners */}
      <div className="absolute top-12 left-12 w-6 h-6 border-t border-l border-slate-700 pointer-events-none" />
      <div className="absolute top-12 right-12 w-6 h-6 border-t border-r border-slate-700 pointer-events-none" />
      <div className="absolute bottom-12 left-12 w-6 h-6 border-b border-l border-slate-700 pointer-events-none" />
      <div className="absolute bottom-12 right-12 w-6 h-6 border-b border-r border-slate-700 pointer-events-none" />

      {/* Pulsing command center radar rings behind the timeline */}
      <div className="absolute right-[10%] top-[30%] w-[450px] h-[450px] pointer-events-none z-0 hidden lg:block">
        <motion.div
          animate={{ scale: [1, 1.8], opacity: [0.15, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeOut" }}
          className="absolute inset-0 border border-cyber-cyan/35 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.8], opacity: [0.1, 0] }}
          transition={{ repeat: Infinity, duration: 4, delay: 2, ease: "easeOut" }}
          className="absolute inset-0 border border-electric-blue/35 rounded-full"
        />
        <div className="absolute inset-0 border border-slate-800/20 rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 w-full"
      >
        {/* Typography Text Content */}
        <motion.div
          style={{ y: yText, opacity: opacityFade }}
          className="lg:col-span-6 flex flex-col items-start text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-electric-blue/10 border border-electric-blue/30 text-[10px] font-mono tracking-widest text-cyber-cyan uppercase mb-6"
          >
            <Shield className="w-3 h-3 animate-pulse" />
            Educational Cyber Attack Simulation & Defense
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] text-white"
          >
            Understand Real <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-cyber-cyan to-white">
              Cyber Attacks
            </span>{" "}
            <br />
            in a Safe Environment
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-6 text-sm md:text-base text-slate-400 max-w-xl font-sans leading-relaxed"
          >
            SENTINEL generates real-time, step-by-step attack simulations inside a safe virtual network. Select an attack scenario, watch how it spreads, and learn how to configure security rules to protect network systems.
          </motion.p>

          {/* Why I Built Sentinel Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="mt-6 p-4 rounded bg-cyber-surface/60 border border-cyber-border/80 text-xs text-slate-300 leading-relaxed max-w-xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
            <span className="font-mono text-[9px] uppercase tracking-widest text-cyber-cyan font-bold block mb-1">Why I Built Sentinel</span>
            I created SENTINEL as a student project at Jaypee Institute of Information Technology, Noida (Electronics & Communication Engineering) to make cybersecurity concepts visual and accessible. It translates complex attack methods into a step-by-step learning journey, helping beginners and fellow students understand how attacks propagate and how defense setups block them.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-4"
          >
            <a
              href="#workflow"
              className="px-6 py-3 rounded bg-white hover:bg-slate-200 text-black text-xs font-mono tracking-widest uppercase transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              How It Works
            </a>
            <Link
              href="/simulate"
              className="px-6 py-3 rounded bg-cyber-surface border border-cyber-border hover:border-cyber-border-active text-xs font-mono tracking-widest uppercase text-slate-300 hover:text-white transition-all duration-300"
            >
              Build a Scenario
            </Link>
          </motion.div>
        </motion.div>

        {/* Visual Simulation Lifecycle Flow Diagram */}
        <motion.div
          style={{ y: yCard }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-6 w-full relative"
        >
          <div className="glassmorphism-card rounded-2xl p-6 md:p-8 border border-cyber-border/60 bg-cyber-surface/40 backdrop-blur-md relative overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.04)]">
            {/* Corner decorations */}
            <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-cyan/40" />
            <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-cyan/40" />
            <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyber-cyan/40" />
            <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyber-cyan/40" />

            <div className="mb-6">
              <span className="font-mono text-[9px] uppercase tracking-widest text-cyber-cyan font-bold block mb-1">Execution Guide</span>
              <h3 className="text-white text-lg font-bold font-sans">Simulation Workflow</h3>
              <p className="text-slate-400 text-xs mt-1 font-sans leading-relaxed">
                Follow these six steps to construct, run, and learn from a simulated cybersecurity threat sequence.
              </p>
            </div>

            {/* Vertical Flow Steps */}
            <div className="relative space-y-3">
              {/* Connector Line */}
              <div className="absolute left-[22px] top-6 bottom-6 w-[1.5px] bg-gradient-to-b from-blue-500 via-cyber-cyan to-rose-500 opacity-20" />

              {FLOW_STEPS.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.01 }}
                    className="relative flex gap-4 p-2.5 rounded-xl border border-transparent hover:border-cyber-border/40 hover:bg-black/25 transition-all duration-300 group"
                  >
                    {/* Circle icon */}
                    <div className={`relative z-10 shrink-0 w-11 h-11 rounded-lg border border-cyber-border bg-black/40 flex items-center justify-center text-slate-400 group-hover:text-white transition-all duration-300 group-hover:${step.glow} group-hover:border-cyber-cyan/50`}>
                      <Icon className={`w-5 h-5 ${step.color} transition-transform duration-300 group-hover:scale-110`} />
                    </div>

                    {/* Step descriptions */}
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider group-hover:text-cyber-cyan transition-colors duration-300 flex items-center gap-1.5">
                        {step.title}
                        {idx < 5 && <ChevronRight className="w-3.5 h-3.5 text-slate-650 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />}
                      </h4>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-sans group-hover:text-slate-300 transition-colors duration-300">
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
