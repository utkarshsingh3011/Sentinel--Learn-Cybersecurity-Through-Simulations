"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft, Lightbulb, Activity, Shield, Cpu,
  Layers, Play, FileText, CheckCircle2, BookOpen
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "../../components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-cyber-bg text-slate-200 selection:bg-electric-blue/30 selection:text-white font-sans">

      {/* Background radial glows & grids */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid-fine opacity-40 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[45vh] bg-electric-blue/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vh] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Sticky Header Navigation */}
      <Header />

      <main className="flex-grow pt-36 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6 space-y-20"
        >

          {/* Navigation back */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 hover:text-white uppercase transition-colors group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Return to Home Page
            </Link>
          </div>

          {/* SECTION 1: About Sentinel */}
          <section className="space-y-6">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase">
              <Shield className="w-3.5 h-3.5" />
              Overview
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              About Sentinel
            </h1>
            <p className="text-slate-300 text-base md:text-lg leading-relaxed max-w-3xl font-sans">
              Sentinel is an interactive cybersecurity learning platform designed to make cyber attacks easier to understand.
            </p>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl font-sans">
              Instead of reading long technical explanations, users can build attack scenarios, watch them unfold step by step, explore what happened, and learn how different security measures stop them.
            </p>
          </section>

          {/* SECTION 2: Why I Built It */}
          <section className="space-y-6 pt-6 border-t border-cyber-border/20">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase">
              <Lightbulb className="w-3.5 h-3.5" />
              Purpose
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Why I Built It
            </h2>
            <div className="space-y-4 text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl font-sans">
              <p>
                When I first started learning cybersecurity, I realized many concepts were difficult to visualize.
              </p>
              <p>
                Most resources explained attacks using slides, terminal logs, or long documentation.
              </p>
              <p>
                I built Sentinel to make cybersecurity more interactive and easier to understand through visual simulations.
              </p>
            </div>
          </section>

          {/* SECTION 3: What You Can Do */}
          <section className="space-y-8 pt-6 border-t border-cyber-border/20">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase">
              <Layers className="w-3.5 h-3.5" />
              Capabilities
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              What You Can Do
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Card 1 */}
              <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border bg-cyber-surface/30 hover:border-cyber-cyan/35 transition-all duration-300 relative overflow-hidden group">
                <span className="absolute top-0 left-0 w-2 h-full bg-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-cyber-surface border border-cyber-border flex items-center justify-center text-cyber-cyan">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </span>
                  <h3 className="text-white text-sm font-bold uppercase font-mono tracking-wider">
                    Build Scenarios
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Create custom attack simulations.
                </p>
              </div>

              {/* Card 2 */}
              <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border bg-cyber-surface/30 hover:border-cyber-cyan/35 transition-all duration-300 relative overflow-hidden group">
                <span className="absolute top-0 left-0 w-2 h-full bg-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-cyber-surface border border-cyber-border flex items-center justify-center text-cyber-cyan">
                    <Activity className="w-4 h-4" />
                  </span>
                  <h3 className="text-white text-sm font-bold uppercase font-mono tracking-wider">
                    Watch Attacks
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  See every stage of an attack unfold visually.
                </p>
              </div>

              {/* Card 3 */}
              <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border bg-cyber-surface/30 hover:border-cyber-cyan/35 transition-all duration-300 relative overflow-hidden group">
                <span className="absolute top-0 left-0 w-2 h-full bg-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-cyber-surface border border-cyber-border flex items-center justify-center text-cyber-cyan">
                    <FileText className="w-4 h-4" />
                  </span>
                  <h3 className="text-white text-sm font-bold uppercase font-mono tracking-wider">
                    Review Reports
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Understand what happened using simple explanations.
                </p>
              </div>

              {/* Card 4 */}
              <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border bg-cyber-surface/30 hover:border-cyber-cyan/35 transition-all duration-300 relative overflow-hidden group">
                <span className="absolute top-0 left-0 w-2 h-full bg-cyber-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-8 rounded-lg bg-cyber-surface border border-cyber-border flex items-center justify-center text-cyber-cyan">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <h3 className="text-white text-sm font-bold uppercase font-mono tracking-wider">
                    Learn Defenses
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Explore practical security measures that stop attacks.
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 4: Technology */}
          <section className="space-y-6 pt-6 border-t border-cyber-border/20">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase">
              <Cpu className="w-3.5 h-3.5" />
              Stack
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Technology
            </h2>
            <div className="flex flex-wrap gap-3 pt-2">
              {[
                "Next.js",
                "TypeScript",
                "Tailwind CSS",
                "Framer Motion",
                "GSAP",
                "Gemini API",
                "MITRE ATT&CK"
              ].map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full bg-cyber-surface/60 border border-cyber-border/80 text-xs font-mono font-bold text-slate-300 tracking-wider hover:border-cyber-cyan/30 hover:text-white transition-all duration-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>

          {/* SECTION 5: Educational Purpose */}
          <section className="space-y-6 pt-6 border-t border-cyber-border/20">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase">
              <BookOpen className="w-3.5 h-3.5" />
              Purpose
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Educational Purpose
            </h2>
            <div className="glassmorphism-card rounded-xl p-6 md:p-8 border border-cyber-border bg-cyber-surface/30 max-w-3xl">
              <div className="space-y-4 text-slate-400 text-sm md:text-base leading-relaxed font-sans">
                <p>
                  Sentinel is an educational cybersecurity learning platform created to help students and beginners understand how cyber attacks unfold through safe, interactive simulations.
                </p>
                <p>
                  Every scenario takes place inside a controlled virtual environment designed for learning. Sentinel does not interact with real systems, perform offensive security operations, or target real networks.
                </p>
                <p>
                  Its purpose is to encourage cybersecurity awareness, defensive thinking, and hands-on learning through visual experiences.
                </p>
              </div>
            </div>
          </section>

        </motion.div>
      </main>

      {/* Global Footer */}
      <Footer />

    </div>
  );
}
