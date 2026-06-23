"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Brain, ShieldAlert, Layers, AlertTriangle,
  FileText, Download, Printer, ChevronRight, TrendingUp, Shield,
  CheckCircle2, AlertOctagon, Info, Share2, Lock, Eye, Mail, Key, ShieldCheck, Terminal, Activity
} from "lucide-react";
import {
  getCampaignHistory, StoredCampaign, getActorName,
  getAttackName, getIndustryName, CampaignStage, getSecurityLevelName
} from "../../components/campaignStore";

// Fallback campaign configuration
const DEFAULT_ANALYST_CAMPAIGN: StoredCampaign = {
  id: "SIM-FALLBACK",
  timestamp: new Date().toISOString(),
  threatActor: "Lazarus",
  industry: "Banking",
  attackType: "Supply Chain",
  riskScore: 54,
  status: "Successful",
  securityLevel: "Medium",
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

// MITRE ATT&CK techniques mapper
const getMitreAttackMapping = (attackType: string, stageIdx: number) => {
  const mappings: Record<string, { code: string; name: string }[]> = {
    Phishing: [
      { code: "T1595", name: "Active Scanning (Reconnaissance)" },
      { code: "T1566.002", name: "Spearphishing Link (Initial Access)" },
      { code: "T1003.001", name: "LSASS Memory Dump (Credential Access)" },
      { code: "T1021", name: "Remote Services (Lateral Movement)" },
      { code: "T1134", name: "Access Token Manipulation (Privilege Escalation)" },
      { code: "T1041", name: "Exfiltration Over C2 Channel (Exfiltration)" },
    ],
    Ransomware: [
      { code: "T1046", name: "Network Service Scanning (Reconnaissance)" },
      { code: "T1566.001", name: "Spearphishing Attachment (Initial Access)" },
      { code: "T1003.001", name: "LSASS Memory Dump (Credential Access)" },
      { code: "T1021.001", name: "Remote Desktop Protocol (Lateral Movement)" },
      { code: "T1482", name: "Domain Trust Discovery (Privilege Escalation)" },
      { code: "T1486", name: "Data Encrypted for Impact (Impact/Ransomware)" },
    ],
    DDoS: [
      { code: "T1595.002", name: "Vulnerability Scanning (Reconnaissance)" },
      { code: "T1190", name: "Exploit Public-Facing Application (Initial Access)" },
      { code: "T1555", name: "Credentials from Password Stores (Credential Access)" },
      { code: "T1021", name: "Remote Services (Lateral Movement)" },
      { code: "T1068", name: "Exploitation for Privilege Escalation (Privilege Escalation)" },
      { code: "T1498.001", name: "Direct Volumetric Flood (Impact/DDoS)" },
    ],
    "Supply Chain": [
      { code: "T1595", name: "Active Scanning (Reconnaissance)" },
      { code: "T1195.002", name: "Supply Chain Compromise (Initial Access)" },
      { code: "T1003.001", name: "LSASS Memory Dump (Credential Access)" },
      { code: "T1570", name: "Lateral Tool Transfer (Lateral Movement)" },
      { code: "T1134", name: "Access Token Manipulation (Privilege Escalation)" },
      { code: "T1041", name: "Exfiltration Over C2 Channel (Exfiltration)" },
    ],
    "SQL Injection": [
      { code: "T1595.002", name: "Vulnerability Scanning (Reconnaissance)" },
      { code: "T1190", name: "Exploit Public-Facing Application (Initial Access)" },
      { code: "T1555.003", name: "Credentials from Web Browsers (Credential Access)" },
      { code: "T1021.004", name: "SSH Remote Session (Lateral Movement)" },
      { code: "T1068", name: "Exploitation for Privilege Escalation (Privilege Escalation)" },
      { code: "T1041", name: "Exfiltration Over C2 Channel (Exfiltration)" },
    ],
  };

  const list = mappings[attackType] || mappings["Phishing"];
  return list[stageIdx] || { code: "T1059", name: "Command and Scripting Interpreter" };
};

// Local Fallback CTI Report Generator
const generateCTIReport = (campaign: StoredCampaign) => {
  const actor = getActorName(campaign.threatActor);
  const vector = getAttackName(campaign.attackType);
  const industry = getIndustryName(campaign.industry);
  const target = campaign.primaryTarget;
  const isBlocked = campaign.status === "Blocked";

  // Executive Summary
  let execSummary = "";
  if (isBlocked) {
    execSummary = `A simulated attack emulating ${actor} was run against the ${industry} network target ${target}. The attacker attempted access via ${vector}. Under your current security strength (${campaign.securityLevel}), the platform's security rules successfully detected and stopped the attack. Defensive controls blocked the attacker from spreading through the network or copying files. Your target database remains safe, and defenses functioned as expected.`;
  } else {
    execSummary = `A security compromise was simulated representing a ${actor} attack against the ${industry} network. Using a ${vector} scenario, the attacker bypassed outer defenses, established a connection to the compromised device, and harvested active login credentials. The attacker then moved laterally across the network to access the target system ${target}, copying sensitive database tables and encrypting files. Local security rules failed to block these actions, highlighting a need for stronger security settings.`;
  }

  // Threat Actor Profile
  let actorProfile = "";
  if (campaign.threatActor === "APT29") {
    actorProfile = "APT29 (also known as CozyBear) is a state-sponsored advanced persistent threat group known for stealthy, long-term intelligence operations. They typically target government entities, foreign ministries, and critical research infrastructure. Their operational profile focuses heavily on defense evasion, utilizing spearphishing campaigns carrying weaponized attachments, API token hijacking, and custom backdoor loaders. APT29 prioritizes credential theft and lateral pivoting to establish persistent footholds while keeping log signatures minimal.";
  } else if (campaign.threatActor === "Lazarus") {
    actorProfile = "Lazarus Group is a state-sponsored cyber warfare actor famous for highly destructive attacks, financial cyber-heists, and cryptocurrency network infiltrations. Lazarus employs diverse, aggressive tactics, ranging from Blind SQL Injection on database services to weaponized supply chain dependencies. Their campaigns are characterized by rapid propagation, custom network evasion tunnels, and the deployment of wiper malware. Lazarus exhibits high operational flexibility and will pivot quickly to exfiltration or system ransom.";
  } else if (campaign.threatActor === "LockBit") {
    actorProfile = "LockBit 3.0 is one of the most prolific Ransomware-as-a-Service (RaaS) syndicate globally. Operating on a double-extortion model, they exfiltrate sensitive corporate databases before triggering local file encryption. LockBit targets commercial entities, municipal backbones, and healthcare infrastructures. They utilize automated network scanners, lateral service transfers, and memory dump scripts to steal administrative domain controller tokens. LockBit leverages aggressive double-extortion leak sites as leverage for payout.";
  } else if (campaign.threatActor === "FIN7") {
    actorProfile = "FIN7 is a highly organized, financially motivated cybercriminal syndicate specializing in targeting point-of-sale (POS) environments, corporate billing pipelines, and financial ledger services. FIN7 relies heavily on spearphishing campaigns with highly polished social engineering scripts. They deploy modular malware backdoors and memory scrapers to capture domain keys. FIN7 typically monitors compromised networks for weeks to map financial systems before executing final asset theft.";
  } else {
    actorProfile = "Anonymous is a decentralized, global hacktivist collective specializing in public-facing service disruptions, volumetric packet floods, and public data leaks. Their operational focus is ideological rather than financial, targeting public corporate portals and Registrar student backends. They utilize open-source stressor tools to execute volumetric DDoS packet floods and exploit SQL flaws on vulnerable web applications to leak customer lists. Anonymous actions are designed to cause maximum reputational damage.";
  }

  // Business Impact Assessment
  let financialLoss = "";
  let operationalImpact = "";
  let downtime = "";

  if (campaign.industry === "Banking") {
    financialLoss = isBlocked ? "$45,000 (Incident Response & Forensic Audit)" : "$6,800,000 (Direct ledger liabilities, SWIFT penalty fines, and compliance litigation)";
    operationalImpact = isBlocked ? "Negligible. Security Operations isolated target hosts within 15 minutes." : "Severe. SWIFT ledger operations suspended. Customer portals taken offline for 48 hours for data sanitization.";
    downtime = isBlocked ? "0 Hours" : "48 Hours";
  } else if (campaign.industry === "Healthcare") {
    financialLoss = isBlocked ? "$35,000 (SIEM log analysis and EDR updates)" : "$4,200,000 (HIPAA regulatory fines, medical class-action lawsuits, and forensic remediation)";
    operationalImpact = isBlocked ? "None. Patient databases remained isolated behind active EDR rules." : "Critical. Electronic Medical Record (EMR) systems locked. Telemedicine and scheduling nodes offline, forcing manual triage protocols.";
    downtime = isBlocked ? "0 Hours" : "24 Hours";
  } else if (campaign.industry === "Government") {
    financialLoss = isBlocked ? "$20,000 (Threat intelligence feeds and patching)" : "$9,500,000 (National security audit, backup server rebuilds, and identity recovery funding)";
    operationalImpact = isBlocked ? "Negligible. Gateway firewall rules dropped all C2 exfiltration attempts." : "High. Secure federal registry directories compromised. Government agency backup storage arrays corrupted.";
    downtime = isBlocked ? "0 Hours" : "72 Hours";
  } else if (campaign.industry === "University") {
    financialLoss = isBlocked ? "$15,000 (Infrastructure scan and token reset)" : "$1,800,000 (FERPA privacy violations, research patent litigation, and system recovery)";
    operationalImpact = isBlocked ? "None. Network micro-segmentation blocked access to registrar NAS arrays." : "Moderate. Registrar portal taken offline. Research file shares encrypted, disrupting ongoing scientific projects.";
    downtime = isBlocked ? "0 Hours" : "36 Hours";
  } else { // Startup
    financialLoss = isBlocked ? "$12,000 (Cloud security configuration review)" : "$1,500,000 (Production API key exposure, customer churn liabilities, and Kubernetes rebuilding costs)";
    operationalImpact = isBlocked ? "Negligible. API rate-limiting successfully contained the intrusion source." : "Critical. Kubernetes master cluster compromised. Production API tokens exposed, requiring immediate revocation of all client keys.";
    downtime = isBlocked ? "0 Hours" : "18 Hours";
  }

  // Recommended Defenses
  const mitigations = [];
  if (campaign.attackType === "Phishing") {
    mitigations.push("Enforce hardware multi-factor authentication (MFA) like security keys to stop attackers from using stolen credentials.");
    mitigations.push("Use email filtering rules to detect and block malicious phishing links before they reach users.");
    mitigations.push("Enable endpoint protection rules to block credential harvesting tools from scanning system memory.");
  } else if (campaign.attackType === "Ransomware") {
    mitigations.push("Set up offline, immutable backups so data can be restored easily without paying a ransom.");
    mitigations.push("Disable default administrative folders (like Admin$ and C$) on endpoints to block spreading.");
    mitigations.push("Deploy active endpoint rules to detect and stop rapid file encryption attempts.");
  } else if (campaign.attackType === "DDoS") {
    mitigations.push("Use traffic scrubbing and web gateways to filter out large surges of malicious traffic.");
    mitigations.push("Configure rate limits on border firewalls to throttle excessive connection requests.");
    mitigations.push("Enable content delivery networks (CDNs) and caching to protect application servers under load.");
  } else if (campaign.attackType === "Supply Chain") {
    mitigations.push("Validate package integrity (using SHA-256 checks) before importing third-party libraries.");
    mitigations.push("Use software scan tools to identify known security vulnerabilities in external code dependencies.");
    mitigations.push("Configure firewall rules to block build servers from initiating unauthorized outbound connections.");
  } else { // SQL Injection
    mitigations.push("Use parameterized queries (prepared statements) in code to ensure input parameters cannot run database commands.");
    mitigations.push("Deploy a Web Application Firewall (WAF) to intercept database injection entries.");
    mitigations.push("Apply the principle of least privilege by removing write and file access permissions for the database user account.");
  }

  // Risk Reduction metrics
  const currentRisk = isBlocked ? campaign.riskScore : Math.max(70, campaign.riskScore);
  const projectedRisk = 5;
  const riskReduction = Math.max(0, currentRisk - projectedRisk);

  return {
    id: campaign.id,
    timestamp: campaign.timestamp,
    actorName: actor,
    actorId: campaign.threatActor,
    vectorName: vector,
    vectorId: campaign.attackType,
    industryName: industry,
    targetName: target,
    status: campaign.status,
    securityLevel: campaign.securityLevel,
    executiveSummary: execSummary,
    actorProfile,
    financialLoss,
    operationalImpact,
    downtime,
    mitigations,
    currentRisk,
    projectedRisk,
    riskReduction,
    stages: campaign.stages,
    mitreMapping: undefined as { stageIndex: number; code: string; name: string }[] | undefined // local has no overrides
  };
};

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
  return <span className="text-cyber-cyan">{time || "00:00:00 UTC"}</span>;
}

const getEstimatedLearningOutcome = (attackType: string) => {
  switch (attackType) {
    case "Phishing":
      return "This simulation demonstrates how phishing attacks can bypass human trust and why layered defenses are important.";
    case "Ransomware":
      return "This simulation demonstrates how ransomware can lock critical data assets and why automated endpoint containment is vital.";
    case "DDoS":
      return "This simulation demonstrates how volumetric request traffic can disrupt public services and why gateway scrubbing rate limits are necessary.";
    case "SQL Injection":
      return "This simulation demonstrates how unsanitized database queries can expose table schemas and why parameterized parameters protect databases.";
    case "Supply Chain":
      return "This simulation demonstrates how trust in third-party software updates can be exploited and why package sign checking is essential.";
    default:
      return "This simulation demonstrates the stages of cyber intrusions and how proactive security controls prevent system compromises.";
  }
};

const getWhatYouLearnedSummary = (attackType: string) => {
  switch (attackType) {
    case "Phishing":
      return "This attack relied on social engineering rather than exploiting software vulnerabilities. The attacker first targeted people instead of systems. Once credentials were stolen, they attempted to move deeper into the environment. Stronger authentication controls would have significantly reduced the chance of success.";
    case "Ransomware":
      return "This attack demonstrated how malicious software can lock files and compromise databases. Rather than just stealing credentials, the attacker aimed to encrypt files to demand payment. Backups and write locks on volumes are critical for recovering without paying the attacker.";
    case "DDoS":
      return "This attack used brute-force network traffic to overwhelm server capacity, causing a denial of service. The attacker didn't need to bypass authentication to succeed; they simply flooded the doorway. Volumetric scrubbers and CDNs are needed to absorb these traffic surges.";
    case "SQL Injection":
      return "This attack exploited a database vulnerability on a public application. By manipulating input fields, the attacker executed commands directly on the database server. Parameterized queries are the most effective way to ensure inputs are treated as data, not code.";
    case "Supply Chain":
      return "This attack compromised a trusted software update process, inserting malicious code before the software was installed. Security systems trusted the signed package, allowing the attacker to bypass the perimeter. Automated checksum validation and registry controls block these malicious dependencies.";
    default:
      return "This simulation demonstrates how attackers identify weaknesses in defenses, move laterally within networks, and target critical databases. A defense-in-depth approach ensures that even if one layer fails, subsequent security controls block the intrusion.";
  }
};

const getPreventionSuite = (attackType: string) => {
  switch (attackType) {
    case "Phishing":
      return [
        { title: "Enable Multi-Factor Authentication", why: "Makes stolen passwords far less useful by requiring a second verification factor." },
        { title: "Use Endpoint Protection", why: "Detects suspicious activity, like credential harvesting tools, before damage occurs." },
        { title: "Employee Awareness Training", why: "Reduces the likelihood of users clicking malicious links or submitting passwords." }
      ];
    case "Ransomware":
      return [
        { title: "Configure Immutable Backups", why: "Ensures data cannot be deleted or encrypted by ransomware, enabling complete recovery." },
        { title: "Enforce Volume Write Locks", why: "Blocks unauthorized programs and script writers from modifying sensitive directories." },
        { title: "Enable Endpoint Detection & Response", why: "Instantly isolates infected machines to prevent ransomware from spreading." }
      ];
    case "DDoS":
      return [
        { title: "Deploy Traffic Scrubbing", why: "Volumetric packet scrubbers filter out malicious request spikes before they reach servers." },
        { title: "Configure SYN-Cookie Rate Limits", why: "Throttles connection counts at the gateway to keep load balancers operational." },
        { title: "Enable Edge Content Caching", why: "Distributes static content over CDNs to absorb loads and protect backend systems." }
      ];
    case "SQL Injection":
      return [
        { title: "Enforce Parameterized Queries", why: "Ensures database engines treat user input as values rather than executable commands." },
        { title: "Deploy Web Application Firewalls (WAF)", why: "Detects and blocks known database command injection patterns at the app boundary." },
        { title: "Apply Least Privilege Permissions", why: "Restricts database application accounts from reading or modifying database schemas." }
      ];
    case "Supply Chain":
      return [
        { title: "Validate Checksum Signatures", why: "Verifies the cryptographic hash of dependencies before they are built or executed." },
        { title: "Use Ephemeral Sandbox Builders", why: "Compiles code inside isolated, internet-restricted build agents." },
        { title: "Mirror Local Package Registries", why: "Forces dependencies to resolve from internal mirrors rather than public code hubs." }
      ];
    default:
      return [
        { title: "Zero Trust Architecture", why: "Restricts access to systems dynamically based on device compliance and identity checks." },
        { title: "Enforce Network Microsegmentation", why: "Restricts communication between servers to block lateral movements." },
        { title: "Implement Centralized Log Monitoring", why: "Helps security teams identify anomalous logs early and trigger responses." }
      ];
  }
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

const getStorySteps = (attackType: string, status: "Blocked" | "Successful", stages: CampaignStage[]) => {
  const steps = [
    {
      title: "Looking for Weak Points (Reconnaissance)",
      doing: "Scanning network boundaries to identify active computers and open ports.",
      why: "To locate open doors and map the network layout before launching an exploit.",
      response: stages[0]?.status === "blocked"
        ? "The firewall immediately detected the scan patterns, flagged the IP, and blocked all further requests."
        : "The perimeter checks failed to flag the scan, allowing the attacker to map the target network segment successfully."
    },
    {
      title: "Trying to Get In (Initial Access)",
      doing: `Attempting to gain entry using the attack method (${attackType}).`,
      why: "To establish an active connection inside the network and bypass outer perimeter controls.",
      response: stages[1]?.status === "blocked"
        ? "The security gateway intercepted the malicious traffic or email link, blocking execution and terminating the connection."
        : "The security filters failed to block the payload, allowing the attacker to establish a silent connection inside the system."
    },
    {
      title: "Trying to Steal Passwords (Credential Access)",
      doing: "Searching system memory (e.g. LSASS dumps) for active login passwords and session keys.",
      why: "To steal administrator credentials, making it easy to masquerade as a legitimate user.",
      response: stages[2]?.status === "blocked"
        ? "Local endpoint protection detected the memory dumping attempt and immediately terminated the hostile process."
        : "Local protections failed, and the attacker successfully dumped system memory to harvest plain-text admin passwords."
    },
    {
      title: "Moving Through the Network (Lateral Movement)",
      doing: "Connecting from the first compromised computer to other critical servers deep in the network.",
      why: "To locate and access key database storage arrays containing sensitive data.",
      response: stages[3]?.status === "blocked"
        ? "Internal network firewalls blocked the unauthorized server-to-server traffic, isolating the threat."
        : "Unsegmented network paths allowed the attacker to pivot directly from the workstation to the database gateway."
    },
    {
      title: "Taking Control (Privilege Escalation)",
      doing: "Manipulating active security tokens to elevate permissions from a standard user to a system administrator.",
      why: "To gain unrestricted access and bypass database write locks and security rules.",
      response: stages[4]?.status === "blocked"
        ? "Access controllers flagged the token manipulation attempt and revoked the account's credentials."
        : "Loose configuration settings allowed the attacker to hijack admin tokens, granting them master control."
    },
    {
      title: "Attempting to Steal Data (Data Exfiltration)",
      doing: "Accessing target database directories to copy files and deploy disruptive payloads.",
      why: "To exfiltrate sensitive files out of the network and encrypt databases to demand ransom payment.",
      response: stages[5]?.status === "blocked"
        ? "Automated database triggers and write locks immediately isolated the target files, preventing all exfiltration."
        : "Defenses failed to halt database operations, allowing the attacker to copy sensitive customer files and encrypt the system."
    }
  ];

  return steps;
};


interface CTIReport {
  id: string;
  timestamp: string;
  actorName: string;
  actorId: string;
  vectorName: string;
  vectorId: string;
  industryName: string;
  targetName: string;
  status: "Blocked" | "Successful";
  securityLevel: string;
  executiveSummary: string;
  actorProfile: string;
  financialLoss: string;
  operationalImpact: string;
  downtime: string;
  mitigations: string[];
  currentRisk: number;
  projectedRisk: number;
  riskReduction: number;
  stages: CampaignStage[];
  mitreMapping?: { stageIndex: number; code: string; name: string }[];
}

function AIAnalystContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");

  const [campaign, setCampaign] = useState<StoredCampaign | null>(null);
  const [reportData, setReportData] = useState<CTIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLiveAI, setIsLiveAI] = useState(false);
  const [activeMenuSection, setActiveMenuSection] = useState("exec-summary");
  const [copied, setCopied] = useState(false);
  const [isTechnicalExpanded, setIsTechnicalExpanded] = useState(false);
  const [showFullTimeline, setShowFullTimeline] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  useEffect(() => {
    // 1. Load Campaign
    const history = getCampaignHistory();
    let resolvedCampaign: StoredCampaign | null = null;

    if (campaignId) {
      resolvedCampaign = history.find(c => c.id === campaignId) || null;
    }

    if (!resolvedCampaign && typeof window !== "undefined") {
      const saved = sessionStorage.getItem("sentinel_campaign_config");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          resolvedCampaign = {
            id: parsed.id || `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: parsed.timestamp || new Date().toISOString(),
            threatActor: parsed.threatActor,
            industry: parsed.industry,
            attackType: parsed.attackType,
            riskScore: parsed.riskFactor !== undefined ? parsed.riskFactor : 50,
            status: parsed.stages && parsed.stages[parsed.stages.length - 1]?.status === "blocked" ? "Blocked" : "Successful",
            securityLevel: parsed.securityLevel || "Medium",
            primaryTarget: parsed.primaryTarget || "Unknown-Target",
            stages: parsed.stages || [],
          };
        } catch {
          // fallback
        }
      }
    }

    if (!resolvedCampaign) {
      resolvedCampaign = history[0] || DEFAULT_ANALYST_CAMPAIGN;
    }

    // Call server API for live Gemini analysis!
    const fetchAIReport = async (camp: StoredCampaign) => {
      setCampaign(camp);
      setLoading(true);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(camp),
        });

        if (!res.ok) throw new Error(`Server returned status: ${res.status}`);

        const data = await res.json();

        if (data.isFallback) {
          console.warn("[SENTINEL] Live Gemini API not configured or returned fallback. Using local generator.");
          setReportData(generateCTIReport(camp));
          setIsLiveAI(false);
        } else {
          console.log("[SENTINEL] Live Gemini CTI report generated successfully.");
          setReportData({
            id: camp.id,
            timestamp: camp.timestamp,
            actorName: getActorName(camp.threatActor),
            actorId: camp.threatActor,
            vectorName: getAttackName(camp.attackType),
            vectorId: camp.attackType,
            industryName: getIndustryName(camp.industry),
            targetName: camp.primaryTarget,
            status: camp.status,
            securityLevel: camp.securityLevel,
            executiveSummary: data.executiveSummary,
            actorProfile: data.actorProfile,
            financialLoss: data.businessImpact.financialLoss,
            operationalImpact: data.businessImpact.operationalImpact,
            downtime: data.businessImpact.downtime,
            mitigations: data.mitigations,
            currentRisk: data.riskAssessment.currentRisk,
            projectedRisk: data.riskAssessment.projectedRisk,
            riskReduction: data.riskAssessment.riskReduction,
            stages: camp.stages,
            mitreMapping: data.mitreMapping
          });
          setIsLiveAI(true);
        }
      } catch (error) {
        console.error("[SENTINEL ERROR] Fetching Gemini report failed. Using local compiler:", error);
        setReportData(generateCTIReport(camp));
        setIsLiveAI(false);
      } finally {
        setLoading(false);
      }
    };

    fetchAIReport(resolvedCampaign);

  }, [campaignId]);

  // Export report to Markdown
  const handleExportMarkdown = () => {
    if (!reportData) return;
    const dateStr = new Date(reportData.timestamp).toUTCString();

    const mitreMappingStr = reportData.stages.map((stage: CampaignStage, idx: number) => {
      const customMapping = reportData.mitreMapping?.find((m: { stageIndex: number; code: string; name: string }) => m.stageIndex === idx);
      const mapping = customMapping
        ? { code: customMapping.code, name: customMapping.name }
        : getMitreAttackMapping(reportData.vectorId, idx);
      return `Phase ${idx + 1}: ${stage.title} -> MITRE ATT&CK: ${mapping.code} [${mapping.name}] - Status: ${stage.status.toUpperCase()}`;
    }).join("\n");

    const content = `# SENTINEL CYBER THREAT INTELLIGENCE (CTI) REPORT
Generated: ${new Date().toUTCString()}
Campaign Reference: ${reportData.id}
Telemetry Log Time: ${dateStr}

======================================================================
1. QUICK SUMMARY
----------------------------------------------------------------------
${reportData.executiveSummary}

======================================================================
2. ATTACKER PROFILE: ${reportData.actorName.toUpperCase()}
----------------------------------------------------------------------
${reportData.actorProfile}

======================================================================
3. ATTACK TECHNIQUES USED (MITRE ATT&CK)
----------------------------------------------------------------------
${mitreMappingStr}

======================================================================
4. POTENTIAL DAMAGE ESTIMATE
----------------------------------------------------------------------
Adversary Target Endpoint: ${reportData.targetName}
Operational Downtime: ${reportData.downtime}
Financial Liability Impact: ${reportData.financialLoss}
Core Infrastructure Impact: ${reportData.operationalImpact}

======================================================================
5. RECOMMENDED SECURITY IMPROVEMENTS
----------------------------------------------------------------------
${reportData.mitigations.map((mit: string, i: number) => `${i + 1}. [Mitigation] ${mit}`).join("\n")}

======================================================================
6. RISK REDUCTION ESTIMATE
----------------------------------------------------------------------
Current Infrastructure Risk: ${reportData.currentRisk}%
Projected Risk Post-Remediation: < 5%
Net Security Posture Risk Reduction: ${reportData.riskReduction}%

======================================================================
Report Generated Authenticated by Sentinel AI Security Core Node
VERIFICATION TELEMETRY: COMPLETED // DEFENSE BLOCK STATUS: ${reportData.status.toUpperCase()}
`;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SENTINEL-CTI-Report-${reportData.id}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // High-fidelity dynamic analysis loading screen
  if (loading || !reportData || !campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-cyber-cyan font-mono text-xs uppercase tracking-widest">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <span className="relative flex h-8 w-8">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-8 w-8 bg-cyber-cyan/35 flex items-center justify-center border border-cyber-cyan/50">
              <Brain className="w-4 h-4 text-cyber-cyan animate-pulse animate-duration-1000" />
            </span>
          </span>
          <div className="space-y-1">
            <div className="font-extrabold text-white uppercase tracking-[0.12em]">AI Threat Analysis Active</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
            Querying Gemini Security Telemetry nodes & compiling TTP brief...
            </div>
          </div>
        </div>
      </div>
    );
  }

  const attackAttempt = `An attacker representing ${reportData.actorName} attempted to gain access to the ${reportData.industryName} environment targeting the ${reportData.targetName} systems using ${reportData.vectorName.toLowerCase()} techniques.`;

  const defenseResponse = reportData.status === "Blocked"
    ? `Defensive security systems running under ${getSecurityLevelName(reportData.securityLevel)} Protection successfully detected the suspicious intrusion activity in its early stages and intervened to block the threat.`
    : `Security controls configured under ${getSecurityLevelName(reportData.securityLevel)} Protection failed to contain the intrusion, allowing the attacker to bypass access boundaries and establish network connections.`;

  const finalOutcome = reportData.status === "Blocked"
    ? `No sensitive database files or customer records were exposed, and the attacker was successfully stopped before reaching critical systems.`
    : `Sensitive database tables were accessed and files were locked. The attacker successfully compromised critical systems, resulting in estimated data exposure.`;

  return (
    <div
      style={{ overflowAnchor: "none" }}
      className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-cyber-bg text-slate-100 selection:bg-electric-blue/30 selection:text-white print:bg-white print:text-black font-sans"
    >
      {/* Background elements - hidden on print */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0 print:hidden" />
      <div className="absolute inset-0 cyber-grid-fine opacity-50 pointer-events-none z-0 print:hidden" />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] opacity-10 print:hidden" />
      <div className="fixed inset-0 pointer-events-none z-50 animate-scanline bg-gradient-to-b from-transparent via-cyber-cyan/[0.012] to-transparent h-16 w-full print:hidden" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-7xl mx-auto px-6 relative z-10 w-full flex-grow pt-8 pb-12 print:pt-0"
      >
        {/* Navigation back and telemetry info - hidden on print */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4 print:hidden font-mono text-[10px]">
          <Link
            href="/command-center"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white uppercase transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Command Center
          </Link>

          <div className="flex items-center gap-4 text-slate-400 tracking-wider">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyber-border bg-black/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
              </span>
              AI Security Assistant
            </span>
            <LiveClock />
          </div>
        </div>

        {/* Title Header - print:hidden */}
        <div className="mb-10 max-w-4xl print:hidden flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase font-bold">
              <Brain className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
              Interactive Cybersecurity Walkthrough
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase font-sans">
              Simulation Results
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed font-sans">
              See how the attack unfolded, what impact it had, and how security defenses responded.
            </p>
          </div>

          <div>
            {reportData.status === "Blocked" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-green/30 bg-cyber-green/10 text-cyber-green text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                🟢 Attack Successfully Blocked
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                🔴 Attack Reached Critical Systems
              </span>
            )}
          </div>
        </div>

        {/* Print Only Header: Visible only during browser print */}
        <div className="hidden print:block font-mono text-black border-b-2 border-black pb-4 mb-8">
          <h1 className="text-2xl font-bold uppercase">Sentinel Simulation Results Summary</h1>
          <div className="grid grid-cols-2 gap-4 text-[10px] mt-2">
            <div><strong>Report Reference:</strong> {reportData.id}</div>
            <div><strong>Attacker Profile:</strong> {reportData.actorName}</div>
            <div><strong>Attack Method:</strong> {reportData.vectorName}</div>
            <div><strong>Target Environment:</strong> {reportData.industryName} ({reportData.targetName})</div>
            <div><strong>Simulation Status:</strong> {reportData.status === "Blocked" ? "BLOCKED" : "SUCCESSFUL"}</div>
            <div><strong>Timestamp:</strong> {new Date(reportData.timestamp).toUTCString()}</div>
          </div>
        </div>

        {/* Action Controls - hidden on print */}
        <div className="glassmorphism-card rounded-xl p-4 border border-cyber-border mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
            <span className="text-slate-400">TARGET REF:</span>
            <span className="text-white font-bold">{reportData.id}</span>
            <span className="text-slate-655">|</span>
            <span className="text-slate-400">ATTACKER:</span>
            <span className="text-white font-bold uppercase">{reportData.actorName}</span>
            <span className="text-slate-655">|</span>
            <span className="text-slate-400">PROTECTION:</span>
            <span className="text-white font-bold uppercase">{getSecurityLevelName(reportData.securityLevel)}</span>
            <span className="text-slate-655">|</span>
            {isLiveAI ? (
              <span className="px-1.5 py-0.5 rounded border border-cyber-cyan/30 bg-cyber-cyan/10 text-cyber-cyan text-[8px] font-bold uppercase tracking-wider animate-pulse">
                AI Intelligence Synced
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-500 text-[8px] font-bold uppercase tracking-wider">
                Fallback Synthesis
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 font-mono">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-border bg-cyber-surface hover:bg-cyber-surface-brighter hover:text-white text-slate-300 text-[10px] tracking-widest uppercase transition-colors cursor-pointer font-bold"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Summary
            </button>
            <button
              onClick={handleExportMarkdown}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-cyan/35 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan text-[10px] tracking-widest uppercase transition-all hover:shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer font-bold"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-purple-500/35 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] tracking-widest uppercase transition-all hover:shadow-[0_0_12px_rgba(168,85,247,0.2)] cursor-pointer font-bold relative"
            >
              <Share2 className="w-3.5 h-3.5" />
              {copied ? "Link Copied!" : "Share Simulation"}
            </button>
          </div>
        </div>

        {/* Unified Single-Column Flow Layou        {/* Unified Single-Column Flow Layout */}
        <div className="space-y-10 max-w-5xl mx-auto">
          
          {/* Panel 1: Simulation Verdict & AI Explanation */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan/30 via-transparent to-transparent" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-cyber-border/40 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-cyber-cyan" />
                <h3 className="text-white font-bold text-xs uppercase tracking-widest font-mono">
                  Simulation Outcome & Verdict
                </h3>
              </div>
              <div>
                {reportData.status === "Blocked" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-cyber-green/40 bg-cyber-green/10 text-cyber-green text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    🟢 Attack Contained
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded border border-cyber-red/40 bg-cyber-red/10 text-cyber-red text-xs font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                    🔴 System Compromised
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs leading-relaxed text-slate-300">
              <div className="p-4 rounded-lg bg-cyber-surface/40 border border-cyber-border/60">
                <strong className="text-white font-mono text-[9px] uppercase tracking-wider block mb-1 text-cyber-cyan">AI Mentor Analysis</strong>
                <p className="text-slate-200 text-sm font-semibold leading-relaxed">
                  {reportData.executiveSummary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] font-mono text-slate-400">
                <div className="bg-black/35 p-3 rounded border border-cyber-border">
                  <span className="text-slate-505 uppercase block text-[8px] text-slate-500">TARGET ENVIRONMENT</span>
                  <span className="text-white font-bold block mt-1 uppercase">{reportData.industryName} ({reportData.targetName})</span>
                </div>
                <div className="bg-black/35 p-3 rounded border border-cyber-border">
                  <span className="text-slate-505 uppercase block text-[8px] text-slate-500">ATTACKER GROUP</span>
                  <span className="text-white font-bold block mt-1 uppercase">{reportData.actorName}</span>
                </div>
                <div className="bg-black/35 p-3 rounded border border-cyber-border">
                  <span className="text-slate-505 uppercase block text-[8px] text-slate-500">ENTRY METHOD</span>
                  <span className="text-white font-bold block mt-1 uppercase">{reportData.vectorName}</span>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Panel 2: Simulation Impact & Prevention Index */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Financial Card */}
            <div className="glassmorphism-card rounded-xl p-4 border border-cyber-border flex flex-col justify-between h-[115px]">
              <div>
                <span className="text-slate-505 font-mono text-[9px] uppercase tracking-wider block font-bold text-slate-500">💰 Financial Liability</span>
                <div className="text-cyber-red text-sm font-extrabold mt-1 uppercase font-mono">
                  {reportData.financialLoss.includes("(") ? reportData.financialLoss.split(" ")[0] : reportData.financialLoss}
                </div>
              </div>
              <p className="text-slate-400 text-[9px] leading-tight">
                Potential remediation & recovery fees.
              </p>
            </div>

            {/* Downtime Card */}
            <div className="glassmorphism-card rounded-xl p-4 border border-cyber-border flex flex-col justify-between h-[115px]">
              <div>
                <span className="text-slate-505 font-mono text-[9px] uppercase tracking-wider block font-bold text-slate-500">⏱️ Operational Downtime</span>
                <div className="text-cyber-cyan text-sm font-extrabold mt-1 uppercase font-mono">
                  {reportData.downtime}
                </div>
              </div>
              <p className="text-slate-400 text-[9px] leading-tight">
                Infrastructure restoration delay duration.
              </p>
            </div>

            {/* Recommended Fix Card */}
            <div className="glassmorphism-card rounded-xl p-4 border border-cyber-border flex flex-col justify-between h-[115px]">
              <div>
                <span className="text-slate-505 font-mono text-[9px] uppercase tracking-wider block font-bold text-slate-500">🛡️ Recommended Fix</span>
                <div className="text-white text-[11px] font-bold mt-1 uppercase truncate font-mono" title={
                  reportData.mitigations && reportData.mitigations.length > 0
                    ? reportData.mitigations[0].split(":")[0]
                    : getPreventionSuite(reportData.vectorId)[0].title
                }>
                  {
                    reportData.mitigations && reportData.mitigations.length > 0
                      ? reportData.mitigations[0].split(":")[0]
                      : getPreventionSuite(reportData.vectorId)[0].title
                  }
                </div>
              </div>
              <p className="text-slate-400 text-[9px] leading-tight truncate">
                {
                  reportData.mitigations && reportData.mitigations.length > 0
                    ? reportData.mitigations[0].split(":").slice(1).join(":")
                    : getPreventionSuite(reportData.vectorId)[0].why
                }
              </p>
            </div>

            {/* Risk Reduction Card */}
            <div className="glassmorphism-card rounded-xl p-4 border border-cyber-green/30 bg-cyber-green/5 flex flex-col justify-between h-[115px]">
              <div>
                <span className="text-cyber-green font-mono text-[9px] uppercase tracking-wider block font-bold">⚡ Risk Mitigated</span>
                <div className="text-cyber-green text-sm font-extrabold mt-1 font-mono">
                  +{reportData.riskReduction}% Security
                </div>
              </div>
              <p className="text-slate-400 text-[9px] leading-tight">
                Current Risk: {reportData.currentRisk}% → Projected: {reportData.projectedRisk}%
              </p>
            </div>
          </motion.section>

          {/* Panel 3: Simplified 3-Step Timeline */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan/30 via-transparent to-transparent" />
            <div className="flex items-center justify-between border-b border-cyber-border/40 pb-3 mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyber-cyan animate-pulse" />
                <h3 className="text-white font-bold text-xs uppercase tracking-widest font-mono">
                  Simulation Progression Timeline
                </h3>
              </div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Condensed Milestones</span>
            </div>

            {(() => {
              const stages = reportData.stages;
              const isStep1Blocked = stages[0]?.status === "blocked" || stages[1]?.status === "blocked";
              const isStep2Blocked = !isStep1Blocked && (stages[2]?.status === "blocked" || stages[3]?.status === "blocked" || stages[4]?.status === "blocked");
              const isStep3Blocked = !isStep1Blocked && !isStep2Blocked && (stages[5]?.status === "blocked");

              const milestones = [
                {
                  title: "Milestone 1: Looking for Entry (Ingress Attempt)",
                  desc: `Attacker performed scanning and executed initial entry payloads via ${reportData.vectorName}.`,
                  status: isStep1Blocked ? "Stopped" : "Successful"
                },
                {
                  title: "Milestone 2: Pivoting Inside (Lateral Movement & Escalation)",
                  desc: "Attacker attempted credential harvesting, host token manipulation, and lateral pivots to secure server zones.",
                  status: isStep1Blocked ? "Unreached" : isStep2Blocked ? "Stopped" : "Successful"
                },
                {
                  title: "Milestone 3: Data Target (Exfiltration & System Ransom)",
                  desc: "Attacker targeted core operational files to compress databases for exfiltration and execute locking scripts.",
                  status: (isStep1Blocked || isStep2Blocked) ? "Unreached" : isStep3Blocked ? "Stopped" : "Successful"
                }
              ];

              return (
                <div className="relative border-l border-cyber-border/80 pl-6 space-y-6 ml-3">
                  {milestones.map((milestone, idx) => {
                    const stepStatus = milestone.status;
                    return (
                      <div key={idx} className={`relative transition-all duration-300 ${stepStatus === "Unreached" ? "opacity-30" : "opacity-100"}`}>
                        <span className={`absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center font-mono text-[8px] font-bold ${
                          stepStatus === "Stopped"
                            ? "bg-black border-cyber-green text-cyber-green shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                            : stepStatus === "Successful"
                              ? "bg-cyber-red border-cyber-red text-black"
                              : "bg-slate-955 border-slate-800 text-slate-600"
                        }`}>
                          {idx + 1}
                        </span>

                        <div className="p-4 rounded-lg bg-cyber-surface/30 border border-cyber-border/40 flex flex-wrap md:flex-nowrap gap-4 justify-between items-center">
                          <div className="space-y-1 font-sans text-xs flex-grow">
                            <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">{milestone.title}</h4>
                            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{milestone.desc}</p>
                          </div>

                          <div className="shrink-0 pt-0.5 font-mono">
                            {stepStatus === "Stopped" && (
                              <span className="px-2 py-0.5 rounded border border-cyber-green/30 bg-cyber-green/10 text-cyber-green text-[8px] font-bold uppercase tracking-wider">
                                🟢 Stopped
                              </span>
                            )}
                            {stepStatus === "Successful" && (
                              <span className="px-2 py-0.5 rounded border border-cyber-red/30 bg-cyber-red/10 text-cyber-red text-[8px] font-bold uppercase tracking-wider">
                                🔴 Successful
                              </span>
                            )}
                            {stepStatus === "Unreached" && (
                              <span className="px-2 py-0.5 rounded border border-slate-800 bg-slate-900/50 text-slate-500 text-[8px] font-bold uppercase tracking-wider">
                                ⚪ Unreached
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </motion.section>

          {/* Section 6 & 7: Collapsible Technical Threat Intelligence */}
          <div className="w-full">
            <div className="p-5 rounded-lg border border-cyber-border bg-cyber-surface/30 mb-4 text-left print:hidden">
              <h4 className="text-white font-mono text-xs uppercase font-bold tracking-wider">Advanced Cybersecurity Concepts (Technical Reference)</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                For cybersecurity learners, analysts, and recruiters interested in deeper technical details.
              </p>
              <button
                onClick={() => setIsTechnicalExpanded(!isTechnicalExpanded)}
                className="mt-3 py-2 px-4 rounded border border-cyber-cyan/35 bg-cyber-cyan/10 hover:bg-cyber-cyan/20 text-cyber-cyan hover:text-white flex items-center gap-2 font-mono text-[9px] uppercase tracking-wider transition-all duration-300 hover:cursor-pointer font-bold"
              >
                <Layers className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
                <span>{isTechnicalExpanded ? "Hide Advanced Cybersecurity Concepts (Technical Reference)" : "View Advanced Cybersecurity Concepts (Technical Reference)"}</span>
              </button>
            </div>

            <AnimatePresence>
              {(isTechnicalExpanded || typeof window === "undefined" /* keep visible on print if server side */) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8 overflow-hidden pb-8 pt-2 print:block font-mono"
                >
                  {/* Threat Intelligence Metadata */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-[10px]">
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">Who is behind the attack (Threat Actor)</div>
                      <div className="text-white font-bold mt-1.5 uppercase">
                        {getActorName(reportData.actorId, true)}
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">How the attack starts (Attack Vector)</div>
                      <div className="text-white font-bold mt-1.5 uppercase font-bold">
                        {getAttackName(reportData.vectorId, true)}
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">Internal Asset ID</div>
                      <div className="text-white font-bold mt-1.5 uppercase">
                        {reportData.targetName}
                      </div>
                    </div>
                    <div className="bg-black/40 p-4 rounded-xl border border-cyber-border bg-black/40">
                      <div className="text-cyber-cyan text-[8px] uppercase tracking-wider">Defense Profile</div>
                      <div className="text-white font-bold mt-1.5 uppercase">
                        {getSecurityLevelName(reportData.securityLevel)}
                      </div>
                    </div>
                  </div>

                  {/* Attacker Threat Intel profile reference */}
                  <div className="bg-cyber-surface/40 border border-cyber-border p-5 rounded-xl">
                    <div className="text-cyber-cyan font-mono text-[10px] uppercase font-bold mb-3 font-bold">Adversary Threat Intelligence Profile (Advanced)</div>
                    <p className="text-slate-350 leading-relaxed text-[11px] font-sans">
                      {reportData.actorProfile}
                    </p>
                  </div>

                  {/* Adversary Attack Chain & Containment Flow */}
                  <div className="glassmorphism-card rounded-xl p-6 border border-cyber-border bg-black/40">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold mb-6">
                      Adversary Attack Chain & Containment Flow
                    </span>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-[9px]">
                      {reportData.stages.map((stage, idx) => {
                        const isStageBlocked = stage.status === "blocked";
                        const isPriorStageBlocked = reportData.stages.slice(0, idx).some(s => s.status === "blocked");
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
                              <div className="opacity-50 text-[8px] uppercase font-mono">PHASE 0{idx + 1}</div>
                              <div className="font-bold text-white uppercase text-[9px] my-1 truncate" title={stage.title}>
                                {stage.title.split(" ").slice(0, 2).join(" ")}
                              </div>
                              <div className="font-bold">{statusLabel}</div>
                            </div>
                            {idx < reportData.stages.length - 1 && (
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
                      <div className="text-cyber-cyan font-mono text-[10px] uppercase font-bold mb-4">Technical Reference (MITRE ATT&CK Mapping)</div>
                      <div className="space-y-2.5 font-mono text-[9px]">
                        {reportData.stages.map((stage: CampaignStage, idx: number) => {
                          const customMapping = reportData.mitreMapping?.find((m: { stageIndex: number; code: string; name: string }) => m.stageIndex === idx);
                          const mapping = customMapping
                            ? { code: customMapping.code, name: customMapping.name }
                            : getMitreAttackMapping(reportData.vectorId, idx);
                          return (
                            <div key={idx} className="flex justify-between items-center bg-black/40 p-2.5 border border-cyber-border/40 rounded">
                              <span className="text-white font-bold">{mapping.name.split(" (")[0]}</span>
                              <span className="text-cyber-cyan font-bold border border-cyber-cyan/30 px-1.5 py-0.5 rounded bg-cyber-cyan/5 ml-2 font-mono">{mapping.code}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Detection Rules Card */}
                    <div className="bg-cyber-surface/40 border border-cyber-border p-5 rounded-xl">
                      <div className="text-cyber-cyan font-mono text-[10px] uppercase font-bold mb-4">Detection Rules</div>
                      <ul className="space-y-2.5 text-[10px] text-slate-350 list-disc pl-4 font-sans leading-relaxed">
                        {reportData.vectorId === "Phishing" && (
                          <>
                            <li>Mail gateway SPF/DMARC verify alerts</li>
                            <li>Anomaly detection on credential inputs & headers</li>
                            <li>EDR alerts on process launches from browser temp paths</li>
                          </>
                        )}
                        {reportData.vectorId === "Ransomware" && (
                          <>
                            <li>Host telemetry monitoring file writing high frequency</li>
                            <li>Endpoint detection alerts on backup shadow copy deletes</li>
                            <li>Network firewall rules logging active encryption keys</li>
                          </>
                        )}
                        {reportData.vectorId === "DDoS" && (
                          <>
                            <li>Border gateway volume thresholds logging packet counts</li>
                            <li>DNS request rate verification on load balancer ports</li>
                            <li>SYN-flood detection alerts on gateway filters</li>
                          </>
                        )}
                        {reportData.vectorId === "SQL Injection" && (
                          <>
                            <li>Web Application Firewall checking SELECT/UNION keys</li>
                            <li>Database command logs flagging query validation fails</li>
                            <li>API gateway logging anomalous query parameter lengths</li>
                          </>
                        )}
                        {reportData.vectorId === "Supply Chain" && (
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
                          {getIocData(reportData.vectorId).ips.map((ip, index) => (
                            <div key={index} className="bg-black/30 p-1.5 rounded border border-cyber-border/40 mt-1">{ip}</div>
                          ))}
                        </div>
                        <div>
                          <strong className="text-white block uppercase mb-1 text-[9px]">File Hashes (MD5):</strong>
                          {getIocData(reportData.vectorId).hashes.map((hash, index) => (
                            <div key={index} className="bg-black/30 p-1.5 rounded border border-cyber-border/40 mt-1 truncate" title={hash}>{hash}</div>
                          ))}
                        </div>
                        <div>
                          <strong className="text-white block uppercase mb-1 text-[9px]">Network / Host Artifacts:</strong>
                          {getIocData(reportData.vectorId).artifacts.map((art, index) => (
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
        </div>

      </motion.div>

      {/* Footer - hidden on print */}
      <footer className="relative bg-black border-t border-cyber-border/40 py-10 z-10 overflow-hidden mt-12 print:hidden font-mono text-[9px]">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 tracking-wider uppercase">
          <div>
            <span className="text-white font-bold tracking-[0.2em]">SENTINEL PLATFORM</span>
            <span className="ml-2">© {new Date().getFullYear()} Sentinel Cyber Inc.</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-green opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-green"></span>
            </span>
            <span>INTEL ENCRYPT SYNC: COMPLETED</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AIAnalystPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg text-cyber-cyan font-mono text-xs uppercase tracking-widest">
        <div className="flex flex-col items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyber-cyan"></span>
          </span>
          Initializing Threat Intel Analyst Console...
        </div>
      </div>
    }>
      <AIAnalystContent />
    </Suspense>
  );
}
