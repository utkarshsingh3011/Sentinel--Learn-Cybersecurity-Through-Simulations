"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Terminal, Shield, ArrowRight } from "lucide-react";
import { useProgression, hasActiveCampaignConfig } from "./progressionStore";

export default function CTA() {
  const { maxUnlocked, latestValidPath } = useProgression();
  const hasActiveConfig = hasActiveCampaignConfig();

  return (
    <section id="cta" className="relative py-32 bg-cyber-bg overflow-hidden border-t border-cyber-border/40">
      {/* Background radial glow */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] bg-electric-blue/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">

        {/* Decorative alert icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="mx-auto w-12 h-12 rounded-full bg-electric-blue/10 border border-electric-blue/40 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(37,99,235,0.2)]"
        >
          <Shield className="w-5.5 h-5.5 text-cyber-cyan" />
        </motion.div>

        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
          Ready to Start <br />
          Learning?
        </h2>

        <p className="mt-6 text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Begin exploring interactive cybersecurity simulations, analyze threat behavior, and practice defending virtual networks.
        </p>

        {/* Console Signup Card */}
        <div className="mt-12 max-w-lg mx-auto glassmorphism-card rounded-xl border border-cyber-border overflow-hidden glow-blue text-left">
          {/* Header */}
          <div className="bg-cyber-surface px-4 py-2.5 border-b border-cyber-border flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5 uppercase">
              <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
              initialize-workspace
            </span>
            <span className="text-cyber-cyan font-bold animate-pulse">ONLINE</span>
          </div>

          {/* Form / Body */}
          <div className="p-6 bg-black/50">
            <div className="space-y-4 font-mono text-xs">
              <div className="text-slate-400">
                &gt; Click below to initialize the simulation platform. No registration or installation required.
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/simulate"
                  className="flex-1 py-3 rounded bg-electric-blue hover:bg-blue-600 text-white font-bold font-mono text-center text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 cursor-pointer"
                >
                  Start Learning
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={hasActiveConfig && maxUnlocked > 1 ? latestValidPath : "/simulate"}
                  className="flex-1 py-3 rounded bg-cyber-surface border border-cyber-border hover:border-cyber-cyan/40 text-slate-350 hover:text-white font-bold font-mono text-center text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
                >
                  {hasActiveConfig && maxUnlocked > 1 ? "Resume Investigation" : "Launch Simulation"}
                </Link>
              </div>
            </div>
          </div>

          {/* Footer console note */}
          <div className="bg-cyber-surface/60 border-t border-cyber-border/40 px-4 py-2 text-[8px] font-mono text-slate-600 flex justify-between">
            <div>EDUCATIONAL LAB ENVIRONMENT ACTIVE</div>
            <div>SENTINEL v4.2</div>
          </div>
        </div>

      </div>
    </section>
  );
}
