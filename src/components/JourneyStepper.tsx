"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, ArrowRight } from "lucide-react";
import {
  StageId,
  SIMULATION_STAGES,
  StageDefinition,
  useProgression,
} from "./progressionStore";

interface JourneyStepperProps {
  currentStep: StageId;
}

export default function JourneyStepper({ currentStep }: JourneyStepperProps) {
  const router = useRouter();
  const { maxUnlocked, latestValidPath, getStatus } = useProgression(currentStep);

  const [lockedNotice, setLockedNotice] = useState<{
    targetLabel: string;
    lockReason: string;
    unlockReq: string;
  } | null>(null);

  const handleLockedClick = (step: StageDefinition) => {
    setLockedNotice({
      targetLabel: step.label,
      lockReason: step.lockReason,
      unlockReq: step.unlockRequirement,
    });
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mb-10 px-4 print:hidden">
        <div className="glassmorphism-card rounded-xl p-4 sm:p-5 border border-cyber-border/60 bg-cyber-surface/40 backdrop-blur-md relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          {/* Top subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/40 to-transparent" />

          {/* Stepper Header Information */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2 border-b border-cyber-border/30">
            <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
              </span>
              <span className="text-white font-bold">Investigation Workflow</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyber-cyan font-semibold">Sequential Gating Active</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
              <span className="text-slate-500">PHASE 0{currentStep} OF 04:</span>
              <span className="text-white font-bold uppercase tracking-wider flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded border border-cyber-border/40">
                <span className="text-cyber-cyan">●</span>
                {SIMULATION_STAGES[currentStep - 1]?.label}
              </span>
            </div>
          </div>

          {/* Stepper Steps Row */}
          <div className="relative mt-6 pt-1 pb-2 flex items-center justify-between gap-1 sm:gap-2">
            {/* Background connector track */}
            <div className="absolute left-6 right-6 top-[22px] h-[2px] bg-slate-900 z-0" />

            {/* Dynamic Animated Progress Track */}
            <div className="absolute left-6 right-6 top-[22px] h-[2px] z-0 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyber-cyan via-blue-500 to-cyber-green"
                initial={{ width: 0 }}
                animate={{
                  width: `${((Math.max(1, maxUnlocked) - 1) / (SIMULATION_STAGES.length - 1)) * 100}%`,
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>

            {SIMULATION_STAGES.map((step) => {
              const Icon = step.icon;
              const status = getStatus(step.id);
              const isLocked = status === "locked";
              const isCurrent = status === "current";
              const isCompleted = status === "completed";
              const isAvailable = status === "available";

              const iconContent = (
                <>
                  {isLocked ? (
                    <Lock className="w-4 h-4 text-slate-500 transition-transform group-hover:scale-110" />
                  ) : isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}

                  {/* Step index badge on top corner */}
                  <span
                    className={`absolute -top-1.5 -right-1.5 text-[8px] font-mono px-1 rounded-full border ${
                      isCurrent
                        ? "bg-cyber-cyan text-black border-white font-bold"
                        : isCompleted
                        ? "bg-cyber-green text-black border-cyber-green font-bold"
                        : isLocked
                        ? "bg-slate-900 text-slate-500 border-slate-800"
                        : "bg-slate-800 text-slate-300 border-slate-700"
                    }`}
                  >
                    0{step.id}
                  </span>
                </>
              );

              const buttonClass = `relative flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-300 ${
                isCurrent
                  ? "bg-black border-cyber-cyan text-cyber-cyan shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-110 ring-1 ring-cyber-cyan/50 cursor-default"
                  : isCompleted
                  ? "bg-cyber-surface/90 border-cyber-green/60 text-cyber-green hover:border-cyber-green hover:shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                  : isAvailable
                  ? "bg-black/80 border-slate-700 text-slate-300 hover:border-cyber-cyan hover:text-cyber-cyan cursor-pointer"
                  : "bg-black/40 border-slate-800 text-slate-600 opacity-60 cursor-not-allowed hover:border-amber-500/40"
              }`;

              return (
                <div
                  key={step.id}
                  className="relative z-10 flex-1 flex flex-col items-center group select-none"
                >
                  {isLocked ? (
                    <button
                      type="button"
                      onClick={() => handleLockedClick(step)}
                      aria-disabled="true"
                      className={buttonClass}
                      title={`${step.label} [LOCKED] - ${step.lockReason}`}
                    >
                      {iconContent}
                    </button>
                  ) : isCurrent ? (
                    <div
                      className={buttonClass}
                      title={`${step.label} [CURRENT STAGE]`}
                    >
                      {iconContent}
                    </div>
                  ) : (
                    <Link
                      href={step.path}
                      className={buttonClass}
                      title={
                        isCompleted
                          ? `${step.label} [COMPLETED - Click to Revisit]`
                          : `${step.label} [AVAILABLE]`
                      }
                    >
                      {iconContent}
                    </Link>
                  )}

                  {/* Text Status & Labels */}
                  <div
                    className={`flex flex-col items-center mt-2.5 text-center ${
                      isLocked ? "cursor-not-allowed" : isCurrent ? "cursor-default" : "cursor-pointer"
                    }`}
                    onClick={isLocked ? () => handleLockedClick(step) : undefined}
                  >
                    <span
                      className={`hidden md:block text-[10px] font-mono font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isCurrent
                          ? "text-cyber-cyan"
                          : isCompleted
                          ? "text-cyber-green"
                          : isLocked
                          ? "text-slate-600 group-hover:text-slate-500"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    >
                      {step.label}
                    </span>

                    {/* Status Pill Badge */}
                    <span
                      className={`mt-1 text-[8px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border transition-colors ${
                        isCurrent
                          ? "bg-cyber-cyan/15 text-cyber-cyan border-cyber-cyan/40 font-bold"
                          : isCompleted
                          ? "bg-cyber-green/10 text-cyber-green border-cyber-green/30"
                          : isLocked
                          ? "bg-slate-950 text-slate-600 border-slate-900 group-hover:border-amber-500/30"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {isCurrent
                        ? "● CURRENT"
                        : isCompleted
                        ? "✓ COMPLETED"
                        : isLocked
                        ? "🔒 LOCKED"
                        : "→ AVAILABLE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Locked Stage Contextual Modal */}
      <AnimatePresence>
        {lockedNotice && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setLockedNotice(null)}
              className="fixed inset-0 bg-black/80 z-[100] backdrop-blur-sm"
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.1 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] max-w-md z-[101] p-6 rounded-xl border border-cyber-border bg-cyber-surface/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl font-sans text-left"
            >
              {/* Cyan top glowing stripe */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyber-cyan to-transparent rounded-t-xl" />

              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-10 h-10 rounded-lg border border-amber-500/40 bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                    Access Gated &bull; Sequential Investigation
                  </div>
                  <h3 className="text-white text-base font-bold font-mono uppercase mt-0.5">
                    {lockedNotice.targetLabel} is Locked
                  </h3>
                </div>
              </div>

              <div className="bg-black/50 p-3.5 rounded-lg border border-cyber-border/60 text-xs space-y-2 mb-5">
                <div className="text-slate-300 font-medium">
                  <span className="text-slate-500 font-mono text-[10px] uppercase block mb-0.5">
                    Why is this locked?
                  </span>
                  {lockedNotice.lockReason}
                </div>
                <div className="text-slate-400 border-t border-slate-800/80 pt-2 text-[11px] leading-relaxed">
                  <span className="text-cyber-cyan font-mono text-[10px] uppercase block mb-0.5 font-bold">
                    Unlock Requirement:
                  </span>
                  {lockedNotice.unlockReq}
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed mb-6 font-sans">
                Sentinel enforces a real-world security investigation sequence. Complete your active phase to unlock subsequent telemetry and intelligence reports.
              </p>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    setLockedNotice(null);
                    router.push(latestValidPath);
                  }}
                  className="flex-1 py-2.5 px-4 rounded bg-electric-blue hover:bg-blue-600 text-white text-xs font-bold font-mono uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] cursor-pointer"
                >
                  Go to Active Stage
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLockedNotice(null)}
                  className="py-2.5 px-4 rounded border border-slate-800 bg-transparent text-slate-400 hover:text-white hover:border-slate-600 text-xs font-bold font-mono uppercase tracking-widest transition-all duration-300 cursor-pointer"
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
