"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import JourneyStepper from "../../components/JourneyStepper";
import Footer from "../../components/Footer";
import {
  ArrowLeft, Brain, ShieldAlert, Layers, AlertTriangle,
  FileText, Download, Printer, ChevronRight, TrendingUp, Shield,
  CheckCircle2, AlertOctagon, Info, Share2, Lock, Eye, Mail, Key, ShieldCheck, Terminal, Activity, BookOpen
} from "lucide-react";
import {
  getCampaignHistory, StoredCampaign, getActorName,
  getAttackName, getIndustryName, CampaignStage, getSecurityLevelName, generateCTIReport
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

const getAttackJourneyFlow = (attackType: string) => {
  const journeys: Record<string, string[]> = {
    Phishing: [
      "Fake Email Delivered",
      "Victim Clicked Link",
      "Password Stolen",
      "Attacker Entered System",
      "Sensitive Records Accessed"
    ],
    Ransomware: [
      "Malicious File Downloaded",
      "Victim Opened Attachment",
      "Ransomware Run on Machine",
      "Files Locked and Encrypted",
      "Payment Demand Displayed"
    ],
    DDoS: [
      "Malicious Traffic Flooded Gateway",
      "Gateway Ports Overloaded",
      "Server Resource Limits Exhausted",
      "Public Web Portal Crashed",
      "Services Unreachable for Users"
    ],
    "SQL Injection": [
      "Malicious Input Sent to Web Form",
      "Database Command Query Executed",
      "Access Authentication Bypassed",
      "Attacker Gained Database Entry",
      "Sensitive Customer Lists Stolen"
    ],
    "Supply Chain": [
      "Malicious Package Pushed to Public Library",
      "Developer Build System Imported Package",
      "Malicious Code Run During Software Build",
      "Hidden Back Door Opened on Build Server",
      "Attacker Accessed Internal Infrastructure"
    ]
  };

  return journeys[attackType] || [
    "Attack Initiated",
    "Outer Defenses Probed",
    "System Vulnerability Exploited",
    "Internal Pivot Attempted",
    "Data Assets Target Reached"
  ];
};

const getRealWorldContext = (attackType: string) => {
  switch (attackType) {
    case "Phishing":
      return "In 2020, hackers phished Twitter employees to gain access to internal systems and hijack prominent accounts. Sentinel shows how simple email scams bypass human trust to breach networks.";
    case "Ransomware":
      return "In 2021, the Colonial Pipeline shutdown demonstrated how ransomware encrypts critical files. Sentinel shows why automated containment is vital to prevent entire operations from stopping.";
    case "DDoS":
      return "In 2016, the massive Dyn attack took down sites like Netflix and Reddit using a flood of volumetric traffic. Sentinel highlights how limiting query rates keeps portals online.";
    case "SQL Injection":
      return "In 2017, Equifax leaked millions of records because of an unpatched database entry vulnerability. Sentinel demonstrates how sanitizing inputs protects database schemas.";
    case "Supply Chain":
      return "In 2020, the SolarWinds compromise infected thousands of companies through a trusted update. Sentinel shows why cryptographic checksums must verify every file dependency.";
    default:
      return "Many famous data breaches start with simple configuration gaps left unpatched. Sentinel teaches how defense-in-depth principles prevent local intrusions from becoming full system compromises.";
  }
};

const getSimplifiedPreventativeChecklist = (attackType: string) => {
  switch (attackType) {
    case "Phishing":
      return [
        { icon: "🔑", title: "Enforce Hardware MFA", desc: "Prevents attackers from logging in even if they steal user passwords." },
        { icon: "✉️", title: "Configure Email Filters", desc: "Blocks phishing links and spoofed email headers at the mail gateway." },
        { icon: "🖥️", title: "Deploy Endpoint protection", desc: "Terminates credential harvesting script attempts in memory." },
        { icon: "🎓", title: "Run User Awareness Training", desc: "Helps students recognize suspicious domains." }
      ];
    case "Ransomware":
      return [
        { icon: "🔒", title: "Enable Immutable Backups", desc: "Ensures data cannot be deleted or encrypted by ransomware payload files." },
        { icon: "💾", title: "Restrict Write Permissions", desc: "Prevents unauthorized scripts from locking down network directories." },
        { icon: "⚙️", title: "Automate Host Isolation", desc: "Instantly disconnects compromised workstations before malware propagates." },
        { icon: "🛡️", title: "Enforce Zero Trust Access", desc: "Limits user access to only the specific files they need." }
      ];
    case "DDoS":
      return [
        { icon: "🌐", title: "Route Through Volumetric Scrubbers", desc: "Cleans inbound packet surges at the network border." },
        { icon: "⏱️", title: "Set SYN-Cookie Rate Limits", desc: "Restricts connection rates to prevent load balancer exhaustion." },
        { icon: "📦", title: "Distribute Over Edge CDNs", desc: "Caches static pages close to users to keep backend databases safe." },
        { icon: "🔌", title: "Establish Redundant Gateways", desc: "Provides back-up routing paths if the primary link goes offline." }
      ];
    case "SQL Injection":
      return [
        { icon: "🧱", title: "Enforce Parameterized Queries", desc: "Tells database engines to treat inputs as plain text rather than commands." },
        { icon: "🛡️", title: "Deploy Web Application Firewalls", desc: "Filters out database script tags at the website boundary." },
        { icon: "🔑", title: "Limit User Read/Write Privileges", desc: "Restricts compromised application servers from editing schemas." },
        { icon: "🔎", title: "Conduct Input Length Checks", desc: "Blocks excessively long or strange query queries from execution." }
      ];
    case "Supply Chain":
      return [
        { icon: "🔑", title: "Verify Cryptographic Checksums", desc: "Ensures third-party packages match official publisher signatures." },
        { icon: "📦", title: "Run Builds in Ephemeral Sandboxes", desc: "Compiles code inside isolated, internet-restricted containers." },
        { icon: "🌐", title: "Mirror External Registries", desc: "Pulls package updates from validated local servers rather than public hubs." },
        { icon: "🔎", title: "Audit Dependency Libraries", desc: "Scans open-source packages for known security vulnerabilities before build." }
      ];
    default:
      return [
        { icon: "🔒", title: "Implement Zero Trust Rules", desc: "Validates all user access requests regardless of network location." },
        { icon: "🛡️", title: "Segment Network Zones", desc: "Confines potential breaches to isolated developer subnets." },
        { icon: "📊", title: "Enable Centralized Log Rules", desc: "Flags unusual activity alerts early to trigger fast responses." }
      ];
  }
};

const getRememberThisPoints = (attackType: string) => {
  switch (attackType) {
    case "Phishing":
      return [
        "Trust should always be verified—never enter passwords on email links without checking the URL.",
        "Small security gaps can lead to large attacks if administrator credentials are harvested.",
        "Layered security (like hardware MFA keys) greatly reduces credential compromise risk."
      ];
    case "Ransomware":
      return [
        "Offline backups are only useful if the attacker cannot access or modify them.",
        "Internal network segmentation confines file encryption payloads to a single subnet.",
        "Automated endpoint tools must isolate compromised hosts instantly before malware propagates."
      ];
    case "DDoS":
      return [
        "Availability is a core pillar of security—keeping servers accessible is just as vital as data confidentiality.",
        "Connection rate limits prevent gateways from crashing under volumetric request spikes.",
        "Edge caching and distributed networks absorb traffic surges to protect backend assets."
      ];
    case "SQL Injection":
      return [
        "Never trust user inputs—always use parameterized queries in code.",
        "Least privilege database rules prevent attackers from viewing or modifying core schemas.",
        "WAF filters add a vital layer of perimeter protection to detect and block malicious script syntax."
      ];
    case "Supply Chain":
      return [
        "Trusting external code updates without validation exposes the entire build pipeline.",
        "Isolated build agents prevent malicious packages from downloading backdoor shells.",
        "Software dependencies must be cryptographically verified and audited regularly for gaps."
      ];
    default:
      return [
        "Verify credentials at every layer instead of trusting internal network zones.",
        "Defenders must continuously monitor system memory and logs for suspicious pivot activity.",
        "Layered security controls dramatically reduce the likelihood of a successful system compromise."
      ];
  }
};

const getRevealCardContent = (attackType: string, securityLevel: string, isBlocked: boolean) => {
  const levelName = getSecurityLevelName(securityLevel);
  return {
    whyBlockedOrSucceeded: isBlocked
      ? `Under ${levelName} Protection, active security rules successfully flagged unauthorized activity (like memory scanning or lateral pivots) and isolated key assets, preventing the attacker from compromising critical systems.`
      : `Lacking active rules under ${levelName} Protection, the security tools failed to flag the attacker's script or credentials dump, allowing them to pivot laterally and exfiltrate database tables.`,
    whatIfDifferentSecurity: isBlocked
      ? "If Basic Protection had been selected, many advanced endpoint scanning and network segmentation rules would be disabled. The attacker would have easily pivoted from the workstation to compromise the database."
      : "If Advanced Protection had been active, the security gateway would have automatically isolated the compromised workstation and blocked lateral access to the server, stopping the attack in its tracks.",
    howBasicProtectionChanges: "Under Basic Protection, the system relies on generic perimeter firewalls with no internal access control. Attackers can move freely once inside, dump system memory credentials, and compromise databases without triggering alerts."
  };
};

const getImpactDetails = (attackType: string, industry: string, isBlocked: boolean) => {
  const defaultSystems = ["Internal workstations", "Directory servers", "Backup servers"];
  const defaultConsequences = ["Operational delays", "Exposure of internal files", "Service downtime"];
  const defaultRecovery = isBlocked 
    ? "Under 1 hour to inspect logs, run scans, and confirm containment."
    : "Several hours to multiple days depending on backups and incident response readiness.";
  const defaultImprovements = ["Multi-factor authentication", "Email filtering", "Network separation", "Endpoint protection"];

  const mapping: Record<string, Record<string, { systems: string[]; consequences: string[]; recovery: string; improvements: string[] }>> = {
    Banking: {
      Phishing: {
        systems: ["Employee email accounts", "SWIFT transfer terminals", "Identity directories"],
        consequences: ["Unauthorized fund transfers", "Exposed customer banking records", "Temporary compliance halts"],
        recovery: isBlocked 
          ? "Under 1 hour to lock the targeted email accounts and reset credentials." 
          : "24 to 72 hours to audit transaction logs and verify SWIFT network compliance.",
        improvements: ["Hardware-based MFA security keys", "Email DMARC/SPF ingress rules", "Endpoint memory scanning blocks"]
      },
      Ransomware: {
        systems: ["Transaction ledgers", "Core account databases", "Backup storage drives"],
        consequences: ["Interrupted customer transactions", "Locked branch operations", "Regulatory non-compliance fines"],
        recovery: isBlocked 
          ? "Under 2 hours to confirm malware containment and run full network scans." 
          : "3 to 5 days to restore banking nodes from secure offline backup snapshots.",
        improvements: ["Immutable cloud backups", "Endpoint containment playbooks", "Workstation volume write blocks"]
      },
      DDoS: {
        systems: ["Online banking web portals", "Mobile application API servers", "Internet gateway router ports"],
        consequences: ["Customers unable to log in", "Interrupted online transfers", "Customer support desk overload"],
        recovery: isBlocked 
          ? "Under 30 minutes for traffic scrubbers to absorb and filter the surge." 
          : "6 to 12 hours of service degradation while filtering attacker IP networks.",
        improvements: ["Volumetric DDoS traffic scrubbers", "SYN-cookie rate limits", "Distributed CDN caching"]
      },
      "SQL Injection": {
        systems: ["Customer accounting schemas", "Loan approval databases", "Public contact forms"],
        consequences: ["Theft of client account credentials", "Exposed balance databases", "Application code exploitation"],
        recovery: isBlocked 
          ? "Under 1 hour to patch public query fields and verify database security logs." 
          : "12 to 36 hours to review database leaks, patch SQL code, and rotate passwords.",
        improvements: ["Parameterized database queries", "Web Application Firewalls (WAF)", "Least privilege database accounts"]
      },
      "Supply Chain": {
        systems: ["Core banking software build servers", "Internal software dependency libraries", "Developer computers"],
        consequences: ["Infected banking software updates", "Undetected system backdoor access", "Compromised developer credentials"],
        recovery: isBlocked 
          ? "Under 2 hours to isolate build containers and inspect dependency files." 
          : "Several days to weeks to audit software code packages and rebuild environments.",
        improvements: ["Cryptographic dependency checksums", "Isolated CI/CD builders", "Mirrored local package repositories"]
      }
    },
    Healthcare: {
      Phishing: {
        systems: ["Staff email systems", "Patient scheduling records", "Employee directories"],
        consequences: ["Interrupted doctor schedules", "Exposed patient contact details", "Stolen staff credentials"],
        recovery: isBlocked 
          ? "Under 1 hour to lock the compromised inbox and alert staff." 
          : "24 to 48 hours to inspect logs and ensure no other medical files were opened.",
        improvements: ["Multi-factor authentication (MFA)", "Phishing email filtering rules", "Endpoint credential dumping alerts"]
      },
      Ransomware: {
        systems: ["Electronic Medical Records (EMR)", "Hospital scheduling databases", "Emergency dispatch nodes"],
        consequences: ["Unable to access patient history", "Canceled surgeries and appointments", "Forced manual triage protocols"],
        recovery: isBlocked 
          ? "Under 2 hours to verify isolated hosts and restore normal logins." 
          : "2 to 4 days to rebuild EMR servers and recover files from offline backup drives.",
        improvements: ["Immutable backups", "Network microsegmentation", "Automated threat containment"]
      },
      DDoS: {
        systems: ["Patient telemedicine portals", "Hospital website host servers", "Inbound internet gateways"],
        consequences: ["Canceled online doctor visits", "Patients unable to reach online help", "Internal system connectivity delays"],
        recovery: isBlocked 
          ? "Under 30 minutes to apply border rate limiting and route scrubbers." 
          : "6 to 18 hours of intermittent telemedicine access while scrubbing traffic.",
        improvements: ["Distributed CDN edge caching", "Border firewall rate limits", "Backup internet gateway routing"]
      },
      "SQL Injection": {
        systems: ["Patient diagnosis databases", "Billing records tables", "Public appointment forms"],
        consequences: ["Exposed patient treatment history", "Stolen billing information", "Unsanitized database queries run"],
        recovery: isBlocked 
          ? "Under 1 hour to patch inputs and verify patient record integrity." 
          : "12 to 24 hours to patch application code, verify leaks, and alert compliance.",
        improvements: ["Parameterized query bind parameters", "Web Application Firewalls", "Database least privilege rights"]
      },
      "Supply Chain": {
        systems: ["Medical software build pipelines", "Internal libraries", "Medical imaging update systems"],
        consequences: ["Malicious software run on hospital networks", "Backdoors in medical updates", "Exposed system servers"],
        recovery: isBlocked 
          ? "Under 2 hours to isolate servers and inspect software dependency logs." 
          : "Several days to audit all medical app packages and reinstall systems.",
        improvements: ["Package verification controls", "Sandboxed build runners", "Mirrored internal library registries"]
      }
    }
  };

  const industryMap = mapping[industry] || mapping["Healthcare"];
  return industryMap[attackType] || {
    systems: defaultSystems,
    consequences: defaultConsequences,
    recovery: defaultRecovery,
    improvements: defaultImprovements
  };
};

const getEducationalLessons = (attackType: string, securityLevel: string) => {
  const isLowOrMedium = securityLevel === "Low" || securityLevel === "Medium";
  
  const defaultLessons = {
    keyTakeaway: "Cybersecurity is about defense in depth. One single lock is not enough to stop a determined attacker.",
    whatBeginnersRemember: "Always double-check link origins, use strong password managers, and enable multi-factor authentication (MFA).",
    realWorldLesson: "Many real-world breaches happen because of minor security configuration gaps that go unpatched for months.",
    whyAttackWorked: "The security setup did not have layered boundary protections, allowing the attacker to pivot from system to system.",
    howDefendersImprove: "Segment networks into isolated security zones, monitor system memory, and configure automatic alerts for credential theft attempts."
  };

  const lessons: Record<string, typeof defaultLessons> = {
    Phishing: {
      keyTakeaway: "Attackers often target humans first because people can be tricked easier than computers. Securing credentials is our strongest defense.",
      whatBeginnersRemember: "Phishing emails look identical to real ones. Never type your login password after clicking a link in an email; always log in directly through the main website.",
      realWorldLesson: "Even major technology organizations get breached because a single employee was tricked by a fake login form.",
      whyAttackWorked: isLowOrMedium 
        ? "The security setup lacked Multi-Factor Authentication (MFA) and did not scan email attachments, allowing the attacker to harvest active logins easily."
        : "Although basic email filters were active, the user was able to bypass warn prompts and enter credentials on a spoofed external portal.",
      howDefendersImprove: "Enforce hardware-based security keys (MFA) that cannot be phished, run automated email link scanners, and train employees."
    },
    Ransomware: {
      keyTakeaway: "Ransomware attempts to cause maximum disruption by locking data assets. Protecting backups is the key to recovery.",
      whatBeginnersRemember: "Opening one suspicious file attachment can compromise an entire business network within minutes.",
      realWorldLesson: "Organizations have paid millions of dollars to recover files because their online backups were encrypted by the attacker too.",
      whyAttackWorked: isLowOrMedium
        ? "Operating system folders allowed write permissions for standard user scripts, and backup drives were connected directly to the network."
        : "Defenses detected the ransomware payload but lacked automatic endpoint isolation, allowing the encryption tool to spread to server nodes.",
      howDefendersImprove: "Set up immutable (non-rewritable) offline backups, restrict volume write access, and deploy endpoint tools to isolate hosts instantly."
    },
    DDoS: {
      keyTakeaway: "DDoS attacks do not try to steal passwords or breach data; they simply flood the entry gates to keep real users out.",
      whatBeginnersRemember: "If a website is running slow or not responding, it might be undergoing a traffic flood rather than being breached.",
      realWorldLesson: "Volumetric floods are often used as a decoy to distract security teams while attackers breach systems silently elsewhere.",
      whyAttackWorked: isLowOrMedium
        ? "The load balancer did not limit connection rates, and there were no traffic scrubbers to inspect and filter packet loads."
        : "The volume of traffic was too massive for the local gateway servers to absorb, leading to memory and port exhaustion.",
      howDefendersImprove: "Use third-party traffic scrubbing networks, set rate limits on connections, and cache pages at the network edge."
    },
    "SQL Injection": {
      keyTakeaway: "SQL Injection occurs when a database treats user input as executable instructions. Input must always be cleaned and separated.",
      whatBeginnersRemember: "Web forms (like username inputs) should only accept text characters, never code statements or database operators.",
      realWorldLesson: "SQL Injection is one of the oldest web vulnerabilities but remains common because developer code often concatenates database query strings.",
      whyAttackWorked: isLowOrMedium
        ? "The web application query strings directly concatenated input fields, allowing standard user inputs to bypass authentication checks."
        : "Although a basic firewall was active, the database was accessed using a master admin account with full write permissions.",
      howDefendersImprove: "Enforce parameterized database queries (prepared statements), deploy Web Application Firewalls (WAF), and limit database user account access."
    },
    "Supply Chain": {
      keyTakeaway: "Supply chain attacks exploit trust. When we import packages, we import all of their hidden security gaps too.",
      whatBeginnersRemember: "Always verify the creator and code checksum of packages before installing them in your programming project.",
      realWorldLesson: "Attackers compromise open-source package repositories to inject backdoors into trusted software updates used by millions.",
      whyAttackWorked: isLowOrMedium
        ? "The system automatically downloaded dependency packages from public registries without verifying signature checksums."
        : "The builder network was connected to the public internet, allowing the corrupted code package to make outbound connections.",
      howDefendersImprove: "Validate package checksum hashes, run software build pipelines in internet-isolated sandboxes, and audit code dependencies."
    }
  };

  return lessons[attackType] || defaultLessons;
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

const getCaseStudyTitle = (vectorId: string, status: string) => {
  const isBlocked = status === "Blocked";
  switch (vectorId) {
    case "Phishing":
      return isBlocked 
        ? "How Active Filtering Intercepted a Targeted Phishing Attack"
        : "How a Fake Email Led to Unauthorized Access";
    case "Ransomware":
      return isBlocked
        ? "How Automated Isolation Defeated an Encryption Threat"
        : "How Weak Security Controls Allowed an Internal Breach";
    case "SQL Injection":
      return isBlocked
        ? "How Parameter Validation Protected Database Assets"
        : "How Stolen Credentials Exposed Sensitive Records";
    case "DDoS":
      return isBlocked
        ? "How Rate Limits Intercepted a Volumetric Service Flood"
        : "How Traffic Overload Disrupted Public Service Portals";
    case "Supply Chain":
      return isBlocked
        ? "How Signature Checks Intercepted a Supply Chain Intrusion"
        : "How a Malicious Package Update Gained Silent Control";
    default:
      return isBlocked
        ? "How Multi-Layered Postures Contained a Simulated Intrusion"
        : "How Weak Defensive Controls Allowed a System Compromise";
  }
};

const getScenarioSummary = (vectorId: string, status: string, industry: string, target: string) => {
  const isBlocked = status === "Blocked";
  if (vectorId === "Phishing") {
    return isBlocked
      ? `A simulated email scam was delivered to a user workstation in our ${industry} environment to establish initial access. While the link was clicked, the attacker's attempt to steal login credentials and pivot laterally was intercepted. Our active security posture flagged the unauthorized access request and blocked database volume modifications on ${target}. The attack was successfully contained before any sensitive information could be copied.`
      : `During this simulation, an attacker targeted our ${industry} environment using a deceptive email scam. The email bypassed boundary checks, causing an employee to click a malicious link and unknowingly reveal their login credentials. Armed with active administrator access, the attacker moved deep into internal networks to target ${target}. Because multi-factor authentication was not enforced, the attacker successfully accessed database target directories and compromised sensitive records.`;
  }
  if (vectorId === "Ransomware") {
    return isBlocked
      ? `An attacker attempted to deploy encryption malware to compromise target arrays on ${target} in our ${industry} environment. While the initial script executed on an endpoint workstation, it was quickly flagged by system sensors. The attempt to elevate local permissions and pivot laterally was blocked by automated endpoint containment rules. As a result, critical database arrays remained fully secured and operational.`
      : `The simulation demonstrated a file encryption attack aimed at locking target systems on ${target} in the ${industry} environment. The attacker successfully gained access to a user endpoint and executed a payload that searched memory for credentials. Lacking internal network separation, the attacker moved laterally to intermediate servers and elevated user privileges to Administrator. The attack succeeded in locking backup directories and encrypting sensitive target tables.`;
  }
  if (vectorId === "DDoS") {
    return isBlocked
      ? `A volumetric traffic overload was directed at network access ports in the ${industry} environment to disrupt operations on ${target}. Gateway scrubbing rules and rate limits identified the flooding pattern from the hostile IP source. The traffic was filtered and blocked at the border, allowing system services to remain fully responsive for users without any downtime.`
      : `A volumetric traffic overload attack was launched to overwhelm service access points on ${target} in our ${industry} environment. Lacking scrubbing gates, the simulated flood quickly saturated public-facing interfaces. System services became completely unresponsive, preventing legitimate connections and causing severe operational halts. The simulation ended with services failing under the massive traffic load.`;
  }
  if (vectorId === "SQL Injection") {
    return isBlocked
      ? `An attacker attempted to extract private database tables from ${target} in the ${industry} environment using input field injection. Although malicious queries were sent to the database interface, parameterized inputs and query filters neutralized the command syntax. The attempt was flagged as hostile and blocked at the application layer, preventing any data exposure.`
      : `The attacker targeted the web application database on ${target} in our ${industry} environment using unsanitized SQL commands. An exposed input field allowed the attacker to bypass access filters and read database structures. Moving through database schemas, the attacker extracted password hashes and stole administrative tables, culminating in unauthorized reading of customer database targets.`;
  }
  if (vectorId === "Supply Chain") {
    return isBlocked
      ? `An attacker attempted to compromise software dependencies on ${target} in our ${industry} environment by injecting a malicious library update. During download, the system's software signature checker noticed the invalid verification key and blocked installation. The backdoor attempt was terminated immediately, keeping internal networks secured.`
      : `A malicious package update was injected into software libraries on ${target} in our ${industry} environment to bypass perimeter checks. The update was downloaded by internal deployment routines, establishing a backdoor. Lacking file checking rules, the update ran and allowed the attacker to elevate local privileges and access target datastores, gaining complete administrative system control.`;
  }
  return isBlocked
    ? `Our active defensive posture successfully contained a simulated intrusion in the ${industry} environment targeting ${target}. The threat was detected early in the attack lifecycle and terminated before any critical assets could be accessed or stolen.`
    : `A simulated security breach in the ${industry} environment exposed system configurations on ${target}. Because defensive rules were unconfigured or bypassed, the attacker moved successfully through the network and completed their objectives.`;
};

const getPrintTimeline = (vectorId: string, stages: CampaignStage[]) => {
  const list = [];
  for (let idx = 0; idx < stages.length; idx++) {
    const stage = stages[idx];
    const isStageBlocked = stage.status === "blocked";
    const isPriorStageBlocked = stages.slice(0, idx).some(s => s.status === "blocked");
    
    let title = stage.title;
    let whatHappened = "";
    let whyItMatters = "";
    let outcome = "";

    if (isPriorStageBlocked) {
      whatHappened = "This stage was not reached.";
      whyItMatters = "The attack was already stopped in a previous step, preventing further progression.";
      outcome = "Unreached due to containment.";
      list.push({ title, whatHappened, whyItMatters, outcome });
      continue;
    }

    if (idx === 0) {
      title = "Scanning for Weak Points";
      whatHappened = "The attacker scanned public connections to identify active interfaces and open ports.";
      whyItMatters = "Open ports let attackers locate potential doors into the private network.";
      outcome = isStageBlocked 
        ? "The firewall detected the scanning pattern and blocked further requests from the attacker's IP." 
        : "The attacker mapped the network's interfaces successfully.";
    } else if (idx === 1) {
      title = "Getting Into The System";
      if (vectorId === "Phishing") {
        whatHappened = "An employee received a deceptive email containing a malicious link.";
        whyItMatters = "Deceptive emails are the most common entry vector to bypass network firewalls.";
        outcome = isStageBlocked 
          ? "Email security filters recognized the malicious link and quarantined the message." 
          : "The employee clicked the link and opened the connection.";
      } else if (vectorId === "Ransomware") {
        whatHappened = "A malicious file download was triggered from a compromised website.";
        whyItMatters = "Malware downloads run initial access scripts to establish a local foothold.";
        outcome = isStageBlocked 
          ? "The endpoint protection blocked the file from executing." 
          : "The script executed, establishing a local network backdoor.";
      } else if (vectorId === "DDoS") {
        whatHappened = "The attacker initiated a flood of request packets towards the main gateway.";
        whyItMatters = "Traffic floods seek to saturate system resources and prevent real connections.";
        outcome = isStageBlocked 
          ? "The border router dropped the scanning packets and throttled the IP block." 
          : "Hostile requests saturated the load balancer port allocations.";
      } else if (vectorId === "SQL Injection") {
        whatHappened = "The attacker sent database query syntax through an unvalidated web form input field.";
        whyItMatters = "Exposed input fields let malicious commands execute directly on database engines.";
        outcome = isStageBlocked 
          ? "The application filtered out special query operators, blocking command parsing." 
          : "The application compiled the input string directly as a database request.";
      } else { // Supply Chain
        whatHappened = "The builder platform initiated a regular package fetch from public registries.";
        whyItMatters = "Default trust settings allow software update managers to download unverified dependencies.";
        outcome = isStageBlocked 
          ? "The dependency loader rejected the package update due to an invalid cryptographic signature." 
          : "The unverified dependency package was successfully compiled into the application environment.";
      }
    } else if (idx === 2) {
      title = "Trying To Steal Passwords";
      whatHappened = "The attacker dumped system memory to search for active logins and session keys.";
      whyItMatters = "Stolen logins allow the attacker to impersonate legitimate administrators.";
      outcome = isStageBlocked 
        ? "Local protection tools intercepted memory access, blocking credential extraction." 
        : "Administrative passwords and session hashes were extracted.";
    } else if (idx === 3) {
      title = "Moving Through The Network";
      whatHappened = "The attacker used stolen credentials to connect to databases and internal servers.";
      whyItMatters = "Critical databases are kept deep in the network, requiring pivoting from endpoints.";
      outcome = isStageBlocked 
        ? "Internal firewalls blocked server access requests from standard workstations." 
        : "The attacker connected directly to the database server host.";
    } else if (idx === 4) {
      title = "Taking Control";
      whatHappened = "The attacker ran local scripts to elevate permissions to system administrator.";
      whyItMatters = "Administrator control lets the attacker disable security logs and override access rules.";
      outcome = isStageBlocked 
        ? "Access control rules flagged the privilege escalation and locked the account." 
        : "The attacker took complete administrative control over the database system.";
    } else if (idx === 5) {
      title = "Stealing Data";
      if (vectorId === "Ransomware") {
        whatHappened = "The attacker deployed wiper malware to encrypt system database files.";
        whyItMatters = "Encrypted files prevent business operations, allowing attackers to demand payment.";
        outcome = isStageBlocked 
          ? "System backup arrays and database volumes were locked, preventing encryption." 
          : "Critical database directories were encrypted and locked.";
      } else if (vectorId === "DDoS") {
        whatHappened = "The service interface became fully saturated by persistent traffic.";
        whyItMatters = "Prolonged downtime halts all business operations and customer access.";
        outcome = isStageBlocked 
          ? "Traffic scrubbing limited the impact, keeping services online." 
          : "Core systems crashed, leading to total operational failure.";
      } else {
        whatHappened = "The attacker compiled database records and exfiltrated files to an external server.";
        whyItMatters = "Exfiltrated records expose customer private details and violate regulatory laws.";
        outcome = isStageBlocked 
          ? "Database monitors flagged the massive export request and locked all tables." 
          : "Customer records and private tables were copied out of the network.";
      }
    }
    list.push({ title, whatHappened, whyItMatters, outcome });
  }
  return list;
};

const getWhySecurityStruggled = (vectorId: string, status: string, securityLevel: string) => {
  const isBlocked = status === "Blocked";
  if (isBlocked) {
    return `Security succeeded during this simulation because multiple defensive layers were active. When the threat actor attempted to probe ports or run malicious payloads, the systems flagged the activity. By blocking IP ranges or preventing database writes early on, the active controls kept the intrusion contained. This shows that layered defenses can protect critical assets even when an attacker gains a temporary foothold.`;
  }
  if (vectorId === "Phishing") {
    return `Security struggled because the system relied entirely on standard passwords. Once the employee was tricked into entering their login credentials on the fake website, the attacker could log in without any secondary checks. Lacking network segmentation, the workstation could connect directly to the database. Additionally, a lack of active endpoint controls let the attacker search memory for administrative keys without triggering an alarm.`;
  }
  if (vectorId === "Ransomware") {
    return `Security struggled because the endpoint workstation lacked containment rules. This allowed the attacker's script to execute and download malware files. Because backup systems were kept online and connected to the same network segment, the encryption process easily reached the backup files. Additionally, a lack of local access controls allowed a standard workstation account to run administrator-level updates.`;
  }
  if (vectorId === "DDoS") {
    return `Security struggled because the public web servers had no rate-limiting or scrubbing policies configured. When the automated request flood started, the network interfaces were quickly overwhelmed by the volume. Without a gateway filter to distinguish malicious requests from normal user actions, all traffic was processed, causing the systems to exhaust their resources and crash.`;
  }
  if (vectorId === "SQL Injection") {
    return `Security struggled because the web application's form inputs accepted raw query commands without validation. This allowed the attacker to type database syntax directly into fields and read database tables. Additionally, the web service account had overly permissive rights, allowing it to query administrative schemas and extract password hashes.`;
  }
  return `Security struggled because the deployment system trusted external package updates by default. When the malicious update was pushed to the repository, it was installed automatically without any signature or checksum verification. Once installed, the update established a backdoor connection that was not flagged by outbound network monitors.`;
};

const getWhyThisMatters = (vectorId: string) => {
  if (vectorId === "Phishing") {
    return [
      "Customer account passwords, emails, and login hashes could be stolen.",
      "Operations would halt while administrators verify all active user sessions.",
      "The organization could face regulatory penalties and lose client trust.",
      "Recovery would involve resetting all user credentials and auditing logs."
    ];
  }
  if (vectorId === "Ransomware") {
    return [
      "Operational databases and files could be permanently locked or deleted.",
      "Daily services would stop entirely, halting business operations.",
      "Attackers could extort the company for financial ransom payments.",
      "Recovery would depend on restoring clean files from offline backup archives."
    ];
  }
  if (vectorId === "DDoS") {
    return [
      "Public portals and service interfaces would become completely offline.",
      "Customers would be unable to access their accounts or complete transactions.",
      "Support lines would be overwhelmed by user complaints during the outage.",
      "Recovery requires filtering traffic, blocks, and redirecting requests."
    ];
  }
  if (vectorId === "SQL Injection") {
    return [
      "Sensitive database tables, including private records, could be exposed.",
      "Attackers could modify database entries, corrupting system data.",
      "The business could face severe regulatory fines for data privacy failures.",
      "Recovery involves patching application code and auditing database query logs."
    ];
  }
  return [
    "Proprietary software updates could carry backdoors to compromise other systems.",
    "Internal code repositories and network credentials could be stolen.",
    "The organization could lose its certification and suffer severe loss of trust.",
    "Recovery requires revoking certificates, auditing code, and rebuilding updates."
  ];
};

const getPreventativeDefenses = (vectorId: string) => {
  if (vectorId === "Phishing") {
    return [
      { rank: "Most Important", icon: "🔐", name: "Multi-Factor Authentication", desc: "Even with a stolen password, attackers cannot access accounts without the secondary verification code." },
      { rank: "Moderately Important", icon: "✉", name: "Email Filtering", desc: "Identifies and blocks deceptive emails before they ever reach an employee's inbox." },
      { rank: "Additional Protection", icon: "🛡", name: "Endpoint Monitoring", desc: "Tracks local computer activity to detect and block malicious credential-theft tools in memory." }
    ];
  }
  if (vectorId === "Ransomware") {
    return [
      { rank: "Most Important", icon: "🔐", name: "Endpoint Isolation", desc: "Automated endpoint containment can immediately quarantine a workstation when encryption starts, preventing it from spreading." },
      { rank: "Moderately Important", icon: "✉", name: "Network Segmentation", desc: "Dividing the network into isolated zones restricts the attacker from moving from workstations to servers." },
      { rank: "Additional Protection", icon: "🛡", name: "Immutable Backups", desc: "Keeping database backup files in read-only offline folders protects recovery data from encryption." }
    ];
  }
  if (vectorId === "DDoS") {
    return [
      { rank: "Most Important", icon: "🔐", name: "Traffic Scrubbing", desc: "Route public traffic through gateway systems that analyze signatures and drop request floods before they reach servers." },
      { rank: "Moderately Important", icon: "✉", name: "Rate Limiting", desc: "Restricts the number of connections any single IP address can submit within a specific timeframe." },
      { rank: "Additional Protection", icon: "🛡", name: "Load Balancing", desc: "Distributes incoming traffic across redundant server nodes so that a flood targeting one node does not crash the system." }
    ];
  }
  if (vectorId === "SQL Injection") {
    return [
      { rank: "Most Important", icon: "🔐", name: "Parameterized Queries", desc: "Forces the database to treat inputs strictly as text rather than executable query commands." },
      { rank: "Moderately Important", icon: "✉", name: "Input Validation", desc: "Filters web form inputs to block query characters and SQL statements at the boundary." },
      { rank: "Additional Protection", icon: "🛡", name: "Least Privilege Access", desc: "Restricts database credentials so that the web application cannot run administrative updates or read schemas." }
    ];
  }
  return [
    { rank: "Most Important", icon: "🔐", name: "Signature Verification", desc: "Requires cryptographic signatures for package updates, blocking installation of unverified files." },
    { rank: "Moderately Important", icon: "✉", name: "Package Auditing", desc: "Scans code libraries for known security gaps and hidden backdoor modules before deployment." },
    { rank: "Additional Protection", icon: "🛡", name: "Network Outbound Rules", desc: "Blocks internal software update engines from establishing unauthorized external server connections." }
  ];
};

const getCaseStudyKeyLessons = (vectorId: string) => {
  if (vectorId === "Phishing") {
    return [
      "Passwords alone are no longer enough to protect accounts; secondary checks are critical.",
      "Security is a team effort that combines human alertness with automated rules.",
      "A single mistake can compromise a workstation and serve as a foothold for larger attacks."
    ];
  }
  if (vectorId === "Ransomware") {
    return [
      "Network segmentation prevents local workstation threats from spreading to database servers.",
      "Automated isolation can stop malware execution before file encryption begins.",
      "Offline backups are the only guarantee for file recovery after an encryption attack."
    ];
  }
  if (vectorId === "DDoS") {
    return [
      "Volumetric attacks target system availability rather than stealing private data.",
      "Rate-limiting rules are essential to separate normal user actions from traffic floods.",
      "Outages interrupt business operations and damage customer trust."
    ];
  }
  if (vectorId === "SQL Injection") {
    return [
      "Unsanitized user inputs are a direct gateway for database exposure.",
      "Parameterized queries are the most effective way to neutralize input manipulation threats.",
      "Database permissions should restrict access only to the tables a user actually needs."
    ];
  }
  return [
    "Supply chain attacks leverage trusted software channels to bypass boundary defenses.",
    "Cryptographic signatures are critical to verify the source of software updates.",
    "Zero-trust principles require verifying package signatures before execution."
  ];
};

const getFinalThoughtPrint = (vectorId: string, status: string) => {
  const isBlocked = status === "Blocked";
  if (isBlocked) {
    return "Remember that cybersecurity is not about building a single perfect wall, but about layering checks so that when one layer fails, another is ready to intercept the threat. By rate-limiting requests, segmenting servers, or filtering emails, we prevent small gaps from becoming system-wide breaches. Real security means ensuring that if one door is opened, the inner chambers remain fully locked.";
  }
  return "Remember that a single unpatched gap or human error is often all an attacker needs to bypass perimeter firewalls. When networks lack multi-factor authentication, segmentation, or query validation, attackers can easily pivot from a user workstation to the core database. Cybersecurity requires multi-layered safeguards at every stage to ensure a single mistake cannot compromise the entire system.";
};

const generateReportId = (timestamp: string, reportId: string) => {
  const date = new Date(timestamp);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hash = reportId ? reportId.substring(0, 4).toUpperCase() : Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SENT-${yyyy}${mm}${dd}-${hash}`;
};

const getPrimaryWeakness = (vectorId: string) => {
  switch (vectorId) {
    case "Phishing":
      return "Lack of Multi-Factor Authentication (MFA) and employee security awareness regarding spear-phishing links.";
    case "Ransomware":
      return "Flat network architecture enabling unchecked lateral movement and lack of automated endpoint containment.";
    case "DDoS":
      return "Lack of rate-limiting rules and public traffic scrubbing capability at the network boundary.";
    case "SQL Injection":
      return "Unsanitized user inputs in web forms allowing direct command execution on back-end database servers.";
    case "Supply Chain":
    default:
      return "Trusting software updates from third-party channels without verifying package signatures or outbound rules.";
  }
};

const getTopImprovement = (vectorId: string) => {
  switch (vectorId) {
    case "Phishing":
      return "Enforce hardware multi-factor authentication (MFA) and establish strict inbound mail filtering rules.";
    case "Ransomware":
      return "Implement strict network micro-segmentation and maintain offline/immutable backup copies.";
    case "DDoS":
      return "Deploy traffic-scrubbing services and rate-limiting at the API gateway layer.";
    case "SQL Injection":
      return "Use parameterized SQL queries and sanitize all incoming user database inputs.";
    case "Supply Chain":
    default:
      return "Implement cryptographic signature checks for all updates and restrict server outbound traffic.";
  }
};

const PrintCaseStudy = ({ reportData }: { reportData: CTIReport }) => {
  const title = getCaseStudyTitle(reportData.vectorId, reportData.status);
  const summary = getScenarioSummary(reportData.vectorId, reportData.status, reportData.industryName, reportData.targetName);
  const timeline = getPrintTimeline(reportData.vectorId, reportData.stages);
  const whySecurityStruggled = getWhySecurityStruggled(reportData.vectorId, reportData.status, reportData.securityLevel);
  const whyThisMatters = getWhyThisMatters(reportData.vectorId);
  const preventions = getPreventativeDefenses(reportData.vectorId);
  const lessons = getCaseStudyKeyLessons(reportData.vectorId);
  const reflection = getFinalThoughtPrint(reportData.vectorId, reportData.status);

  const reportId = generateReportId(reportData.timestamp, reportData.id);
  const isBlocked = reportData.status === "Blocked";

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case "critical":
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">Critical</span>;
      case "high":
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-orange-50 text-orange-700 border border-orange-250">High</span>;
      case "medium":
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-yellow-50 text-yellow-800 border border-yellow-200">Medium</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">Low</span>;
    }
  };

  return (
    <div className="hidden print:block text-black bg-white font-sans text-sm max-w-[21cm] mx-auto">
      {/* CSS overrides to ensure clean background color and no header/footer default elements when printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          @page {
            size: A4;
            margin-top: 30px;
            margin-bottom: 24px;
            margin-left: 24px;
            margin-right: 24px;
          }
          .print-section {
            page-break-inside: avoid;
            break-inside: avoid;
            margin-bottom: 24px;
          }
          .page-num::after {
            content: counter(page);
          }
          .page-total::after {
            content: counter(pages);
          }
          table {
            border-collapse: collapse !important;
          }
          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      ` }} />

      {/* =========================================================
          PAGE 1: COVER PAGE
          ========================================================= */}
      <div className="flex flex-col justify-between items-start text-left p-12 bg-white" style={{ pageBreakAfter: "always", minHeight: "27cm" }}>
        {/* Header Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center text-white font-mono font-extrabold text-sm">
            S
          </div>
          <span className="text-black font-extrabold tracking-[0.2em] font-mono text-sm uppercase">SENTINEL</span>
        </div>

        {/* Main Metadata Section */}
        <div className="w-full my-auto space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest uppercase text-slate-400 font-bold block">Cybersecurity Incident Report</span>
            <h1 className="text-3xl font-extrabold text-black font-sans leading-tight border-b-2 border-black pb-4 max-w-2xl">{title}</h1>
          </div>

          <div className="w-full max-w-xl space-y-3 font-sans text-xs pt-4">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Simulation Name</span>
              <span className="text-black font-bold text-right max-w-[320px] truncate">{title}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Attack Type</span>
              <span className="text-black font-semibold">{reportData.vectorName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Target Environment</span>
              <span className="text-black font-semibold">{reportData.industryName} ({reportData.targetName})</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Generated Date</span>
              <span className="text-black font-semibold">{new Date(reportData.timestamp).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Report ID</span>
              <span className="text-black font-mono font-semibold">{reportId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-mono uppercase text-[9px] tracking-wider">Platform</span>
              <span className="text-slate-650">Generated using Sentinel</span>
            </div>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="w-full border-t border-slate-200 pt-6 flex justify-between items-center text-[10px] font-mono text-slate-400 uppercase tracking-widest">
          <div>Educational Simulation Report</div>
          <div>SENTINEL &copy; 2026</div>
        </div>
      </div>

      {/* =========================================================
          MAIN REPORT CONTAINER (WITH REPEATING HEADER/FOOTER)
          ========================================================= */}
      <table className="w-full border-none">
        {/* Repeating Header */}
        <thead>
          <tr>
            <td className="border-none pb-6">
              <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-4 text-[9px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5 font-bold text-black uppercase tracking-wider">
                  <div className="w-5 h-5 rounded bg-black flex items-center justify-center text-white font-mono font-extrabold text-[10px]">
                    S
                  </div>
                  <span>SENTINEL</span>
                </div>
                <div className="uppercase font-bold max-w-sm truncate text-slate-700">
                  {title}
                </div>
                <div className="text-right leading-tight">
                  <div>ID: {reportId}</div>
                  <div>PAGE <span className="page-num"></span> OF <span className="page-total"></span></div>
                </div>
              </div>
            </td>
          </tr>
        </thead>

        {/* Repeating Footer */}
        <tfoot>
          <tr>
            <td className="border-none pt-6">
              <div className="flex justify-between items-center border-t border-slate-200 pt-2.5 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                <div>&copy; 2026 Sentinel</div>
                <div>Interactive Cybersecurity Learning Platform</div>
                <div>Page <span className="page-num"></span> of <span className="page-total"></span></div>
              </div>
            </td>
          </tr>
        </tfoot>

        {/* Main Content Body */}
        <tbody className="border-none">
          <tr>
            <td className="border-none p-0">
              <div className="space-y-8 flex flex-col justify-start">
                
                {/* Section 1: Executive Summary */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    1. Executive Summary
                  </h2>
                  <div className="space-y-2.5 text-xs text-slate-800 leading-relaxed font-sans">
                    <p><strong>Scenario:</strong> An emulation mimicking threat actor <strong>{reportData.actorName}</strong> was conducted against simulated target systems in the {reportData.industryName.toLowerCase()} sector.</p>
                    <p><strong>Entry Vector:</strong> The simulation targeted the database host <strong>{reportData.targetName}</strong> via <strong>{reportData.vectorName.toLowerCase()}</strong> access channels.</p>
                    <p><strong>Outcome:</strong> {isBlocked ? (
                      <span>Defensive controls successfully intercepted the threat. Passive and active rules detected the intrusion, blocking propagation before network-wide lateral movements occurred.</span>
                    ) : (
                      <span>Defensive security rules failed to contain the intrusion. The threat actor successfully bypassed active EDR firewalls, established network footholds, and executed lateral pivoting.</span>
                    )}</p>
                    <p className="mt-2"><strong>Summary:</strong> {reportData.executiveSummary || summary}</p>
                  </div>
                </div>

                {/* Section 2: Attack Overview */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    2. Attack Overview
                  </h2>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs font-sans text-slate-700 mb-4">
                    <div><strong>Target Environment:</strong> {reportData.industryName} ({reportData.targetName})</div>
                    <div><strong>Scenario Profile:</strong> {reportData.actorName} Campaign</div>
                    <div><strong>Attack Method:</strong> {reportData.vectorName}</div>
                    <div><strong>Outcome Rating:</strong> {isBlocked ? (
                      <span className="text-green-700 font-bold uppercase text-[10px]">Threat Containment Successful</span>
                    ) : (
                      <span className="text-red-700 font-bold uppercase text-[10px]">System Compromise / Breach Executed</span>
                    )}</div>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans mt-2">
                    {summary}
                  </p>
                </div>

                {/* Section 3: Attack Timeline */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    3. Attack Timeline
                  </h2>
                  <div className="space-y-3 text-xs">
                    {timeline.map((stage, idx) => {
                      const isUnreached = stage.whatHappened === "This stage was not reached.";
                      const isStageBlocked = reportData.stages[idx]?.status === "blocked";
                      const isStageAlerted = reportData.stages[idx]?.status === "alerted";
                      const stageSeverity = reportData.stages[idx]?.severity || "medium";

                      return (
                        <div key={idx} className="p-3 border-b border-slate-100 last:border-0" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                          <div className="flex justify-between items-center font-bold font-mono text-[9px] pb-1 mb-1">
                            <span className="text-slate-850 uppercase font-sans">Phase {idx + 1}: {stage.title}</span>
                            <div className="flex items-center gap-2">
                              {getSeverityBadge(stageSeverity)}
                              <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] font-bold border ${isUnreached ? "bg-slate-100 border-slate-200 text-slate-400" : isStageBlocked ? "bg-green-50 border-green-200 text-green-750" : isStageAlerted ? "bg-blue-50 border-blue-200 text-blue-750" : "bg-red-50 border-red-200 text-red-750"}`}>
                                {isUnreached ? "UNREACHED" : isStageBlocked ? "BLOCKED" : isStageAlerted ? "ALERTED" : "EVADED"}
                              </span>
                            </div>
                          </div>
                          <p className="leading-relaxed text-[11px] text-slate-750 font-sans">
                            <strong>Activity:</strong> {stage.whatHappened}
                          </p>
                          {!isUnreached && (
                            <p className="mt-1 leading-relaxed text-[11px] text-slate-600 font-sans">
                              <strong>Outcome:</strong> {stage.outcome}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 4: MITRE ATT&CK Mapping */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    4. MITRE ATT&CK Mapping
                  </h2>
                  <table className="w-full border border-slate-200 border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <th className="p-2 border-r border-slate-200 w-16">Phase</th>
                        <th className="p-2 border-r border-slate-200">Stage Activity</th>
                        <th className="p-2 border-r border-slate-200 w-24">MITRE Technique</th>
                        <th className="p-2 border-r border-slate-200">Technique Name</th>
                        <th className="p-2 border-r border-slate-200 w-24">Severity</th>
                        <th className="p-2 w-20">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.stages.map((stage, idx) => {
                        const customMapping = reportData.mitreMapping?.find((m: { stageIndex: number; code: string; name: string }) => m.stageIndex === idx);
                        const mapping = customMapping
                          ? { code: customMapping.code, name: customMapping.name }
                          : getMitreAttackMapping(reportData.vectorId, idx);
                        const isStageBlocked = stage.status === "blocked";
                        const isStageAlerted = stage.status === "alerted";
                        const isUnreached = reportData.stages.slice(0, idx).some(s => s.status === "blocked");
                        
                        return (
                          <tr key={idx} className="border-b border-slate-200 odd:bg-white even:bg-slate-50/20">
                            <td className="p-2 border-r border-slate-200 font-mono text-[10px]">Phase {idx + 1}</td>
                            <td className="p-2 border-r border-slate-200 font-semibold">{stage.title}</td>
                            <td className="p-2 border-r border-slate-200 font-mono text-[10px]">{isUnreached ? "N/A" : mapping.code}</td>
                            <td className="p-2 border-r border-slate-200 text-slate-600">{isUnreached ? "N/A" : mapping.name}</td>
                            <td className="p-2 border-r border-slate-200">
                              {isUnreached ? <span className="text-slate-400 font-mono text-[10px]">-</span> : getSeverityBadge(stage.severity)}
                            </td>
                            <td className="p-2 font-mono text-[9px] font-bold">
                              {isUnreached ? (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 uppercase">Unreached</span>
                              ) : isStageBlocked ? (
                                <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 uppercase">Blocked</span>
                              ) : isStageAlerted ? (
                                <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">Alerted</span>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 uppercase">Evaded</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Section 5: Risk Assessment */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    5. Risk Assessment
                  </h2>
                  <p className="text-xs text-slate-800 leading-relaxed font-sans mb-4">
                    {whySecurityStruggled}
                  </p>

                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2 font-mono">
                    Impact & Business Risk Metrics
                  </h3>
                  <table className="w-full border border-slate-200 border-collapse text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <th className="p-2 border-r border-slate-200 w-1/3">Risk Category</th>
                        <th className="p-2">Observed Metric / Security Output</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-200 odd:bg-white even:bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-semibold">Current Risk Level Rating</td>
                        <td className="p-2 font-medium">{reportData.currentRisk}%</td>
                      </tr>
                      <tr className="border-b border-slate-200 odd:bg-white even:bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-semibold">Projected Remediation Risk Level</td>
                        <td className="p-2 font-medium">{reportData.projectedRisk}%</td>
                      </tr>
                      <tr className="border-b border-slate-200 odd:bg-white even:bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-semibold">Target Risk Reduction Delta</td>
                        <td className="p-2 font-medium text-blue-700 font-bold">{reportData.riskReduction}%</td>
                      </tr>
                      <tr className="border-b border-slate-200 odd:bg-white even:bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-semibold">Financial Exposure</td>
                        <td className="p-2 text-slate-650">{reportData.financialLoss}</td>
                      </tr>
                      <tr className="border-b border-slate-200 odd:bg-white even:bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-semibold">Operational Impact</td>
                        <td className="p-2 text-slate-650">{reportData.operationalImpact}</td>
                      </tr>
                      <tr className="odd:bg-white even:bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-semibold">Estimated System Downtime</td>
                        <td className="p-2 text-slate-650">{reportData.downtime}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 6: Recommendations */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    6. Recommendations
                  </h2>
                  <div className="grid grid-cols-1 gap-2.5">
                    {preventions.map((prev, idx) => (
                      <div key={idx} className="p-3 border border-slate-100 rounded flex items-start gap-3 bg-slate-50/10" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                        <span className="text-base leading-none pt-0.5 text-blue-600">{prev.icon}</span>
                        <div className="text-xs font-sans">
                          <strong className="text-black font-mono block uppercase text-[9px] text-blue-700">{prev.rank}: {prev.name}</strong>
                          <p className="text-slate-650 mt-1 leading-relaxed">{prev.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 7: Key Takeaways */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    7. Key Takeaways
                  </h2>
                  <div className="space-y-4 text-xs text-slate-800 leading-relaxed font-sans">
                    <ul className="list-decimal pl-5 space-y-1.5">
                      {lessons.slice(0, 3).map((lesson, idx) => (
                        <li key={idx}><strong>Core Lesson {idx + 1}:</strong> {lesson}</li>
                      ))}
                    </ul>
                    <div className="border-t border-slate-150 pt-3 mt-3">
                      <p className="italic text-slate-600 pl-2 border-l-2 border-blue-500 font-sans">
                        &ldquo;{reflection}&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 8: Report Summary */}
                <div className="print-section">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-slate-200 pb-1.5 mb-3">
                    8. Report Summary
                  </h2>
                  <table className="w-full border border-slate-200 border-collapse text-left text-xs font-sans">
                    <tbody>
                      <tr className="border-b border-slate-200 bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-bold w-48">Simulation</td>
                        <td className="p-2 text-slate-800 font-medium">{title}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 font-bold">Overall Risk Rating</td>
                        <td className="p-2 text-slate-800">{reportData.currentRisk}% ({reportData.securityLevel} Security Level)</td>
                      </tr>
                      <tr className="border-b border-slate-200 bg-slate-50/20">
                        <td className="p-2 border-r border-slate-200 font-bold">Primary Weakness</td>
                        <td className="p-2 text-slate-800">{getPrimaryWeakness(reportData.vectorId)}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 border-r border-slate-200 font-bold">Recommended Improvements</td>
                        <td className="p-2 text-slate-800">{getTopImprovement(reportData.vectorId)}</td>
                      </tr>
                      <tr>
                        <td className="p-2 border-r border-slate-200 font-bold">Platform</td>
                        <td className="p-2 text-slate-500 font-mono text-[10px]">Generated using Sentinel</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Educational Notice */}
                <div className="print-section border-t border-slate-200 pt-5 mt-6" style={{ pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 mb-2">
                    Educational Notice
                  </h2>
                  <div className="space-y-1.5 text-[10px] text-slate-500 font-sans leading-relaxed">
                    <p>
                      This report was generated from a simulated cybersecurity scenario within Sentinel and is intended for educational purposes only.
                    </p>
                    <p>
                      All scenarios are fictional simulations created to help users understand cybersecurity concepts in a safe learning environment.
                    </p>
                  </div>
                </div>

              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

function RevealCard({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="glassmorphism-card rounded-xl border border-cyber-border overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center text-left hover:bg-cyber-surface/40 transition-colors font-mono text-[11px] font-bold text-white uppercase"
      >
        <span className="text-cyber-cyan">{question}</span>
        <span className="text-xs text-cyber-cyan">{isOpen ? "CLOSE" : "REVEAL"}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-cyber-border/40 bg-black/25 overflow-hidden font-sans"
          >
            <p className="p-4 text-xs leading-relaxed text-slate-300">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
      
      // Check cache first!
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem(`sentinel_ai_report_${camp.id}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setReportData(parsed);
            setIsLiveAI(parsed.isLiveAI !== undefined ? parsed.isLiveAI : true);
            setLoading(false);
            
            // Unlock next step
            const currentMax = parseInt(sessionStorage.getItem("sentinel_max_unlocked_step") || "1", 10);
            if (currentMax >= 3 && currentMax < 4) {
              sessionStorage.setItem("sentinel_max_unlocked_step", "4");
              window.dispatchEvent(new Event("sentinel_progress_update"));
            }
            return;
          } catch (e) {
            // fallback to fetch
          }
        }
      }

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
          const localReport = generateCTIReport(camp);
          const cachedPayload = { ...localReport, isLiveAI: false };
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`sentinel_ai_report_${camp.id}`, JSON.stringify(cachedPayload));
          }
          setReportData(localReport);
          setIsLiveAI(false);
        } else {
          console.log("[SENTINEL] Live Gemini CTI report generated successfully.");
          const reportPayload = {
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
            mitreMapping: data.mitreMapping,
            isLiveAI: true
          };
          if (typeof window !== "undefined") {
            sessionStorage.setItem(`sentinel_ai_report_${camp.id}`, JSON.stringify(reportPayload));
          }
          setReportData(reportPayload);
          setIsLiveAI(true);
        }
      } catch (error) {
        console.error("[SENTINEL ERROR] Fetching Gemini report failed. Using local compiler:", error);
        const localReport = generateCTIReport(camp);
        const cachedPayload = { ...localReport, isLiveAI: false };
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`sentinel_ai_report_${camp.id}`, JSON.stringify(cachedPayload));
        }
        setReportData(localReport);
        setIsLiveAI(false);
      } finally {
        setLoading(false);
        // Only unlock Learning Journal after the report has actually loaded,
        // and only if the user legitimately reached the AI Analyst step (step >= 3).
        if (typeof window !== "undefined") {
          const currentMax = parseInt(sessionStorage.getItem("sentinel_max_unlocked_step") || "1", 10);
          if (currentMax >= 3 && currentMax < 4) {
            sessionStorage.setItem("sentinel_max_unlocked_step", "4");
            window.dispatchEvent(new Event("sentinel_progress_update"));
          }
        }
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
            <div className="font-extrabold text-white uppercase tracking-[0.12em]">Preparing Your Review</div>
            <div className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
            Consulting security mentor & compiling review...
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
        className="max-w-7xl mx-auto px-6 relative z-10 w-full flex-grow pt-8 pb-12 print:hidden"
      >
        {/* Navigation back and telemetry info - hidden on print */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4 print:hidden font-mono text-[10px]">
          <Link
            href="/command-center"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white uppercase transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Learning Journal
          </Link>

          <div className="flex items-center gap-4 text-slate-400 tracking-wider">
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded border border-cyber-border bg-black/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
              </span>
              Simulation Review
            </span>
          </div>
        </div>

        <JourneyStepper currentStep={3} />

        {/* Title Header - print:hidden */}
        <div className="mb-10 max-w-4xl print:hidden space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-cyber-cyan text-[10px] font-mono tracking-widest uppercase font-bold">
              <Brain className="w-3.5 h-3.5 text-cyber-cyan animate-pulse" />
              Let's Understand What Happened
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white uppercase font-sans">
              Let's Understand What Happened
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2 font-mono text-[10px] tracking-wider">
            <div className="bg-black/40 p-4 rounded-xl border border-cyber-border">
              <span className="text-slate-500 uppercase block text-[8px] font-bold">Attack Result</span>
              <span className={`font-bold block mt-1.5 uppercase ${
                reportData.status === "Blocked" ? "text-cyber-green" : "text-cyber-red"
              }`}>
                {reportData.status === "Blocked" ? "🟢 Blocked" : "🔴 Successful"}
              </span>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-cyber-border">
              <span className="text-slate-500 uppercase block text-[8px] font-bold">Target</span>
              <span className="text-white font-bold block mt-1.5 uppercase truncate" title={reportData.targetName}>
                {reportData.targetName}
              </span>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-cyber-border">
              <span className="text-slate-500 uppercase block text-[8px] font-bold">Attack Method</span>
              <span className="text-white font-bold block mt-1.5 uppercase truncate" title={reportData.vectorName}>
                {reportData.vectorName}
              </span>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-cyber-border">
              <span className="text-slate-500 uppercase block text-[8px] font-bold">Security Level</span>
              <span className="text-white font-bold block mt-1.5 uppercase">
                {getSecurityLevelName(reportData.securityLevel)}
              </span>
            </div>
            <div className="bg-black/40 p-4 rounded-xl border border-cyber-border col-span-2 md:col-span-1">
              <span className="text-slate-500 uppercase block text-[8px] font-bold">CTI Classification</span>
              <span className="text-amber-500 font-bold block mt-1.5 uppercase tracking-wider">
                🟡 TLP:AMBER
              </span>
            </div>
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
        <div className="flex justify-end mb-8 gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-cyber-border bg-cyber-surface hover:bg-cyber-surface-brighter hover:text-white text-slate-350 text-[10px] tracking-widest uppercase transition-colors cursor-pointer font-bold"
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

        {/* Unified Single-Column Flow Layout */}
        <div className="space-y-10 max-w-5xl mx-auto">

          {/* 1. Attack Story */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan/30 via-transparent to-transparent" />
            <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-4 mb-6">
              <span className="text-cyber-cyan font-mono text-[10px] uppercase font-bold tracking-wider">🕵️ Attack Story</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative font-sans text-xs">
              {/* How the attacker entered */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-black/35 p-4 rounded-xl border border-cyber-border relative"
              >
                <span className="text-cyber-cyan font-mono text-[8px] uppercase tracking-wider block font-bold mb-1.5">01. Entry Vector</span>
                <h4 className="text-white font-bold mb-1 uppercase font-mono text-[10px]">How Attacker Entered</h4>
                <p className="text-slate-300 leading-relaxed">
                  The attacker targeted the {reportData.industryName} network using a simulated {reportData.vectorName.toLowerCase()} exploit.
                </p>
              </motion.div>

              {/* What the attacker tried */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-black/35 p-4 rounded-xl border border-cyber-border relative"
              >
                <span className="text-cyber-cyan font-mono text-[8px] uppercase tracking-wider block font-bold mb-1.5">02. Objective</span>
                <h4 className="text-white font-bold mb-1 uppercase font-mono text-[10px]">What Attacker Tried</h4>
                <p className="text-slate-300 leading-relaxed">
                  They attempted to harvest administrative login credentials and move laterally to access the target system: {reportData.targetName}.
                </p>
              </motion.div>

              {/* How security responded */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-black/35 p-4 rounded-xl border border-cyber-border relative"
              >
                <span className="text-cyber-cyan font-mono text-[8px] uppercase tracking-wider block font-bold mb-1.5">03. Defense Action</span>
                <h4 className="text-white font-bold mb-1 uppercase font-mono text-[10px]">How Security Responded</h4>
                <p className="text-slate-300 leading-relaxed">
                  {reportData.status === "Blocked"
                    ? `Active rules under ${getSecurityLevelName(reportData.securityLevel)} Protection successfully detected and blocked the malicious steps.`
                    : `Configured security settings under ${getSecurityLevelName(reportData.securityLevel)} Protection failed to intercept the credential dumps or lateral pivots.`}
                </p>
              </motion.div>

              {/* Final outcome */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-black/35 p-4 rounded-xl border border-cyber-border relative"
              >
                <span className="text-cyber-cyan font-mono text-[8px] uppercase tracking-wider block font-bold mb-1.5">04. Outcome</span>
                <h4 className="text-white font-bold mb-1 uppercase font-mono text-[10px]">Final Outcome</h4>
                <p className="text-slate-300 leading-relaxed">
                  {reportData.status === "Blocked"
                    ? "The attack was blocked with zero records exposed, keeping database tables completely safe."
                    : "The attacker gained root administrator control, encrypting local system files and exfiltrating target databases."}
                </p>
              </motion.div>
            </div>
          </motion.section>

          {/* 2. Attack Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attacker's Goal */}
            <div className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/20">
              <span className="text-cyber-cyan font-mono text-[9px] uppercase tracking-wider block font-bold mb-2">🎯 Attacker's Goal</span>
              <p className="text-white text-xs leading-relaxed font-sans">
                {reportData.status === "Blocked"
                  ? `To pivot silent lateral channels into the ${reportData.targetName} server and exfiltrate secure records.`
                  : `To compromise the ${reportData.targetName} host, exfiltrate private database files, and lock operations.`}
              </p>
            </div>

            {/* Defender's Response */}
            <div className="glassmorphism-card rounded-xl p-5 border border-cyber-border bg-black/20">
              <span className="text-cyber-cyan font-mono text-[9px] uppercase tracking-wider block font-bold mb-2">🛡️ Defender's Response</span>
              <p className="text-white text-xs leading-relaxed font-sans">
                {reportData.status === "Blocked"
                  ? `Automated rules successfully detected the malicious access attempts and isolated the threat at early stages.`
                  : `Loose access policies failed to intercept internal pivots, allowing the attacker to retrieve master admin tokens.`}
              </p>
            </div>
          </div>

          {/* 3. Real World Context */}
          <div className="glassmorphism-card rounded-xl p-5 border border-purple-500/30 bg-purple-500/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-purple-500" />
            <span className="text-[9px] font-mono text-purple-400 uppercase tracking-widest block font-bold mb-2">
              💡 Could this happen in real life?
            </span>
            <p className="text-xs leading-relaxed text-slate-350 font-sans">
              {getRealWorldContext(reportData.vectorId)}
            </p>
          </div>

          {/* 4. Interactive Questions */}
          <div className="space-y-4">
            <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest block font-bold">
              Interactive Lesson Details (Reveal Cards)
            </span>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: "why",
                  q: reportData.status === "Blocked" ? "▶ Why was the attack blocked?" : "▶ Why did the attack succeed?",
                  ans: getRevealCardContent(reportData.vectorId, reportData.securityLevel, reportData.status === "Blocked").whyBlockedOrSucceeded
                },
                {
                  id: "change",
                  q: reportData.status === "Blocked" ? "▶ What if weaker security had been selected?" : "▶ What if stronger security had been selected?",
                  ans: getRevealCardContent(reportData.vectorId, reportData.securityLevel, reportData.status === "Blocked").whatIfDifferentSecurity
                },
                {
                  id: "basic",
                  q: "▶ How would this attack change with Basic Protection?",
                  ans: getRevealCardContent(reportData.vectorId, reportData.securityLevel, reportData.status === "Blocked").howBasicProtectionChanges
                }
              ].map((item) => {
                return (
                  <RevealCard key={item.id} question={item.q} answer={item.ans} />
                );
              })}
            </div>
          </div>

          {/* Risk Mitigation Scorecard */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan/30 via-transparent to-transparent" />
            <div className="flex items-center justify-between border-b border-cyber-border/40 pb-4 mb-6">
              <span className="text-cyber-cyan font-mono text-[10px] uppercase font-bold tracking-wider">📊 Risk Mitigation Scorecard</span>
              <span className="text-[9px] font-mono text-slate-500 uppercase">Analysis Telemetry</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono text-[10px]">
              {/* Current Risk Gauge */}
              <div className="bg-black/30 p-4 rounded-xl border border-cyber-border flex flex-col justify-between items-center text-center">
                <span className="text-slate-500 text-[8px] uppercase tracking-wider block mb-2 font-mono">Pre-Defense Risk</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(30, 41, 59, 0.3)" strokeWidth="4" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      fill="none" 
                      stroke="#f43f5e" 
                      strokeWidth="4" 
                      strokeDasharray={`${2 * Math.PI * 28}`} 
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - reportData.currentRisk / 100)}`}
                    />
                  </svg>
                  <span className="absolute text-white font-bold text-xs">{reportData.currentRisk}%</span>
                </div>
                <span className="text-cyber-red font-bold uppercase mt-3 tracking-widest text-[8px]">HIGH VULNERABILITY</span>
              </div>

              {/* Projected Risk Gauge */}
              <div className="bg-black/30 p-4 rounded-xl border border-cyber-border flex flex-col justify-between items-center text-center">
                <span className="text-slate-500 text-[8px] uppercase tracking-wider block mb-2 font-mono">Projected Risk</span>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(30, 41, 59, 0.3)" strokeWidth="4" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="28" 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="4" 
                      strokeDasharray={`${2 * Math.PI * 28}`} 
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - (reportData.projectedRisk || 5) / 100)}`}
                    />
                  </svg>
                  <span className="absolute text-white font-bold text-xs">{(reportData.projectedRisk || 5)}%</span>
                </div>
                <span className="text-cyber-green font-bold uppercase mt-3 tracking-widest text-[8px]">SECURED / CONTROLLED</span>
              </div>

              {/* Total Mitigation Rating */}
              <div className="bg-black/30 p-4 rounded-xl border border-cyber-border flex flex-col justify-between items-center text-center">
                <span className="text-slate-500 text-[8px] uppercase tracking-wider block mb-2 font-mono">Posture Improvement</span>
                <div className="text-cyber-cyan font-extrabold text-2xl my-auto flex items-center justify-center">
                  +{reportData.riskReduction}%
                </div>
                <div className="w-full bg-slate-900 border border-cyber-border rounded-full h-2 overflow-hidden mt-3">
                  <div className="bg-cyber-cyan h-full" style={{ width: `${reportData.riskReduction}%` }} />
                </div>
                <span className="text-cyber-cyan font-bold uppercase mt-2 tracking-widest text-[8px]">NET REDUCTION RATE</span>
              </div>
            </div>
          </motion.section>

          {/* 5. How could this attack be prevented? */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan/30 via-transparent to-transparent" />
            <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-4 mb-4">
              <span className="text-cyber-cyan font-mono text-[10px] uppercase font-bold tracking-wider">🛡️ How could this attack be prevented?</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getSimplifiedPreventativeChecklist(reportData.vectorId).map((item, idx) => (
                <div key={idx} className="p-3.5 rounded bg-cyber-surface/30 border border-cyber-border/40 flex items-start gap-3">
                  <span className="text-lg shrink-0 pt-0.5">{item.icon}</span>
                  <div className="font-sans text-xs">
                    <strong className="text-white font-mono text-[10px] uppercase tracking-wider block font-bold">{item.title}</strong>
                    <p className="text-slate-400 text-[10.5px] mt-0.5 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* 6. Remember This */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-border relative"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyber-cyan/30 via-transparent to-transparent" />
            <div className="flex items-center gap-2 border-b border-cyber-border/40 pb-4 mb-4">
              <span className="text-cyber-cyan font-mono text-[10px] uppercase font-bold tracking-wider">🎓 Remember This</span>
            </div>
            
            <ul className="space-y-3 font-sans text-xs text-slate-300 font-sans">
              {getRememberThisPoints(reportData.vectorId).map((point, idx) => (
                <li key={idx} className="flex gap-2.5 items-start">
                  <span className="text-cyber-cyan font-bold">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Lesson Complete */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glassmorphism-card rounded-xl p-6 border border-cyber-green/45 bg-cyber-green/5 relative overflow-hidden text-center max-w-2xl mx-auto shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-8"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-cyber-green" />
            
            <h3 className="text-lg font-bold text-white uppercase tracking-wider font-mono">
              Lesson Complete
            </h3>
            
            <div className="my-5 flex flex-col items-center gap-2 text-xs text-slate-300 font-sans">
              <div className="flex items-center gap-1.5 text-cyber-green">
                <span>✓</span>
                <span>You learned how the attacker entered.</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyber-green">
                <span>✓</span>
                <span>You learned how defenses responded.</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyber-green">
                <span>✓</span>
                <span>You learned how to strengthen security.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 border-t border-cyber-green/10">
              <Link
                href="/command-center"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded bg-cyber-green text-xs font-mono font-bold tracking-widest text-black uppercase hover:bg-cyber-green/90 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all duration-300 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-black" />
                Continue to Learning Journal
              </Link>
              <button
                onClick={handleExportMarkdown}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded border border-cyber-border bg-cyber-surface hover:bg-cyber-surface-brighter text-xs font-mono font-bold tracking-widest text-slate-300 uppercase transition-all duration-300 cursor-pointer"
              >
                <Download className="w-4.5 h-4.5 text-slate-300" />
                Download Learning Report
              </button>
            </div>
          </motion.div>

        </div>

          {/* Collapsible Advanced Technical Details */}
          <div className="w-full pt-4">
            <button
              onClick={() => setIsTechnicalExpanded(!isTechnicalExpanded)}
              className="w-full py-3.5 px-4 rounded-lg border border-cyber-border hover:border-slate-700 bg-cyber-surface/40 hover:bg-cyber-surface/75 text-slate-350 hover:text-white flex items-center justify-between font-mono text-[10px] uppercase tracking-wider transition-all duration-300 hover:cursor-pointer"
            >
              <span className="font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyber-cyan" />
                Advanced Technical Details
              </span>
              <span className="text-cyber-cyan font-bold">{isTechnicalExpanded ? "▲ Collapse" : "▼ Expand"}</span>
            </button>

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

      </motion.div>

      {reportData && (
        <PrintCaseStudy reportData={reportData} />
      )}

      {/* Footer - hidden on print */}
      <div className="print:hidden">
        <Footer />
      </div>
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
          Preparing Your Review...
        </div>
      </div>
    }>
      <AIAnalystContent />
    </Suspense>
  );
}
