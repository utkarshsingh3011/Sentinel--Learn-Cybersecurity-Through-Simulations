"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Eye, FileText, BookOpen, Check, Lock } from "lucide-react";

interface JourneyStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { id: 1, label: "Build Simulation", secondary: "Simulation Builder", path: "/simulate", icon: Settings },
  { id: 2, label: "Watch The Attack", secondary: "Attack Viewer", path: "/attack-viewer", icon: Eye },
  { id: 3, label: "Understand What Happened", secondary: "AI Analyst", path: "/ai-analyst", icon: FileText },
  { id: 4, label: "Key Lessons", secondary: "Learning Journal", path: "/command-center", icon: BookOpen },
];

/** Read the current unlocked step synchronously (safe: "use client" only). */
function readMaxUnlocked(): number {
  if (typeof window === "undefined") return 1;
  const raw = sessionStorage.getItem("sentinel_max_unlocked_step");
  const parsed = raw ? parseInt(raw, 10) : 1;
  // Write default if missing
  if (!raw) sessionStorage.setItem("sentinel_max_unlocked_step", "1");
  return Number.isFinite(parsed) ? parsed : 1;
}

export default function JourneyStepper({ currentStep }: JourneyStepperProps) {
  const router = useRouter();
  // Lazy initializer: reads sessionStorage synchronously on first render —
  // avoids the flash where maxUnlockedStep briefly defaults to 1 before useEffect fires.
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(() => readMaxUnlocked());
  const [showLockedModal, setShowLockedModal] = useState(false);

  useEffect(() => {
    // Keep in sync when other pages fire the progress event
    const handleUpdate = () => {
      setMaxUnlockedStep(readMaxUnlocked());
    };

    // Also re-sync on focus in case sessionStorage was updated in another tab / page transition
    window.addEventListener("sentinel_progress_update", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    return () => {
      window.removeEventListener("sentinel_progress_update", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, []);

  // The ONLY navigable "next" step is exactly maxUnlockedStep + 1
  const nextRequiredStep = Math.min(maxUnlockedStep + 1, 4);
  const nextRequiredPath = STEPS[nextRequiredStep - 1]?.path ?? "/simulate";

  const handleStepClick = (e: React.MouseEvent, stepId: number) => {
    // Always allow: already completed or is the current step
    if (stepId <= maxUnlockedStep) return;

    // Allow: the single immediate next step
    if (stepId === maxUnlockedStep + 1) return;

    // Anything else: locked — show modal
    e.preventDefault();
    setShowLockedModal(true);
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mb-10 px-4 print:hidden">
        <div className="glassmorphism-card rounded-xl p-4 border border-cyber-border/60 bg-cyber-surface/35 backdrop-blur-md relative overflow-hidden">
          {/* Top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
              </span>
              <span>Learning Journey Progress</span>
            </div>

            <div className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
              <span>STEP 0{currentStep} / 04:</span>
              <span className="text-white font-bold uppercase tracking-widest flex items-center gap-1">
                {STEPS[currentStep - 1].label}
                <span className="text-slate-500 font-normal lowercase font-sans">({STEPS[currentStep - 1].secondary})</span>
              </span>
            </div>
          </div>

          {/* Stepper Steps Row */}
          <div className="relative mt-5 flex items-center justify-between gap-2">
            {/* Background connector line */}
            <div className="absolute left-6 right-6 top-[22px] h-[1.5px] bg-slate-900 z-0" />

            {/* Animated progress fill */}
            <div className="absolute left-6 right-6 top-[22px] h-[1.5px] z-0">
              <motion.div
                className="h-full bg-gradient-to-r from-cyber-cyan via-blue-500 to-cyber-green"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            </div>

            {STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              // Hard-locked: more than one step beyond maxUnlocked
              const isHardLocked = step.id > maxUnlockedStep + 1;
              // Soft-accessible: exactly the next step (maxUnlockedStep + 1)
              const isNextStep = !isHardLocked && step.id > currentStep && step.id <= maxUnlockedStep + 1;

              return (
                <div key={step.id} className="relative z-10 flex-1 flex flex-col items-center group">
                  <Link
                    href={isHardLocked ? "#" : step.path}
                    onClick={(e) => handleStepClick(e, step.id)}
                    className={`relative flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-300 ${
                      isActive
                        ? "bg-black border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-110"
                        : isCompleted
                        ? "bg-cyber-surface/80 border-cyber-green/50 text-cyber-green hover:border-cyber-green"
                        : isNextStep
                        ? "bg-black/60 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                        : isHardLocked
                        ? "bg-black/20 border-slate-950 text-slate-700 opacity-40 cursor-not-allowed pointer-events-none"
                        : "bg-black/60 border-slate-900 text-slate-400 hover:border-slate-800"
                    }`}
                  >
                    {isHardLocked ? (
                      <Lock className="w-4 h-4 text-slate-600" />
                    ) : isCompleted ? (
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </Link>

                  <span
                    className={`hidden md:flex flex-col items-center text-[9px] font-mono font-bold uppercase tracking-wider mt-2.5 transition-colors duration-300 ${
                      isActive
                        ? "text-cyber-cyan"
                        : isCompleted
                        ? "text-cyber-green"
                        : isHardLocked
                        ? "text-slate-700 opacity-40"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="text-center">{step.label}</span>
                    <span className="text-slate-500 text-[8px] font-normal lowercase tracking-wide mt-0.5">
                      ({step.secondary})
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Locked Step Modal */}
      <AnimatePresence>
        {showLockedModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLockedModal(false)}
              className="fixed inset-0 bg-black z-[100] backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm z-[101] p-6 rounded-xl border border-cyber-border bg-cyber-surface/95 shadow-[0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-xl font-sans text-center"
            >
              {/* Top glow stripe */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent rounded-t-xl" />

              {/* Lock icon */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900/80 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
              </div>

              <h3 className="text-white text-sm font-bold uppercase tracking-wider font-mono mb-2">
                Complete the previous step first
              </h3>

              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Finish the previous learning stage before continuing. Sentinel is designed to guide you through the complete attack story one step at a time.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setShowLockedModal(false);
                    router.push(nextRequiredPath);
                  }}
                  className="w-full py-2.5 px-4 rounded bg-electric-blue hover:bg-blue-600 text-white text-xs font-bold font-mono uppercase tracking-widest transition-all duration-300 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                >
                  Continue Learning
                </button>
                <button
                  onClick={() => setShowLockedModal(false)}
                  className="w-full py-2.5 px-4 rounded border border-slate-800 bg-transparent text-slate-400 hover:text-white hover:border-slate-600 text-xs font-bold font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer"
                >
                  Stay Here
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
