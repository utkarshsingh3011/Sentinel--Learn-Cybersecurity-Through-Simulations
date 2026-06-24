import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-cyber-border/40 py-16 z-10 overflow-hidden">
      {/* Top Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />

      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.02),transparent_70%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h3 className="text-white font-bold tracking-[0.3em] text-sm uppercase">
                SENTINEL
              </h3>
              <span className="px-2 py-0.5 rounded border border-cyber-cyan/30 bg-cyber-cyan/5 text-cyber-cyan font-mono text-[8px] font-bold uppercase tracking-wider">
                Student Project
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              SENTINEL is an interactive cybersecurity learning platform built to demystify complex cyberattack chains. By mapping attack paths step-by-step and explaining defenses, it helps students, beginners, and tech enthusiasts learn core cybersecurity concepts in a safe, visual environment.
            </p>

            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
              Learn • Simulate • Defend
            </div>
          </div>

          {/* Student Profile & Links */}
          <div className="flex flex-col lg:items-end justify-between h-full gap-6">
            <div className="space-y-2 lg:text-right">
              <h4 className="text-white text-xs font-bold uppercase tracking-[0.2em]">
                Project Creator
              </h4>
              <p className="text-slate-350 text-xs font-medium">
                Utkarsh Singh
              </p>
              <p className="text-slate-500 text-[11px]">
                Jaypee Institute of Information Technology, Noida
                <br />
                Electronics & Communication Engineering
              </p>
            </div>

            <div className="flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest">
              <a
                href="https://github.com/utkarshsingh3011/SENTINEL"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyber-cyan transition-colors"
              >
                GitHub
              </a>
              <span className="text-slate-700">|</span>
              <a
                href="https://www.linkedin.com/in/utkarshsingh3011"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyber-cyan transition-colors"
              >
                LinkedIn
              </a>
              <span className="text-slate-700">|</span>
              <Link
                href="/about"
                className="text-slate-400 hover:text-cyber-cyan transition-colors"
              >
                About Project
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 h-px bg-gradient-to-r from-transparent via-cyber-border/30 to-transparent" />

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-wrap justify-center items-center gap-3 text-center">
          <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
            SENTINEL — Interactive Cybersecurity Learning Platform
          </span>
          <span className="text-slate-800">•</span>
          <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest">
            Built as an educational tool for ECE/CSE students
          </span>
        </div>
      </div>
    </footer>
  );
}