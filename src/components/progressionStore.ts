"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Settings, Eye, Brain, BookOpen, LucideIcon } from "lucide-react";

export type StageId = 1 | 2 | 3 | 4;

export type StageStatus = "locked" | "current" | "completed" | "available";

export interface StageDefinition {
  id: StageId;
  key: "build" | "watch" | "analyst" | "review";
  label: string;
  secondary: string;
  path: string;
  icon: LucideIcon;
  shortDesc: string;
  lockReason: string;
  unlockRequirement: string;
}

export const SIMULATION_STAGES: StageDefinition[] = [
  {
    id: 1,
    key: "build",
    label: "Build Simulation",
    secondary: "Simulation Builder",
    path: "/simulate",
    icon: Settings,
    shortDesc: "Configure environment, attacker profile, and security controls",
    lockReason: "Available by default",
    unlockRequirement: "Configure target system, attacker, vector, and defenses, then compile scenario.",
  },
  {
    id: 2,
    key: "watch",
    label: "Watch The Attack",
    secondary: "Attack Viewer",
    path: "/attack-viewer",
    icon: Eye,
    shortDesc: "Observe real-time 6-phase attack execution and network telemetry",
    lockReason: "Complete Build Simulation first",
    unlockRequirement: "Finish compiling and launching a scenario in the Simulation Builder.",
  },
  {
    id: 3,
    key: "analyst",
    label: "AI Analyst",
    secondary: "Threat Intelligence",
    path: "/ai-analyst",
    icon: Brain,
    shortDesc: "Review automated CTI report, MITRE ATT&CK mapping, and blast radius",
    lockReason: "Complete Watch The Attack first",
    unlockRequirement: "Observe the full simulated attack sequence to 100% completion.",
  },
  {
    id: 4,
    key: "review",
    label: "Review Findings",
    secondary: "Learning Journal",
    path: "/command-center",
    icon: BookOpen,
    shortDesc: "Study key takeaways, mitigation blueprints, and telemetry debrief",
    lockReason: "Complete AI Analyst first",
    unlockRequirement: "Generate and review the AI Threat Intelligence analysis report.",
  },
];

const STORAGE_KEY = "sentinel_max_unlocked_step";
const CONFIG_KEY = "sentinel_campaign_config";
const UPDATE_EVENT = "sentinel_progress_update";

/**
 * Reads the current maximum unlocked step from sessionStorage.
 * Default is 1 (Build Simulation). Safe for SSR.
 */
export function getMaxUnlockedStage(): StageId {
  if (typeof window === "undefined") return 1;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      return 1;
    }
    const parsed = parseInt(raw, 10);
    if (parsed >= 1 && parsed <= 4) {
      return parsed as StageId;
    }
    sessionStorage.setItem(STORAGE_KEY, "1");
    return 1;
  } catch {
    return 1;
  }
}

/**
 * Check whether a specific stage is unlocked.
 */
export function isStageUnlocked(stageId: StageId): boolean {
  return stageId <= getMaxUnlockedStage();
}

/**
 * Calculate the visual and operational status for a stage.
 */
export function getStageStatus(
  stageId: StageId,
  currentStageId?: StageId,
  overrideMaxUnlocked?: StageId
): StageStatus {
  const maxUnlocked = overrideMaxUnlocked !== undefined ? overrideMaxUnlocked : getMaxUnlockedStage();

  if (stageId > maxUnlocked) {
    return "locked";
  }

  if (currentStageId !== undefined && stageId === currentStageId) {
    return "current";
  }

  if (currentStageId !== undefined && stageId < currentStageId) {
    return "completed";
  }

  if (stageId < maxUnlocked) {
    return "completed";
  }

  return "available";
}

/**
 * Unlocks a stage sequentially up to stageId.
 * Dispatches a progress update event so all listeners sync immediately.
 */
export function unlockStage(stageId: StageId): void {
  if (typeof window === "undefined") return;
  try {
    const currentMax = getMaxUnlockedStage();
    // Enforce sequential unlocking: cannot skip stages (e.g. stage 2 cannot unlock stage 4)
    if (stageId > currentMax && stageId <= currentMax + 1) {
      const target = Math.min(4, Math.max(1, stageId));
      sessionStorage.setItem(STORAGE_KEY, target.toString());
      window.dispatchEvent(new Event(UPDATE_EVENT));
    }
  } catch (e) {
    console.error("[Sentinel Progression] Failed to update stage:", e);
  }
}

/**
 * Marks a stage as genuinely completed and unlocks the next stage.
 */
export function markStageCompleted(stageId: StageId): void {
  if (stageId < 4) {
    unlockStage((stageId + 1) as StageId);
  }
}

/**
 * Resets the entire simulation progression back to Stage 1.
 * Clears active scenario configuration while preserving historical logs.
 */
export function resetSimulationProgression(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
    sessionStorage.removeItem(CONFIG_KEY);
    window.dispatchEvent(new Event(UPDATE_EVENT));
  } catch (e) {
    console.error("[Sentinel Progression] Failed to reset:", e);
  }
}

/**
 * Returns the highest valid unlocked route path.
 */
export function getLatestValidPath(): string {
  const max = getMaxUnlockedStage();
  const stage = SIMULATION_STAGES.find((s) => s.id === max);
  return stage ? stage.path : "/simulate";
}

/**
 * Checks if there is an active compiled campaign configuration in session.
 */
export function hasActiveCampaignConfig(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!sessionStorage.getItem(CONFIG_KEY);
  } catch {
    return false;
  }
}

/**
 * Hook to subscribe to progression state changes and helpers.
 */
export function useProgression(currentStageId?: StageId) {
  const [maxUnlocked, setMaxUnlocked] = useState<StageId>(1);
  const [hasLoaded, setHasLoaded] = useState(false);

  const sync = useCallback(() => {
    setMaxUnlocked(getMaxUnlockedStage());
  }, []);

  useEffect(() => {
    sync();
    setHasLoaded(true);

    window.addEventListener(UPDATE_EVENT, sync);
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(UPDATE_EVENT, sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("storage", sync);
    };
  }, [sync]);

  return {
    maxUnlocked,
    hasLoaded,
    stages: SIMULATION_STAGES,
    isUnlocked: (id: StageId) => id <= maxUnlocked,
    getStatus: (id: StageId) => getStageStatus(id, currentStageId, maxUnlocked),
    getRequirement: (id: StageId) => SIMULATION_STAGES.find((s) => s.id === id)?.unlockRequirement || "",
    getLockReason: (id: StageId) => SIMULATION_STAGES.find((s) => s.id === id)?.lockReason || "",
    unlock: unlockStage,
    completeStage: markStageCompleted,
    reset: resetSimulationProgression,
    latestValidPath: getLatestValidPath(),
  };
}

/**
 * Route protection guard hook.
 * Synchronously checks authorization on the client so child components are
 * never mounted (and never run data-fetching effects) when the stage is locked.
 * isChecking is only true during SSR where sessionStorage is unavailable.
 */
export function useStageGuard(requiredStageId: StageId) {
  const router = useRouter();

  // Compute initial value synchronously on the client.
  // On the server (SSR), window is undefined so we start null (isChecking=true).
  const computeInitial = (): boolean | null => {
    if (typeof window === "undefined") return null;
    return getMaxUnlockedStage() >= requiredStageId;
  };

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(computeInitial);

  useEffect(() => {
    const checkAccess = () => {
      const currentMax = getMaxUnlockedStage();
      if (currentMax < requiredStageId) {
        setIsAuthorized(false);
        const validPath = getLatestValidPath();
        router.replace(validPath);
      } else {
        setIsAuthorized(true);
      }
    };

    // Run once on mount to handle the case where the value may have changed
    // between SSR and hydration, and to set up the event listener.
    checkAccess();

    window.addEventListener(UPDATE_EVENT, checkAccess);
    return () => {
      window.removeEventListener(UPDATE_EVENT, checkAccess);
    };
  }, [requiredStageId, router]);

  return {
    isAuthorized: isAuthorized === true,
    isChecking: isAuthorized === null,
  };
}
