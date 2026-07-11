import Link from "next/link";
import { Info } from "lucide-react";


const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="relative bg-[#05070a] border-t border-cyber-border/40 py-12 z-10 overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.015),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

          {/* Column 1: Brand & Description */}
          <div className="space-y-4 flex flex-col justify-start h-full">
            <div>
              <h3 className="text-white font-bold tracking-[0.3em] text-sm uppercase font-mono">
                SENTINEL
              </h3>
              <p className="text-cyber-cyan text-[10px] font-mono uppercase tracking-widest font-bold block mt-1">
                Interactive Cybersecurity Learning Platform
              </p>
              <p className="text-slate-400 text-xs leading-relaxed mt-4 font-sans">
                Learn cybersecurity by watching attacks unfold, understanding how they work, and exploring practical defense techniques through interactive simulations.
              </p>
            </div>

            <div className="pt-6">
              <Link
                href="/simulate"
                className="inline-block px-8 py-2.5 rounded bg-white hover:bg-slate-200 text-black text-[10px] font-mono tracking-widest uppercase transition-all duration-300 font-bold"
              >
                Start Learning
              </Link>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 md:pl-12 flex flex-col justify-start">
            <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] font-mono">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-xs font-sans mt-2">
              <li>
                <a
                  href="https://linkedin.com/in/utkarshsingh3011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-400 hover:text-cyber-cyan transition-colors duration-200 flex items-center gap-2.5"
                >
                  <LinkedinIcon className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
                  <span className="font-medium">LinkedIn</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/utkarshsingh3011"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-slate-400 hover:text-cyber-cyan transition-colors duration-200 flex items-center gap-2.5"
                >
                  <GithubIcon className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
                  <span className="font-medium">GitHub</span>
                </a>
              </li>
              <li>
                <Link
                  href="/about"
                  className="group text-slate-400 hover:text-cyber-cyan transition-colors duration-200 flex items-center gap-2.5"
                >
                  <Info className="w-4 h-4 text-slate-500 group-hover:text-cyber-cyan transition-colors" />
                  <span className="font-medium">About</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: About */}
          <div className="space-y-4 flex flex-col justify-start h-full">
            <div>
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em] font-mono">
                About This Project
              </h4>
              <div className="space-y-3.5 mt-4 text-xs text-slate-400 font-sans leading-relaxed">
                <div className="border-l-2 border-cyber-cyan/50 pl-3">
                  <span className="text-slate-500 text-[10px] uppercase tracking-widest font-mono font-bold block">Built by</span>
                  <span className="text-slate-200 font-bold block">Utkarsh Singh</span>
                </div>
                <p className="text-slate-400 leading-relaxed pt-1">
                  Created as an educational cybersecurity project focused on making complex attack concepts easier to understand through interactive visual simulations.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Divider above bottom bar */}
        <div className="mt-12 h-px bg-cyber-border/20" />

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center text-[10px] text-slate-500 font-mono tracking-wider w-full">
          <div className="sm:w-1/3 sm:text-left">
            &copy; {new Date().getFullYear()} SENTINEL
          </div>
          <div className="sm:w-1/3 sm:text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
            </span>
            <span></span>
          </div>
          <div className="sm:w-1/3 sm:text-right uppercase">
            Designed & Developed by Utkarsh Singh
          </div>
        </div>
      </div>
    </footer>
  );
}