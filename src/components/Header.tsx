"use client";

import React, { useState, useEffect } from "react";
import { Shield, Terminal, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? "py-3 bg-cyber-bg/85 backdrop-blur-md border-b border-cyber-border/70 shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
        : "py-6 bg-transparent border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo and Brand */}
        <div
          onClick={() => {
            if (pathname === "/") {
              window.scrollTo({
                top: 0,
                left: 0,
                behavior: "auto",
              });
            } else {
              router.push("/");
            }
          }}
          className="flex items-center gap-3 group cursor-pointer select-none hover:opacity-90 transition-opacity"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-cyber-surface border border-cyber-border-active/40 overflow-hidden">

            <Image
              src="/sentinel-logo.png"
              alt="Sentinel Logo"
              width={22}
              height={22}
              className="object-contain transition-transform duration-500 group-hover:scale-110"
            />

            {/* Subtle Logo Glow */}
            <div className="absolute inset-0 bg-cyber-cyan/10 blur-md pointer-events-none" />

            <motion.div
              animate={{ y: [-15, 25] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="absolute left-0 right-0 h-[1.5px] bg-cyber-cyan shadow-[0_0_8px_#06b6d4] opacity-70 pointer-events-none"
            />

          </div>

          <div className="flex flex-col">
            <span className="font-mono text-lg font-bold tracking-[0.2em] text-white">
              SENTINEL
            </span>

            <span className="text-[9px] font-mono tracking-widest text-slate-500 uppercase">
              Interactive Cybersecurity Learning Platform
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#threats"
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Attack Simulations
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#workflow"
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Security Insights
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#preview"
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Simulation Builder
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href="#features"
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Modules
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <Link
            href="/about"
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            About
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-6">
          {/* Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-surface/60 border border-cyber-border/40 font-mono text-[10px] tracking-wider text-slate-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span className="text-slate-300 uppercase font-semibold">INTERACTIVE LABS AVAILABLE</span>
          </div>

          {/* Launch Console button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <Link
              href="/simulate"
              className="relative px-4 py-2 flex items-center gap-2 rounded bg-electric-blue/15 border border-electric-blue/50 text-xs font-mono tracking-widest text-white uppercase overflow-hidden hover:bg-electric-blue/25 hover:border-electric-blue/80 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300"
            >
              <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
              Start Simulation
              <ArrowUpRight className="w-3 h-3 text-slate-400" />
              {/* Corner decorations */}
              <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyber-cyan" />
              <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-cyber-cyan" />
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header >
  );
}
