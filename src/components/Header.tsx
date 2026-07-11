"use client";

import React, { useState, useEffect } from "react";
import { Shield, Terminal, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { getCampaignHistory } from "./campaignStore";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const [startSimPath, setStartSimPath] = useState("/simulate");
  const [isInvestigationActive, setIsInvestigationActive] = useState(false);
  const [historyCount, setHistoryCount] = useState(0);
  const [badgeHovered, setBadgeHovered] = useState(false);

  useEffect(() => {
    const checkActiveSimulation = () => {
      if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem("sentinel_campaign_config");
        const maxUnlocked = parseInt(sessionStorage.getItem("sentinel_max_unlocked_step") || "1", 10);
        if (saved && maxUnlocked > 1) {
          setIsInvestigationActive(true);
          const pathMap: Record<number, string> = {
            1: "/simulate",
            2: "/attack-viewer",
            3: "/ai-analyst",
            4: "/command-center"
          };
          setStartSimPath(pathMap[maxUnlocked] || "/simulate");
        } else {
          setIsInvestigationActive(false);
          setStartSimPath("/simulate");
        }

        try {
          const history = getCampaignHistory();
          setHistoryCount(history.length);
        } catch (e) {
          console.error(e);
        }
      }
    };

    checkActiveSimulation();
    window.addEventListener("sentinel_progress_update", checkActiveSimulation);
    window.addEventListener("focus", checkActiveSimulation);
    return () => {
      window.removeEventListener("sentinel_progress_update", checkActiveSimulation);
      window.removeEventListener("focus", checkActiveSimulation);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getNavHref = (target: string) => {
    return pathname === "/" ? target : `/${target}`;
  };

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
            href={getNavHref("#threats")}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Attack Simulations
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href={getNavHref("#workflow")}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Security Insights
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href={getNavHref("#preview")}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Simulation Builder
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <a
            href={getNavHref("#features")}
            className="text-xs font-mono text-slate-400 hover:text-white transition-colors tracking-widest uppercase relative py-1 group"
          >
            Modules
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-cyber-cyan transition-all duration-300 group-hover:w-full" />
          </a>
          <Link
            href="/about"
            className={`text-xs font-mono tracking-widest uppercase relative py-1 transition-colors group ${
              pathname === "/about" ? "text-cyber-cyan font-bold" : "text-slate-400 hover:text-white"
            }`}
          >
            About
            <span className={`absolute bottom-0 left-0 h-[1px] bg-cyber-cyan transition-all duration-300 ${
              pathname === "/about" ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </Link>
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-6">
          {/* Status Indicator */}
          <div
            onMouseEnter={() => setBadgeHovered(true)}
            onMouseLeave={() => setBadgeHovered(false)}
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyber-surface/60 border border-cyber-border/40 font-mono text-[10px] tracking-wider text-slate-400 relative cursor-pointer transition-colors hover:border-cyber-cyan/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span className="text-slate-300 uppercase font-semibold">
              {badgeHovered ? `LABS: ${historyCount} RUNS IN HISTORY` : "INTERACTIVE LABS AVAILABLE"}
            </span>

            <AnimatePresence>
              {badgeHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 p-2.5 bg-cyber-surface border border-cyber-border-active/40 rounded shadow-xl text-[9px] w-48 text-slate-400 z-50 pointer-events-none"
                >
                  <div className="text-white font-bold mb-1 font-mono uppercase tracking-wider text-cyber-cyan border-b border-cyber-border pb-1">
                    System Telemetry
                  </div>
                  <div>Stored Scenarios: <span className="text-white font-bold">{historyCount}</span></div>
                  <div>Sandbox API: <span className="text-cyber-green font-bold font-mono">ONLINE</span></div>
                  <div className="mt-1 text-[8px] text-slate-500 italic">Hover to refresh telemetry details</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Launch Console button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex"
          >
            <Link
              href={startSimPath}
              className={`relative px-4 py-2 flex items-center gap-2 rounded text-xs font-mono tracking-widest text-white uppercase overflow-hidden transition-all duration-300 ${
                isInvestigationActive
                  ? "bg-cyber-cyan/15 border border-cyber-cyan/50 hover:bg-cyber-cyan/25 hover:border-cyber-cyan/85 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse-subtle"
                  : "bg-electric-blue/15 border border-electric-blue/50 hover:bg-electric-blue/25 hover:border-electric-blue/80 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)]"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
              {isInvestigationActive ? "Resume Investigation" : "Start Simulation"}
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
