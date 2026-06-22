"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Brain, Cpu, Layers, 
  BookOpen, Lightbulb, Compass, Award
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "../../components/Header";

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toUTCString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  return <span>{time || "00:00:00 UTC"}</span>;
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-cyber-bg text-slate-200 selection:bg-electric-blue/30 selection:text-white">
      
      {/* Background radial glows & grids */}
      <div className="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid-fine opacity-40 pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[45vh] bg-electric-blue/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vh] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Sticky Header Navigation */}
      <Header />

      <main className="flex-grow pt-32 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-4xl mx-auto px-6"
        >
          
          {/* Navigation back */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-400 hover:text-white uppercase mb-8 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Return to Home Page
          </Link>

          {/* Top Human-Readable Explanation */}
          <div className="mb-8 p-5 rounded bg-cyber-surface/60 border border-cyber-border/80 text-xs text-slate-300 leading-relaxed max-w-4xl relative overflow-hidden space-y-3">
            <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
            <div>
              <strong className="text-white block mb-0.5">What is this?</strong>
              An educational overview explaining the architecture, technology stack, and design of the AEGIS simulation platform.
            </div>
            <div>
              <strong className="text-white block mb-0.5">Why does it matter?</strong>
              It provides developers, students, and recruiters with a clear look under the hood at how Next.js, Framer Motion, and the Gemini API are integrated.
            </div>
            <div>
              <strong className="text-white block mb-0.5">What can I do here?</strong>
              Learn about the project purpose, explore the system modules, examine the technology stack, and review the future development roadmap.
            </div>
          </div>

          {/* Page Intro Title */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-4">
              <BookOpen className="w-3.5 h-3.5 text-cyber-cyan" />
              Document Node: about-project.exe
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase">
              About the AEGIS Platform
            </h1>
            <p className="mt-4 text-slate-400 text-sm md:text-base leading-relaxed">
              AEGIS is an educational cybersecurity simulation platform that helps students, beginners, and security enthusiasts understand how modern cyberattacks work and how organizations defend against them.
            </p>
          </div>

          <div className="space-y-16">
            
            {/* 1. Project Overview & Purpose */}
            <section className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
              <h2 className="text-white font-mono text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyber-cyan" />
                [1.0] Project Overview & Purpose
              </h2>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
                <p>
                  Cybersecurity concepts are often locked behind dense jargon and command-line interfaces. AEGIS was built to make these complex processes visible and intuitive. By combining custom simulation controls, real-time playbacks, and AI-driven analysis, AEGIS allows users to safely watch how attacks spread across networks and study defensive protections in real-time.
                </p>
                <p>
                  Whether you are a recruiter evaluating technical competency, a professor verifying architectural frameworks, or a beginner starting your cybersecurity journey, AEGIS is designed to convey the core mechanics of threat blocking and defense in less than 60 seconds.
                </p>
              </div>
            </section>

            {/* 2. Why I Built AEGIS */}
            <section className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
              <h2 className="text-white font-mono text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-cyber-cyan" />
                [2.0] Why I Built AEGIS
              </h2>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
                <p>
                  As a student learning cybersecurity, I noticed a huge gap between textbook theory and practical, visual understanding. Concepts like port scanning, lateral network movement, and credential protection are often taught purely through text or complex command-line logs, making it hard for beginners to grasp the &quot;big picture.&quot;
                </p>
                <p>
                  I built AEGIS as an educational student project to bridge this gap. My goal was to create a visual, interactive simulation workspace that makes cybersecurity concepts clear and accessible. It serves as:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
                  <li><strong className="text-slate-200">A Visual Textbook:</strong> Turning abstract network logs into interactive timeline playback animations.</li>
                  <li><strong className="text-slate-200">A Safe Sandbox:</strong> Demonstrating attack steps deep within a network without any setup or security risks.</li>
                  <li><strong className="text-slate-200">A Portfolio Showcase:</strong> Demonstrating how React, Next.js, Framer Motion, and generative AI can be integrated into a premium educational tool.</li>
                </ul>
              </div>
            </section>

            {/* 3. Core Features */}
            <section className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
              <h2 className="text-white font-mono text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyber-cyan" />
                [3.0] Platform Modules
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-2">
                <div className="bg-black/35 p-4 rounded border border-cyber-border">
                  <h3 className="text-white font-mono uppercase tracking-wider font-bold mb-1">Simulation Builder</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Custom-build attack simulations by selecting target environments, attacker profiles, attack scenarios, and security strengths.
                  </p>
                </div>
                <div className="bg-black/35 p-4 rounded border border-cyber-border">
                  <h3 className="text-white font-mono uppercase tracking-wider font-bold mb-1">Attack Viewer</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Observe the attack playback step-by-step. Includes an educational guide panel and live logs monitoring gateway and internal networks.
                  </p>
                </div>
                <div className="bg-black/35 p-4 rounded border border-cyber-border">
                  <h3 className="text-white font-mono uppercase tracking-wider font-bold mb-1">AI Analyst Console</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Generates a clear AI security report using the Gemini API. Features a 30-second Quick Summary panel and security improvement recommendations.
                  </p>
                </div>
                <div className="bg-black/35 p-4 rounded border border-cyber-border">
                  <h3 className="text-white font-mono uppercase tracking-wider font-bold mb-1">Security Insights Dashboard</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Dashboard tracking past simulations, average security scores, target environment distributions, and effectiveness rates mapped to standard techniques.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. Architecture & Technology Stack */}
            <section id="tech-stack" className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
              <h2 className="text-white font-mono text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyber-cyan" />
                [4.0] Architecture & Technology Stack
              </h2>
              <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
                <p>
                  AEGIS is structured as a client-first React application deployed on Vercel. It leverages serverless server endpoints for external API requests.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
                  <div className="p-4 bg-black/40 border border-cyber-border rounded">
                    <span className="text-cyber-cyan font-bold block mb-2 uppercase text-[10px]">Framework</span>
                    <strong className="text-white block">Next.js 16 (React 19)</strong>
                    <span className="text-slate-500 block mt-1 text-[10px]">App Router architecture utilizing Server Actions and API route handlers.</span>
                  </div>
                  <div className="p-4 bg-black/40 border border-cyber-border rounded">
                    <span className="text-cyber-cyan font-bold block mb-2 uppercase text-[10px]">Styling & Animations</span>
                    <strong className="text-white block">Tailwind CSS v4 & Framer Motion</strong>
                    <span className="text-slate-500 block mt-1 text-[10px]">High-performance styling and custom keyframe timeline playback animations.</span>
                  </div>
                  <div className="p-4 bg-black/40 border border-cyber-border rounded">
                    <span className="text-cyber-cyan font-bold block mb-2 uppercase text-[10px]">Security Standard</span>
                    <strong className="text-white block">MITRE ATT&CK Mapping</strong>
                    <span className="text-slate-500 block mt-1 text-[10px]">Attack techniques mapped directly to standard industry security IDs (e.g. T1566 for Phishing, T1486 for Encryption).</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 5. Gemini API Integration */}
            <section className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
              <h2 className="text-white font-mono text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyber-cyan" />
                [5.0] Gemini API Integration
              </h2>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
                <p>
                  The AI Security Analyst Console integrates Google&apos;s <strong className="text-white">Gemini 2.5 Flash / 1.5 Flash</strong> model to generate reports. 
                  When a simulation concludes, security logs are sent to the Next.js API endpoint `/api/analyze`.
                </p>
                <p>
                  To guarantee reliability, we invoke the Gemini API using <strong className="text-white">Structured JSON Output</strong>. By providing a strict JSON schema, the API is constrained to return a perfectly formatted security report, ensuring structured data is parsed instantly.
                </p>
                <div className="bg-black/40 border border-cyber-border p-4 rounded font-mono text-[10px] text-slate-400 space-y-1">
                  <div className="text-slate-500">{"// Structured Report Schema"}</div>
                  <div>{"{"}</div>
                  <div className="pl-4">&quot;executiveSummary&quot;: &quot;string&quot;,</div>
                  <div className="pl-4">&quot;attackerProfile&quot;: &quot;string&quot;,</div>
                  <div className="pl-4">&quot;businessImpact&quot;: {"{ \"financialLoss\": \"string\", \"downtime\": \"string\" }"},</div>
                  <div className="pl-4">&quot;mitigations&quot;: &quot;string[]&quot;</div>
                  <div>{"}"}</div>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  *Fallback: If no API key is configured, a high-fidelity local report compiler processes parameters, ensuring recruiters can test all report sections without setup delays.*
                </p>
              </div>
            </section>

            {/* 6. Future Roadmap */}
            <section className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
              <h2 className="text-white font-mono text-xs uppercase tracking-widest font-bold mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyber-cyan" />
                [6.0] Future Platform Roadmap
              </h2>
              <div className="space-y-4 text-sm text-slate-300 leading-relaxed font-sans">
                <p>
                  AEGIS is actively developed. Future enhancements include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-400 pl-2">
                  <li><strong className="text-slate-200">Active Defenses:</strong> Toggle firewall rules and network limits *during* simulation playback to see the attacker blocked in real-time.</li>
                  <li><strong className="text-slate-200">Custom Network Layouts:</strong> Upload network configuration files to instantly render custom visual network diagrams.</li>
                  <li><strong className="text-slate-200">Multi-Stage Attacks:</strong> Run complex, multi-step simulations testing defense limits against prolonged digital threats.</li>
                </ul>
              </div>
            </section>

          </div>
        </motion.div>
      </main>

      {/* Futuristic Command Center Footer */}
      <footer className="relative bg-black border-t border-cyber-border/40 py-12 z-10 overflow-hidden">
        {/* Decorative Grid Line */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-slate-500 font-mono text-[10px] tracking-wider">
          
          {/* Brand copyright */}
          <div className="md:col-span-4 flex flex-col gap-1 text-left">
            <span className="text-white font-bold tracking-[0.2em] uppercase">AEGIS PLATFORM</span>
            <span>© {new Date().getFullYear()} AEGIS Cyber Inc. All rights reserved.</span>
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
            <span className="text-slate-400 uppercase flex items-center gap-1.5">
              SYS: OPERATIONAL | <LiveClock />
            </span>
          </div>

          {/* Minimal links */}
          <div className="md:col-span-4 flex justify-start md:justify-end gap-6 text-[9px] uppercase">
            <Link href="/about" className="hover:text-cyber-cyan transition-colors">About</Link>
            <a href="https://github.com/utkarshsingh3011/AEGIS-ai-cyber-simulator" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-cyan transition-colors">GitHub Repository</a>
            <Link href="/about#tech-stack" className="hover:text-cyber-cyan transition-colors">Technology Stack</Link>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyber-cyan transition-colors">LinkedIn</a>
          </div>

        </div>
      </footer>

    </div>
  );
}
