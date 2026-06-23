"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { saveCampaignToHistory, getFriendlySimulationName, getActorName, getAttackName, getIndustryName, getSecurityLevelName } from "../../components/campaignStore";
import AnimatedCounter from "../../components/AnimatedCounter";
import {
  Play, Pause, RotateCcw, ArrowLeft, Terminal,
  Activity, ShieldCheck, Brain, ChevronRight, Layers, ShieldAlert, CheckCircle2, AlertOctagon, Info
} from "lucide-react";

interface CampaignStage {
  title: string;
  description: string;
  log: string;
  status: "evaded" | "blocked" | "alerted";
  severity: "low" | "medium" | "high" | "critical";
}

interface CampaignConfig {
  industry: string;
  threatActor: string;
  attackType: string;
  securityLevel: string;
  timestamp: string;
  riskFactor: number;
  compromiseChance: number;
  primaryTarget: string;
  stages: CampaignStage[];
}

const FALLBACK_CAMPAIGN: CampaignConfig = {
  industry: "Banking",
  threatActor: "Lazarus Group",
  attackType: "Supply Chain",
  securityLevel: "High",
  timestamp: new Date().toISOString(),
  riskFactor: 54,
  compromiseChance: 42,
  primaryTarget: "Swift-Transfer-Core",
  stages: [
    {
      title: "Scanning the Network",
      description: "Attacker scanned the network to find active computers and open ports.",
      log: "[RECON] Scan complete. Found open ports: 443, 8080. EDR status: BLOCKED",
      status: "blocked",
      severity: "low",
    },
    {
      title: "Attacker Gained Access",
      description: "Attacker established a foothold in the network, bypassing outer defenses.",
      log: "[INGRESS] Entry payload executed. Connection established with target device. EDR status: BLOCKED",
      status: "blocked",
      severity: "medium",
    },
    {
      title: "Passwords Were Stolen",
      description: "Attacker searched computer memory and tables to find login passwords and session tokens.",
      log: "[CREDENTIALS] Stole administrative credentials and login keys from memory. EDR status: EVADED",
      status: "evaded",
      severity: "medium",
    },
    {
      title: "Moved to Another System",
      description: "Attacker moved from the first compromised computer to a server deeper in the network.",
      log: "[LATERAL] Moved to server node segment containing Swift-Transfer-Core. EDR status: BLOCKED",
      status: "blocked",
      severity: "high",
    },
    {
      title: "Gained Admin Access",
      description: "Attacker elevated their access level to become a network administrator.",
      log: "[ESCALATION] Root credentials retrieved. Gained administrator rights. EDR status: EVADED",
      status: "evaded",
      severity: "high",
    },
    {
      title: "Data Was Stolen and Locked",
      description: "Attacker copied sensitive files out of the network and started encrypting systems.",
      log: "[EXFILTRATION] Copied customer database tables and encrypted database files. EDR status: EVADED",
      status: "evaded",
      severity: "critical",
    },
  ],
};

export default function AttackViewerPage() {
  const [campaign, setCampaign] = useState<CampaignConfig | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef<boolean>(true);
  const [showGuide, setShowGuide] = useState(true);
  const [isTechnicalExpanded, setIsTechnicalExpanded] = useState(false);

  // Helper to dynamically stream sub-logs matching the CampaignConfig details
  const addDynamicSubLog = useCallback((stageIdx: number, subIndex: number) => {
    if (!campaign) return;
    const stage = campaign.stages[stageIdx];
    let newLog = "";

    switch (stageIdx) {
      case 0: // Recon
        if (subIndex === 0) newLog = `[RECON] Scanning network ports on segment ${campaign.industry} networks...`;
        if (subIndex === 1) newLog = `[RECON] Looking for active servers and services...`;
        if (subIndex === 2) newLog = `[RECON] Found open server bindings. Status: ${stage.status.toUpperCase()}`;
        break;
      case 1: // Initial Access
        if (subIndex === 0) newLog = `[INGRESS] Preparing delivery method for attack scenario: ${campaign.attackType}...`;
        if (subIndex === 1) newLog = `[INGRESS] Executing entry script on target device...`;
        if (subIndex === 2) newLog = `[INGRESS] Access channel establishing. Gateway: ${stage.status.toUpperCase()}`;
        break;
      case 2: // Credential Theft
        if (subIndex === 0) newLog = `[CREDENTIALS] Searching system memory for login credentials...`;
        if (subIndex === 1) newLog = `[CREDENTIALS] Querying user account lists...`;
        if (subIndex === 2) newLog = `[CREDENTIALS] Session key acquisition: ${stage.status.toUpperCase()}`;
        break;
      case 3: // Lateral Movement
        if (subIndex === 0) newLog = `[LATERAL] Moving from initial computer to intermediate servers...`;
        if (subIndex === 1) newLog = `[LATERAL] Accessing network segment containing target server: ${campaign.primaryTarget}...`;
        if (subIndex === 2) newLog = `[LATERAL] Remote server access: ${stage.status.toUpperCase()}`;
        break;
      case 4: // Privilege Escalation
        if (subIndex === 0) newLog = `[ESCALATION] Attempting to elevate permissions to system administrator...`;
        if (subIndex === 1) newLog = `[ESCALATION] Bypassing local user account control rules...`;
        if (subIndex === 2) newLog = `[ESCALATION] Administrator rights: ${stage.status.toUpperCase()}`;
        break;
      case 5: // Exfiltration
        if (subIndex === 0) newLog = `[EXFILTRATION] Compressing sensitive files and database tables...`;
        if (subIndex === 1) newLog = `[EXFILTRATION] Copying files out of network to external server...`;
        if (subIndex === 2) newLog = `[EXFILTRATION] File transfer and system lock state: ${stage.status.toUpperCase()}`;
        break;
      default:
        break;
    }

    if (newLog) {
      setTerminalLogs(prev => [...prev, `[${new Date().toLocaleTimeString("en-US", { hour12: false })}] ${newLog}`]);
    }
  }, [campaign]);

  // Read configuration from sessionStorage on mount
  useEffect(() => {
    const loadCampaign = () => {
      if (typeof window !== "undefined") {
        const saved = sessionStorage.getItem("sentinel_campaign_config");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setCampaign(parsed);
            saveCampaignToHistory(parsed);
            return;
          } catch {
            // fallback
          }
        }
      }
      setCampaign(FALLBACK_CAMPAIGN);
      saveCampaignToHistory(FALLBACK_CAMPAIGN);
    };

    const timer = setTimeout(loadCampaign, 50);
    return () => clearTimeout(timer);
  }, []);

  // Playback and log streaming engine
  useEffect(() => {
    if (!campaign || !isPlaying) return;

    // Simulation playback variables: each stage takes 4 seconds (4000ms)
    const stageDuration = 4000;
    const updateInterval = 100; // update UI state every 100ms
    let elapsedTimeInStage = 0;

    const streamTimer = setInterval(() => {
      elapsedTimeInStage += updateInterval;

      // Calculate overall progress across the 6 stages
      const totalStages = campaign.stages.length;
      const baseProgress = (currentStageIdx / totalStages) * 100;
      const stageWeight = 100 / totalStages;
      const stageFraction = elapsedTimeInStage / stageDuration;
      const currentProgress = baseProgress + (stageFraction * stageWeight);
      setProgress(Math.min(100, Math.floor(currentProgress)));

      // Add a couple of sub-logs periodically within the stage
      if (elapsedTimeInStage === 400) {
        addDynamicSubLog(currentStageIdx, 0);
      } else if (elapsedTimeInStage === 1800) {
        addDynamicSubLog(currentStageIdx, 1);
      } else if (elapsedTimeInStage === 3200) {
        addDynamicSubLog(currentStageIdx, 2);
      }

      // Stage completion transition
      if (elapsedTimeInStage >= stageDuration) {
        const stage = campaign.stages[currentStageIdx];
        setTerminalLogs(prev => [
          ...prev,
          `[STAGE DONE] Completed Phase: ${stage.title} | Result: ${stage.status.toUpperCase()}`
        ]);

        if (currentStageIdx < totalStages - 1) {
          setCurrentStageIdx(prev => prev + 1);
          elapsedTimeInStage = 0;
        } else {
          // Finished entire simulation
          setIsPlaying(false);
          setProgress(100);
          clearInterval(streamTimer);
          setTerminalLogs(prev => [...prev, `[COMPLETE] --- All attack stages executed ---`]);
        }
      }
    }, updateInterval);

    return () => clearInterval(streamTimer);
  }, [campaign, isPlaying, currentStageIdx, addDynamicSubLog]);

  const handleTerminalScroll = () => {
    const container = terminalContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 20;
    isNearBottomRef.current = isAtBottom;
  };

  useEffect(() => {
    const container = terminalContainerRef.current;
    if (container && isNearBottomRef.current) {
      container.scrollTop = container.scrollHeight;
    }
  }, [terminalLogs]);

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStageIdx(0);
    setProgress(0);
    setTerminalLogs([]);
    setTimeout(() => setIsPlaying(true), 100);
  };

  // Generate dynamic defenses mapping based on campaign config
  const getRecommendedDefenses = (attackType: string) => {
    switch (attackType) {
      case "Phishing":
        return [
          { title: "Enforce Hardware MFA", desc: "Deploy FIDO2 security keys globally to intercept compromised credential use." },
          { title: "DMARC/SPF Ingress Rules", desc: "Enable reject policies on external mail filters to block sender domain spoofs." },
          { title: "EDR Sandbox Policies", desc: "Configure endpoint detection to execute email payload files in temporary containers." }
        ];
      case "Ransomware":
        return [
          { title: "Immutable GCS Backups", desc: "Enable non-rewritable cloud database snapshots to bypass wiper threats." },
          { title: "Volume Write Locks", desc: "Deploy host controls to block script writes to sensitive folder volumes." },
          { title: "Microsegmentation Blocks", desc: "Restrict lateral ports between developer hosts and operational subnets." }
        ];
      case "DDoS":
        return [
          { title: "BGP Scrubber Routing", desc: "Route ingress packets through volumetric scrubbers to clean exhaust surges." },
          { title: "SYN-Cookies & Rate Limits", desc: "Implement firewall connection rate limits on border load balancers." },
          { title: "DNS Query Throttling", desc: "Restrict external lookup frequencies to bypass recursive resolver poison loops." }
        ];
      case "Supply Chain":
        return [
          { title: "Checksum Sign Controls", desc: "Enforce sha-256 package checks before importing public script dependencies." },
          { title: "Isolated CI/CD Runners", desc: "Run build pipelines inside ephemeral, internet-restricted docker instances." },
          { title: "Repository Mirrors", desc: "Sync open source dependencies through verified internal registry proxies." }
        ];
      case "SQL Injection":
        return [
          { title: "Prepared Bind Queries", desc: "Mandate parameterized sql commands across all application server models." },
          { title: "WAF SQL Regex Rules", desc: "Configure Web Application Firewalls to intercept UNION/SELECT script entries." },
          { title: "Least Privilege DB Access", desc: "Disable application database user write privileges on schema tables." }
        ];
      default:
        return [
          { title: "Zero Trust Architecture", desc: "Enforce microsegments, MFA, and continuous session token verification." },
          { title: "Active SOC Monitoring", desc: "Ingest WMI, Active Directory, and netflow records into SIEM rules." }
        ];
    }
  };

  // Generate dynamic MITRE techniques based on campaign config
  const getMitreTechniques = (attackType: string) => {
    const common = [
      { id: "T1078", name: "Valid Accounts", category: "Defense Evasion" },
      { id: "T1021", name: "Remote Services", category: "Lateral Move" },
      { id: "T1003", name: "OS Credential Dumping", category: "Credential Theft" }
    ];

    switch (attackType) {
      case "Phishing":
        return [
          { id: "T1566.002", name: "Spearphishing Link", category: "Initial Access" },
          { id: "T1204.001", name: "User Execution", category: "Execution" },
          ...common
        ];
      case "Ransomware":
        return [
          { id: "T1486", name: "Data Encrypted for Impact", category: "Impact" },
          { id: "T1490", name: "Inhibit System Recovery", category: "Impact" },
          ...common
        ];
      case "DDoS":
        return [
          { id: "T1498.001", name: "Direct Network Flood", category: "Impact" },
          { id: "T1499", name: "Endpoint Denial of Service", category: "Impact" },
          ...common
        ];
      case "Supply Chain":
        return [
          { id: "T1195.002", name: "Compromise Software Dependencies", category: "Initial Access" },
          { id: "T1072", name: "Software Deployment", category: "Execution" },
          ...common
        ];
      case "SQL Injection":
        return [
          { id: "T1190", name: "Exploit Public-Facing Application", category: "Initial Access" },
          { id: "T1505.003", name: "Web Shell", category: "Persistence" },
          ...common
        ];
      default:
        return common;
    }
  };

  const getStoryboardEvent = (stageIdx: number, status?: "blocked" | "evaded" | "alerted", attackType?: string) => {
    const isBlocked = status === "blocked";
    
    const reconNarrative = isBlocked
      ? "At this stage the attacker is scanning network boundaries to locate open ports. Fortunately, firewall rules immediately flagged the IP address and blocked all scanning attempts, stopping the attack at the perimeter."
      : "At this stage the attacker is scanning network boundaries to identify active systems and open ports. Since no active firewalls blocked the scanning, the attacker successfully mapped the environment.";

    const ingressNarrative = isBlocked
      ? "At this stage the attacker attempts to deliver their initial payload to gain a foothold. Fortunately, local endpoint sandboxing or email filter rules blocked the script execution, terminating the attack."
      : "At this stage the attacker attempts to deliver their initial payload. Because outer filters did not block the delivery, the attacker successfully established a remote connection to the host.";

    const credsNarrative = isBlocked
      ? "At this stage the attacker is attempting to steal login credentials. If successful, these credentials could allow them to impersonate legitimate users and move deeper into the network. Fortunately, security controls detected the memory scraping activity and blocked access."
      : "At this stage the attacker is attempting to steal login credentials. Because local host memory protections were absent, the attacker scraped administrative account keys directly from active memory tables.";

    const lateralNarrative = isBlocked
      ? "At this stage the attacker attempts to pivot to core server nodes holding database assets. Fortunately, internal network segmentation firewalls blocked the cross-subnet connection request, isolating the threat."
      : "At this stage the attacker attempts to pivot deeper. Since internal subnets were unsegmented, the attacker hopped directly from the user host to the database server gateway.";

    const escalationNarrative = isBlocked
      ? "At this stage the attacker attempts to acquire full network Administrator privileges. Fortunately, active access control policies blocked the token impersonation attempt, preventing the escalation."
      : "At this stage the attacker attempts to acquire full network Administrator privileges. Because permissions were loosely configured, the attacker successfully impersonated system accounts to gain master control.";

    const exfilNarrative = isBlocked
      ? "At this stage the attacker reaches the database server to lock files or extract records. Fortunately, automated database triggers and write locks blocked the exfiltration attempt, securing the database."
      : "At this stage the attacker reaches their final target. The attacker copied sensitive database files out of the network and ran file encryption commands, completing a successful breach.";

    const narratives = [reconNarrative, ingressNarrative, credsNarrative, lateralNarrative, escalationNarrative, exfilNarrative];
    const titles = [
      "Step 1: Attempting to Scan Network Boundaries",
      "Step 2: Attempting to Gain Initial Entry",
      "Step 3: Attempting to Steal Passwords",
      "Step 4: Attempting to Move Deeper into the Network",
      "Step 5: Attempting to Gain Administrator Control",
      "Step 6: Attempting to Access the Target Database"
    ];

    return {
      title: titles[stageIdx] || `Step ${stageIdx + 1}: Attempting to Execute Intrusion Phase`,
      narrative: narratives[stageIdx] || "The attacker is executing this stage of the simulated attack. Defensive controls are checking system activity."
    };
  };

  const getFriendlyStageInfo = (idx: number) => {
    const list = [
      {
        title: "Step 1: Attempting to Scan Network Boundaries",
        description: "The attacker scans the network to find active computers and open entry points."
      },
      {
        title: "Step 2: Attempting to Gain Initial Entry",
        description: "The attacker establishes a silent foothold in the network, bypassing outer defenses."
      },
      {
        title: "Step 3: Attempting to Steal Passwords",
        description: "The attacker searches local system memory to harvest administrative login credentials."
      },
      {
        title: "Step 4: Attempting to Move Deeper into the Network",
        description: "Using stolen credentials, the attacker pivots deeper into the core servers."
      },
      {
        title: "Step 5: Attempting to Gain Administrator Control",
        description: "The attacker elevates permissions, gaining administrative access to network controllers."
      },
      {
        title: "Step 6: Attempting to Access the Target Database",
        description: "The attacker copies database records out of the network and triggers the final disruptive payload."
      }
    ];
    return list[idx] || { title: `Step ${idx + 1}`, description: `Executing stage ${idx + 1}...` };
  };

  const getLiveStoryTranslation = (stageIdx: number, attackType: string) => {
    const translations = [
      "The attacker is scanning network boundaries to identify open entry ports and check for gaps. Defensive systems are monitoring inbound connection requests.",
      "The attacker is attempting to establish a silent foothold by executing an entry script or sending a fake email. Security filters are validating execution signatures.",
      "The attacker is searching system memory to steal active credentials and admin keys. Active endpoint protection is checking for credential dump activity.",
      "The attacker is attempting to pivot laterally from the initial host into the core network segment. Internal microsegmentation firewalls are inspecting server-to-server traffic.",
      "The attacker is attempting to elevate permissions to Administrator level to bypass local boundaries. Access controls are blocking privilege escalations.",
      "The attacker is executing the final payload to steal database records or lock file directories. Defenses are intercepting outbound streams or volume modifications."
    ];
    return translations[stageIdx] || "The attacker is running the simulation campaign step. Defensive layers are actively monitoring host telemetry.";
  };

  const getAttackGuide = (attackType: string, industry: string) => {
    const guides: Record<string, { goal: string; entry: string; systems: string[]; impact: string[]; defenses: string[] }> = {
      Phishing: {
        goal: "Steal employee credentials to gain a silent foothold and access critical internal databases.",
        entry: "Fake email scam carrying a malicious link designed to trick users.",
        systems: ["User workstation", "Domain Controller", "Database Server"],
        impact: ["Credential theft", "Unauthorized access", "Patient/Client record leaks"],
        defenses: ["Hardware MFA keys", "Email gateways", "Endpoint sandboxing"]
      },
      Ransomware: {
        goal: "Deploy wiper or encryption malware to lock critical operational databases and demand payment.",
        entry: "Fake email attachments or malicious script downloads.",
        systems: ["Workstation endpoints", "Backup storage arrays", "Core server directories"],
        impact: ["File lockouts", "Severe operational downtime", "Compliance regulatory penalties"],
        defenses: ["Immutable GCS backups", "Volume write locks", "Endpoint containment"]
      },
      DDoS: {
        goal: "Overwhelm web portals and load balancers to disrupt public-facing services.",
        entry: "Volumetric packet flooding overloading gateway bandwidth.",
        systems: ["Internet gateway", "Load balancer ports", "Public web servers"],
        impact: ["Service outage", "Downtime disruption", "Reputational loss"],
        defenses: ["Traffic filtering scrubbers", "SYN-cookie rate limits", "Distributed CDN caching"]
      },
      "SQL Injection": {
        goal: "Manipulate web input forms to bypass login authentication and extract database schemas.",
        entry: "Malicious SQL database commands entered directly into web forms.",
        systems: ["Web application firewall", "Database server directories", "Customer database tables"],
        impact: ["Database breach", "Data exposure", "Credential leaks"],
        defenses: ["Parameterized queries", "WAF regex controls", "Least privilege DB permissions"]
      },
      "Supply Chain": {
        goal: "Infect signed, trusted software updates to inject a back door into developer build servers.",
        entry: "Malicious packages imported as trusted dependencies.",
        systems: ["CI/CD builder containers", "Local library mirrors", "Internal application code"],
        impact: ["CI/CD pipeline compromise", "Developer workstation hijack", "Repository compromise"],
        defenses: ["Checksum hash checks", "Ephemeral build sandboxes", "Private registry mirroring"]
      }
    };

    return guides[attackType] || {
      goal: "Bypass outer boundaries and access target database systems.",
      entry: "Exploiting network vulnerability or social engineering.",
      systems: ["Network gateway", "Internal server node", "Target database"],
      impact: ["System exposure", "Data leaks", "Operational outages"],
      defenses: ["Zero trust rules", "EDR monitoring", "Firewall segment block"]
    };
  };

  const getIocData = (attackType: string) => {
    switch (attackType) {
      case "Phishing":
        return {
          ips: ["193.228.14.92", "45.227.254.101"],
          hashes: ["a8f278d9101d2ce9eb4b3e8e89f8101a", "2f913d80a10c92f1b0aef1010dbdeca3"],
          artifacts: ["C:\\Users\\Public\\Update.js", "http://login-verify-update.com/signin"],
        };
      case "Ransomware":
        return {
          ips: ["185.112.144.12", "91.240.118.83"],
          hashes: ["d3f1a0f8b19a1a0f8c8d8e8f8101a0f2", "f3a0d1e1f1c2d3e4f5a6b7c8d9e0f1a2"],
          artifacts: ["C:\\ProgramData\\lockbit.exe", "shadowcopy_delete.bat"],
        };
      case "DDoS":
        return {
          ips: ["103.88.22.41", "172.96.12.190"],
          hashes: ["n/a (traffic volumetric flood)"],
          artifacts: ["SYN flood on TCP Port 443", "DNS Query flood on Port 53"],
        };
      case "SQL Injection":
        return {
          ips: ["198.51.100.12", "203.0.113.88"],
          hashes: ["c8f2b3e4a9f81a7b3c2d1e0f9a8b7c6d"],
          artifacts: ["SELECT * FROM users WHERE id = '1' OR '1'='1';", "C:\\inetpub\\wwwroot\\uploads\\webshell.aspx"],
        };
      case "Supply Chain":
        return {
          ips: ["185.220.101.4", "45.154.253.22"],
          hashes: ["8f81a0b1c2d3e4f5a6b7c8d9e0f1a2b3", "7e70a9b8c7d6e5f4a3b2c1d0e9f8a7b6"],
          artifacts: ["package.json -> corrupted update v1.4.2", "npm install run-script outbound trigger"],
        };
      default:
        return {
          ips: ["192.0.2.1", "198.51.100.5"],
          hashes: ["9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c"],
          artifacts: ["Command line payload", "Outbound beacon connection"],
        };
    }
  };

  const getWhatYouLearnedNarrative = (attackType: string, level: string) => {
    const introMap: Record<string, string> = {
      Phishing: "This attack attempted to trick users into revealing credentials through a fake email.",
      Ransomware: "This attack attempted to deploy malicious software that encrypts important files and systems.",
      DDoS: "This attack attempted to take services offline by overwhelming them with massive fake traffic.",
      "SQL Injection": "This attack attempted to manipulate website input forms to run unauthorized database commands.",
      "Supply Chain": "This attack attempted to infect trusted software updates with malicious code to gain internal access."
    };

    const outcomeMap: Record<string, Record<string, string>> = {
      Phishing: {
        Low: "Because the target had Basic Protection enabled, there were no advanced email filters or multi-factor authentication (MFA) to stop it. The attacker successfully harvested user login credentials, allowing full access to internal systems.",
        Medium: "Because the target had Standard Protection enabled, basic filters flagged the link but failed to prevent the credentials from being entered. The attacker eventually accessed some systems, but lateral movement was slowed.",
        High: "Because the target had Advanced Protection enabled, the malicious link was detected and blocked, and Multi-Factor Authentication (MFA) prevented any stolen credentials from being used. The attack was successfully contained.",
        Enterprise: "Because the target had Enterprise Security enabled, advanced AI email filtering blocked the email at the gateway, and strict hardware security keys neutralized the credential theft attempt entirely. No foothold was established."
      },
      Ransomware: {
        Low: "Because the target had Basic Protection enabled, the ransomware executed without resistance, locking critical systems and databases, and demanding payment.",
        Medium: "Because the target had Standard Protection enabled, basic host antiviruses detected the ransomware after some initial files were locked, but were too late to prevent core systems from being affected.",
        High: "Because the target had Advanced Protection enabled, volume write locks and endpoint threat detection instantly isolated the host before the ransomware could spread or lock critical databases.",
        Enterprise: "Because the target had Enterprise Security enabled, automated endpoint containment playbooks isolated the entry host instantly and immutable backups were ready, neutralizing the impact."
      },
      DDoS: {
        Low: "Because the target had Basic Protection enabled, the public portal was completely overwhelmed, causing a total service outage for legitimate users.",
        Medium: "Because the target had Standard Protection enabled, basic rate limits helped mitigate minor traffic spikes, but the volume was too large, causing intermittent service disruptions.",
        High: "Because the target had Advanced Protection enabled, automatic traffic scrubbing and load balancer rate-limiting filtered out the fake traffic, keeping the services fully operational.",
        Enterprise: "Because the target had Enterprise Security enabled, distributed edge caching and automated cloud scrubbers absorbed the volumetric flood instantly. Legitimate users experienced zero downtime."
      },
      "SQL Injection": {
        Low: "Because the target had Basic Protection enabled, input was not validated, allowing the attacker to bypass authentication and directly extract database tables.",
        Medium: "Because the target had Standard Protection enabled, basic firewalls flagged common attack signatures, but the database itself lacked parameterized queries, resulting in partial data exposure.",
        High: "Because the target had Advanced Protection enabled, parameterized queries and Web Application Firewall (WAF) regex controls blocked the injection attempt, protecting the database.",
        Enterprise: "Because the target had Enterprise Security enabled, automated database activity monitoring blocked the anomalous query execution and flagged the source IP for immediate perimeter blocking."
      },
      "Supply Chain": {
        Low: "Because the target had Basic Protection enabled, the compromised package was downloaded and run with full administrator permissions, allowing immediate network access.",
        Medium: "Because the target had Standard Protection enabled, code signatures were checked, but since the package itself was signed, it bypassed basic checks before endpoint behavior monitoring flagged lateral movement.",
        High: "Because the target had Advanced Protection enabled, secure dependency check registries and sandboxed CI/CD runners isolated the update, blocking the code before execution.",
        Enterprise: "Because the target had Enterprise Security enabled, automated code analysis and package validation pipelines flagged the malicious dependency upgrade before it could be pushed to any servers."
      }
    };

    const intro = introMap[attackType] || "This attack attempted to breach target systems.";
    const outcome = outcomeMap[attackType]?.[level] || `Under ${level} protection, defenses attempted to mitigate the threat.`;

    return { intro, outcome };
  };

  if (!campaign) {
    return (
      <div className="min-h-screen bg-cyber-bg flex items-center justify-center font-mono text-xs text-slate-500 font-bold tracking-widest uppercase">
        <Activity className="w-5 h-5 text-cyber-cyan animate-spin mr-2" />
        INGESTING SIMULATION ENVIRONMENT DATA...
      </div>
    );
  }

  const defenses = getRecommendedDefenses(campaign.attackType);
  const mitreTechniques = getMitreTechniques(campaign.attackType);

  // Dynamic Impact Level Warning
  const getImpactLevel = (risk: number) => {
    if (risk > 70) return { label: "CRITICAL", color: "text-cyber-red border-cyber-red/30 bg-cyber-red/5" };
    if (risk > 40) return { label: "MEDIUM EXPOSURE", color: "text-amber-500 border-amber-500/30 bg-amber-500/5" };
    return { label: "LOW EXPOSURE", color: "text-cyber-green border-cyber-green/30 bg-cyber-green/5" };
  };
  const impact = getImpactLevel(campaign.riskFactor);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const { intro: learnedIntro, outcome: learnedOutcome } = getWhatYouLearnedNarrative(campaign.attackType, campaign.securityLevel);

  const liveRisk = (() => {
    if (progress === 100) {
      const hasEvaded = campaign.stages.some(s => s.status === "evaded");
      return hasEvaded ? "High" : "Low";
    }
    const activeStages = campaign.stages.slice(0, currentStageIdx + 1);
    const evadedCount = activeStages.filter(s => s.status === "evaded").length;
    if (evadedCount >= 2) return "High";
    if (evadedCount === 1) return "Medium";
    return "Low";
  })();

  const liveRiskColor = liveRisk === "High"
    ? "border-cyber-red/30 bg-cyber-red/10 text-cyber-red"
    : liveRisk === "Medium"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
      : "border-cyber-green/30 bg-cyber-green/10 text-cyber-green";

  return (
    <div className="relative min-h-screen bg-cyber-bg overflow-x-hidden pt-28 pb-16 flex flex-col justify-between selection:bg-electric-blue/30 selection:text-white font-sans">

      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[40vh] bg-electric-blue/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/4 w-[30vw] h-[30vh] bg-cyber-cyan/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Cyber Grid Decorators */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0" />
      <div className="absolute inset-0 cyber-grid-fine opacity-50 pointer-events-none z-0" />

      {/* CRT Scanline Filter Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10" />
      <div className="fixed inset-0 pointer-events-none z-50 animate-scanline bg-gradient-to-b from-transparent via-cyber-cyan/[0.012] to-transparent h-16 w-full" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-6 relative z-10 w-full flex-grow"
      >

        {/* Navigation Link */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4 font-mono text-[10px] tracking-widest uppercase">
          <Link
            href="/simulate"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Simulation Setup
          </Link>
          <Link
            href="/command-center"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan hover:bg-cyber-cyan/20 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:border-cyber-cyan/60"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            Open Command Center
          </Link>
        </div>

        {/* What You'll Learn Panel */}
        <div className="mb-8 p-5 rounded-lg bg-cyber-surface/60 border border-cyber-border/80 text-xs leading-relaxed max-w-4xl relative overflow-hidden">
          <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-cyber-cyan" />
          <h2 className="text-white font-bold mb-2 uppercase font-mono tracking-wider text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyber-cyan" />
            What You&apos;ll Learn
          </h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            This simulation shows how attackers attempt to enter a system, move through a network, and reach valuable data.
          </p>
          <div className="text-[11px] text-slate-400 grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono uppercase text-[9px]">
            <div className="flex items-center gap-1.5">• What the attacker is trying to do</div>
            <div className="flex items-center gap-1.5">• Which systems are being targeted</div>
            <div className="flex items-center gap-1.5">• How defenses react</div>
            <div className="flex items-center gap-1.5">• Whether the attack succeeds or fails</div>
          </div>
        </div>

        {/* Page Header */}
        <div className="mb-8 max-w-4xl">
          <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase mb-4 font-bold">
            <Terminal className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
            Interactive Cybersecurity Walkthrough
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase font-sans">
            Watch The Attack Unfold
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl leading-relaxed text-xs">
            Follow the attacker’s journey step-by-step and see how security defenses respond in real time.
          </p>
        </div>

        {/* What Happens During This Attack? Guide Panel */}
        <div className="mb-8 glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-cyber-border/40 pb-4 mb-4">
            <span className="text-[10px] font-mono text-cyber-cyan uppercase tracking-widest block font-bold">
              [INFO] What Happens During This Attack?
            </span>
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="text-[9px] font-mono px-2 py-1 rounded border border-cyber-border hover:border-slate-600 text-slate-400 hover:text-white cursor-pointer transition-colors"
            >
              {showGuide ? "HIDE DETAILS" : "SHOW DETAILS"}
            </button>
          </div>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-5 gap-6 text-[11px] font-sans text-slate-400 overflow-hidden"
              >
                <div>
                  <strong className="text-white font-mono block mb-1.5 uppercase tracking-wider text-[10px] text-cyber-cyan">🎯 Attacker&apos;s Goal</strong>
                  {getAttackGuide(campaign.attackType, campaign.industry).goal}
                </div>
                <div>
                  <strong className="text-white font-mono block mb-1.5 uppercase tracking-wider text-[10px] text-cyber-cyan">🚪 Entry Method</strong>
                  {getAttackGuide(campaign.attackType, campaign.industry).entry}
                </div>
                <div>
                  <strong className="text-white font-mono block mb-1.5 uppercase tracking-wider text-[10px] text-cyber-cyan">🖥 Systems Targeted</strong>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-[10px]">
                    {getAttackGuide(campaign.attackType, campaign.industry).systems.map((sys, idx) => (
                      <li key={idx} className="text-[10px] text-slate-300">{sys}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-white font-mono block mb-1.5 uppercase tracking-wider text-[10px] text-cyber-cyan">⚠ Potential Impact</strong>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-[10px]">
                    {getAttackGuide(campaign.attackType, campaign.industry).impact.map((imp, idx) => (
                      <li key={idx} className="text-[10px] text-slate-300">{imp}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong className="text-white font-mono block mb-1.5 uppercase tracking-wider text-[10px] text-cyber-cyan">🛡 Defensive Measures</strong>
                  <ul className="list-disc list-inside space-y-0.5 mt-1 font-mono text-[10px]">
                    {getAttackGuide(campaign.attackType, campaign.industry).defenses.map((def, idx) => (
                      <li key={idx} className="text-[10px] text-slate-300">{def}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Global Progress and Playback Control bar */}
        <div className="glassmorphism-card rounded-xl p-4 border border-cyber-border mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${isPlaying
                  ? "bg-amber-500 text-black hover:bg-amber-400"
                  : "bg-electric-blue text-white hover:bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                }`}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current text-black" /> : <Play className="w-4 h-4 fill-current ml-0.5 text-white" />}
            </button>

            <button
              onClick={resetSimulation}
              className="w-9 h-9 rounded-full bg-cyber-surface border border-cyber-border hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase hidden sm:inline">
              {isPlaying ? "SIMULATION RUNNING" : progress === 100 ? "SIMULATION COMPLETED" : "SIMULATION PAUSED"}
            </span>
          </div>

          {/* Progress Bar or AI Analyst Action */}
          <div className="flex items-center gap-4">
            {progress === 100 ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-4 flex-wrap"
              >
                <span className="text-[10px] font-mono text-cyber-green font-bold uppercase tracking-wider hidden sm:inline">
                  [CTI BRIEF GENERATED]
                </span>
                <Link
                  href="/ai-analyst"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded bg-electric-blue border border-electric-blue/50 text-xs font-mono font-bold tracking-widest text-white uppercase hover:bg-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all duration-300 animate-pulse cursor-pointer animate-pulse-subtle"
                >
                  <Brain className="w-3.5 h-3.5 text-cyber-cyan" />
                  Analyze with AI Analyst
                </Link>
              </motion.div>
            ) : (
              <>
                <span className="text-[10px] font-mono text-slate-400">COMPLETION: {progress}%</span>
                <div className="w-48 sm:w-64 h-2 bg-slate-950 border border-cyber-border rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-electric-blue to-cyber-cyan"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Simulation Debrief Panel (What You Learned) */}
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-green/45 bg-cyber-green/5 relative overflow-hidden mb-8 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyber-green" />
            
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-cyber-green animate-pulse" />
              <span className="text-[10px] font-mono text-cyber-green uppercase tracking-widest block font-bold">
                [SUMMARY] What You Learned
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans text-xs leading-relaxed text-slate-350">
              <div className="bg-black/40 p-5 rounded border border-cyber-border/40 space-y-2">
                <strong className="text-white block font-mono uppercase tracking-wider text-[10px] text-cyber-green">Attack Objective Overview</strong>
                <p>{learnedIntro}</p>
              </div>
              <div className="bg-black/40 p-5 rounded border border-cyber-border/40 space-y-2">
                <strong className="text-white block font-mono uppercase tracking-wider text-[10px] text-cyber-green">Defense Outcome Overview</strong>
                <p>{learnedOutcome}</p>
              </div>
            </div>

            {/* Checklist of learned points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[9px] text-slate-400 pt-5 mt-5 border-t border-cyber-green/10">
              <div className="flex items-center gap-2">
                <span className="text-cyber-green">✓</span> How attackers move through a network
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyber-green">✓</span> Why credentials are valuable targets
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyber-green">✓</span> How security controls interrupt attacks
              </div>
              <div className="flex items-center gap-2">
                <span className="text-cyber-green">✓</span> Why multiple layers of protection matter
              </div>
            </div>
          </motion.div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Side: Overview, Timeline, prevention suite (7 cols) */}
          <div className="lg:col-span-7 space-y-8">

            {/* 1. Attack Setup Overview Panel */}
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-4">
                [01] ATTACK SETUP OVERVIEW
              </span>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-[10px]"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.div variants={cardVariants} className="bg-black/40 p-3 rounded border border-cyber-border">
                  <div className="text-slate-500 text-[8px] uppercase">Target</div>
                  <div className="text-white font-bold mt-1 uppercase truncate" title={getIndustryName(campaign.industry)}>
                    {getIndustryName(campaign.industry).split(" ").slice(1).join(" ")}
                  </div>
                </motion.div>
                <motion.div variants={cardVariants} className="bg-black/40 p-3 rounded border border-cyber-border">
                  <div className="text-slate-500 text-[8px] uppercase">Attacker</div>
                  <div className="text-white font-bold mt-1 uppercase truncate" title={getActorName(campaign.threatActor)}>
                    {getActorName(campaign.threatActor).split(" ").slice(1).join(" ")}
                  </div>
                </motion.div>
                <motion.div variants={cardVariants} className="bg-black/40 p-3 rounded border border-cyber-border">
                  <div className="text-slate-500 text-[8px] uppercase">Attack Type</div>
                  <div className="text-white font-bold mt-1 uppercase truncate" title={getAttackName(campaign.attackType)}>
                    {getAttackName(campaign.attackType).split(" ").slice(1).join(" ")}
                  </div>
                </motion.div>
                <motion.div variants={cardVariants} className="bg-black/40 p-3 rounded border border-cyber-border">
                  <div className="text-slate-500 text-[8px] uppercase">Protection Level</div>
                  <div className="text-white font-bold mt-1 uppercase truncate" title={getSecurityLevelName(campaign.securityLevel)}>
                    {getSecurityLevelName(campaign.securityLevel).split(" ").slice(1).join(" ")}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* 2. Attack Story Timeline */}
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border">
              <div className="flex justify-between items-center border-b border-cyber-border/40 pb-4 mb-6 font-mono">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold">
                  [02] ATTACK STORY TIMELINE
                </span>
                <span className="text-[9px] text-cyber-cyan">ACTIVE STEP: 0{currentStageIdx + 1}/06</span>
              </div>

              {/* Timeline Tree */}
              <div className="relative border-l border-cyber-border pl-6 space-y-6 ml-3">
                {campaign.stages.map((stage, idx) => {
                  const isActive = currentStageIdx === idx;
                  const isCompleted = currentStageIdx > idx;
                  const isPending = currentStageIdx < idx;

                  const getStatusBadge = () => {
                    if (isPending) {
                      return <span className="px-1.5 py-0.5 rounded border border-slate-800 bg-slate-900/40 text-slate-600 text-[8px] font-mono font-bold uppercase">⚪ Pending</span>;
                    }
                    if (isActive) {
                      return <span className="px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[8px] font-mono font-bold uppercase animate-pulse">🟡 In Progress</span>;
                    }
                    if (stage.status === "blocked") {
                      return <span className="px-1.5 py-0.5 rounded border border-cyber-green/30 bg-cyber-green/10 text-cyber-green text-[8px] font-mono font-bold uppercase">🟢 Stopped</span>;
                    }
                    return <span className="px-1.5 py-0.5 rounded border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-[8px] font-mono font-bold uppercase">🔴 Successful</span>;
                  };

                  return (
                    <div
                      key={idx}
                      className={`relative transition-all duration-500 ${isPending ? "opacity-35" : "opacity-100"}`}
                    >
                      {/* Timeline dot */}
                      <span className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center ${isActive
                          ? "bg-black border-cyber-cyan shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                          : isCompleted
                            ? "bg-cyber-cyan border-cyber-cyan"
                            : "bg-slate-950 border-slate-800"
                        }`}>
                        {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                        {isActive && <motion.span
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-1.5 h-1.5 rounded-full bg-cyber-cyan"
                        />}
                      </span>

                      {/* Content Card */}
                      <div className={`p-4 rounded-lg border transition-all duration-300 ${isActive
                          ? "bg-cyber-surface border-cyber-border-active shadow-[0_0_20px_rgba(6,182,212,0.06)]"
                          : "bg-cyber-surface/30 border-cyber-border/30"
                        }`}>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 font-bold">STEP 0{idx + 1}</span>
                            <span className="text-slate-700">|</span>
                            <span className={`px-1.5 py-0.5 rounded border text-[8px] font-mono font-bold uppercase ${stage.severity === "critical" ? "text-cyber-red border-cyber-red/30 bg-cyber-red/5" :
                                stage.severity === "high" ? "text-rose-500 border-rose-500/30 bg-rose-500/5" :
                                  "text-cyber-cyan border-cyber-cyan/30 bg-cyber-cyan/5"
                              }`}>
                              {stage.severity}
                            </span>
                          </div>
                          {getStatusBadge()}
                        </div>

                        <h4 className="text-xs font-bold text-white mt-2 font-mono uppercase tracking-wider">{getFriendlyStageInfo(idx).title}</h4>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed font-sans">{getFriendlyStageInfo(idx).description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Prevention Suite */}
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-4">
                [03] HOW THIS ATTACK CAN BE PREVENTED
              </span>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {defenses.map((def, idx) => (
                  <motion.div key={idx} variants={cardVariants} className="bg-cyber-surface/40 border border-cyber-border p-4 rounded-lg flex flex-col justify-between hover:border-slate-800 transition-colors">
                    <div>
                      <div className="flex items-center gap-1.5 text-cyber-cyan font-mono text-[10px] uppercase font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        PREVENTION {idx + 1}
                      </div>
                      <h4 className="text-xs font-bold text-white font-mono uppercase mt-2">{def.title}</h4>
                      <p className="text-[10px] text-slate-450 mt-1.5 leading-relaxed font-sans">
                        <strong className="text-cyber-cyan block mb-0.5">Why it helps:</strong>
                        {def.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Key Takeaways Section */}
            {progress === 100 && (
              <div className="glassmorphism-card rounded-xl p-6 border border-purple-500/30 bg-purple-500/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
                <div className="flex items-center gap-2 mb-4 font-mono">
                  <Info className="w-5 h-5 text-purple-400" />
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest block font-bold">
                    Key Takeaways
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-300 font-sans">
                  This simulation demonstrates how attackers attempt to overwhelm services and gain access to critical systems. Even when strong defenses exist, attackers may continue trying multiple paths. Layered security controls dramatically reduce the likelihood of a successful compromise.
                </p>
              </div>
            )}

          </div>

          {/* Right Side: Situation Panel, Storyboard, Feed (5 cols) */}
          <div className="lg:col-span-5 space-y-8">

            {/* 1. Current Situation Panel */}
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-cyber-red/5 rounded-full blur-[60px] pointer-events-none" />

              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-4">
                [04] Current Situation
              </span>

              {/* Progress gauge dial */}
              <div className="flex items-center justify-between gap-6 border-b border-cyber-border/40 pb-5 mb-5">
                <div className="space-y-4 font-mono text-[10px] flex-grow">
                  <div className="flex justify-between items-center bg-black/40 p-2.5 border border-cyber-border rounded">
                    <span className="text-slate-500">ATTACK PROGRESS</span>
                    <span className="text-white font-bold">
                      {progress === 100 ? "6 of 6" : `${currentStageIdx} of 6`} steps done
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-black/40 p-2.5 border border-cyber-border rounded">
                    <span className="text-slate-500">CURRENT RISK</span>
                    <span className={`px-2 py-0.5 rounded border text-[8px] font-bold ${liveRiskColor} uppercase`}>
                      {liveRisk} Risk
                    </span>
                  </div>
                </div>
              </div>

              {/* Systems Affected indicators */}
              <div className="space-y-3 font-mono text-[10px]">
                <div className="flex justify-between text-slate-500">
                  <span>Network Gateway</span>
                  <span className={currentStageIdx === 0 ? "text-amber-500 font-bold" : currentStageIdx >= 1 && campaign.stages[0].status === "evaded" ? "text-cyber-red font-bold" : "text-cyber-green font-bold"}>
                    {currentStageIdx === 0 ? "UNDER PROBE" : currentStageIdx >= 1 && campaign.stages[0].status === "evaded" ? "COMPROMISED" : "SECURED"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-550 flex justify-between text-slate-500">
                  <span>Internal Server</span>
                  <span className={currentStageIdx === 2 ? "text-amber-500 font-bold" : currentStageIdx >= 3 && campaign.stages[2].status === "evaded" ? "text-cyber-red font-bold" : "text-cyber-green font-bold"}>
                    {currentStageIdx === 2 ? "UNDER PROBE" : currentStageIdx >= 3 && campaign.stages[2].status === "evaded" ? "COMPROMISED" : "SECURED"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Database Target</span>
                  <span className={currentStageIdx === 4 ? "text-amber-500 font-bold" : currentStageIdx >= 5 && campaign.stages[4].status === "evaded" ? "text-cyber-red font-bold animate-pulse" : "text-cyber-green font-bold"}>
                    {currentStageIdx === 4 ? "UNDER PROBE" : currentStageIdx >= 5 && campaign.stages[4].status === "evaded" ? "COMPROMISED" : "SECURED"}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Attack Story Storyboard Panel */}
            <div className="glassmorphism-card rounded-xl p-6 border border-cyber-cyan/30 bg-cyber-cyan/5 relative overflow-hidden glow-cyan">
              <div className="absolute top-0 right-0 w-8 h-8 border-b border-l border-cyber-cyan/20 pointer-events-none" />
              <div className="flex justify-between items-center border-b border-cyber-cyan/20 pb-3 mb-4">
                <span className="text-[10px] font-mono text-cyber-cyan uppercase tracking-widest block font-bold flex items-center gap-1.5 animate-pulse">
                  <Activity className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                  Visual Attack Storyboard
                </span>
                <span className="text-[9px] font-mono text-slate-400">STEP 0{currentStageIdx + 1}/06</span>
              </div>
              <div className="space-y-4">
                <div className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  {getStoryboardEvent(currentStageIdx, campaign.stages[currentStageIdx].status, campaign.attackType).title}
                </div>
                <p className="text-xs text-slate-350 leading-relaxed font-sans min-h-[75px]">
                  {getStoryboardEvent(currentStageIdx, campaign.stages[currentStageIdx].status, campaign.attackType).narrative}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Action Result:</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                    campaign.stages[currentStageIdx].status === "blocked" 
                      ? "text-cyber-green border border-cyber-green/30 bg-cyber-green/10" 
                      : "text-cyber-red border border-cyber-red/30 bg-cyber-red/10"
                  }`}>
                    {campaign.stages[currentStageIdx].status === "blocked" ? "🚨 Stopped by Defenses" : "⚠ Succeeded"}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Terminal Log Panel with Translation */}
            <div className="glassmorphism-card rounded-xl border border-cyber-border overflow-hidden glow-blue">
              <div className="bg-cyber-surface px-4 py-2 border-b border-cyber-border flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 uppercase font-bold">
                  <Terminal className="w-3.5 h-3.5 text-cyber-cyan" />
                  live-activity-telemetry.log
                </span>
                <span className="text-cyber-cyan animate-pulse">STREAM ACTIVE</span>
              </div>

              {/* Live Translation block */}
              <div className="bg-cyber-surface/40 p-4 border-b border-cyber-border text-xs text-slate-300 font-sans leading-relaxed">
                <div className="text-cyber-cyan font-mono text-[9px] uppercase font-bold tracking-wider mb-1">What Is Happening Right Now?</div>
                <p className="text-[11px] text-slate-300">
                  {getLiveStoryTranslation(currentStageIdx, campaign.attackType)}
                </p>
              </div>

              {/* Logs Screen */}
              <div
                ref={terminalContainerRef}
                onScroll={handleTerminalScroll}
                className="bg-black/90 p-4 font-mono text-[10px] text-slate-400 h-[200px] overflow-y-auto space-y-1.5"
              >
                {terminalLogs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-600 text-center uppercase font-bold tracking-widest font-mono">
                    Initializing logs stream player...
                  </div>
                ) : (
                  terminalLogs.map((log, idx) => {
                    const isSystem = log.includes("[STAGE DONE]") || log.includes("[COMPLETE]");
                    return (
                      <div
                        key={idx}
                        className={`leading-relaxed ${isSystem ? "text-cyber-cyan font-bold animate-pulse" : "text-slate-400"}`}
                      >
                        <span className="text-slate-700 mr-1.5">&gt;</span>
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Collapsible View Technical Details Section */}
        {progress === 100 && (
          <div className="w-full mt-10">
            <button
              onClick={() => setIsTechnicalExpanded(!isTechnicalExpanded)}
              className="w-full py-3.5 px-4 rounded-lg border border-cyber-border hover:border-slate-700 bg-cyber-surface/40 hover:bg-cyber-surface/70 text-slate-300 hover:text-white flex items-center justify-between font-mono text-[10px] uppercase tracking-wider transition-all duration-300 hover:cursor-pointer mb-8"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                <span>{isTechnicalExpanded ? "[-] Hide Technical Details" : "[+] View Technical Details"}</span>
              </div>
              <span className="text-cyber-cyan font-bold">{isTechnicalExpanded ? "CLOSE" : "EXPAND"}</span>
            </button>

            <AnimatePresence>
              {isTechnicalExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 overflow-hidden pb-8 pt-4"
                >
                  {/* Threat Intelligence Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-[10px]">
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">Threat Actor Group</div>
                      <div className="text-white font-bold mt-1.5 uppercase">
                        {getActorName(campaign.threatActor, true)}
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">Attack Vector (MITRE)</div>
                      <div className="text-white font-bold mt-1.5 uppercase">
                        {getAttackName(campaign.attackType, true)}
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">Internal Asset ID</div>
                      <div className="text-white font-bold mt-1.5 uppercase">
                        {campaign.primaryTarget}
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">Defense Profile</div>
                      <div className="text-white font-bold mt-1.5 uppercase">
                        {getSecurityLevelName(campaign.securityLevel)}
                      </div>
                    </div>
                  </div>

                  {/* Adversary Attack Chain & Containment Flow */}
                  <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border bg-black/40">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-6">
                      Adversary Attack Chain & Containment Flow
                    </span>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px]">
                      {campaign.stages.map((stage, idx) => {
                        const isStageBlocked = stage.status === "blocked";
                        const isPriorStageBlocked = campaign.stages.slice(0, idx).some(s => s.status === "blocked");
                        const statusLabel = isPriorStageBlocked 
                          ? "UNREACHED" 
                          : isStageBlocked 
                          ? "BLOCKED" 
                          : "EVADED";
                        const statusColor = isPriorStageBlocked 
                          ? "text-slate-505 border-slate-800 bg-slate-950/20" 
                          : isStageBlocked 
                          ? "text-cyber-green border-cyber-green/45 bg-cyber-green/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                          : "text-cyber-red border-cyber-red/45 bg-cyber-red/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
                          
                        return (
                          <React.Fragment key={idx}>
                            <div className={`flex-1 w-full p-3.5 rounded border ${statusColor} text-center flex flex-col justify-between min-h-[95px]`}>
                              <div className="opacity-50 text-[8px] uppercase">PHASE 0{idx + 1}</div>
                              <div className="font-bold text-white uppercase text-[9px] my-1 truncate" title={stage.title}>
                                {stage.title.split(" ").slice(0, 2).join(" ")}
                              </div>
                              <div className="font-bold">{statusLabel}</div>
                            </div>
                            {idx < campaign.stages.length - 1 && (
                              <ChevronRight className="w-4 h-4 text-slate-700 hidden md:block animate-pulse-subtle" />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* MITRE, Controls & Detection Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* MITRE Card */}
                    <div className="bg-cyber-surface/40 border border-cyber-border p-5 rounded-xl">
                      <div className="text-cyber-cyan font-mono text-[10px] uppercase font-bold mb-4">MITRE ATT&CK Mapping</div>
                      <div className="space-y-2.5 font-mono text-[9px]">
                        {mitreTechniques.map((tech) => (
                          <div key={tech.id} className="flex justify-between items-center bg-black/40 p-2.5 border border-cyber-border/40 rounded">
                            <span className="text-white font-bold">{tech.name}</span>
                            <span className="text-cyber-cyan font-bold border border-cyber-cyan/30 px-1.5 py-0.5 rounded bg-cyber-cyan/5 ml-2">{tech.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detection Methods Card */}
                    <div className="bg-cyber-surface/40 border border-cyber-border p-5 rounded-xl">
                      <div className="text-cyber-cyan font-mono text-[10px] uppercase font-bold mb-4">Detection Rules</div>
                      <ul className="space-y-2.5 text-[10px] text-slate-350 list-disc pl-4 font-sans leading-relaxed">
                        {campaign.attackType === "Phishing" && (
                          <>
                            <li>Mail gateway SPF/DMARC verify alerts</li>
                            <li>Anomaly detection on credential inputs & headers</li>
                            <li>EDR alerts on process launches from browser temp paths</li>
                          </>
                        )}
                        {campaign.attackType === "Ransomware" && (
                          <>
                            <li>Host telemetry monitoring file writing high frequency</li>
                            <li>Endpoint detection alerts on backup shadow copy deletes</li>
                            <li>Network firewall rules logging active encryption keys</li>
                          </>
                        )}
                        {campaign.attackType === "DDoS" && (
                          <>
                            <li>Border gateway volume thresholds logging packet counts</li>
                            <li>DNS request rate verification on load balancer ports</li>
                            <li>SYN-flood detection alerts on gateway filters</li>
                          </>
                        )}
                        {campaign.attackType === "SQL Injection" && (
                          <>
                            <li>Web Application Firewall checking SELECT/UNION keys</li>
                            <li>Database command logs flagging query validation fails</li>
                            <li>API gateway logging anomalous query parameter lengths</li>
                          </>
                        )}
                        {campaign.attackType === "Supply Chain" && (
                          <>
                            <li>CI/CD build pipeline checksum verify alerts</li>
                            <li>Endpoint detection tracking unknown code execution paths</li>
                            <li>Proxy servers logging unauthorized outbound script downloads</li>
                          </>
                        )}
                      </ul>
                    </div>

                    {/* Indicators of Compromise (IOCs) */}
                    <div className="bg-cyber-surface/40 border border-cyber-border p-5 rounded-xl">
                      <div className="text-cyber-cyan font-mono text-[10px] uppercase font-bold mb-4">Indicators of Compromise (IOCs)</div>
                      <div className="space-y-3 font-mono text-[8px] text-slate-400">
                        <div>
                          <strong className="text-white block uppercase mb-1 text-[9px]">IP Addresses:</strong>
                          {getIocData(campaign.attackType).ips.map((ip, index) => (
                            <div key={index} className="bg-black/30 p-1.5 rounded border border-cyber-border/40 mt-1">{ip}</div>
                          ))}
                        </div>
                        <div>
                          <strong className="text-white block uppercase mb-1 text-[9px]">File Hashes (MD5):</strong>
                          {getIocData(campaign.attackType).hashes.map((hash, index) => (
                            <div key={index} className="bg-black/30 p-1.5 rounded border border-cyber-border/40 mt-1 truncate" title={hash}>{hash}</div>
                          ))}
                        </div>
                        <div>
                          <strong className="text-white block uppercase mb-1 text-[9px]">Network / Host Artifacts:</strong>
                          {getIocData(campaign.attackType).artifacts.map((art, index) => (
                            <div key={index} className="bg-black/30 p-1.5 rounded border border-cyber-border/40 mt-1">{art}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </motion.div>

      {/* Footer Info */}
      <footer className="max-w-7xl mx-auto px-6 w-full text-slate-650 font-mono text-[9px] tracking-wider border-t border-cyber-border/20 pt-6 mt-12 flex justify-between items-center z-10">
        <div>CORE PLATFORM: attack-viewer.sentinel.local</div>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
          <span>SYS_TELEMETRY: TIMELINE INTRUSION WALKTHROUGH ACTIVE</span>
        </div>
      </footer>

    </div>
  );
}


