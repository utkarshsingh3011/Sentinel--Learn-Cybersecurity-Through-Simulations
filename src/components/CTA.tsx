"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, ArrowRight, Loader, CheckCircle2 } from "lucide-react";

export default function CTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [consoleMsg, setConsoleMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || status !== "idle") return;

    setStatus("submitting");
    setConsoleMsg("Preparing local simulation workspace...");

    setTimeout(() => {
      setConsoleMsg("Creating your access keys...");
    }, 800);

    setTimeout(() => {
      setConsoleMsg("Sandbox environment ready. Initialising access...");
    }, 1600);

    setTimeout(() => {
      setStatus("success");
    }, 2400);
  };

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
          Ready to Learn <br />
          Cyber Defenses?
        </h2>

        <p className="mt-6 text-slate-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Get access to the SENTINEL simulation workspace. Select attack simulations, see how they spread, and learn how to secure networks.
        </p>

        {/* Console Signup Card */}
        <div className="mt-12 max-w-lg mx-auto glassmorphism-card rounded-xl border border-cyber-border overflow-hidden glow-blue text-left">
          {/* Header */}
          <div className="bg-cyber-surface px-4 py-2.5 border-b border-cyber-border flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span className="flex items-center gap-1.5 uppercase">
              <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
              request-simulation-access
            </span>
            <span className="text-cyber-green animate-pulse">SYSTEM READY</span>
          </div>

          {/* Form / Body */}
          <div className="p-6 bg-black/50">
            <AnimatePresence mode="wait">
              {status !== "success" ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="email-address" className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email-address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="student@example.com"
                        disabled={status === "submitting"}
                        className="w-full bg-cyber-surface/50 border border-cyber-border focus:border-cyber-border-active focus:ring-1 focus:ring-cyber-cyan/30 rounded px-3 py-2.5 font-mono text-xs text-white placeholder-slate-600 outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full py-3 rounded bg-electric-blue hover:bg-blue-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:border-transparent text-white font-bold font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 cursor-pointer"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" />
                        Setting Up Sandbox...
                      </>
                    ) : (
                      <>
                        Request Sandbox Access
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {consoleMsg && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-[9px] text-cyber-cyan animate-pulse border-t border-cyber-border/40 pt-3"
                    >
                      &gt; {consoleMsg}
                    </motion.div>
                  )}
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-6 text-center space-y-4 font-mono"
                >
                  <div className="flex justify-center">
                    <CheckCircle2 className="w-10 h-10 text-cyber-green" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">Demo Access Granted</h3>
                    <p className="text-[10px] text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
                      This is a demonstration environment for the SENTINEL cybersecurity simulation platform. No email is sent. You may continue exploring the simulation features.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer console note */}
          <div className="bg-cyber-surface/60 border-t border-cyber-border/40 px-4 py-2 text-[8px] font-mono text-slate-600 flex justify-between">
            <div>SECURE DEPLOYMENT PROTOCOL ACTIVE</div>
            <div>SENTINEL v4.2</div>
          </div>
        </div>

      </div>
    </section>
  );
}
