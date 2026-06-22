import React from "react";
import Header from "../components/Header";
import CyberBackground from "../components/CyberBackground";
import Hero from "../components/Hero";
import ThreatEmergence from "../components/ThreatEmergence";
import HowItWorks from "../components/HowItWorks";
import SimulationPreview from "../components/SimulationPreview";
import Features from "../components/Features";
import CTA from "../components/CTA";
import ScrollReveal from "../components/ScrollReveal";
import Link from "next/link";
import { GraduationCap, BookOpen, ShieldAlert, Briefcase, Presentation } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-electric-blue/30 selection:text-white">
      {/* Immersive animated background */}
      <CyberBackground />

      {/* Sticky Header Navigation */}
      <Header />

      {/* Main Page Content */}
      <main className="flex-grow">
        {/* Fullscreen Hero (handled its own scroll transitions internally) */}
        <Hero />

        {/* Scroll-revealed Threat Vector Flow */}
        <ScrollReveal delay={0.15}>
          <ThreatEmergence />
        </ScrollReveal>

        {/* How Sentinel Works */}
        <ScrollReveal delay={0.15}>
          <HowItWorks />
        </ScrollReveal>

        {/* Timeline Simulation Player */}
        <ScrollReveal delay={0.15}>
          <SimulationPreview />
        </ScrollReveal>

        {/* Modular Feature Subsystems */}
        <ScrollReveal delay={0.15}>
          <Features />
        </ScrollReveal>

        {/* Who Is This For Section */}
        <ScrollReveal delay={0.15}>
          <section className="py-24 bg-black/20 border-t border-cyber-border/40 relative z-10 overflow-hidden">
            {/* Background radial glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[30vh] bg-electric-blue/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="font-mono text-[9px] uppercase tracking-widest text-cyber-cyan font-bold block mb-4">Target Audience</span>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Who Is Sentinel For?</h2>
                <p className="mt-4 text-slate-400 text-sm leading-relaxed">
                  Sentinel is designed to be an accessible, visual entry point for anyone wishing to explore how cybersecurity works in practice.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                  {
                    title: "Students",
                    desc: "Bridge the gap between theoretical textbook concepts and visual, step-by-step network attack timelines.",
                    icon: GraduationCap,
                  },
                  {
                    title: "Beginners",
                    desc: "Demystify cybersecurity jargon and build foundational knowledge through simple English and clear interactive guides.",
                    icon: BookOpen,
                  },
                  {
                    title: "Security Enthusiasts",
                    desc: "Experiment with security configurations and test firewall strength settings in a safe, simulated sandbox.",
                    icon: ShieldAlert,
                  },
                  {
                    title: "Recruiters",
                    desc: "Evaluate the architecture and design of an impressive educational portfolio project built by a motivated student.",
                    icon: Briefcase,
                  },
                  {
                    title: "Academic Demos",
                    desc: "Showcase clear, structured visual simulations during lectures, presentations, or lab study groups.",
                    icon: Presentation,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="bg-cyber-surface/30 border border-cyber-border/40 hover:border-cyber-cyan/35 rounded-xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        <div className="w-10 h-10 rounded-lg bg-cyber-surface border border-cyber-border flex items-center justify-center text-cyber-cyan group-hover:border-cyber-cyan/40 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-white text-sm font-bold uppercase font-mono tracking-wider mt-4 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Signup Terminal CTA */}
        <ScrollReveal delay={0.15}>
          <CTA />
        </ScrollReveal>

        {/* Built With Section */}
        <ScrollReveal delay={0.15}>
          <section className="py-16 bg-black/40 border-t border-cyber-border/20 text-center relative z-10">
            <div className="max-w-7xl mx-auto px-6">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-6">Built With</span>
              <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-cyber-cyan font-extrabold text-sm">N</span> Next.js
                </div>
                <div className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-cyber-cyan font-extrabold text-sm">#</span> Tailwind CSS
                </div>
                <div className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-cyber-cyan font-extrabold text-sm">M</span> Framer Motion
                </div>
                <div className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-cyber-cyan font-extrabold text-sm">AI</span> Gemini API
                </div>
                <div className="flex items-center gap-2 hover:text-white transition-colors">
                  <span className="text-cyber-cyan font-extrabold text-sm">M</span> MITRE ATT&CK Matrix
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      {/* Futuristic Command Center Footer */}
      <footer className="relative bg-black border-t border-cyber-border/40 py-12 z-10 overflow-hidden">
        {/* Decorative Grid Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-slate-500 font-mono text-[10px] tracking-wider">

          {/* Brand copyright */}
          <div className="md:col-span-4 flex flex-col gap-1 text-left">
            <span className="text-white font-bold tracking-[0.2em] uppercase">SENTINEL PLATFORM</span>
            <span>© {new Date().getFullYear()} SENTINEL Cyber Inc. All rights reserved.</span>
            <span className="text-slate-600 uppercase text-[8px] mt-1">
              SECURE DEPLOYMENT NODE: REG-49.882.A
            </span>
          </div>

          {/* Platform status indicator */}
          <div className="md:col-span-4 flex justify-start md:justify-center items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span className="text-slate-400 uppercase">SYS_STATUS: ALL SERVICES OPERATIONAL</span>
          </div>

          {/* Minimal links */}
          <div className="md:col-span-4 flex justify-start md:justify-end gap-6 text-[9px] uppercase">
            <Link href="/about" className="hover:text-cyber-cyan transition-colors">About</Link>
            <a href="https://github.com/utkarshsingh3011/Sentinel-ai-cyber-simulator" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-cyan transition-colors">GitHub Repository</a>
            <Link href="/about#tech-stack" className="hover:text-cyber-cyan transition-colors">Technology Stack</Link>
            <a href="https://www.linkedin.com/in/utkarshsingh3011" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-cyan transition-colors">LinkedIn</a>
          </div>

        </div>
      </footer>
    </div>
  );
}
