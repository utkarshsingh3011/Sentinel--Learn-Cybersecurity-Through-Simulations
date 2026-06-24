"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Settings, Eye, FileText, BookOpen, ChevronRight, Check } from "lucide-react";

interface JourneyStepperProps {
  currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { id: 1, label: "Setup Scenario", path: "/simulate", icon: Settings },
  { id: 2, label: "Watch Attack", path: "/attack-viewer", icon: Eye },
  { id: 3, label: "Simulation Review", path: "/ai-analyst", icon: FileText },
  { id: 4, label: "Learning Journal", path: "/command-center", icon: BookOpen },
];

export default function JourneyStepper({ currentStep }: JourneyStepperProps) {
  return (
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
            <span className="text-white font-bold uppercase tracking-widest">
              {STEPS[currentStep - 1].label}
            </span>
          </div>
        </div>

        {/* Stepper Steps Row */}
        <div className="relative mt-5 flex items-center justify-between gap-2">
          {/* Connector Line behind steps */}
          <div className="absolute left-6 right-6 top-[22px] h-[1.5px] bg-slate-900 z-0" />
          
          {/* Animated active path length connector */}
          <div className="absolute left-6 right-6 top-[22px] h-[1.5px] z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-cyber-cyan via-blue-500 to-cyber-green"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` 
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isPending = currentStep < step.id;

            return (
              <div key={step.id} className="relative z-10 flex-1 flex flex-col items-center group">
                <Link
                  href={step.path}
                  className={`flex items-center justify-center w-11 h-11 rounded-lg border transition-all duration-300 ${
                    isActive
                      ? "bg-black border-cyber-cyan text-cyber-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)] scale-110"
                      : isCompleted
                      ? "bg-cyber-surface/80 border-cyber-green/50 text-cyber-green hover:border-cyber-green"
                      : "bg-black/60 border-slate-900 text-slate-650 pointer-events-none sm:pointer-events-auto sm:hover:border-slate-800"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </Link>

                <span
                  className={`hidden md:block text-[9px] font-mono font-bold uppercase tracking-wider mt-2.5 transition-colors duration-300 ${
                    isActive
                      ? "text-cyber-cyan"
                      : isCompleted
                      ? "text-cyber-green"
                      : "text-slate-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
