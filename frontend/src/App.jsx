import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  PhoneCall,
  PhoneOff,
  Sparkles,
  LayoutDashboard,
  FileText,
  CheckSquare,
  Bot,
  Users,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Send,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Trash2,
  UserPlus,
  RotateCcw,
  Copy,
  Plus,
  Bell,
  Download,
  Globe,
  FileDown,
  LogIn,
  LogOut,
  Lock,
  Mail,
  User,
  ArrowRight,
  ChevronRight,
  Zap,
  Star,
  Edit2,
  PhoneForwarded,
  Smartphone,
  PhoneIncoming,
  Wifi,
  Battery,
  Briefcase,
  Layers,
  Cpu,
  Coins,
  TrendingUp,
  Server,
  BarChart3
} from "lucide-react";
import "./App.css";

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const MODES_CONFIG = {
  Student: {
    name: "Student",
    shortLabel: "Student",
    icon: "🧑‍🎓",
    badgeClass: "badge-student",
    themeColor: "#8b5cf6",
    subtitle: "Keerthana's Academic & Campus Assistant",
    tagline: "Academic Inbound, Coursework, Lab & Campus Liaison",
    studioDeskTitle: "Student Desk • Academic Inbound",
    studioDeskBadge: "🧑‍🎓 Academic Mode Active",
    presets: [
      { name: "Rahul Sharma", phone: "9876543210", email: "rahul@example.com", label: "Rahul (AI Project Lead)" },
      { name: "Priya Patel", phone: "9123456780", email: "priya@example.com", label: "Priya (Internship Applicant)" },
      { name: "Arjun Verma", phone: "9988776655", email: "arjun@example.com", label: "Arjun (Hackathon Teammate)" }
    ],
    kpis: {
      calls: "Academic & Campus Calls",
      urgency: "Urgent Submissions & Deadlines",
      actions: "Pending Study Actions",
      callers: "Peers & Faculty"
    },
    dashboardSubtitle: "Track campus communications, project teammates, coursework deadlines, and academic inquiries.",
    categoryTitle: "Academic Category Breakdown",
    askHeroTitle: "Ask KIRA (Student Desk)",
    askHeroSub: "Query your coursework calls, project meetings, internship inquiries, and exam reminders.",
    samplePrompts: [
      "Who called about internships this week?",
      "What did Rahul say about our AI project?",
      "What are my high urgency deadlines?",
      "List all lab and team meeting requests"
    ],
    actionsTitle: "Academic Action Items",
    actionsSub: "Tasks and follow-ups generated from coursework, team syncs, and lab calls.",
    recordsSub: "Complete log of student calls, professor syncs, and hackathon discussions.",
    memorySub: "Recognized campus peers, professors, and student contacts."
  },
  Freelancer: {
    name: "Freelancer",
    shortLabel: "Freelancer",
    icon: "💻",
    badgeClass: "badge-freelancer",
    themeColor: "#06b6d4",
    subtitle: "Keerthana's Freelance & Client Inbound Desk",
    tagline: "Client Acquisition, Project Scopes, Invoicing & Retainers",
    studioDeskTitle: "Freelancer Studio • Client Acquisition & Briefs",
    studioDeskBadge: "💻 Freelance Mode Active",
    presets: [
      { name: "David Miller", phone: "9811223344", email: "david@millerdesign.com", label: "David Miller (Miller Design - UI Redesign)" },
      { name: "Sarah Jenkins", phone: "9712345678", email: "sarah@growthtech.io", label: "Sarah Jenkins (GrowthTech - SaaS Client)" },
      { name: "Alex Rivera", phone: "9654321098", email: "alex@riveramedia.com", label: "Alex Rivera (Rivera Media - Retainer Lead)" }
    ],
    kpis: {
      calls: "Active Client Calls",
      urgency: "Urgent Client Inquiries",
      actions: "Pending Deliverables & Proposals",
      callers: "Clients & Retainers"
    },
    dashboardSubtitle: "Monitor incoming client briefs, milestone signoffs, retainer negotiations, and project deadlines.",
    categoryTitle: "Client & Project Classification",
    askHeroTitle: "Ask KIRA (Freelance Desk)",
    askHeroSub: "Query client briefs, budget inquiries, revision feedback, and upcoming project delivery dates.",
    samplePrompts: [
      "What client proposals or briefs came in?",
      "What did David Miller ask about the UI redesign?",
      "Which clients requested budget quotes or deadlines?",
      "Summarize all pending client deliverables"
    ],
    actionsTitle: "Client Deliverables & Action Items",
    actionsSub: "Proposals to send, scopes to review, and milestone tasks extracted from client calls.",
    recordsSub: "Complete log of client negotiations, project reviews, and client inquiries.",
    memorySub: "Client roster, design agencies, tech leads, and retainer contacts."
  },
  "Small Business": {
    name: "Small Business",
    shortLabel: "Small Business",
    icon: "🏬",
    badgeClass: "badge-business",
    themeColor: "#f59e0b",
    subtitle: "Keerthana's Retail & Business Operations Desk",
    tagline: "Order Fulfilment, Bulk Purchasing, Vendor Relations & Customer Service",
    studioDeskTitle: "Business Operations • Customer & Vendor Desk",
    studioDeskBadge: "🏬 Small Business Mode Active",
    presets: [
      { name: "Anita Desai", phone: "9844556677", email: "anita.d@apexretail.in", label: "Anita Desai (Apex Retail - Bulk Orders)" },
      { name: "Vikram Mehta", phone: "9765432100", email: "vikram@logisticsplus.com", label: "Vikram Mehta (Logistics Plus - Supply)" },
      { name: "Sunita Rao", phone: "9123498765", email: "sunita@chennaicatering.com", label: "Sunita Rao (Chennai Catering - Supply Inquiry)" }
    ],
    kpis: {
      calls: "Customer & Vendor Calls",
      urgency: "Urgent Orders & Disputes",
      actions: "Pending Invoices & Dispatches",
      callers: "Customers & Suppliers"
    },
    dashboardSubtitle: "Track wholesale orders, delivery logistics, customer inquiries, and vendor supply requests.",
    categoryTitle: "Business & Order Classification",
    askHeroTitle: "Ask KIRA (Small Business Desk)",
    askHeroSub: "Query bulk orders, delivery timelines, vendor invoices, and customer satisfaction issues.",
    samplePrompts: [
      "What bulk orders or purchase inquiries arrived?",
      "Did Anita Desai confirm the hamper quantities?",
      "Are there any pending vendor payments or delivery issues?",
      "Summarize today's customer order requests"
    ],
    actionsTitle: "Business Operations Action Items",
    actionsSub: "Dispatch follow-ups, invoice dispatches, and quote reviews extracted from business calls.",
    recordsSub: "Complete log of customer orders, wholesale queries, and logistics conversations.",
    memorySub: "Customer directory, bulk buyers, suppliers, and logistics partners."
  },
  Professional: {
    name: "Professional",
    shortLabel: "Professional",
    icon: "💼",
    badgeClass: "badge-professional",
    themeColor: "#3b82f6",
    subtitle: "Keerthana's Executive & Advisory Liaison",
    tagline: "Recruiter Inquiries, Board Advisory, Executive Syncs & Career Opportunities",
    studioDeskTitle: "Executive Suite • Professional Liaison",
    studioDeskBadge: "💼 Executive Mode Active",
    presets: [
      { name: "Meera Nair", phone: "9877889900", email: "meera.nair@globaltalent.com", label: "Meera Nair (Global Talent Search - Recruiter)" },
      { name: "Dr. Ramesh Gupta", phone: "9822334455", email: "r.gupta@aiconsult.org", label: "Dr. Ramesh Gupta (AI Ethics Advisory Board)" },
      { name: "Elena Rostova", phone: "9833445566", email: "elena@venturepartners.com", label: "Elena Rostova (Venture Partner Advisory)" }
    ],
    kpis: {
      calls: "Executive & Recruiter Calls",
      urgency: "High-Priority Career Inquiries",
      actions: "Strategic Follow-ups",
      callers: "Industry Network"
    },
    dashboardSubtitle: "Monitor career outreach, executive recruiter interviews, advisory board requests, and speaking invitations.",
    categoryTitle: "Executive & Career Classification",
    askHeroTitle: "Ask KIRA (Executive Liaison)",
    askHeroSub: "Query recruiter communications, advisory meeting schedules, executive proposals, and compensation discussions.",
    samplePrompts: [
      "Which executive recruiters or firms reached out?",
      "What details did Meera Nair give for the advisory interview?",
      "List scheduled interviews and advisory meetings",
      "Summarize executive inquiries this week"
    ],
    actionsTitle: "Executive Strategic Action Items",
    actionsSub: "Interview prep, contract reviews, and executive follow-ups extracted from professional calls.",
    recordsSub: "Complete log of recruiter outreach, consulting inquiries, and executive discussions.",
    memorySub: "Executive search partners, industry advisors, corporate contacts, and hiring managers."
  }
};

const PRESET_CALLERS = MODES_CONFIG.Student.presets;

// ----------------------------------------------------
// SMARTPHONE CALL-SCREEN SIMULATOR SCENARIOS
// ----------------------------------------------------
const SMARTPHONE_SCENARIOS = {
  friend: {
    id: "friend",
    name: "Ajay",
    label: "🧑‍🤝‍🧑 Friend (Ajay)",
    phone: "+91 98765 43210",
    role: "College Teammate & Friend",
    avatarBg: "linear-gradient(135deg, #10b981, #06b6d4)",
    tag: "Personal Circle",
    tagClass: "badge-friend",
    carrierBadge: "Personal Contact Detected",
    domain: "Personal / Peer Circle",
    language: "English",
    decisionLog: "Caller recognized as Personal Friend (Ajay) -> Corporate constraints suppressed -> Warm conversational tone engaged.",
    dialogue: [
      {
        speaker: "caller",
        name: "Ajay",
        text: "Hey Keerthana! Just called to check on you and see how you're doing. Let's catch up whenever you're free!",
        delay: 600
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Hello Ajay! That's so thoughtful of you. Keerthana is away from her phone right now, but I'll make sure to let her know you called to say hi! Shall I ask her to give you a call back later?",
        delay: 2400
      },
      {
        speaker: "caller",
        name: "Ajay",
        text: "Yeah, just tell her to call me whenever she gets a break. No rush at all, thanks KIRA!",
        delay: 9500
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Will do, Ajay! Have a wonderful day. Bye!",
        delay: 12000
      }
    ],
    summary: "Ajay called casually to check in and say hi. No urgent matters.",
    actionItem: "Give Ajay a friendly callback when on a break.",
    urgency: "Low",
    urgencyClass: "badge-low"
  },
  delivery: {
    id: "delivery",
    name: "Ramesh (Swiggy / Amazon)",
    label: "🚚 Delivery (WhatsApp PIN)",
    phone: "+91 98112 33445",
    role: "Swiggy Express • Delivery Partner",
    avatarBg: "linear-gradient(135deg, #10b981, #059669)",
    tag: "Instant WhatsApp",
    tagClass: "badge-delivery",
    carrierBadge: "Autonomous WhatsApp Dispatch",
    domain: "Automated Logistics & Gate PIN",
    language: "English",
    decisionLog: "Courier / Delivery partner recognized -> Autonomous WhatsApp Tool Executed -> Flat 402 Gate 2 Landmark sent -> 0 manual intervention.",
    dialogue: [
      {
        speaker: "caller",
        name: "Ramesh",
        text: "Madam, I am at the society main gate with your Swiggy parcel. Where should I deliver it?",
        delay: 600
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Hello Ramesh! I have just dispatched an instant WhatsApp message with the exact gate directions, Block B, and Flat 402 to your phone. Please leave the package with the security desk or at the doorstep.",
        delay: 2400,
        actionDispatch: {
          channel: "WhatsApp",
          type: "DELIVERY_GATE_PIN",
          badge: "WhatsApp Dispatched",
          recipient: "+91 98112 33445",
          preview: "📍 Flat 402, Block B, Green Heights (Gate 2 landmark). Leave parcel at doorstep. PIN: 402",
          deliveredAt: "Just now • Delivered"
        }
      },
      {
        speaker: "caller",
        name: "Ramesh",
        text: "Oh super madam! I just received the WhatsApp message with the flat code. Leaving it at Flat 402 doorstep right now. Thank you!",
        delay: 9500
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Thank you so much Ramesh! Have a safe day ahead.",
        delay: 12000
      }
    ],
    summary: "Ramesh from Swiggy arrived at main gate. KIRA autonomously dispatched WhatsApp with Flat 402 and Gate 2 landmark. Parcel left safely at doorstep.",
    actionItem: "Pick up Swiggy delivery parcel from Flat 402 doorstep.",
    urgency: "High",
    urgencyClass: "badge-high",
    dispatchedAction: {
      channel: "WhatsApp",
      title: "Delivery Gate Landmark & Flat PIN",
      recipient: "+91 98112 33445",
      content: "📍 Flat 402, Block B, Green Heights (Gate 2 landmark). Leave parcel at doorstep. PIN: 402",
      deliveredAt: "Delivered (180ms)"
    }
  },
  business: {
    id: "business",
    name: "Anita Desai",
    label: "🏬 Wholesale Order (Anita)",
    phone: "+91 98451 22334",
    role: "Apex Retail • Procurement Head",
    avatarBg: "linear-gradient(135deg, #ec4899, #f43f5e)",
    tag: "Small Business",
    tagClass: "badge-business",
    carrierBadge: "Wholesale Order Inbound",
    domain: "Small Business Desk",
    language: "English",
    decisionLog: "Inbound wholesale order detected -> Strict commercial domain lock applied -> Academic references suppressed -> Order recorded.",
    dialogue: [
      {
        speaker: "caller",
        name: "Anita Desai",
        text: "Hello, this is Anita from Apex Retail. We need to confirm our bulk purchase order of 300 festival gift hampers for next Friday.",
        delay: 600
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Hello Anita! Thank you for contacting Keerthana's business desk. I have logged your order for 300 gift hampers for delivery next Friday. Does this include custom branding packaging?",
        delay: 2400
      },
      {
        speaker: "caller",
        name: "Anita Desai",
        text: "Yes, standard gold packaging. Please ask Keerthana to share the final tax invoice so we can clear advance payment.",
        delay: 9500
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Understood. I am notifying Keerthana right away to review warehouse inventory and dispatch the proforma invoice to Apex Retail today.",
        delay: 12000
      }
    ],
    summary: "Apex Retail confirmed bulk order of 300 festival hampers for next Friday. Requires tax invoice for advance clearance.",
    actionItem: "Verify hamper inventory and send proforma tax invoice to Anita Desai.",
    urgency: "High",
    urgencyClass: "badge-high"
  },
  recruiter: {
    id: "recruiter",
    name: "Meera Nair",
    label: "💼 Recruiter (Meera)",
    phone: "+91 98778 89900",
    role: "Global Talent Search • Partner",
    avatarBg: "linear-gradient(135deg, #3b82f6, #6366f1)",
    tag: "Executive Search",
    tagClass: "badge-professional",
    carrierBadge: "Executive Screening",
    domain: "Professional Suite",
    language: "English",
    decisionLog: "Executive recruiter inquiry detected -> Confidentiality protocol active -> Dispatched live portfolio & resume SMS -> Capturing firm name, role title & interview schedule.",
    dialogue: [
      {
        speaker: "caller",
        name: "Meera Nair",
        text: "Hello Keerthana, Meera from Global Talent Search. We are headhunting for a Lead AI Systems Architect role and wanted to schedule an advisory sync.",
        delay: 600
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Good day, Meera. You've reached Keerthana's executive desk. She is currently in an advisory session. Could you share the organization name and timeline for the role?",
        delay: 2400
      },
      {
        speaker: "caller",
        name: "Meera Nair",
        text: "It is for a tier-1 tech firm in Bengaluru. Can she share her portfolio or resume links so we can prepare for Thursday afternoon?",
        delay: 9200
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Certainly! I have just dispatched an SMS with Keerthana's resume and live portfolio link to your number. I have also scheduled an alert for Thursday afternoon.",
        delay: 11800,
        actionDispatch: {
          channel: "SMS",
          type: "RESUME_PORTFOLIO_LINK",
          badge: "SMS Dispatched",
          recipient: "+91 98778 89900",
          preview: "📄 Keerthana Sangam — Portfolio: github.com/keerthanasangam | Resume: kira.ai/cv/keerthana",
          deliveredAt: "Just now • Delivered"
        }
      }
    ],
    summary: "Meera Nair (Global Talent Search) invited Keerthana for Lead AI Systems Architect interview on Thursday. Portfolio & CV links dispatched via SMS.",
    actionItem: "Review role description and confirm 30-min interview window with Meera.",
    urgency: "Medium",
    urgencyClass: "badge-medium",
    dispatchedAction: {
      channel: "SMS",
      title: "Portfolio & Resume Links",
      recipient: "+91 98778 89900",
      content: "📄 Keerthana Sangam — Portfolio: github.com/keerthanasangam | Resume: kira.ai/cv/keerthana",
      deliveredAt: "Delivered (165ms)"
    }
  },
  spam: {
    id: "spam",
    name: "Unknown / Promotional",
    label: "🚫 Robocall & Spam Defense",
    phone: "+91 14099 87654",
    role: "Automated Robotic Dialer",
    avatarBg: "linear-gradient(135deg, #64748b, #475569)",
    tag: "Telemarketer",
    tagClass: "badge-spam",
    carrierBadge: "Spam Defense Active",
    domain: "Carrier Spam Firewall",
    language: "English",
    decisionLog: "Automated robocall signature identified -> Commercial loan solicitation detected -> Terminating without notifying subscriber.",
    dialogue: [
      {
        speaker: "caller",
        name: "Robotic Dialer",
        text: "Congratulations! You have pre-approved instant cash loan of 10 Lakhs with zero documentation. Press 1 to speak with our representative...",
        delay: 600
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "This telephone number is registered on the National Do Not Disturb registry. Unsolicited promotional calls are prohibited. Screening and disconnecting.",
        delay: 2400
      }
    ],
    summary: "Blocked telemarketing robocall offering instant loans. Call screened and terminated automatically. Keerthana was not disturbed.",
    actionItem: "No action required. Call blocked and flagged in spam registry.",
    urgency: "Filtered",
    urgencyClass: "badge-spam"
  },
  vernacular: {
    id: "vernacular",
    name: "Suresh Kumar",
    label: "🗣️ Telugu Native (సురేష్)",
    phone: "+91 99887 76655",
    role: "Hyd Tech Park • Coordinator",
    avatarBg: "linear-gradient(135deg, #f59e0b, #d97706)",
    tag: "Telugu • తెలుగు",
    tagClass: "badge-vernacular",
    carrierBadge: "Vernacular Multilingual Engine",
    domain: "Regional Telecom Gateway",
    language: "Telugu",
    decisionLog: "Regional language detected (Telugu script) -> te-IN-ShrutiNeural voice activated -> English executive translation running synchronously.",
    dialogue: [
      {
        speaker: "caller",
        name: "Suresh Kumar",
        text: "నమస్కారం అండి, సురేష్ మాట్లాడుతున్నాను. ప్రాజెక్ట్ డెలివరీ అప్డేట్ గురించి కీర్తన గారితో మాట్లాడాలి.",
        delay: 600
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "నమస్కారం సురేష్ గారు! కీర్తన గారు ప్రస్తుతానికి వేరే ముఖ్యమైన మీటింగ్‌లో ఉన్నారు. ప్రాజెక్ట్ అప్డేట్ గురించి వివరాలు చెప్పండి, నేను వారికి వెంటనే తెలియజేస్తాను.",
        delay: 2400
      },
      {
        speaker: "caller",
        name: "Suresh Kumar",
        text: "రేపు సాయంత్రం 5 గంటలకు ఫైనల్ డెమో ఉంటుంది, డెమో లింక్ ఈమెయిల్ చేసాము.",
        delay: 9500
      },
      {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "సరే సురేష్ గారు, రేపు సాయంత్రం 5 గంటల డెమో గురించి కీర్తన గారికి నోట్ చేసాను. ధన్యవాదాలు!",
        delay: 12000
      }
    ],
    summary: "Suresh Kumar called in Telugu regarding final project demo scheduled for tomorrow at 5 PM. Demo link sent via email.",
    actionItem: "Check email for Suresh's demo link and prep for tomorrow 5 PM presentation.",
    urgency: "Medium",
    urgencyClass: "badge-medium"
  },
  live_caller: {
    id: "live_caller",
    name: "You (Live Screener)",
    label: "🎙️ Speak Live (You)",
    phone: "+91 90000 12345",
    role: "Speak into your laptop mic",
    avatarBg: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    tag: "Live Duplex ASR",
    tagClass: "badge-live",
    carrierBadge: "Interactive Live Screening",
    domain: "Real-Time Voice Pipeline",
    language: "English",
    decisionLog: "Full duplex audio stream active -> Whisper STT on-device -> Gemini Agentic reasoning -> Edge-TTS speech synthesis.",
    isLive: true,
    dialogue: [],
    summary: "Live voice screening session. Voice transcribed via Whisper and summarized by Gemini.",
    actionItem: "Follow up with caller according to conversation directives.",
    urgency: "Normal",
    urgencyClass: "badge-medium"
  }
};

export default function App() {
  // Application Stage Routing: "landing" | "purpose_selection" | "dashboard"
  // Default to landing page first so visitors experience the product intro & trial flow
  const [appStage, setAppStage] = useState("landing");

  // Navigation & Mode
  const [activeTab, setActiveTab] = useState("studio");
  const [activeMode, setActiveMode] = useState(() => {
    return localStorage.getItem("kira_purpose") || "Student";
  });
  const [backendOnline, setBackendOnline] = useState(true);

  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("kira_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState("login"); // "login" | "register"
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // UI / UX Navigation States
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeskMenu, setShowDeskMenu] = useState(false);
  const [trialUnlockedBanner, setTrialUnlockedBanner] = useState(false);

  // Caller Upfront Registered Mode
  const [callerRegisteredMode, setCallerRegisteredMode] = useState(() => {
    return localStorage.getItem("kira_purpose") || "Student";
  });

  // Purpose Selection Handler
  const handleSelectPurpose = (mode) => {
    setActiveMode(mode);
    setCallerRegisteredMode(mode);
    localStorage.setItem("kira_purpose", mode);
    handleModeChange(mode);
    setAppStage("dashboard");
  };

  // Tab Mode Filters ("auto" follows activeMode, or "all", or specific mode)
  const [recordsModeFilter, setRecordsModeFilter] = useState("auto");
  const [actionsModeFilter, setActionsModeFilter] = useState("auto");
  const [actionStatusFilter, setActionStatusFilter] = useState("all"); // "all" | "pending" | "completed" | "urgent"
  const [dashboardModeFilter, setDashboardModeFilter] = useState("auto");
  const [callersModeFilter, setCallersModeFilter] = useState("auto");

  // Call Studio State
  const [activeCallId, setActiveCallId] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [callerName, setCallerName] = useState("Rahul Sharma");
  const [callerPhone, setCallerPhone] = useState("9876543210");
  const [callerEmail, setCallerEmail] = useState("rahul@example.com");
  const [isNewCallerMode, setIsNewCallerMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [kiraStatus, setKiraStatus] = useState("KIRA is ready. Start a call to begin.");
  const [studioMessages, setStudioMessages] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [postCallSummary, setPostCallSummary] = useState(null);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  // Data Collections
  const [analytics, setAnalytics] = useState(null);
  const [callsList, setCallsList] = useState([]);
  const [actionsList, setActionsList] = useState([]);
  const [callersList, setCallersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [expandedCallId, setExpandedCallId] = useState(null);

  // Ask KIRA Assistant & Voice Briefing
  const [askQuestion, setAskQuestion] = useState("");
  const [askAnswer, setAskAnswer] = useState("");
  const [askAudioBase64, setAskAudioBase64] = useState("");
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [autoPlayVoice, setAutoPlayVoice] = useState(true);
  const [isAsking, setIsAsking] = useState(false);
  const voiceAudioRef = useRef(null);

  // Live feed copy state
  const [copiedFeed, setCopiedFeed] = useState(false);

  // Multi-Language state (English, Telugu, Hindi)
  const [activeLanguage, setActiveLanguage] = useState("English");

  // Executive Export & Copy Notion Brief
  const [copiedNotionId, setCopiedNotionId] = useState(null);

  // Notification Settings Modal State
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [notifSettings, setNotifSettings] = useState({
    webhook_url: "",
    telegram_bot_token: "",
    telegram_chat_id: "",
    alert_on_high_urgency: true,
    alert_on_meetings: true,
    enabled: true
  });
  const [notifTesting, setNotifTesting] = useState(false);
  const [notifSavedMsg, setNotifSavedMsg] = useState("");

  // Manual Action Item Creation State
  const [showNewActionModal, setShowNewActionModal] = useState(false);
  const [newActionTask, setNewActionTask] = useState("");
  const [newActionCallerName, setNewActionCallerName] = useState("");
  const [newActionUrgency, setNewActionUrgency] = useState("medium");
  const [newActionDueDate, setNewActionDueDate] = useState("Today");
  const [newActionDescription, setNewActionDescription] = useState("");
  const [isCreatingAction, setIsCreatingAction] = useState(false);

  // VIP & Edit Caller Handlers
  const [vipOnlyFilter, setVipOnlyFilter] = useState(false);
  const [showEditCallerModal, setShowEditCallerModal] = useState(false);
  const [editingCaller, setEditingCaller] = useState(null);
  const [editCallerName, setEditCallerName] = useState("");
  const [editCallerEmail, setEditCallerEmail] = useState("");
  const [editCallerOrg, setEditCallerOrg] = useState("");
  const [editCallerMode, setEditCallerMode] = useState("Student");
  const [editCallerNotes, setEditCallerNotes] = useState("");
  const [editCallerIsVip, setEditCallerIsVip] = useState(false);
  const [isSavingCaller, setIsSavingCaller] = useState(false);

  // Telephony Gateway Modal State
  const [showTelephonyModal, setShowTelephonyModal] = useState(false);
  const [telephonySettings, setTelephonySettings] = useState({
    account_sid: "",
    auth_token: "",
    phone_number: "",
    webhook_base_url: "",
    enabled: false,
    recommended_webhook_path: "/telephony/twilio/voice",
    instructions: []
  });
  const [isSavingTelephony, setIsSavingTelephony] = useState(false);
  const [telephonySavedMsg, setTelephonySavedMsg] = useState("");
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // ----------------------------------------------------
  // CARRIER & OEM PITCH DECK MODAL STATE
  // ----------------------------------------------------
  const [showPitchDeckModal, setShowPitchDeckModal] = useState(false);
  const [pitchDeckActiveSlide, setPitchDeckActiveSlide] = useState(0);
  const [pitchCalculatorAdoption, setPitchCalculatorAdoption] = useState(2.5);
  const [pitchPricePerMonth, setPitchPricePerMonth] = useState(99);
  const [copiedPitchBrief, setCopiedPitchBrief] = useState(false);

  const generatePitchBriefText = () => {
    const subscriberBaseM = 450;
    const activeSubscribersM = ((subscriberBaseM * pitchCalculatorAdoption) / 100).toFixed(2);
    const mrrCrore = ((activeSubscribersM * pitchPricePerMonth) / 1).toFixed(2);
    const arrCrore = (mrrCrore * 12).toFixed(2);
    const arrUsdM = (arrCrore / 8.35).toFixed(1);

    return `# EXECUTIVE PROPOSAL: KIRA AI VOICE SCREENING PLATFORM
FOR CARRIER NETWORKS (JIO / AIRTEL / VI) & OEM HARDWARE (SAMSUNG / APPLE)
CONFIDENTIAL & PROPRIETARY | TELECOM STRATEGY INITIATIVE

1. PROBLEM STATEMENT: THE $12B INERT VOICEMAIL CRISIS
----------------------------------------------------------------------
- 88% of callers disconnect immediately upon encountering legacy carrier voicemail tones.
- Over 65% of incoming calls from unknown numbers are rejected or ignored to evade robocall spam.
- High-intent calls (deliveries, recruiters, hospital alerts, business leads) are routinely lost.
- Mobile Network Operators (MNOs) suffer from negative subscriber sentiment and zero monetization on abandoned voicemail systems.

2. ARCHITECTURAL ADVANTAGE:
----------------------------------------------------------------------
A. CARRIER IMS / 5G VoNR CORE TIER:
   - Direct integration at carrier Session Border Controller (SBC) layer via standard SIP / RTP.
   - Zero-app requirement: Works automatically on any subscriber line (iOS, Android, and 4G/5G feature phones).
   - Low-Latency Conversational Loop: <150ms Groq ASR + <250ms LLM TTFT + Edge TTS voice streaming (<550ms turnaround).

B. OEM HARDWARE & DIALER TIER (SAMSUNG GALAXY AI / APPLE CALLKIT):
   - Native dialer integration with live streaming screen-side speech transcription.
   - On-device Small Language Model (SLM) for local biometric voice match & instant triage.
   - Seamless 1-tap live call takeover at any moment of the conversation.

3. MONETIZATION & ARPU PROJECTION (SIMULATED):
----------------------------------------------------------------------
- Target Network Subscriber Base: ${subscriberBaseM} Million Users
- Estimated VAS Adoption Rate: ${pitchCalculatorAdoption}%
- Paying Subscriber Count: ${activeSubscribersM} Million Active Subscribers
- VAS Price Point: ₹${pitchPricePerMonth} / month
- Projected Monthly Recurring Revenue (MRR): ₹${mrrCrore} Crore / month
- Projected Annual Recurring Revenue (ARR): ₹${arrCrore} Crore / year (~$${arrUsdM}M USD ARR)
- Enterprise & Fleet Upsell: +₹450 Crore / year for corporate lines with automated CRM & ERP sync.

4. REGULATORY, PRIVACY & DATA SOVEREIGNTY:
----------------------------------------------------------------------
- TRAI & UCC Registry Compliance: Automated enforcement against non-compliant telemarketers.
- Indian DPDP Act 2023: 100% sovereign data residency inside Indian borders (AWS Mumbai / Azure Pune / Jio Cloud).
- Automatic Voice Scrubber: Real-time redaction of OTPs, credit card numbers, and PII.
- High Availability SLA: 99.999% "Five Nines" carrier reliability.

PARTNERSHIP & POC CONTACT:
Founding Team: founders@kira-voice.ai
Telecom Partnerships: telecom-partnerships@kira-voice.ai
Live Demo Platform: https://github.com/keerthanasangam/KIRA-AI-Voice-Agent
`;
  };

  const handleDownloadPitchBrief = () => {
    try {
      const briefText = generatePitchBriefText();
      const blob = new Blob([briefText], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "KIRA_Carrier_Executive_Brief.md");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download pitch brief:", e);
    }
  };

  const handleCopyPitchBrief = () => {
    try {
      const briefText = generatePitchBriefText();
      navigator.clipboard.writeText(briefText);
      setCopiedPitchBrief(true);
      setTimeout(() => setCopiedPitchBrief(false), 2500);
    } catch (e) {
      console.error("Failed to copy pitch brief:", e);
    }
  };

  // Close navigation dropdown menus on click outside
  useEffect(() => {
    const handleDocumentClick = () => {
      setShowProfileMenu(false);
      setShowDeskMenu(false);
    };
    if (showProfileMenu || showDeskMenu) {
      document.addEventListener("click", handleDocumentClick);
    }
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [showProfileMenu, showDeskMenu]);

  // ----------------------------------------------------
  // VOICE PLAYBACK & AUDIO BRIEFING HELPERS
  // ----------------------------------------------------
  const simAudioCacheRef = useRef({});
  const simRunIdRef = useRef(0);

  const stopVoiceAudio = () => {
    if (voiceAudioRef.current) {
      try {
        voiceAudioRef.current.pause();
        voiceAudioRef.current.currentTime = 0;
      } catch (e) {
        // ignore
      }
      setIsVoicePlaying(false);
    }
  };

  const playVoiceAudioAsync = (base64Data, runId = null) => {
    return new Promise((resolve) => {
      if (!base64Data || (runId !== null && simRunIdRef.current !== runId)) {
        resolve();
        return;
      }

      if (voiceAudioRef.current) {
        try {
          voiceAudioRef.current.pause();
          voiceAudioRef.current.currentTime = 0;
        } catch (e) {
          // ignore
        }
      }

      const audio = new Audio("data:audio/mp3;base64," + base64Data);
      voiceAudioRef.current = audio;

      let isFinished = false;
      const finish = () => {
        if (!isFinished) {
          isFinished = true;
          setIsVoicePlaying(false);
          resolve();
        }
      };

      audio.onplay = () => {
        if (runId !== null && simRunIdRef.current !== runId) {
          try {
            audio.pause();
          } catch (e) {}
          finish();
          return;
        }
        setIsVoicePlaying(true);
      };

      audio.onended = finish;
      audio.onerror = (err) => {
        console.warn("Audio playback error:", err);
        finish();
      };

      audio.play().catch((e) => {
        console.warn("Autoplay blocked or interrupted:", e);
        finish();
      });
    });
  };

  const playVoiceAudio = (base64Data) => {
    playVoiceAudioAsync(base64Data);
  };

  const speakCustomTextAsync = async (text, language = "English", runId = null) => {
    if (!text) return;
    if (runId !== null && simRunIdRef.current !== runId) return;

    let base64 = simAudioCacheRef.current[text];
    if (!base64) {
      try {
        const res = await fetch(`${BACKEND_URL}/assistant/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language })
        });
        if (res.ok) {
          const d = await res.json();
          if (d.audio_base64) {
            base64 = d.audio_base64;
            simAudioCacheRef.current[text] = base64;
          }
        }
      } catch (e) {
        console.error("Speak failed:", e);
      }
    }

    if (runId !== null && simRunIdRef.current !== runId) return;

    if (base64) {
      await playVoiceAudioAsync(base64, runId);
    }
  };

  const speakCustomText = (text, language = "English") => {
    speakCustomTextAsync(text, language);
  };

  const prefetchScenarioAudio = (scenario) => {
    if (!scenario?.dialogue) return;
    const lang = scenario.language || "English";
    scenario.dialogue.forEach((turn) => {
      if (turn.speaker === "kira" && !simAudioCacheRef.current[turn.text]) {
        fetch(`${BACKEND_URL}/assistant/speak`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: turn.text, language: lang })
        })
          .then((res) => res.json())
          .then((data) => {
            if (data?.audio_base64) {
              simAudioCacheRef.current[turn.text] = data.audio_base64;
            }
          })
          .catch((err) => console.warn("Prefetch TTS failed:", err));
      }
    });
  };

  // ----------------------------------------------------
  // SMARTPHONE CALL-SCREEN SIMULATOR (LANDING PAGE)
  // ----------------------------------------------------
  const [simScenario, setSimScenario] = useState("friend");
  const [simStatus, setSimStatus] = useState("ringing"); // "ringing" | "screening" | "connected" | "completed"
  const [simMessages, setSimMessages] = useState([]);
  const [simTimer, setSimTimer] = useState(0);
  const [simDirectiveSent, setSimDirectiveSent] = useState(null);
  const simIntervalRef = useRef(null);
  const simTimeoutIdsRef = useRef([]);

  // Live Microphone Simulation States & Refs
  const [simLiveCallId, setSimLiveCallId] = useState(null);
  const [simIsRecording, setSimIsRecording] = useState(false);
  const [simIsThinking, setSimIsThinking] = useState(false);
  const [simMicVolume, setSimMicVolume] = useState(0);
  const [simLiveSummary, setSimLiveSummary] = useState(null);

  // In-Call Autonomous Action Dispatcher States
  const [simActiveDispatch, setSimActiveDispatch] = useState(null);
  const [simDispatchedActions, setSimDispatchedActions] = useState([]);
  const [showActionDispatcherModal, setShowActionDispatcherModal] = useState(false);
  const [actionSnippets, setActionSnippets] = useState({});
  const [testDispatchPhone, setTestDispatchPhone] = useState("+91 98765 43210");
  const [testDispatchKey, setTestDispatchKey] = useState("delivery_directions");
  const [testDispatchMsg, setTestDispatchMsg] = useState("");
  const [isTestDispatching, setIsTestDispatching] = useState(false);
  const [isSavingSnippet, setIsSavingSnippet] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);

  const simMediaRecorderRef = useRef(null);
  const simMediaStreamRef = useRef(null);
  const simAudioChunksRef = useRef([]);
  const simAudioContextRef = useRef(null);
  const simAnalyserRef = useRef(null);
  const simVadIntervalRef = useRef(null);
  const simIsRecordingRef = useRef(false);

  // Auto-prefetch audio on mount and when scenario changes
  useEffect(() => {
    if (SMARTPHONE_SCENARIOS[simScenario]) {
      prefetchScenarioAudio(SMARTPHONE_SCENARIOS[simScenario]);
    }
  }, [simScenario]);

  const cleanupSimMic = () => {
    if (simVadIntervalRef.current) {
      clearInterval(simVadIntervalRef.current);
      simVadIntervalRef.current = null;
    }
    if (simAudioContextRef.current) {
      try {
        simAudioContextRef.current.close();
      } catch (e) {}
      simAudioContextRef.current = null;
    }
    if (simMediaStreamRef.current) {
      try {
        simMediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      simMediaStreamRef.current = null;
    }
    simIsRecordingRef.current = false;
    setSimIsRecording(false);
    setSimMicVolume(0);
  };

  const clearSimTimeouts = () => {
    simRunIdRef.current++;
    cleanupSimMic();
    stopVoiceAudio();
    simTimeoutIdsRef.current.forEach(clearTimeout);
    simTimeoutIdsRef.current = [];
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  };

  const handleSelectScenario = (scenarioKey) => {
    clearSimTimeouts();
    setSimScenario(scenarioKey);
    setSimStatus("ringing");
    setSimMessages([]);
    setSimTimer(0);
    setSimDirectiveSent(null);
    setSimLiveCallId(null);
    setSimLiveSummary(null);
    const targetScenario = SMARTPHONE_SCENARIOS[scenarioKey];
    if (targetScenario) {
      prefetchScenarioAudio(targetScenario);
    }
  };

  const handleStartLiveSimScreening = async () => {
    if (!currentUser) {
      setAuthTab("register");
      setShowAuthModal(true);
      return;
    }

    clearSimTimeouts();
    stopVoiceAudio();
    setSimStatus("screening");
    setSimMessages([]);
    setSimTimer(0);
    setSimDirectiveSent(null);
    setSimIsThinking(true);
    setSimLiveSummary(null);

    simIntervalRef.current = setInterval(() => {
      setSimTimer((prev) => prev + 1);
    }, 1000);

    try {
      const res = await fetch(`${BACKEND_URL}/calls/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caller_name: "You (Live Screener)",
          caller_phone: "+91 90000 12345",
          mode: activeMode || "Student",
          language: activeLanguage || "English"
        })
      });

      if (!res.ok) {
        throw new Error("Could not start live screening session");
      }

      const data = await res.json();
      setSimLiveCallId(data.call_id);
      setSimIsThinking(false);

      const greetingText = data.initial_greeting || "Hello! You have reached Keerthana's screening assistant. Who is calling and how may I assist you?";
      const greetingMsg = {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: greetingText
      };
      setSimMessages([greetingMsg]);

      if (data.greeting_audio_base64) {
        await playVoiceAudioAsync(data.greeting_audio_base64);
      } else {
        await speakCustomTextAsync(greetingText, activeLanguage || "English");
      }
    } catch (err) {
      console.error("Live screening init error:", err);
      setSimIsThinking(false);
      const fallbackMsg = {
        speaker: "kira",
        name: "KIRA Voice AI",
        text: "Hello! You've reached Keerthana's live assistant. Tap the microphone below to speak to me."
      };
      setSimMessages([fallbackMsg]);
      await speakCustomTextAsync(fallbackMsg.text, activeLanguage || "English");
    }
  };

  const handleSimStartRecording = async () => {
    if (simIsRecordingRef.current || simIsThinking) return;
    stopVoiceAudio();

    try {
      cleanupSimMic();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      simMediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      simMediaRecorderRef.current = recorder;
      simAudioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          simAudioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        cleanupSimMic();
        const audioBlob = new Blob(simAudioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 200) {
          await handleSimSendAudioBlob(audioBlob);
        }
      };

      recorder.start();
      simIsRecordingRef.current = true;
      setSimIsRecording(true);

      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          simAudioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          analyser.smoothingTimeConstant = 0.3;
          source.connect(analyser);
          simAnalyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          let simHasSpoken = false;
          let simSilenceStart = null;

          simVadIntervalRef.current = setInterval(() => {
            if (!simIsRecordingRef.current) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            setSimMicVolume(Math.min(100, Math.round(avg * 2.5)));

            // Smart Voice Activity Detection: auto-send after natural 950ms pause
            const SPEECH_THRESHOLD = 14;
            if (avg > SPEECH_THRESHOLD) {
              simHasSpoken = true;
              simSilenceStart = null;
            } else if (simHasSpoken) {
              if (!simSilenceStart) {
                simSilenceStart = Date.now();
              } else if (Date.now() - simSilenceStart > 950) {
                simSilenceStart = null;
                handleSimStopRecording();
              }
            }
          }, 60);
        }
      } catch (e) {
        console.warn("Sim audio context error:", e);
      }
    } catch (err) {
      console.error("Microphone access error in simulator:", err);
      alert("Microphone permission is required to talk live to KIRA. Please allow microphone access in your browser.");
      cleanupSimMic();
    }
  };

  const handleSimStopRecording = () => {
    if (simMediaRecorderRef.current && simMediaRecorderRef.current.state !== "inactive") {
      try {
        simMediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setSimIsRecording(false);
    simIsRecordingRef.current = false;
  };

  const handleSimSendAudioBlob = async (audioBlob) => {
    if (!simLiveCallId) return;
    setSimIsThinking(true);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "caller_voice.webm");

      const response = await fetch(`${BACKEND_URL}/voice/${simLiveCallId}`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Voice inference request failed");
      }

      let callerText = "";
      let kiraText = "";
      let callStatus = "in_progress";

      try {
        const rawCaller = response.headers.get("x-caller-text");
        if (rawCaller) callerText = decodeURIComponent(rawCaller);

        const rawKira = response.headers.get("x-kira-text");
        if (rawKira) kiraText = decodeURIComponent(rawKira);

        const rawAction = response.headers.get("x-action-dispatched");
        if (rawAction) {
          try {
            const actionData = JSON.parse(decodeURIComponent(rawAction));
            setSimActiveDispatch(actionData);
            setSimDispatchedActions((prev) => [...prev, actionData]);
          } catch (err) {
            console.warn("Could not parse x-action-dispatched:", err);
          }
        }

        callStatus = response.headers.get("x-call-status") || "in_progress";
      } catch (e) {
        console.warn("Could not decode voice response headers:", e);
      }

      setSimIsThinking(false);

      if (callerText) {
        setSimMessages((prev) => [
          ...prev,
          { speaker: "caller", name: "You (Live)", text: callerText }
        ]);
      }

      if (kiraText) {
        setSimMessages((prev) => [
          ...prev,
          { speaker: "kira", name: "KIRA Voice AI", text: kiraText }
        ]);

        const audioData = await response.blob();
        const audioUrl = URL.createObjectURL(audioData);
        if (voiceAudioRef.current) {
          try {
            voiceAudioRef.current.pause();
          } catch (e) {}
        }
        const audio = new Audio(audioUrl);
        voiceAudioRef.current = audio;
        audio.onplay = () => setIsVoicePlaying(true);
        audio.onended = () => {
          setIsVoicePlaying(false);
          URL.revokeObjectURL(audioUrl);
          if (callStatus === "completed") {
            handleSimEndLiveCall();
          }
        };
        audio.onerror = () => {
          setIsVoicePlaying(false);
          URL.revokeObjectURL(audioUrl);
          if (callStatus === "completed") {
            handleSimEndLiveCall();
          }
        };
        audio.play().catch((e) => {
          console.warn("Audio play blocked:", e);
          if (callStatus === "completed") {
            handleSimEndLiveCall();
          }
        });
      } else if (callStatus === "completed") {
        await handleSimEndLiveCall();
      }
    } catch (err) {
      console.error("Live voice turn failed:", err);
      setSimIsThinking(false);
    }
  };

  const handleSimEndLiveCall = async () => {
    cleanupSimMic();
    stopVoiceAudio();
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }

    if (simLiveCallId) {
      setSimIsThinking(true);
      try {
        const res = await fetch(`${BACKEND_URL}/calls/${simLiveCallId}/end`, {
          method: "POST"
        });
        if (res.ok) {
          const summaryData = await res.json();
          setSimLiveSummary(summaryData);
        }
        if (typeof fetchCalls === "function") fetchCalls();
        if (typeof fetchAnalytics === "function") fetchAnalytics();
      } catch (e) {
        console.error("End live call error:", e);
      } finally {
        setSimIsThinking(false);
      }
    }
    setSimStatus("completed");
  };

  const handleStartSimScreening = async () => {
    if (!currentUser) {
      setAuthTab("register");
      setShowAuthModal(true);
      return;
    }

    if (simScenario === "live_caller") {
      await handleStartLiveSimScreening();
      return;
    }

    clearSimTimeouts();
    stopVoiceAudio();
    setSimStatus("screening");
    setSimMessages([]);
    setSimTimer(0);
    setSimDirectiveSent(null);

    const runId = ++simRunIdRef.current;
    const scenario = SMARTPHONE_SCENARIOS[simScenario] || SMARTPHONE_SCENARIOS.friend;
    const dialogues = scenario.dialogue || [];
    const lang = scenario.language || "English";

    // Prefetch all audio chunks in background
    prefetchScenarioAudio(scenario);

    simIntervalRef.current = setInterval(() => {
      setSimTimer((prev) => prev + 1);
    }, 1000);

    // Initial small pause before incoming caller speaks
    await new Promise((resolve) => {
      const tid = setTimeout(resolve, 600);
      simTimeoutIdsRef.current.push(tid);
    });
    if (simRunIdRef.current !== runId) return;

    for (let i = 0; i < dialogues.length; i++) {
      if (simRunIdRef.current !== runId) return;
      const turn = dialogues[i];

      // Add speech bubble to the live transcript feed
      setSimMessages((prev) => [...prev, turn]);

      // If turn triggers an autonomous in-call tool action dispatch
      if (turn.actionDispatch) {
        setSimActiveDispatch(turn.actionDispatch);
        setSimDispatchedActions((prev) => [...prev, turn.actionDispatch]);
      }

      if (turn.speaker === "kira") {
        // AWAIT KIRA's voice response to finish speaking completely!
        // This guarantees the first response NEVER gets interrupted in the middle.
        await speakCustomTextAsync(turn.text, lang, runId);
        if (simRunIdRef.current !== runId) return;

        // Natural conversational pause before the caller responds
        await new Promise((resolve) => {
          const tid = setTimeout(resolve, 1100);
          simTimeoutIdsRef.current.push(tid);
        });
        if (simRunIdRef.current !== runId) return;
      } else {
        // Caller speech: natural reading time for visitor to read the text
        const readDelay = Math.min(3200, Math.max(2000, turn.text.length * 32));
        await new Promise((resolve) => {
          const tid = setTimeout(resolve, readDelay);
          simTimeoutIdsRef.current.push(tid);
        });
        if (simRunIdRef.current !== runId) return;
      }
    }

    if (simRunIdRef.current !== runId) return;

    // Small concluding pause before transitioning to summary
    await new Promise((resolve) => {
      const tid = setTimeout(resolve, 1400);
      simTimeoutIdsRef.current.push(tid);
    });
    if (simRunIdRef.current !== runId) return;

    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (scenario.dispatchedAction) {
      setSimDispatchedActions((prev) => (prev.length > 0 ? prev : [scenario.dispatchedAction]));
    }
    setSimStatus("completed");
  };

  const handleSimSendDirective = (directiveText) => {
    setSimDirectiveSent(directiveText);
    const directiveMsg = {
      speaker: "kira",
      name: "KIRA Voice AI",
      text: `[Instruction: "${directiveText}"] -> "Noted Keerthana! Relaying this to the caller immediately."`,
      isDirective: true
    };
    setSimMessages((prev) => [...prev, directiveMsg]);
    speakCustomText("Noted Keerthana! Relaying this instruction to the caller immediately.", SMARTPHONE_SCENARIOS[simScenario]?.language || "English");
  };

  const handleSimAnswerMyself = () => {
    if (!currentUser) {
      setAuthTab("register");
      setShowAuthModal(true);
      return;
    }
    clearSimTimeouts();
    stopVoiceAudio();
    setSimStatus("connected");
  };

  const handleSimDecline = () => {
    clearSimTimeouts();
    stopVoiceAudio();
    setSimStatus("ringing");
    setSimMessages([]);
    setSimActiveDispatch(null);
    setSimDispatchedActions([]);
  };

  const handleSimReset = () => {
    clearSimTimeouts();
    stopVoiceAudio();
    setSimStatus("ringing");
    setSimMessages([]);
    setSimTimer(0);
    setSimDirectiveSent(null);
    setSimLiveCallId(null);
    setSimLiveSummary(null);
    setSimActiveDispatch(null);
    setSimDispatchedActions([]);
  };

  const handleOpenEditCaller = (caller) => {
    setEditingCaller(caller);
    setEditCallerName(caller.name || "");
    setEditCallerEmail(caller.email || "");
    setEditCallerOrg(caller.company_or_org || "");
    setEditCallerMode(caller.registered_mode || activeMode);
    setEditCallerNotes(caller.memory_notes || "");
    setEditCallerIsVip(Boolean(caller.is_vip));
    setShowEditCallerModal(true);
  };

  const handleSaveCaller = async (e) => {
    e.preventDefault();
    if (!editingCaller) return;
    setIsSavingCaller(true);
    try {
      const res = await fetch(`${BACKEND_URL}/callers/${editingCaller.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editCallerName,
          email: editCallerEmail,
          company_or_org: editCallerOrg,
          registered_mode: editCallerMode,
          memory_notes: editCallerNotes,
          is_vip: editCallerIsVip
        })
      });
      if (res.ok) {
        setShowEditCallerModal(false);
        refreshAllData();
      }
    } catch (err) {
      console.error("Save caller failed:", err);
    } finally {
      setIsSavingCaller(false);
    }
  };

  const handleToggleVIP = async (caller) => {
    try {
      const newVip = !caller.is_vip;
      const res = await fetch(`${BACKEND_URL}/callers/${caller.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_vip: newVip })
      });
      if (res.ok) {
        refreshAllData();
      }
    } catch (err) {
      console.error("Toggle VIP failed:", err);
    }
  };

  const handleFetchTelephonySettings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/settings/telephony`);
      if (res.ok) {
        const d = await res.json();
        setTelephonySettings(d);
      }
    } catch (err) {
      console.error("Fetch telephony settings failed:", err);
    }
  };

  const handleSaveTelephonySettings = async (e) => {
    e.preventDefault();
    setIsSavingTelephony(true);
    setTelephonySavedMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/settings/telephony`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_sid: telephonySettings.account_sid,
          auth_token: telephonySettings.auth_token,
          phone_number: telephonySettings.phone_number,
          webhook_base_url: telephonySettings.webhook_base_url,
          enabled: telephonySettings.enabled
        })
      });
      if (res.ok) {
        setTelephonySavedMsg("Telephony configuration saved!");
        setTimeout(() => setTelephonySavedMsg(""), 3000);
        handleFetchTelephonySettings();
      }
    } catch (err) {
      console.error("Save telephony settings failed:", err);
    } finally {
      setIsSavingTelephony(false);
    }
  };

  const handleFetchActionSnippets = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/tools/snippets`);
      if (res.ok) {
        const d = await res.json();
        setActionSnippets(d.snippets || {});
      }
    } catch (err) {
      console.warn("Fetch action snippets failed:", err);
    }
  };

  const handleSaveActionSnippet = async (snippetId, updatedFields) => {
    setIsSavingSnippet(true);
    try {
      const res = await fetch(`${BACKEND_URL}/tools/snippets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: snippetId, ...updatedFields })
      });
      if (res.ok) {
        handleFetchActionSnippets();
      }
    } catch (err) {
      console.error("Save action snippet failed:", err);
    } finally {
      setIsSavingSnippet(false);
      setEditingSnippet(null);
    }
  };

  const handleTriggerTestDispatch = async () => {
    setIsTestDispatching(true);
    setTestDispatchMsg("");
    try {
      const res = await fetch(`${BACKEND_URL}/tools/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action_type: testDispatchKey,
          recipient_phone: testDispatchPhone
        })
      });
      if (res.ok) {
        const d = await res.json();
        setTestDispatchMsg(`Dispatched successfully to ${testDispatchPhone} (Status: DELIVERED)!`);
        setTimeout(() => setTestDispatchMsg(""), 4000);
      }
    } catch (err) {
      setTestDispatchMsg("Dispatch error: " + err.message);
    } finally {
      setIsTestDispatching(false);
    }
  };

  // Dynamic mode switcher that updates caller presets & reset tab views
  const handleModeChange = (newMode) => {
    setActiveMode(newMode);
    setCallerRegisteredMode(newMode);
    setRecordsModeFilter("auto");
    setActionsModeFilter("auto");
    setDashboardModeFilter("auto");
    setCallersModeFilter("auto");

    if (!isCallActive) {
      const modePresets = MODES_CONFIG[newMode]?.presets || [];
      if (modePresets.length > 0) {
        setCallerName(modePresets[0].name);
        setCallerPhone(modePresets[0].phone);
        setCallerEmail(modePresets[0].email);
        setIsNewCallerMode(false);
      }
      setKiraStatus(`${newMode} Desk active. Ready for ${MODES_CONFIG[newMode]?.tagline?.toLowerCase() || "calls"}.`);
    }
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authTab === "login" ? `${BACKEND_URL}/auth/login` : `${BACKEND_URL}/auth/register`;
      const body =
        authTab === "login"
          ? { email: authEmail, password: authPassword }
          : { name: authName, email: authEmail, password: authPassword };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Authentication failed");
      }
      setCurrentUser(data.user);
      localStorage.setItem("kira_user", JSON.stringify(data.user));
      setShowAuthModal(false);
      setAuthPassword("");
      setTrialUnlockedBanner(true);
      setAppStage("landing");
      setTimeout(() => {
        const el = document.getElementById("landing-simulator");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 250);
    } catch (err) {
      setAuthError(err.message || "Failed to authenticate");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "keerthana@kira.ai", password: "kira123" })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        localStorage.setItem("kira_user", JSON.stringify(data.user));
        setShowAuthModal(false);
        setTrialUnlockedBanner(true);
        setAppStage("landing");
        setTimeout(() => {
          const el = document.getElementById("landing-simulator");
          el?.scrollIntoView({ behavior: "smooth" });
        }, 250);
      } else {
        const fallback = { id: 1, name: "Keerthana Sangam", email: "keerthana@kira.ai", role: "owner" };
        setCurrentUser(fallback);
        localStorage.setItem("kira_user", JSON.stringify(fallback));
        setShowAuthModal(false);
        setTrialUnlockedBanner(true);
        setAppStage("landing");
        setTimeout(() => {
          const el = document.getElementById("landing-simulator");
          el?.scrollIntoView({ behavior: "smooth" });
        }, 250);
      }
    } catch {
      const fallback = { id: 1, name: "Keerthana Sangam", email: "keerthana@kira.ai", role: "owner" };
      setCurrentUser(fallback);
      localStorage.setItem("kira_user", JSON.stringify(fallback));
      setShowAuthModal(false);
      setTrialUnlockedBanner(true);
      setAppStage("landing");
      setTimeout(() => {
        const el = document.getElementById("landing-simulator");
        el?.scrollIntoView({ behavior: "smooth" });
      }, 250);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("kira_user");
    localStorage.removeItem("kira_purpose");
    setAppStage("landing");
  };

  // Refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Hands-Free VAD Refs & State
  const [handsFreeMode, setHandsFreeMode] = useState(() => {
    return localStorage.getItem("kira_hands_free") !== "false";
  });
  const [micVolume, setMicVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const vadIntervalRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const hasSpokenRef = useRef(false);
  const isRecordingRef = useRef(false);
  const mediaStreamRef = useRef(null);

  const isCallActiveRef = useRef(isCallActive);
  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  const handsFreeModeRef = useRef(handsFreeMode);
  useEffect(() => {
    handsFreeModeRef.current = handsFreeMode;
    localStorage.setItem("kira_hands_free", handsFreeMode ? "true" : "false");
  }, [handsFreeMode]);

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [studioMessages]);

  // Check health and initial data fetch
  const refreshAllData = async () => {
    try {
      const [healthRes, callsRes, actionsRes, callersRes, analyticsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/health`).catch(() => null),
        fetch(`${BACKEND_URL}/calls`).catch(() => null),
        fetch(`${BACKEND_URL}/actions`).catch(() => null),
        fetch(`${BACKEND_URL}/callers`).catch(() => null),
        fetch(`${BACKEND_URL}/analytics`).catch(() => null)
      ]);

      if (healthRes && healthRes.ok) {
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }

      if (callsRes && callsRes.ok) {
        const d = await callsRes.json();
        setCallsList(d.calls || []);
      }
      if (actionsRes && actionsRes.ok) {
        const d = await actionsRes.json();
        setActionsList(d.actions || []);
      }
      if (callersRes && callersRes.ok) {
        const d = await callersRes.json();
        setCallersList(d.callers || []);
      }
      if (analyticsRes && analyticsRes.ok) {
        const d = await analyticsRes.json();
        setAnalytics(d);
      }

      // Fetch notification settings
      fetch(`${BACKEND_URL}/settings/notifications`)
        .then((r) => (r.ok ? r.json() : null))
        .then((s) => {
          if (s) setNotifSettings(s);
        })
        .catch(() => null);

      handleFetchTelephonySettings();
      handleFetchActionSnippets();
    } catch (err) {
      console.error("Data refresh failed:", err);
      setBackendOnline(false);
    }
  };

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 15000);
    return () => clearInterval(interval);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isCallActive) {
      timerIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerIntervalRef.current);
      setCallDuration(0);
    }
    return () => clearInterval(timerIntervalRef.current);
  }, [isCallActive]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ----------------------------------------------------
  // 1. START CALL SESSION
  // ----------------------------------------------------
  const handleStartCall = async () => {
    try {
      setIsProcessing(true);
      setKiraStatus("Connecting call to KIRA...");

      const isActuallyNew = isNewCallerMode || !callersList.some((c) => c.phone === callerPhone);
      const callDeskMode = callerRegisteredMode || activeMode;

      const res = await fetch(`${BACKEND_URL}/calls/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caller_name: callerName || "Guest Caller",
          caller_phone: callerPhone || "9876543210",
          caller_email: callerEmail || null,
          mode: callDeskMode,
          registered_mode: callDeskMode,
          language: activeLanguage,
          purpose: "Inbound communication",
          is_new_caller: isActuallyNew
        })
      });

      if (!res.ok) throw new Error("Failed to start call");

      const data = await res.json();
      setActiveCallId(data.call_id);
      setIsCallActive(true);
      setIsProcessing(false);
      setKiraStatus("Call connected. KIRA is ready. Speak naturally.");
      stopVoiceAudio();

      // Add initial greeting from KIRA
      setStudioMessages([
        {
          speaker: "kira",
          speaker_name: "KIRA",
          content: data.initial_greeting,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      // Play synthesized greeting audio if available
      if (data.initial_audio) {
        try {
          const greetingAudio = new Audio("data:audio/mp3;base64," + data.initial_audio);
          greetingAudio.onplay = () => setKiraStatus("KIRA is greeting caller...");
          greetingAudio.onended = () => {
            setKiraStatus("KIRA is ready. Speak naturally.");
            if (handsFreeModeRef.current && isCallActiveRef.current) {
              setTimeout(() => {
                if (isCallActiveRef.current && !isRecordingRef.current) {
                  startListening();
                }
              }, 300);
            }
          };
          greetingAudio.play().catch((e) => console.warn("Initial greeting play error:", e));
        } catch (e) {
          console.error("Failed to play greeting audio:", e);
        }
      } else {
        if (handsFreeModeRef.current && isCallActiveRef.current) {
          setTimeout(() => {
            if (isCallActiveRef.current && !isRecordingRef.current) {
              startListening();
            }
          }, 500);
        }
      }

      refreshAllData();
    } catch (err) {
      console.error("Start call error:", err);
      setIsProcessing(false);
      setKiraStatus("Could not start call. Check server connection.");
    }
  };

  // ----------------------------------------------------
  // 2. END CALL SESSION (Trigger AI analysis)
  // ----------------------------------------------------
  const handleEndCall = async () => {
    if (!activeCallId) return;

    cleanupVAD();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    isRecordingRef.current = false;

    try {
      setIsProcessing(true);
      setKiraStatus("Ending call & generating AI summary...");

      const res = await fetch(`${BACKEND_URL}/calls/${activeCallId}/end`, {
        method: "POST"
      });

      if (!res.ok) throw new Error("Failed to end call");

      const data = await res.json();
      setIsCallActive(false);
      setIsListening(false);
      setIsProcessing(false);
      setKiraStatus("Call completed. Summary and Action Item generated!");

      setPostCallSummary(data.summary);
      setShowAnalysisModal(true);

      refreshAllData();
    } catch (err) {
      console.error("End call error:", err);
      setIsCallActive(false);
      setIsProcessing(false);
      setKiraStatus("Call ended.");
    }
  };

  // ----------------------------------------------------
  // 3. MICROPHONE AUDIO CAPTURE & WEBM STREAMING (VAD)
  // ----------------------------------------------------
  const cleanupVAD = () => {
    if (vadIntervalRef.current) {
      clearInterval(vadIntervalRef.current);
      vadIntervalRef.current = null;
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    hasSpokenRef.current = false;
    setMicVolume(0);
  };

  const startListening = async () => {
    if (!isCallActiveRef.current) {
      setKiraStatus("Please click 'Start Call' first.");
      return;
    }

    if (isRecordingRef.current) return;

    try {
      cleanupVAD();
      setKiraStatus(handsFreeModeRef.current ? "Listening... (Speak naturally, pause when done)" : "Listening to caller...");
      setIsListening(true);
      isRecordingRef.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        isRecordingRef.current = false;
        cleanupVAD();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (audioBlob.size > 100) {
          await sendAudioToVoiceEndpoint(audioBlob);
        } else {
          setIsProcessing(false);
          if (isCallActiveRef.current && handsFreeModeRef.current) {
            setTimeout(() => {
              if (isCallActiveRef.current && !isRecordingRef.current) {
                startListening();
              }
            }, 400);
          }
        }
      };

      recorder.start();

      // Web Audio API VAD Analysis
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const audioCtx = new AudioCtx();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 512;
          analyser.smoothingTimeConstant = 0.3;
          source.connect(analyser);
          analyserRef.current = analyser;

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          hasSpokenRef.current = false;
          let silenceStart = null;

          vadIntervalRef.current = setInterval(() => {
            if (!isRecordingRef.current) return;
            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const avg = sum / bufferLength;
            setMicVolume(Math.min(100, Math.round(avg * 2.2)));

            if (handsFreeModeRef.current) {
              const SPEECH_THRESHOLD = 15;
              if (avg > SPEECH_THRESHOLD) {
                hasSpokenRef.current = true;
                silenceStart = null;
              } else if (hasSpokenRef.current) {
                if (!silenceStart) {
                  silenceStart = Date.now();
                } else if (Date.now() - silenceStart > 900) {
                  silenceStart = null;
                  stopListening();
                }
              }
            }
          }, 60);
        }
      } catch (vadErr) {
        console.warn("VAD init notice:", vadErr);
      }
    } catch (error) {
      console.error("Microphone error:", error);
      setIsListening(false);
      isRecordingRef.current = false;
      cleanupVAD();
      setKiraStatus("Microphone permission required.");
    }
  };

  const stopListening = () => {
    cleanupVAD();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setIsProcessing(true);
    setKiraStatus("Transcribing with Whisper & consulting KIRA...");
  };

  const sendAudioToVoiceEndpoint = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "caller_audio.webm");

      const response = await fetch(`${BACKEND_URL}/voice/${activeCallId}`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Voice request failed");
      }

      // Extract metadata headers
      let callerText = "";
      let kiraText = "";
      let callStatus = "in_progress";

      try {
        const rawCaller = response.headers.get("x-caller-text");
        if (rawCaller) callerText = decodeURIComponent(rawCaller);

        const rawKira = response.headers.get("x-kira-text");
        if (rawKira) kiraText = decodeURIComponent(rawKira);

        callStatus = response.headers.get("x-call-status") || "in_progress";
      } catch (e) {
        console.warn("Could not decode headers:", e);
      }

      // Append messages to live feed
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const currentCallerName = callerName || "Caller";

      if (callerText || kiraText) {
        setStudioMessages((prev) => {
          const updated = [...prev];
          if (callerText) {
            updated.push({
              speaker: "caller",
              speaker_name: currentCallerName,
              content: callerText,
              timestamp: now
            });
          }
          if (kiraText) {
            updated.push({
              speaker: "kira",
              speaker_name: "KIRA",
              content: kiraText,
              timestamp: now
            });
          }
          return updated;
        });
      } else {
        // Fallback: fetch messages directly from backend conversation record
        try {
          const syncRes = await fetch(`${BACKEND_URL}/calls/${activeCallId}`);
          if (syncRes.ok) {
            const syncData = await syncRes.json();
            if (syncData.conversation && syncData.conversation.length > 0) {
              setStudioMessages(
                syncData.conversation.map((m) => ({
                  speaker: m.speaker,
                  speaker_name: m.speaker === "kira" ? "KIRA" : currentCallerName,
                  content: m.content,
                  timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                }))
              );
            }
          }
        } catch (syncErr) {
          console.warn("Message sync fallback error:", syncErr);
        }
      }

      // Play audio response
      const audioBlobResponse = await response.blob();
      if (audioBlobResponse.size > 0) {
        const audioUrl = URL.createObjectURL(audioBlobResponse);
        const audio = new Audio(audioUrl);

        audio.onplay = () => setKiraStatus("KIRA is speaking...");
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setIsProcessing(false);
          setKiraStatus("KIRA is ready. Speak naturally.");
          if (callStatus === "completed") {
            handleCallFinishedNaturally();
          } else if (handsFreeModeRef.current && isCallActiveRef.current) {
            setTimeout(() => {
              if (isCallActiveRef.current && !isRecordingRef.current) {
                startListening();
              }
            }, 350);
          }
        };
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          setIsProcessing(false);
          setKiraStatus("KIRA is ready.");
          if (handsFreeModeRef.current && isCallActiveRef.current) {
            setTimeout(() => {
              if (isCallActiveRef.current && !isRecordingRef.current) {
                startListening();
              }
            }, 400);
          }
        };

        await audio.play();
      } else {
        setIsProcessing(false);
        setKiraStatus("KIRA is ready.");
        if (handsFreeModeRef.current && isCallActiveRef.current) {
          setTimeout(() => {
            if (isCallActiveRef.current && !isRecordingRef.current) {
              startListening();
            }
          }, 350);
        }
      }
    } catch (error) {
      console.error("Voice processing error:", error);
      setIsProcessing(false);
      setKiraStatus("Could not process voice. Please try again.");
    }
  };
  const handleCallFinishedNaturally = async () => {
    setIsCallActive(false);
    refreshAllData();
    // Fetch summary
    try {
      const res = await fetch(`${BACKEND_URL}/calls/${activeCallId}`);
      if (res.ok) {
        const d = await res.json();
        if (d.summary) {
          setPostCallSummary(d.summary);
          setShowAnalysisModal(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ----------------------------------------------------
  // 4. TEXT CHAT FALLBACK
  // ----------------------------------------------------
  const handleSendTextMessage = async (e) => {
    e?.preventDefault();
    if (!textInput.trim() || !activeCallId) return;

    const userMsg = textInput.trim();
    setTextInput("");
    setIsProcessing(true);
    setKiraStatus("KIRA is thinking...");

    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const currentCallerName = callerName || "Caller";
    setStudioMessages((prev) => [
      ...prev,
      { speaker: "caller", speaker_name: currentCallerName, content: userMsg, timestamp: now }
    ]);

    try {
      const res = await fetch(`${BACKEND_URL}/calls/${activeCallId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg })
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      setStudioMessages((prev) => [
        ...prev,
        {
          speaker: "kira",
          speaker_name: "KIRA",
          content: data.kira_response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);

      if (data.audio_base64) {
        try {
          const chatAudio = new Audio("data:audio/mp3;base64," + data.audio_base64);
          chatAudio.onplay = () => setKiraStatus("KIRA is speaking...");
          chatAudio.onended = () => setKiraStatus("KIRA is ready. Speak naturally.");
          chatAudio.play().catch((e) => console.warn("Chat audio playback notice:", e));
        } catch (e) {
          console.error("Audio playback error:", e);
        }
      }

      if (data.call_status === "completed" && data.summary) {
        setIsCallActive(false);
        setPostCallSummary(data.summary);
        setShowAnalysisModal(true);
        setKiraStatus("Call ended.");
        refreshAllData();
      } else {
        setKiraStatus("KIRA is ready.");
      }
      setIsProcessing(false);
    } catch (err) {
      console.error("Chat error:", err);
      setIsProcessing(false);
      setKiraStatus("Failed to send message.");
    }
  };

  // ----------------------------------------------------
  // 5. ACTION ITEMS TOGGLE
  // ----------------------------------------------------
  const handleToggleAction = async (actionId) => {
    try {
      // Optimistic update
      setActionsList((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, is_completed: !a.is_completed } : a))
      );

      const res = await fetch(`${BACKEND_URL}/actions/${actionId}/toggle`, {
        method: "PATCH"
      });
      if (!res.ok) throw new Error("Toggle failed");

      refreshAllData();
    } catch (err) {
      console.error("Action toggle error:", err);
      refreshAllData();
    }
  };

  // ----------------------------------------------------
  // 5B. MANUAL ACTION CREATION & DELETION
  // ----------------------------------------------------
  const handleCreateManualTask = async (e) => {
    e?.preventDefault();
    if (!newActionTask.trim()) return;

    setIsCreatingAction(true);
    try {
      const res = await fetch(`${BACKEND_URL}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: newActionTask.trim(),
          caller_name: newActionCallerName.trim() || "Keerthana (Directive)",
          urgency: newActionUrgency || "medium",
          due_hint: newActionDueDate.trim() || "Today",
          description: newActionDescription.trim() || `Manual desk directive in ${activeMode}.`,
          call_mode: activeMode
        })
      });

      if (res.ok) {
        setNewActionTask("");
        setNewActionCallerName("");
        setNewActionDescription("");
        setNewActionDueDate("Today");
        setNewActionUrgency("medium");
        setShowNewActionModal(false);
        refreshAllData();
      }
    } catch (err) {
      console.error("Failed to create manual task:", err);
    } finally {
      setIsCreatingAction(false);
    }
  };

  const handleDeleteAction = async (actionId) => {
    try {
      setActionsList((prev) => prev.filter((a) => a.id !== actionId));
      await fetch(`${BACKEND_URL}/actions/${actionId}`, {
        method: "DELETE"
      });
      refreshAllData();
    } catch (err) {
      console.error("Failed to delete action:", err);
      refreshAllData();
    }
  };

  // ----------------------------------------------------
  // 5C. STUDIO SHORTCUTS & LIVE FEED CLIPBOARD
  // ----------------------------------------------------
  const handleCopyLiveFeed = () => {
    if (!studioMessages || studioMessages.length === 0) return;
    const formatted = studioMessages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.speaker === "kira" ? "KIRA" : m.speaker_name || callerName || "Caller"}: ${m.content}`
      )
      .join("\n\n");
    navigator.clipboard.writeText(formatted);
    setCopiedFeed(true);
    setTimeout(() => setCopiedFeed(false), 2200);
  };

  const handleCallCallerInStudio = (caller) => {
    setCallerName(caller.name);
    setCallerPhone(caller.phone);
    setCallerEmail(caller.email || "");
    setIsNewCallerMode(false);
    const targetMode = caller.registered_mode || caller.last_mode;
    if (targetMode && MODES_CONFIG[targetMode]) {
      setActiveMode(targetMode);
      setCallerRegisteredMode(targetMode);
    }
    setActiveTab("studio");
    setKiraStatus(`Ready to connect with ${caller.name} (${targetMode || activeMode} Desk).`);
  };

  // ----------------------------------------------------
  // 5D. NOTIFICATION SETTINGS & EXECUTIVE EXPORTS
  // ----------------------------------------------------
  const handleSaveNotificationSettings = async (e) => {
    e?.preventDefault();
    try {
      const res = await fetch(`${BACKEND_URL}/settings/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifSettings)
      });
      if (res.ok) {
        setNotifSavedMsg("Alert configuration saved!");
        setTimeout(() => setNotifSavedMsg(""), 3500);
      }
    } catch (e) {
      console.error("Save notif error", e);
    }
  };

  const handleSendTestAlert = async () => {
    setNotifTesting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/settings/notifications/test`, { method: "POST" });
      if (res.ok) {
        setNotifSavedMsg("Test alert dispatched! Check your webhook or Telegram.");
        setTimeout(() => setNotifSavedMsg(""), 4000);
      }
    } catch (e) {
      console.error("Test alert error", e);
    } finally {
      setNotifTesting(false);
    }
  };

  const handleCopyNotionBrief = async (callId) => {
    try {
      const res = await fetch(`${BACKEND_URL}/export/calls/${callId}/markdown`);
      if (res.ok) {
        const d = await res.json();
        navigator.clipboard.writeText(d.markdown);
        setCopiedNotionId(callId);
        setTimeout(() => setCopiedNotionId(null), 2500);
      }
    } catch (e) {
      console.error("Copy Notion error", e);
    }
  };

  const handleExportCSV = () => {
    window.open(`${BACKEND_URL}/export/calls/csv?mode=${recordsModeFilter}`, "_blank");
  };

  // ----------------------------------------------------
  // 6. ASK KIRA (AI QUERY ASSISTANT + VOICE OUTPUT)
  // ----------------------------------------------------
  const handleAskKira = async (queryToAsk) => {
    const q = queryToAsk || askQuestion;
    if (!q.trim()) return;

    setIsAsking(true);
    setAskAnswer("");
    setAskAudioBase64("");
    stopVoiceAudio();

    try {
      const res = await fetch(`${BACKEND_URL}/assistant/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, mode: activeMode })
      });

      if (!res.ok) throw new Error("Ask KIRA request failed");

      const data = await res.json();
      setAskAnswer(data.answer);
      setAskAudioBase64(data.audio_base64 || "");
      setIsAsking(false);

      // Auto-play voice briefing for hands-free listening
      if (data.audio_base64 && autoPlayVoice) {
        playVoiceAudio(data.audio_base64);
      }
    } catch (err) {
      console.error("Ask KIRA error:", err);
      setAskAnswer("KIRA encountered an issue querying call records. Please try again.");
      setIsAsking(false);
    }
  };

  // ----------------------------------------------------
  // MODE-AWARE FILTER CALCULATIONS FOR ALL TABS
  // ----------------------------------------------------
  const effectiveDashboardMode = dashboardModeFilter === "auto" ? activeMode : dashboardModeFilter;
  const effectiveRecordsMode = recordsModeFilter === "auto" ? activeMode : recordsModeFilter;
  const effectiveActionsMode = actionsModeFilter === "auto" ? activeMode : actionsModeFilter;
  const effectiveCallersMode = callersModeFilter === "auto" ? activeMode : callersModeFilter;

  // 1. Dashboard Metrics (Mode-specific or All)
  const dashboardCalls = effectiveDashboardMode === "all"
    ? callsList
    : callsList.filter((c) => c.mode === effectiveDashboardMode);

  const dashboardActions = effectiveDashboardMode === "all"
    ? actionsList
    : actionsList.filter((a) => a.call_mode === effectiveDashboardMode);

  const dashboardCallers = effectiveDashboardMode === "all"
    ? callersList
    : callersList.filter(
        (c) => (c.modes && c.modes.includes(effectiveDashboardMode)) || c.last_mode === effectiveDashboardMode
      );

  const dashboardHighUrgencyCount = dashboardCalls.filter((c) => c.summary?.urgency === "high").length;
  const dashboardPendingActionsCount = dashboardActions.filter((a) => !a.is_completed).length;
  const dashboardCompletedCount = dashboardCalls.filter((c) => c.status === "completed").length;
  const dashboardScreenedCount = dashboardCalls.filter((c) => c.summary || c.status === "completed").length;

  const dashboardTypeBreakdown = {};
  dashboardCalls.forEach((c) => {
    const t = c.call_type || "General Inquiry";
    dashboardTypeBreakdown[t] = (dashboardTypeBreakdown[t] || 0) + 1;
  });

  const dashboardUrgentCalls = dashboardCalls.filter(
    (c) => c.summary && (c.summary.urgency === "high" || c.summary.urgency === "medium")
  );

  // 2. Filtered Calls (Calls & Transcripts Tab)
  const filteredCalls = callsList.filter((c) => {
    if (effectiveRecordsMode !== "all" && c.mode !== effectiveRecordsMode) {
      return false;
    }
    if (urgencyFilter !== "all") {
      if (urgencyFilter === "spam") {
        if (!c.is_spam && c.call_type !== "Spam / Robocall") return false;
      } else {
        if (!c.summary || c.summary.urgency !== urgencyFilter) return false;
      }
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.caller?.name?.toLowerCase().includes(q);
      const matchPurpose = c.purpose?.toLowerCase().includes(q);
      const matchSummary = c.summary?.summary?.toLowerCase().includes(q);
      const matchType = c.call_type?.toLowerCase().includes(q);
      if (!matchName && !matchPurpose && !matchSummary && !matchType) return false;
    }
    return true;
  });

  // 3. Filtered Actions (Action Center Tab)
  const filteredActions = actionsList.filter((a) => {
    if (effectiveActionsMode !== "all" && a.call_mode !== effectiveActionsMode) {
      return false;
    }
    if (actionStatusFilter === "pending" && a.is_completed) return false;
    if (actionStatusFilter === "completed" && !a.is_completed) return false;
    if (actionStatusFilter === "urgent" && a.urgency !== "high") return false;
    return true;
  });

  // 4. Filtered Callers (Memory Tab)
  const filteredCallers = callersList.filter((c) => {
    if (vipOnlyFilter && !c.is_vip) return false;
    if (effectiveCallersMode !== "all") {
      const matchRegistered = c.registered_mode === effectiveCallersMode;
      const matchModes = c.modes && c.modes.includes(effectiveCallersMode);
      const matchLast = c.last_mode === effectiveCallersMode;
      if (!matchRegistered && !matchModes && !matchLast) return false;
    }
    return true;
  });

  // ==================================================
  // AUTHENTICATION MODAL RENDERER
  // ==================================================
  const renderAuthModal = () => {
    if (!showAuthModal) return null;
    return (
      <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
        <div className="auth-card" onClick={(e) => e.stopPropagation()}>
          <div className="auth-header">
            <h3>{authTab === "login" ? "Sign In to KIRA" : "Create Host Account"}</h3>
            <button
              type="button"
              className="btn-modal-close"
              onClick={() => setShowAuthModal(false)}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="auth-tabs-row">
            <button
              type="button"
              className={`auth-tab-btn ${authTab === "login" ? "active" : ""}`}
              onClick={() => {
                setAuthTab("login");
                setAuthError("");
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${authTab === "register" ? "active" : ""}`}
              onClick={() => {
                setAuthTab("register");
                setAuthError("");
              }}
            >
              Register
            </button>
          </div>

          {authError && (
            <div className="auth-error-banner">
              <AlertCircle size={14} />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {authTab === "register" && (
              <div className="form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Keerthana Sangam"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="keerthana@kira.ai"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-submit-action"
              style={{ width: "100%", marginTop: "4px" }}
              disabled={authLoading}
            >
              {authLoading ? "Authenticating..." : authTab === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <button
            type="button"
            className="btn-demo-login"
            onClick={handleDemoLogin}
            disabled={authLoading}
          >
            <span>⚡ Quick Demo: Sign in as Keerthana Sangam</span>
          </button>
        </div>
      </div>
    );
  };

  // ==================================================
  // IN-CALL ACTION DISPATCHER MODAL RENDERER
  // ==================================================
  const renderActionDispatcherModal = () => {
    if (!showActionDispatcherModal) return null;

    const snippetList = Object.values(actionSnippets).length > 0
      ? Object.values(actionSnippets)
      : [
          {
            id: "delivery_directions",
            title: "Delivery Gate & Flat Address",
            channel: "WhatsApp",
            template: "📍 Delivery Instructions: Gate 2 landmark, Block B, Flat 402, Green Heights. Please leave parcel with security desk or at doorstep. PIN: 402.",
            announcement: "I have just dispatched a WhatsApp message with the exact gate directions and flat number to your phone. Please leave the package at the doorstep.",
            triggers: ["delivery", "address", "flat", "gate", "package", "swiggy", "amazon"]
          },
          {
            id: "resume_portfolio",
            title: "Portfolio & Resume Links",
            channel: "SMS",
            template: "📄 Keerthana Sangam | Full-Stack & Voice AI Engineer\nPortfolio: https://github.com/keerthanasangam\nResume: https://kira.ai/cv/keerthana\nOpen to Full-Stack / AI opportunities.",
            announcement: "Certainly! I have just dispatched an SMS to your number with Keerthana's resume and live portfolio links.",
            triggers: ["resume", "cv", "portfolio", "github", "hiring", "interview"]
          },
          {
            id: "meeting_booking",
            title: "Calendly / Meeting Booking Link",
            channel: "WhatsApp",
            template: "📅 Schedule a 15-min discovery call with Keerthana: https://cal.com/keerthana/15min. Pick a time slot that suits you best!",
            announcement: "I have just sent you a WhatsApp link to reserve a 15-minute slot directly on Keerthana's calendar.",
            triggers: ["meeting", "schedule", "call", "appointment", "calendar"]
          },
          {
            id: "store_pricing_catalog",
            title: "Store Catalog, Pricing & UPI",
            channel: "WhatsApp",
            template: "🏬 Keerthana Studio Services & Pricing:\nCatalog: https://kira.ai/catalog\nBase rate: ₹2,500/hr ($40/hr)\nUPI ID: keerthana@okaxis\nWhatsApp Support: +91 98765 43210",
            announcement: "I have just dispatched our complete service catalog, pricing tiers, and WhatsApp contact to your phone.",
            triggers: ["price", "pricing", "catalog", "rate", "quote", "cost", "upi"]
          }
        ];

    return (
      <div className="analysis-overlay" onClick={() => setShowActionDispatcherModal(false)}>
        <div className="action-dispatcher-modal" onClick={(e) => e.stopPropagation()}>
          <div className="action-dispatcher-header">
            <div className="dispatcher-header-left">
              <div className="dispatcher-icon-orb">
                <Zap size={22} color="#f59e0b" />
              </div>
              <div>
                <div className="dispatcher-badge-row">
                  <span className="dispatcher-tag">Autonomous In-Call Tool</span>
                  <span className="dispatcher-carrier-tag">Twilio SMS & WhatsApp Gateway</span>
                </div>
                <h3>In-Call Action Dispatcher Center</h3>
                <p>When callers ask for your address, resume, or a calendar booking, KIRA automatically dispatches real-time WhatsApp & SMS messages during the call.</p>
              </div>
            </div>
            <button
              type="button"
              className="btn-close-mini"
              onClick={() => setShowActionDispatcherModal(false)}
            >
              ✕
            </button>
          </div>

          <div className="action-dispatcher-body">
            {/* Quick Test Dispatch Panel */}
            <div className="test-dispatch-card">
              <h4>⚡ Send Instant Test Dispatch (Verify Delivery)</h4>
              <p>Test sending any quick-action snippet directly to your phone number right now.</p>
              <div className="test-dispatch-row">
                <div className="field-group">
                  <label>Snippet to Dispatch</label>
                  <select
                    value={testDispatchKey}
                    onChange={(e) => setTestDispatchKey(e.target.value)}
                  >
                    {snippetList.map((sn) => (
                      <option key={sn.id} value={sn.id}>
                        {sn.channel === "WhatsApp" ? "💬" : "✉️"} {sn.title} ({sn.channel})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-group">
                  <label>Recipient Phone Number</label>
                  <input
                    type="text"
                    value={testDispatchPhone}
                    onChange={(e) => setTestDispatchPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <button
                  type="button"
                  className="btn-trigger-dispatch"
                  onClick={handleTriggerTestDispatch}
                  disabled={isTestDispatching}
                >
                  <Send size={14} />
                  <span>{isTestDispatching ? "Dispatching..." : "Send Live Dispatch"}</span>
                </button>
              </div>
              {testDispatchMsg && (
                <div className="dispatch-success-banner">
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>{testDispatchMsg}</span>
                </div>
              )}
            </div>

            {/* Active Action Snippets Grid */}
            <div className="snippets-grid-header">
              <h4>Active In-Call Action Templates</h4>
              <span className="snippets-count">{snippetList.length} Tools Ready</span>
            </div>

            <div className="snippets-grid">
              {snippetList.map((sn) => (
                <div key={sn.id} className="snippet-card">
                  <div className="snippet-card-header">
                    <span className={`snippet-channel-pill ${sn.channel?.toLowerCase()}`}>
                      {sn.channel === "WhatsApp" ? "💬 WhatsApp" : "✉️ SMS"}
                    </span>
                    <span className="snippet-trigger-badge">
                      Triggers: {sn.triggers?.slice(0, 3).join(", ")}...
                    </span>
                  </div>
                  <strong className="snippet-title">{sn.title}</strong>
                  <div className="snippet-preview-box">
                    <pre>{sn.template}</pre>
                  </div>
                  <div className="snippet-announcement">
                    <span>KIRA Spoken Announcement:</span>
                    <p>&quot;{sn.announcement}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="action-dispatcher-footer">
            <span className="footer-status-pill">
              <span className="green-dot" /> Autonomous Tool Calling Active in Live Voice & Telephony
            </span>
            <button
              type="button"
              className="btn-cancel-action"
              onClick={() => setShowActionDispatcherModal(false)}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================================================
  // CARRIER & OEM EXECUTIVE PITCH DECK MODAL RENDERER
  // ==================================================
  const renderPitchDeckModal = () => {
    if (!showPitchDeckModal) return null;
    return (
      <div className="analysis-overlay pitchdeck-overlay" onClick={() => setShowPitchDeckModal(false)}>
        <div className="pitchdeck-modal-container" onClick={(e) => e.stopPropagation()}>
          
          {/* Modal Header */}
          <div className="pitchdeck-modal-header">
            <div className="pitchdeck-header-left">
              <div className="pitchdeck-badge-row">
                <span className="pitchdeck-badge-pill">B2B STRATEGY & ARCHITECTURE</span>
                <span className="pitchdeck-badge-carrier">MNO & OEM DEPLOYMENT</span>
              </div>
              <h2>KIRA: The Autonomous Telecom Voice Gateway</h2>
              <p>Modernizing legacy voicemail into an active conversational revenue engine for 450M+ subscribers.</p>
            </div>
            <button
              type="button"
              className="btn-close-mini pitchdeck-close-btn"
              onClick={() => setShowPitchDeckModal(false)}
              title="Close Pitch Deck"
            >
              ✕
            </button>
          </div>

          {/* Stepper Tabs Bar */}
          <div className="pitchdeck-tabs-bar">
            {[
              { id: 0, label: "1. $12B Crisis", icon: AlertCircle, subtitle: "Market Opportunity" },
              { id: 1, label: "2. IMS & NPU Core", icon: Server, subtitle: "Network Architecture" },
              { id: 2, label: "3. ARPU Engine", icon: Coins, subtitle: "₹1,336 Cr Projection" },
              { id: 3, label: "4. TRAI & Privacy", icon: ShieldCheck, subtitle: "Data Sovereignty" },
              { id: 4, label: "5. Executive Brief", icon: FileText, subtitle: "Export & POC" }
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = pitchDeckActiveSlide === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`pitchdeck-tab-btn ${isActive ? "active" : ""}`}
                  onClick={() => setPitchDeckActiveSlide(tab.id)}
                >
                  <div className="tab-icon-wrap">
                    <TabIcon size={16} />
                  </div>
                  <div className="tab-text-wrap">
                    <span className="tab-title">{tab.label}</span>
                    <span className="tab-sub">{tab.subtitle}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Slide Body */}
          <div className="pitchdeck-slide-viewport">
            {/* SLIDE 0: Market Opportunity & The $12B Crisis */}
            {pitchDeckActiveSlide === 0 && (
              <div className="pitchdeck-slide slide-market">
                <div className="slide-hero-banner">
                  <div className="slide-hero-tag">THE PROBLEM SPACE</div>
                  <h3>The 100-Year-Old Voicemail Paradigm is Fundamentally Broken</h3>
                  <p>
                    Subscribers are bombarded by 3.8+ Billion spam robocalls every month in India alone. When legitimate callers reach a traditional voicemail beep, over 88% hang up immediately. Carriers invest millions maintaining dead storage infrastructure while generating zero recurring revenue.
                  </p>
                </div>

                <div className="pitchdeck-metrics-grid">
                  <div className="pitch-metric-card stat-danger">
                    <div className="metric-val">88%</div>
                    <div className="metric-lbl">Voicemail Abandonment</div>
                    <div className="metric-desc">Callers hang up at the audio beep rather than leaving a passive recording.</div>
                  </div>
                  <div className="pitch-metric-card stat-warning">
                    <div className="metric-val">3.8 Billion</div>
                    <div className="metric-lbl">Spam & Scam Calls / Mo</div>
                    <div className="metric-desc">Persistent telemarketing and loan fraud causing subscribers to reject 65% of unknown calls.</div>
                  </div>
                  <div className="pitch-metric-card stat-success">
                    <div className="metric-val">₹1,000+ Cr</div>
                    <div className="metric-lbl">Untapped VAS Top-Line</div>
                    <div className="metric-desc">Opportunity for carriers (Jio / Airtel) to offer AI Caller Guardian as a premium ₹99/mo plan.</div>
                  </div>
                </div>

                <div className="pitch-comparison-grid">
                  <div className="comparison-col legacy">
                    <div className="col-header">
                      <span className="col-icon">❌</span>
                      <h4>Legacy Voicemail (Dead Audio)</h4>
                    </div>
                    <ul>
                      <li><strong>Passive Recording:</strong> Callers talk into dead air with zero interactive feedback.</li>
                      <li><strong>Zero Live Visibility:</strong> Subscriber has no idea who called until checking audio hours later.</li>
                      <li><strong>Spam Penetration:</strong> Robocalls leave silent or fraudulent audio recordings unchecked.</li>
                      <li><strong>Zero Carrier ARPU:</strong> Inert commodity feature with zero user engagement.</li>
                    </ul>
                  </div>

                  <div className="comparison-col kira">
                    <div className="col-header">
                      <span className="col-icon">⚡</span>
                      <h4>KIRA Telecom Voice Gateway</h4>
                    </div>
                    <ul>
                      <li><strong>Conversational Interrogation:</strong> Empathetic, low-latency AI speaks immediately with caller.</li>
                      <li><strong>Real-Time Screen Transcription:</strong> Subscriber sees speech live as caller speaks.</li>
                      <li><strong>1-Tap Instant Takeover:</strong> Subscriber can pick up at any second or delegate follow-up.</li>
                      <li><strong>High-Margin ARPU:</strong> ₹99/mo recurring VAS revenue with proven subscriber stickiness.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 1: Dual-Tier Architecture */}
            {pitchDeckActiveSlide === 1 && (
              <div className="pitchdeck-slide slide-architecture">
                <div className="slide-hero-banner">
                  <div className="slide-hero-tag">DEPLOYMENT TOPOLOGY</div>
                  <h3>Dual-Tier Architecture: Telco IMS Core vs. On-Device NPU</h3>
                  <p>
                    KIRA offers a hybrid deployment model: a Carrier IMS core for zero-install universal reach (Jio, Airtel, Vi), paired with an OEM Dialer integration for flagship silicon (Samsung Galaxy AI, Apple CallKit).
                  </p>
                </div>

                <div className="arch-dual-container">
                  {/* Tier 1: Carrier IMS Core */}
                  <div className="arch-tier-box">
                    <div className="tier-header">
                      <div className="tier-badge-wrap">
                        <Server size={18} color="#60a5fa" />
                        <span className="tier-badge">TIER 1: CARRIER NETWORK CORE (IMS / 5G VoNR)</span>
                      </div>
                      <h4>Universal Zero-Install Operator Deployment</h4>
                      <p>Works automatically on 100% of network subscribers—including 4G/5G feature phones—via SIP trunking.</p>
                    </div>

                    <div className="arch-flow-steps">
                      <div className="flow-step-node">
                        <span className="node-num">1</span>
                        <div className="node-info">
                          <strong>Incoming PSTN / VoNR Call</strong>
                          <span>Routed to Carrier Session Border Controller (SBC)</span>
                        </div>
                      </div>
                      <div className="flow-arrow-down">↓</div>
                      <div className="flow-step-node">
                        <span className="node-num">2</span>
                        <div className="node-info">
                          <strong>KIRA SIP Gateway & Media Server</strong>
                          <span>Sub-50ms RTP media packet buffering & WebRTC transcoding</span>
                        </div>
                      </div>
                      <div className="flow-arrow-down">↓</div>
                      <div className="flow-step-node">
                        <span className="node-num">3</span>
                        <div className="node-info">
                          <strong>Groq Whisper ASR + Low-Latency LLM Router</strong>
                          <span>&lt;150ms speech-to-text + &lt;250ms TTFT domain routing</span>
                        </div>
                      </div>
                      <div className="flow-arrow-down">↓</div>
                      <div className="flow-step-node highlight">
                        <span className="node-num">4</span>
                        <div className="node-info">
                          <strong>Multilingual Audio Synthesis & RTP Return</strong>
                          <span>&lt;550ms total conversational turn-around back to caller ear</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tier 2: OEM Handset */}
                  <div className="arch-tier-box">
                    <div className="tier-header">
                      <div className="tier-badge-wrap">
                        <Cpu size={18} color="#a78bfa" />
                        <span className="tier-badge oem">TIER 2: OEM HANDSET & NPU INTEGRATION</span>
                      </div>
                      <h4>Native Dialer Integration (Samsung & Apple)</h4>
                      <p>Deep hardware-accelerated integration into OneUI Phone and iOS CallKit frameworks.</p>
                    </div>

                    <div className="arch-flow-steps">
                      <div className="flow-step-node">
                        <span className="node-num">1</span>
                        <div className="node-info">
                          <strong>Native Phone Call Notification</strong>
                          <span>Screening button embedded directly in incoming call HUD</span>
                        </div>
                      </div>
                      <div className="flow-arrow-down">↓</div>
                      <div className="flow-step-node">
                        <span className="node-num">2</span>
                        <div className="node-info">
                          <strong>On-Device NPU Biometric Triage</strong>
                          <span>Local 1.5B SLM matches caller voice against subscriber VIP contacts</span>
                        </div>
                      </div>
                      <div className="flow-arrow-down">↓</div>
                      <div className="flow-step-node">
                        <span className="node-num">3</span>
                        <div className="node-info">
                          <strong>Live Lock-Screen Transcription</strong>
                          <span>Bi-directional streaming text via local WebSocket connection</span>
                        </div>
                      </div>
                      <div className="flow-arrow-down">↓</div>
                      <div className="flow-step-node highlight">
                        <span className="node-num">4</span>
                        <div className="node-info">
                          <strong>1-Tap Live Intercept or Task Extraction</strong>
                          <span>Zero-latency call pickup or automatic WhatsApp / Calendar sync</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="arch-specs-footer">
                  <div className="spec-pill"><strong>Protocol:</strong> SIP (RFC 3261) & WebRTC</div>
                  <div className="spec-pill"><strong>Turnaround:</strong> &lt; 550ms Conversational Latency</div>
                  <div className="spec-pill"><strong>Scale:</strong> 100,000+ Concurrent Channels</div>
                  <div className="spec-pill"><strong>Reliability:</strong> 99.999% Telecom Five-Nines</div>
                </div>
              </div>
            )}

            {/* SLIDE 2: Telco Monetization & Dynamic ARPU Calculator */}
            {pitchDeckActiveSlide === 2 && (
              <div className="pitchdeck-slide slide-calculator">
                <div className="slide-hero-banner">
                  <div className="slide-hero-tag">TELCO REVENUE MODEL</div>
                  <h3>Interactive ARPU & Recurring Revenue Calculator</h3>
                  <p>
                    Simulate subscriber adoption and recurring VAS top-line across India's tier-1 carrier networks (450 Million base, e.g., Reliance Jio or Bharti Airtel).
                  </p>
                </div>

                <div className="calculator-layout-grid">
                  {/* Controls Column */}
                  <div className="calc-controls-card">
                    <div className="calc-group">
                      <div className="calc-label-row">
                        <label>Subscriber Adoption Rate</label>
                        <span className="calc-slider-val">{pitchCalculatorAdoption}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="10.0"
                        step="0.5"
                        value={pitchCalculatorAdoption}
                        onChange={(e) => setPitchCalculatorAdoption(parseFloat(e.target.value))}
                        className="pitch-slider"
                      />
                      <div className="calc-range-hints">
                        <span>0.5% (Early Adopters)</span>
                        <span>2.5% (Target)</span>
                        <span>10.0% (Mass Market)</span>
                      </div>
                    </div>

                    <div className="calc-group" style={{ marginTop: "24px" }}>
                      <div className="calc-label-row">
                        <label>Monthly VAS Subscription Fee</label>
                        <span className="calc-slider-val">₹{pitchPricePerMonth} / mo</span>
                      </div>
                      <div className="calc-price-presets">
                        {[49, 79, 99, 149].map((price) => (
                          <button
                            key={price}
                            type="button"
                            className={`price-preset-btn ${pitchPricePerMonth === price ? "active" : ""}`}
                            onClick={() => setPitchPricePerMonth(price)}
                          >
                            ₹{price}/mo
                          </button>
                        ))}
                      </div>
                      <p className="price-hint">Recommended: ₹99/mo (standard Indian VAS price point with high conversion).</p>
                    </div>

                    <div className="calc-assumptions-box">
                      <h5>📋 Network Assumptions:</h5>
                      <ul>
                        <li>Carrier Subscriber Base: <strong>450,000,000</strong></li>
                        <li>Billing Method: Direct Carrier Billing (Prepaid deduction / Postpaid bill)</li>
                        <li>Zero Customer Acquisition Cost (CAC) via native SMS & dialer upsell prompts</li>
                      </ul>
                    </div>
                  </div>

                  {/* Calculated Results Column */}
                  <div className="calc-results-card">
                    <div className="results-header">
                      <TrendingUp size={18} color="#10b981" />
                      <h4>Projected Annual Top-Line</h4>
                    </div>

                    <div className="results-metrics-grid">
                      <div className="res-card highlight-green">
                        <div className="res-title">ANNUAL RECURRING REVENUE (ARR)</div>
                        <div className="res-number">
                          ₹{(((450 * pitchCalculatorAdoption / 100) * pitchPricePerMonth) * 12).toFixed(1)} Cr
                        </div>
                        <div className="res-usd">
                          ~${((((450 * pitchCalculatorAdoption / 100) * pitchPricePerMonth) * 12) / 83.5).toFixed(0)}M USD / Year
                        </div>
                      </div>

                      <div className="res-card">
                        <div className="res-title">MONTHLY RECURRING REVENUE (MRR)</div>
                        <div className="res-number">
                          ₹{((450 * pitchCalculatorAdoption / 100) * pitchPricePerMonth).toFixed(1)} Cr
                        </div>
                        <div className="res-sub">Across {((450 * pitchCalculatorAdoption) / 100).toFixed(2)}M Active Subscribers</div>
                      </div>

                      <div className="res-card">
                        <div className="res-title">CARRIER NET SHARE (70%)</div>
                        <div className="res-number">
                          ₹{((((450 * pitchCalculatorAdoption / 100) * pitchPricePerMonth) * 12) * 0.7).toFixed(1)} Cr / yr
                        </div>
                        <div className="res-sub">Pure high-margin operating profit</div>
                      </div>

                      <div className="res-card">
                        <div className="res-title">CHURN REDUCTION IMPACT</div>
                        <div className="res-number">-14.2%</div>
                        <div className="res-sub">Lower churn on high-ARPU post-paid plans</div>
                      </div>
                    </div>

                    <div className="b2b-upsell-banner">
                      <Briefcase size={16} color="#fbbf24" />
                      <div>
                        <strong>Enterprise Fleet Expansion:</strong> Upsell enterprise SIM pools at ₹299/seat/mo with automated CRM & Salesforce synchronization (+₹450 Cr ARR potential).
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 3: Telecom Privacy & TRAI Compliance */}
            {pitchDeckActiveSlide === 3 && (
              <div className="pitchdeck-slide slide-privacy">
                <div className="slide-hero-banner">
                  <div className="slide-hero-tag">SECURITY & SOVEREIGNTY</div>
                  <h3>Regulatory Compliance, TRAI Integration & Data Residency</h3>
                  <p>
                    KIRA meets the stringent security standards mandated by the Department of Telecommunications (DoT), Telecom Regulatory Authority of India (TRAI), and the Digital Personal Data Protection (DPDP) Act 2023.
                  </p>
                </div>

                <div className="privacy-pillars-grid">
                  <div className="pillar-card">
                    <div className="pillar-icon-box" style={{ background: "rgba(99, 102, 241, 0.15)", borderColor: "rgba(99, 102, 241, 0.3)" }}>
                      <ShieldCheck size={22} color="#818cf8" />
                    </div>
                    <h4>TRAI & UCC Registry Compliance</h4>
                    <p>
                      Direct integration with India's Unsolicited Commercial Communication (UCC) database. Calls originating from non-compliant telemarketing entities (140-series prefixes) are automatically flagged, triaged, and reported to the national DND registry.
                    </p>
                    <div className="pillar-badge">DoT & TRAI Aligned</div>
                  </div>

                  <div className="pillar-card">
                    <div className="pillar-icon-box" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                      <Globe size={22} color="#34d399" />
                    </div>
                    <h4>DPDP Act 2023 Sovereign Residency</h4>
                    <p>
                      Zero cross-border telemetry egress. All audio streams, transcriptions, and embeddings are processed strictly within Indian sovereign borders using MeitY-empaneled data centers (AWS Mumbai, Azure Pune, or on-premise Jio Cloud).
                    </p>
                    <div className="pillar-badge">100% Data Sovereignty</div>
                  </div>

                  <div className="pillar-card">
                    <div className="pillar-icon-box" style={{ background: "rgba(245, 158, 11, 0.15)", borderColor: "rgba(245, 158, 11, 0.3)" }}>
                      <Lock size={22} color="#fbbf24" />
                    </div>
                    <h4>Real-Time PII & PCI-DSS Scrubber</h4>
                    <p>
                      Automated neural filters detect and redact sensitive customer credentials in real time. One-Time Passwords (OTPs), bank account numbers, CVVs, and Aadhaar identifiers are masked before any transcript is stored or displayed.
                    </p>
                    <div className="pillar-badge">PCI-DSS Level 1 Ready</div>
                  </div>

                  <div className="pillar-card">
                    <div className="pillar-icon-box" style={{ background: "rgba(236, 72, 153, 0.15)", borderColor: "rgba(236, 72, 153, 0.3)" }}>
                      <Server size={22} color="#f472b6" />
                    </div>
                    <h4>Carrier-Grade "Five Nines" SLA</h4>
                    <p>
                      Architected for 99.999% availability with multi-region active-active failover, stateless SIP ingress pods, and sub-50ms automated media server health recovery, satisfying tier-1 telecom service-level agreements.
                    </p>
                    <div className="pillar-badge">99.999% Uptime Guarantee</div>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: Executive Pitch Brief */}
            {pitchDeckActiveSlide === 4 && (
              <div className="pitchdeck-slide slide-brief">
                <div className="slide-hero-banner">
                  <div className="slide-hero-tag">EXECUTIVE SUMMARY</div>
                  <h3>Ready-to-Present Executive Brief</h3>
                  <p>
                    A concise strategic proposal for executive briefings with Chief Product Officers, Heads of VAS, and OEM Engineering VPs. Copy or download this brief for immediate partnership discussions.
                  </p>
                </div>

                <div className="pitch-actions-toolbar">
                  <button
                    type="button"
                    className="btn-pitch-action primary"
                    onClick={handleCopyPitchBrief}
                  >
                    {copiedPitchBrief ? (
                      <>
                        <CheckCircle2 size={16} color="#4ade80" />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={16} />
                        <span>Copy Executive Brief</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn-pitch-action secondary"
                    onClick={handleDownloadPitchBrief}
                  >
                    <FileDown size={16} />
                    <span>Download Brief (.md)</span>
                  </button>

                  <a
                    href="mailto:founders@kira-voice.ai?subject=KIRA%20Carrier%20%26%20OEM%20POC%20Inquiry"
                    className="btn-pitch-action outline"
                  >
                    <Mail size={16} />
                    <span>Schedule POC Meeting</span>
                  </a>
                </div>

                <div className="pitch-brief-preview-box">
                  <div className="brief-preview-header">
                    <div className="window-dots">
                      <span className="dot red" />
                      <span className="dot yellow" />
                      <span className="dot green" />
                    </div>
                    <span className="brief-filename">KIRA_Carrier_Executive_Brief.md</span>
                    <span className="brief-badge">LIVE SIMULATED VALUES</span>
                  </div>
                  <pre className="brief-pre-code">
                    {generatePitchBriefText()}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Modal Navigation Footer */}
          <div className="pitchdeck-modal-footer">
            <div className="footer-slide-dots">
              {[0, 1, 2, 3, 4].map((idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`slide-dot ${pitchDeckActiveSlide === idx ? "active" : ""}`}
                  onClick={() => setPitchDeckActiveSlide(idx)}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="footer-nav-buttons">
              {pitchDeckActiveSlide > 0 && (
                <button
                  type="button"
                  className="btn-pitch-prev"
                  onClick={() => setPitchDeckActiveSlide((prev) => Math.max(0, prev - 1))}
                >
                  ← Previous
                </button>
              )}

              {pitchDeckActiveSlide < 4 ? (
                <button
                  type="button"
                  className="btn-pitch-next"
                  onClick={() => setPitchDeckActiveSlide((prev) => Math.min(4, prev + 1))}
                >
                  <span>Next Slide</span>
                  <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-pitch-finish"
                  onClick={() => setShowPitchDeckModal(false)}
                >
                  <span>Close Pitch Deck</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  // ==================================================
  // LANDING PAGE RENDERER
  // ==================================================
  const renderLandingPage = () => {
    return (
      <div className="landing-wrapper">
        {/* Landing Navbar */}
        <header className="landing-navbar">
          <div className="kira-brand" onClick={() => setAppStage("landing")}>
            <div className="brand-orb">K</div>
            <div className="brand-info">
              <div className="brand-title-row">
                <h1>KIRA</h1>
              </div>
              <span className="brand-subtag">AI Communication Layer</span>
            </div>
          </div>

          <div className="landing-nav-links">
            <button
              type="button"
              className="landing-nav-link"
              onClick={() => {
                const el = document.getElementById("landing-desks");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Desks & Personas
            </button>
            <button
              type="button"
              className="landing-nav-link"
              onClick={() => {
                const el = document.getElementById("landing-features");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Capabilities
            </button>
            {currentUser && (
              <button
                type="button"
                className="landing-nav-link"
                style={{ color: "#a5b4fc", fontWeight: 600 }}
                onClick={() => setAppStage("dashboard")}
              >
                Go to Dashboard →
              </button>
            )}
          </div>

          <div className="landing-nav-actions">
            <button
              type="button"
              className="btn-nav-pitchdeck"
              title="Carrier & OEM Strategic Pitch Deck"
              onClick={() => {
                setPitchDeckActiveSlide(0);
                setShowPitchDeckModal(true);
              }}
            >
              <Briefcase size={13} />
              <span>Carrier & OEM Pitch</span>
              <span className="pitch-nav-badge">B2B</span>
            </button>

            {currentUser ? (
              <div className="user-profile-pill" style={{ margin: 0 }}>
                <span className="user-avatar-dot">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "K"}
                </span>
                <span className="user-name-text">{currentUser.name}</span>
                <button
                  type="button"
                  className="btn-logout-mini"
                  title="Sign Out"
                  onClick={handleLogout}
                >
                  <LogOut size={12} />
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-landing-secondary"
                  style={{ padding: "8px 18px", fontSize: "13px" }}
                  onClick={() => {
                    setAuthTab("login");
                    setShowAuthModal(true);
                  }}
                >
                  <LogIn size={13} />
                  <span>Sign In</span>
                </button>
                <button
                  type="button"
                  className="btn-landing-primary"
                  style={{ padding: "8px 20px", fontSize: "13px" }}
                  onClick={() => {
                    setAuthTab("register");
                    setShowAuthModal(true);
                  }}
                >
                  <span>Get Started</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="landing-hero">
          <div className="landing-badge-pill">
            <span className="pill-dot" />
            <span>KIRA 2.0 • Autonomous AI Voice Communication Layer</span>
          </div>

          <h1 className="landing-headline">
            KIRA<br />
            <span className="landing-headline-gradient">Your AI Communication Agent</span>
          </h1>

          <p className="landing-subheadline">
            Never miss an important call. Let KIRA screen conversations, understand intent, capture important details, and turn calls into actionable follow-ups.
          </p>

          {/* Streamlined Live Trial Call-to-Action Card */}
          <div className="landing-auth-hero-card">
            {!currentUser ? (
              <>
                <div className="auth-hero-badge">
                  <Sparkles size={13} />
                  <span>FREE INTERACTIVE TRIAL</span>
                </div>
                <h3>Experience KIRA's Live Voice Screening in 30 Seconds</h3>
                <p>
                  Sign up or use 1-Click Demo to unlock all 6 interactive cellular screening scenarios and speak live with your microphone.
                </p>
                <div className="auth-hero-buttons">
                  <button
                    type="button"
                    className="btn-hero-instant-demo"
                    onClick={handleDemoLogin}
                    disabled={authLoading}
                  >
                    <Zap size={15} />
                    <span>⚡ 1-Click Instant Demo</span>
                  </button>
                  <button
                    type="button"
                    className="btn-hero-register"
                    onClick={() => {
                      setAuthTab("register");
                      setShowAuthModal(true);
                    }}
                  >
                    <UserPlus size={15} />
                    <span>Create Free Account</span>
                  </button>
                  <button
                    type="button"
                    className="btn-hero-signin"
                    onClick={() => {
                      setAuthTab("login");
                      setShowAuthModal(true);
                    }}
                  >
                    <LogIn size={14} />
                    <span>Sign In</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="auth-hero-badge active">
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>TRIAL ACCOUNT UNLOCKED • {currentUser.name}</span>
                </div>
                <h3>Your Voice Screening Trial is Active</h3>
                <p>
                  Screen incoming calls live in the interactive smartphone simulator below, or launch your full host cockpit.
                </p>
                <div className="auth-hero-buttons">
                  <button
                    type="button"
                    className="btn-hero-trial-scroll"
                    onClick={() => {
                      const el = document.getElementById("landing-simulator");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <Smartphone size={15} />
                    <span>🎙️ Trial Simulator Calls Below</span>
                  </button>
                  <button
                    type="button"
                    className="btn-hero-dashboard"
                    onClick={() => setAppStage("dashboard")}
                  >
                    <LayoutDashboard size={15} />
                    <span>Launch Full Host Dashboard →</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Carrier-Grade Interactive Smartphone Call-Screening Simulator */}
        <section className="landing-simulator-section">
          <div className="simulator-section-header">
            <div className="carrier-grade-badge">
              <Zap size={14} color="#f59e0b" />
              <span>Carrier-Grade AI Telephony Architecture</span>
            </div>
            <h2>Interactive Smartphone Call-Screening Simulator</h2>
            <p>
              Experience how KIRA intercepts, screens, and transcribes incoming cellular calls in real time before your phone even rings.
            </p>

            {/* Scenario Picker Navigation */}
            <div className="simulator-scenario-nav">
              {Object.keys(SMARTPHONE_SCENARIOS).map((key) => {
                const s = SMARTPHONE_SCENARIOS[key];
                return (
                  <button
                    key={key}
                    type="button"
                    className={`scenario-nav-btn ${simScenario === key ? "active" : ""}`}
                    onClick={() => handleSelectScenario(key)}
                  >
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="simulator-grid-container">
            {/* The Smartphone Frame */}
            <div className="smartphone-showcase-column">
              <div className="smartphone-device">
                {/* Outer Glass Bezel & Metallic Frame */}
                <div className="phone-outer-frame">
                  {/* Speaker Ear-piece & Dynamic Island */}
                  <div className="phone-dynamic-island">
                    <div className="camera-lens" />
                    {simStatus === "screening" && (
                      <div className="island-active-indicator">
                        <span className="island-pulse" />
                        <span className="island-text">KIRA Live</span>
                      </div>
                    )}
                  </div>

                  {/* Top Status Bar */}
                  <div className="phone-status-bar">
                    <span className="status-time">9:41</span>
                    <div className="status-icons">
                      <span className="carrier-name">KIRA 5G</span>
                      <Wifi size={12} />
                      <Battery size={13} />
                    </div>
                  </div>

                  {/* Phone Screen Display */}
                  <div className="phone-screen-content">
                    {/* STATE 1: RINGING */}
                    {simStatus === "ringing" && (
                      <div className="phone-ringing-screen">
                        <div className="caller-incoming-header">
                          <span className="call-incoming-label">Incoming Cellular Call...</span>
                          <span className={`caller-badge-pill ${SMARTPHONE_SCENARIOS[simScenario]?.tagClass || "badge-friend"}`}>
                            {SMARTPHONE_SCENARIOS[simScenario]?.tag}
                          </span>
                        </div>

                        <div className="caller-avatar-hero" style={{ background: SMARTPHONE_SCENARIOS[simScenario]?.avatarBg }}>
                          <span>{SMARTPHONE_SCENARIOS[simScenario]?.name?.slice(0, 1) || "C"}</span>
                        </div>

                        <h3 className="caller-screen-name">{SMARTPHONE_SCENARIOS[simScenario]?.name}</h3>
                        <p className="caller-screen-sub">{SMARTPHONE_SCENARIOS[simScenario]?.role}</p>
                        <p className="caller-screen-phone">{SMARTPHONE_SCENARIOS[simScenario]?.phone}</p>

                        <div className="phone-actions-container">
                          {!currentUser ? (
                            <div
                              className="sim-trial-gate-banner"
                              onClick={() => {
                                setAuthTab("register");
                                setShowAuthModal(true);
                              }}
                            >
                              <Lock size={12} color="#f59e0b" />
                              <span>Free Trial: Sign In or 1-Click Demo to screen</span>
                            </div>
                          ) : (
                            <div className="sim-trial-active-banner">
                              <CheckCircle2 size={12} color="#10b981" />
                              <span>Trial Unlocked for {currentUser.name?.split(" ")[0]}</span>
                            </div>
                          )}

                          <div className="screen-with-kira-highlight">
                            <button
                              type="button"
                              className="btn-screen-kira-primary"
                              onClick={handleStartSimScreening}
                            >
                              <Sparkles size={16} />
                              <span>{simScenario === "live_caller" ? "🎙️ Screen & Speak Live" : "Screen with KIRA (AI)"}</span>
                            </button>
                            <span className="btn-screen-hint">
                              {simScenario === "live_caller" ? "Talk into your mic — KIRA screens you live" : "KIRA answers politely & takes notes"}
                            </span>
                          </div>

                          <div className="phone-standard-buttons-row">
                            <button
                              type="button"
                              className="phone-btn-round decline"
                              title="Decline Call"
                              onClick={handleSimDecline}
                            >
                              <PhoneOff size={18} />
                              <span>Decline</span>
                            </button>
                            <button
                              type="button"
                              className="phone-btn-round answer"
                              title="Answer Personally"
                              onClick={handleSimAnswerMyself}
                            >
                              <PhoneCall size={18} />
                              <span>Answer</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* STATE 2: SCREENING (LIVE VOICEMAIL / PIXEL SCREEN) */}
                    {simStatus === "screening" && (
                      <div className="phone-screening-screen">
                        <div className="screening-top-indicator">
                          <div className="screening-banner-left">
                            <span className="pulse-indicator-dot" />
                            <div>
                              <span className="screening-title">KIRA Live Screening</span>
                              <div className="screening-status-subrow">
                                <span className="screening-timer">{formatTimer(simTimer)}</span>
                                <span className={`screening-voice-indicator ${isVoicePlaying ? "is-speaking" : ""}`}>
                                  <Volume2 size={11} className={isVoicePlaying ? "voice-pulse" : ""} />
                                  <span>{isVoicePlaying ? "Speaking Live" : "Edge-TTS Active"}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className={`caller-badge-mini ${SMARTPHONE_SCENARIOS[simScenario]?.tagClass}`}>
                            {SMARTPHONE_SCENARIOS[simScenario]?.tag}
                          </span>
                        </div>

                        {/* Caller Info Micro Bar */}
                        <div className="screening-caller-micro">
                          <div className="micro-avatar" style={{ background: SMARTPHONE_SCENARIOS[simScenario]?.avatarBg }}>
                            {SMARTPHONE_SCENARIOS[simScenario]?.name?.slice(0, 1)}
                          </div>
                          <div>
                            <strong>{SMARTPHONE_SCENARIOS[simScenario]?.name}</strong>
                            <span>{SMARTPHONE_SCENARIOS[simScenario]?.phone}</span>
                          </div>
                        </div>

                        {/* In-Call Autonomous Action Dispatch Toast */}
                        {simActiveDispatch && (
                          <div className="in-call-dispatch-toast">
                            <div className="dispatch-toast-badge-row">
                              <span className={`dispatch-toast-pill ${simActiveDispatch.channel?.toLowerCase()}`}>
                                {simActiveDispatch.channel === "WhatsApp" ? "💬 WhatsApp Dispatched" : "✉️ SMS Dispatched"}
                              </span>
                              <span className="dispatch-toast-time">Just now • Delivered</span>
                            </div>
                            <div className="dispatch-toast-body">
                              <div className="dispatch-toast-bubble">
                                <p>{simActiveDispatch.preview || simActiveDispatch.content}</p>
                                <span className="dispatch-toast-meta">
                                  ✓ Sent to: {simActiveDispatch.recipient}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Soundwave Visualizer */}
                        <div className={`screening-waveform-container ${isVoicePlaying ? "is-speaking" : ""}`}>
                          <span className="wave-bar wb-1" />
                          <span className="wave-bar wb-2" />
                          <span className="wave-bar wb-3" />
                          <span className="wave-bar wb-4" />
                          <span className="wave-bar wb-5" />
                          <span className="wave-bar wb-6" />
                        </div>

                        {/* Live Transcription Feed */}
                        <div className="screening-live-transcript-feed">
                          {simMessages.length === 0 ? (
                            <div className="transcript-listening-state">
                              <BrainCircuit size={22} className="spinning" />
                              <p>Connecting voice pipeline & transcribing caller...</p>
                            </div>
                          ) : (
                            simMessages.map((msg, idx) => (
                              <div
                                key={idx}
                                className={`sim-bubble ${msg.speaker === "kira" ? "kira-bubble" : "caller-bubble"} ${msg.isDirective ? "directive-bubble" : ""}`}
                              >
                                <div className="sim-bubble-header">
                                  <span className="bubble-speaker-tag">
                                    {msg.speaker === "kira" ? "🤖 KIRA" : msg.name}
                                  </span>
                                  {msg.speaker === "kira" && (
                                    <button
                                      type="button"
                                      className="btn-sim-voice-replay"
                                      title="Click to hear KIRA's voice response"
                                      onClick={() => speakCustomText(msg.text, SMARTPHONE_SCENARIOS[simScenario]?.language || "English")}
                                    >
                                      <Volume2 size={11} />
                                      <span>Listen</span>
                                    </button>
                                  )}
                                </div>
                                <p>{msg.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Quick Owner Directives OR Live Mic Controls */}
                        {simScenario === "live_caller" ? (
                          <div className="phone-live-mic-dock">
                            <div className="phone-mic-controls-row">
                              {!simIsRecording ? (
                                <button
                                  type="button"
                                  className="btn-phone-mic-action start"
                                  onClick={handleSimStartRecording}
                                  disabled={simIsThinking}
                                >
                                  <div className="mic-icon-halo">
                                    <Mic size={17} />
                                  </div>
                                  <div className="mic-action-labels">
                                    <span className="mic-main-lbl">Tap to Speak</span>
                                    <span className="mic-sub-lbl">Auto-sends when you pause</span>
                                  </div>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn-phone-mic-action stop is-recording"
                                  onClick={handleSimStopRecording}
                                >
                                  <div className="mic-icon-halo pulsating">
                                    <MicOff size={17} />
                                  </div>
                                  <div className="mic-action-labels">
                                    <span className="mic-main-lbl">Send Now (or pause)</span>
                                    <span className="mic-sub-lbl">Audio: {simMicVolume}% • Auto-sends</span>
                                  </div>
                                </button>
                              )}

                              <button
                                type="button"
                                className="btn-phone-end-call"
                                title="End Call & Generate AI Summary"
                                onClick={handleSimEndLiveCall}
                              >
                                <PhoneOff size={15} />
                                <span>End</span>
                              </button>
                            </div>

                            {simIsThinking && (
                              <div className="sim-thinking-bar">
                                <Sparkles size={13} className="spinning" />
                                <span>Whisper transcribing & KIRA reasoning...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="phone-quick-directives-strip">
                            <span className="directives-label">Owner Live Directives:</span>
                            <div className="directives-pills-row">
                              <button
                                type="button"
                                className="directive-pill-btn"
                                onClick={() => handleSimSendDirective("Tell them I will call back")}
                              >
                                📞 Call back
                              </button>
                              <button
                                type="button"
                                className="directive-pill-btn"
                                onClick={() => handleSimSendDirective("Ask for meeting details")}
                              >
                                📅 Ask time
                              </button>
                              <button
                                type="button"
                                className="directive-pill-btn"
                                onClick={() => handleSimSendDirective("Take detailed message")}
                              >
                                📝 Message
                              </button>
                              <button
                                type="button"
                                className="directive-pill-btn takeover"
                                onClick={handleSimAnswerMyself}
                              >
                                🟢 Pick Up
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STATE 3: CONNECTED DIRECTLY (User answered) */}
                    {simStatus === "connected" && (
                      <div className="phone-connected-screen">
                        <div className="caller-avatar-hero" style={{ background: SMARTPHONE_SCENARIOS[simScenario]?.avatarBg, width: "64px", height: "64px" }}>
                          <span>{SMARTPHONE_SCENARIOS[simScenario]?.name?.slice(0, 1)}</span>
                        </div>
                        <h3>Connected with {SMARTPHONE_SCENARIOS[simScenario]?.name}</h3>
                        <p className="connected-sub">Personal Cellular Call Active</p>
                        <p className="connected-desc">
                          You answered the call directly on your mobile. KIRA stepped aside seamlessly without interrupting your conversation.
                        </p>
                        <button
                          type="button"
                          className="phone-btn-reset"
                          onClick={handleSimReset}
                        >
                          <RotateCcw size={13} />
                          <span>Restart Simulation</span>
                        </button>
                      </div>
                    )}

                    {/* STATE 4: SCREENING COMPLETED */}
                    {simStatus === "completed" && (
                      <div className="phone-completed-screen">
                        <div className="completed-check-icon">
                          <CheckCircle2 size={28} color="#10b981" />
                        </div>
                        <h3>Call Screened & Saved</h3>
                        <p className="completed-sub">Logged to Keerthana's Executive Dashboard</p>

                        <div className="phone-summary-card">
                          <div className="summary-field">
                            <span className="field-title">AI Summary:</span>
                            <p>
                              {simLiveSummary?.summary?.summary || SMARTPHONE_SCENARIOS[simScenario]?.summary}
                            </p>
                          </div>

                          <div className="summary-field highlight">
                            <span className="field-title">Action Directive:</span>
                            <p>
                              {simLiveSummary?.summary?.action_required || SMARTPHONE_SCENARIOS[simScenario]?.actionItem}
                            </p>
                          </div>

                          <div className="summary-meta-row">
                            <span className={`meta-badge ${simLiveSummary?.summary?.urgency ? `badge-${simLiveSummary.summary.urgency.toLowerCase()}` : SMARTPHONE_SCENARIOS[simScenario]?.urgencyClass}`}>
                              Priority: {simLiveSummary?.summary?.urgency || SMARTPHONE_SCENARIOS[simScenario]?.urgency}
                            </span>
                            <span className="meta-badge contact-saved">
                              ✓ Saved in Memory
                            </span>
                            {simScenario === "live_caller" && (
                              <span className="meta-badge" style={{ background: "rgba(139, 92, 246, 0.2)", color: "#c084fc", border: "1px solid rgba(139, 92, 246, 0.4)" }}>
                                🎙️ Live Session
                              </span>
                            )}
                          </div>
                        </div>

                        {/* In-Call Autonomous Dispatches Receipt */}
                        {simDispatchedActions.length > 0 && (
                          <div className="phone-dispatched-receipt-card">
                            <div className="receipt-header">
                              <Zap size={13} color="#10b981" />
                              <span>⚡ Autonomous Action Dispatched:</span>
                            </div>
                            {simDispatchedActions.map((disp, dIdx) => (
                              <div key={dIdx} className="receipt-item">
                                <div className="receipt-item-top">
                                  <span className={`receipt-channel-badge ${disp.channel?.toLowerCase()}`}>
                                    {disp.channel === "WhatsApp" ? "💬 WhatsApp" : "✉️ SMS Gateway"}
                                  </span>
                                  <span className="receipt-status-pill">✓ Delivered (180ms)</span>
                                </div>
                                <p className="receipt-snippet-text">{disp.preview || disp.content}</p>
                                <div className="receipt-item-bottom">
                                  <span>To: {disp.recipient}</span>
                                  <span>{disp.deliveredAt || "Just now"}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="phone-completed-actions-row">
                          <button
                            type="button"
                            className="phone-btn-listen-summary"
                            onClick={() => {
                              const s = simLiveSummary?.summary?.summary || SMARTPHONE_SCENARIOS[simScenario]?.summary;
                              const a = simLiveSummary?.summary?.action_required || SMARTPHONE_SCENARIOS[simScenario]?.actionItem;
                              speakCustomText(`Summary: ${s}. Action required: ${a}`, SMARTPHONE_SCENARIOS[simScenario]?.language || "English");
                            }}
                          >
                            <Volume2 size={13} />
                            <span>Hear Audio Summary</span>
                          </button>
                          <button
                            type="button"
                            className="phone-btn-reset"
                            onClick={handleSimReset}
                          >
                            <RotateCcw size={13} />
                            <span>Replay Scenario</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          className="phone-btn-goto-dashboard"
                          onClick={() => setAppStage("dashboard")}
                        >
                          <LayoutDashboard size={13} />
                          <span>View Extracted Directive in Dashboard →</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Phone Home Bar */}
                  <div className="phone-home-indicator" />
                </div>
              </div>
            </div>

            {/* Telco & Carrier Enterprise Telemetry Panel (Right Column) */}
            <div className="carrier-telemetry-column">
              <div className="telemetry-card">
                <div className="telemetry-header">
                  <div className="telemetry-title-row">
                    <ShieldCheck size={18} color="#38bdf8" />
                    <h3>Carrier-Grade Telecom Telemetry</h3>
                  </div>
                  <span className="live-telemetry-pulse">
                    <span className="dot" />
                    TELECOM PIPELINE ACTIVE
                  </span>
                </div>

                <div className="telemetry-metrics-grid">
                  <div className="telemetry-metric-box">
                    <span className="metric-label">Latency (TTFB)</span>
                    <span className="metric-val cyan">480ms</span>
                    <span className="metric-sub">Voice stream response</span>
                  </div>
                  <div className="telemetry-metric-box">
                    <span className="metric-label">Protocol Bridge</span>
                    <span className="metric-val purple">SIP / TwiML</span>
                    <span className="metric-sub">PSTN & IMS compatible</span>
                  </div>
                  <div className="telemetry-metric-box">
                    <span className="metric-label">ASR Accuracy</span>
                    <span className="metric-val emerald">99.2%</span>
                    <span className="metric-sub">Whisper Neural Engine</span>
                  </div>
                  <div className="telemetry-metric-box">
                    <span className="metric-label">Active Domain</span>
                    <span className="metric-val amber">{SMARTPHONE_SCENARIOS[simScenario]?.domain}</span>
                    <span className="metric-sub">Zero cross-persona drift</span>
                  </div>
                </div>

                {/* Live In-Call Action Dispatcher Telemetry HUD */}
                <div className="telemetry-dispatch-box">
                  <div className="dispatch-box-header">
                    <div className="dispatch-title">
                      <Zap size={14} color="#f59e0b" />
                      <span>Autonomous In-Call Action Dispatcher</span>
                    </div>
                    <span className="dispatch-badge-mode">
                      {simDispatchedActions.length > 0 ? "⚡ Tool Executed" : "Tool Ready"}
                    </span>
                  </div>
                  {simActiveDispatch || (simDispatchedActions.length > 0) ? (
                    <div className="dispatch-active-card">
                      <div className="dispatch-card-top">
                        <span className={`channel-pill ${(simActiveDispatch || simDispatchedActions[0]).channel?.toLowerCase()}`}>
                          {(simActiveDispatch || simDispatchedActions[0]).channel === "WhatsApp" ? "💬 WhatsApp Business" : "✉️ Twilio SMS"}
                        </span>
                        <span className="dispatch-status-delivered">✓ Delivered in 180ms</span>
                      </div>
                      <p className="dispatch-content-text">&quot;{(simActiveDispatch || simDispatchedActions[0]).preview || (simActiveDispatch || simDispatchedActions[0]).content}&quot;</p>
                      <div className="dispatch-meta-sub">
                        <span>Recipient: {(simActiveDispatch || simDispatchedActions[0]).recipient}</span>
                        <span>Protocol: Automated Intent Detection</span>
                      </div>
                    </div>
                  ) : (
                    <div className="dispatch-idle-state">
                      <MessageSquare size={15} color="var(--text-muted)" />
                      <span>KIRA actively listens for delivery addresses, resumes, or meeting requests and executes instant SMS / WhatsApp dispatches while on the call.</span>
                    </div>
                  )}
                </div>

                {/* Live AI Decision Engine Log */}
                <div className="telemetry-decision-log">
                  <div className="log-title">
                    <BrainCircuit size={14} />
                    <span>Real-Time Autonomous Decision Log</span>
                  </div>
                  <div className="log-content-box">
                    <code>
                      [CALLER_ID]: {SMARTPHONE_SCENARIOS[simScenario]?.phone} ({SMARTPHONE_SCENARIOS[simScenario]?.name})<br />
                      [CALL_STATE]: {simStatus.toUpperCase()}<br />
                      [RULE_ENGINE]: {SMARTPHONE_SCENARIOS[simScenario]?.decisionLog}
                    </code>
                  </div>
                </div>

                {/* Scenario Value Proposition Box */}
                <div className="scenario-value-box">
                  <h4>💡 Why Telcos & Smartphone OEMs Care:</h4>
                  <ul>
                    <li>
                      <strong>Zero Voicemail Abandonment:</strong> Callers converse with an empathetic voice AI instead of hanging up at an audio tone.
                    </li>
                    <li>
                      <strong>Live Voicemail Transcript:</strong> Subscribers read speech live as the caller speaks, with the power to pick up at any second.
                    </li>
                    <li>
                      <strong>Autonomous Task Extraction:</strong> Converts transient voice calls into structured actionable database items automatically.
                    </li>
                  </ul>
                </div>

                {/* CTA to Open Dashboard */}
                <div className="telemetry-cta-row">
                  <button
                    type="button"
                    className="btn-telemetry-launch"
                    onClick={handleDemoLogin}
                  >
                    <span>Launch Full Host Dashboard</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    className="btn-telemetry-pitchdeck"
                    onClick={() => {
                      setPitchDeckActiveSlide(0);
                      setShowPitchDeckModal(true);
                    }}
                  >
                    <Briefcase size={14} />
                    <span>View Carrier & OEM Pitch Deck</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Desks Section */}
        <section id="landing-desks" className="landing-section">
          <div className="landing-section-header">
            <h2>Domain-Isolated Intelligence</h2>
            <p>
              Different calls demand different minds. KIRA strictly walls off your academic projects, 
              wholesale business, freelance retainers, and executive inquiries.
            </p>
          </div>

          <div className="landing-desks-grid">
            {Object.keys(MODES_CONFIG).map((modeKey) => {
              const cfg = MODES_CONFIG[modeKey];
              return (
                <div key={modeKey} className="landing-desk-card">
                  <div>
                    <div className="landing-desk-card-header">
                      <span className="landing-desk-icon">{cfg.icon}</span>
                      <div>
                        <h3>{cfg.name}</h3>
                        <span style={{ fontSize: "11px", color: "var(--accent-cyan)", fontWeight: 600 }}>
                          {cfg.shortLabel} Desk
                        </span>
                      </div>
                    </div>
                    <p className="landing-desk-desc">{cfg.tagline}</p>
                    <div className="landing-desk-chips">
                      {cfg.presets.slice(0, 2).map((p, idx) => (
                        <span key={idx} className="landing-desk-chip">
                          📞 {p.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="landing-desk-btn"
                    onClick={() => {
                      if (currentUser) {
                        handleSelectPurpose(modeKey);
                      } else {
                        setAuthTab("login");
                        setShowAuthModal(true);
                      }
                    }}
                  >
                    <span>Launch {cfg.name} Desk</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Capabilities Section */}
        <section id="landing-features" className="landing-section" style={{ paddingTop: 0 }}>
          <div className="landing-section-header">
            <h2>Autonomous Architecture</h2>
            <p>Engineered for high accuracy, voice immediacy, and zero cognitive fatigue.</p>
          </div>

          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <Mic size={20} />
              </div>
              <h4>Full-Duplex Voice Synthesis</h4>
              <p>Streaming speech transcription powered by Whisper, instantaneous Gemini reasoning, and high-fidelity Edge-TTS speech generation.</p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <BrainCircuit size={20} />
              </div>
              <h4>Zero Persona Drift</h4>
              <p>Small business inquiries never mention coursework or internships. Strict context isolation guarantees domain integrity on every call.</p>
            </div>

            <div className="landing-feature-card">
              <div className="landing-feature-icon">
                <CheckSquare size={20} />
              </div>
              <h4>Autonomous Action Items</h4>
              <p>KIRA automatically extracts tasks, urgency levels, and due hints from calls, dispatching instant webhook alerts for high-priority events.</p>
            </div>
          </div>
        </section>

        {/* Landing Footer */}
        <footer className="landing-footer">
          <div>
            <span>KIRA AI Voice Agent © 2026. Designed for Keerthana Sangam.</span>
          </div>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "6px" }}>
              <span className="status-dot" style={{ backgroundColor: "#10b981" }} /> System Operational
            </span>
            <button
              type="button"
              className="btn-demo-login"
              style={{ width: "auto", margin: 0, padding: "6px 14px" }}
              onClick={handleDemoLogin}
              disabled={authLoading}
            >
              ⚡ Quick Demo
            </button>
          </div>
        </footer>
      </div>
    );
  };

  // ==================================================
  // PURPOSE SELECTION ONBOARDING RENDERER
  // ==================================================
  const renderPurposeSelection = () => {
    return (
      <div className="onboarding-wrapper">
        <div className="onboarding-container">
          <div className="onboarding-header">
            <div className="onboarding-step-pill">
              <Sparkles size={12} />
              <span>Step 2 of 2 • Workspace Personalization</span>
            </div>
            <h1>Welcome{currentUser?.name ? `, ${currentUser.name}` : ""}!</h1>
            <p>
              What purpose are you here for? Select your active workspace desk. 
              KIRA will tailor her voice persona, memory dossiers, and action center accordingly.
            </p>
          </div>

          <div className="onboarding-grid">
            {[
              {
                id: "Student",
                icon: "🧑‍🎓",
                title: "Student Desk",
                subtitle: "Academics & Campus Inbound",
                desc: "Handle coursework queries, lab team syncs, faculty calls, hackathons, and exam submission deadlines."
              },
              {
                id: "Small Business",
                icon: "🏬",
                title: "Small Business",
                subtitle: "Orders, Wholesale & Vendors",
                desc: "Manage bulk customer orders, wholesale pricing, supplier deliveries, dispatch follow-ups, and customer inquiries."
              },
              {
                id: "Freelancer",
                icon: "💻",
                title: "Freelancer Studio",
                subtitle: "Client Briefs & Retainers",
                desc: "Manage incoming client briefs, milestone reviews, budget quotes, UI/UX revisions, and design retainers."
              },
              {
                id: "Professional",
                icon: "💼",
                title: "Executive Suite",
                subtitle: "Recruiting & Board Advisory",
                desc: "Screen recruiter inquiries, coordinate advisory board syncs, speaking engagements, and career opportunities."
              }
            ].map((purpose) => (
              <div
                key={purpose.id}
                className="onboarding-card"
                onClick={() => handleSelectPurpose(purpose.id)}
              >
                <div>
                  <div className="onboarding-card-top">
                    <span className="onboarding-card-icon">{purpose.icon}</span>
                    <div>
                      <h3 className="onboarding-card-title">{purpose.title}</h3>
                      <span className="onboarding-card-subtitle">{purpose.subtitle}</span>
                    </div>
                  </div>
                  <p className="onboarding-card-desc">{purpose.desc}</p>
                </div>

                <div className="onboarding-card-footer">
                  <span>Enter {purpose.title}</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-onboarding-back"
            onClick={() => setAppStage("landing")}
          >
            ← Back to Landing Page
          </button>
        </div>
      </div>
    );
  };

  // Top-level Stage Branching
  if (appStage === "landing") {
    return (
      <>
        {renderLandingPage()}
        {renderAuthModal()}
        {renderPitchDeckModal()}
        {renderActionDispatcherModal()}
      </>
    );
  }

  if (appStage === "purpose_selection") {
    return (
      <>
        {renderPurposeSelection()}
        {renderAuthModal()}
        {renderPitchDeckModal()}
        {renderActionDispatcherModal()}
      </>
    );
  }

  return (
    <div className="kira-app-wrapper">
      {/* ==================================================
          TOP NAVIGATION BAR (STREAMLINED EXECUTIVE OBSIDIAN)
          ================================================== */}
      <header className="kira-navbar">
        <div className="nav-left-cluster">
          <div className="kira-brand" onClick={() => setAppStage("landing")}>
            <div className="brand-orb">K</div>
            <div className="brand-info">
              <div className="brand-title-row">
                <h1>KIRA</h1>
              </div>
              <span className="brand-subtag">AI Voice Agent</span>
            </div>
          </div>

          {/* Unified Desk Dropdown Persona */}
          <div className="unified-desk-dropdown-container">
            <button
              type="button"
              className="btn-unified-desk"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeskMenu((prev) => !prev);
              }}
              title="Switch Workspace Desk"
            >
              <span className="desk-icon">{MODES_CONFIG[activeMode]?.icon || "🧑‍🎓"}</span>
              <span className="desk-name">{activeMode} Desk</span>
              <ChevronDown size={13} className={`chevron-rotate ${showDeskMenu ? "open" : ""}`} />
            </button>

            {showDeskMenu && (
              <div className="desk-menu-popover" onClick={(e) => e.stopPropagation()}>
                <div className="desk-menu-header">
                  <span>ACTIVE DESK PERSONA</span>
                </div>
                {["Student", "Freelancer", "Small Business", "Professional"].map((modeKey) => (
                  <button
                    key={modeKey}
                    type="button"
                    className={`desk-menu-item ${activeMode === modeKey ? "active" : ""}`}
                    onClick={() => {
                      handleModeChange(modeKey);
                      setShowDeskMenu(false);
                    }}
                  >
                    <span className="item-icon">{MODES_CONFIG[modeKey]?.icon}</span>
                    <div className="item-text">
                      <strong>{modeKey} Desk</strong>
                      <span>{MODES_CONFIG[modeKey]?.tagline}</span>
                    </div>
                    {activeMode === modeKey && <CheckCircle2 size={14} color="#10b981" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tab Switcher Capsule */}
        <nav className="nav-center-tabs">
          <button
            className={`tab-btn ${activeTab === "studio" ? "active" : ""}`}
            onClick={() => setActiveTab("studio")}
          >
            <Mic size={14} />
            <span>Studio</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "records" ? "active" : ""}`}
            onClick={() => setActiveTab("records")}
          >
            <FileText size={14} />
            <span>Calls</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "actions" ? "active" : ""}`}
            onClick={() => setActiveTab("actions")}
          >
            <CheckSquare size={14} />
            <span>Directives</span>
            {filteredActions.filter((a) => !a.is_completed).length > 0 && (
              <span className="tab-badge">
                {filteredActions.filter((a) => !a.is_completed).length}
              </span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "ask" ? "active" : ""}`}
            onClick={() => setActiveTab("ask")}
          >
            <Bot size={14} />
            <span>Ask KIRA</span>
          </button>
          <button
            className={`tab-btn ${activeTab === "callers" ? "active" : ""}`}
            onClick={() => setActiveTab("callers")}
          >
            <Users size={14} />
            <span>Memory</span>
          </button>
        </nav>

        {/* Right Executive Utility & Profile Cluster */}
        <div className="nav-right-controls">
          <button
            type="button"
            className="nav-pitchdeck-btn"
            title="Carrier (Jio/Airtel) & OEM (Samsung/Apple) Pitch Deck"
            onClick={() => {
              setPitchDeckActiveSlide(0);
              setShowPitchDeckModal(true);
            }}
          >
            <Briefcase size={13} />
            <span>Pitch Deck</span>
            <span className="nav-pitch-badge">B2B</span>
          </button>

          <button
            type="button"
            className="nav-icon-util-btn"
            title="In-Call Action Dispatcher (WhatsApp & SMS Delivery)"
            onClick={() => {
              handleFetchActionSnippets();
              setShowActionDispatcherModal(true);
            }}
          >
            <Zap size={14} color="#f59e0b" />
          </button>

          <button
            type="button"
            className="nav-icon-util-btn"
            title="Real Phone & Twilio Setup"
            onClick={() => {
              handleFetchTelephonySettings();
              setShowTelephonyModal(true);
            }}
          >
            <PhoneForwarded size={14} />
          </button>

          <button
            type="button"
            className="nav-icon-util-btn"
            title="Instant Alerts & Webhooks"
            onClick={() => setShowNotificationsModal(true)}
          >
            <Bell size={14} />
          </button>

          <div className="system-status-indicator" title={backendOnline ? "KIRA Engine Connected" : "Backend Disconnected"}>
            <span
              className="status-dot"
              style={{
                backgroundColor: backendOnline ? "#10b981" : "#f43f5e",
                boxShadow: backendOnline ? "0 0 8px #10b981" : "0 0 8px #f43f5e"
              }}
            />
            <span>{backendOnline ? "Live" : "Offline"}</span>
          </div>

          {/* User Profile Popover */}
          <div className="user-profile-menu-container">
            {currentUser ? (
              <button
                type="button"
                className="user-profile-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu((prev) => !prev);
                }}
                title={`Profile: ${currentUser.name} (${currentUser.email})`}
              >
                <span className="user-avatar-circle">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : "K"}
                </span>
                <span className="user-name-label">{currentUser.name?.split(" ")[0]}</span>
                <ChevronDown size={11} className={`chevron-rotate ${showProfileMenu ? "open" : ""}`} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-login-trigger"
                onClick={() => {
                  setAuthTab("login");
                  setShowAuthModal(true);
                }}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            )}

            {showProfileMenu && currentUser && (
              <div className="profile-popover-menu" onClick={(e) => e.stopPropagation()}>
                <div className="popover-user-card">
                  <span className="popover-avatar">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : "K"}
                  </span>
                  <div className="popover-user-details">
                    <strong>{currentUser.name}</strong>
                    <span>{currentUser.email}</span>
                    <span className="popover-desk-pill">
                      {MODES_CONFIG[activeMode]?.icon} {activeMode} Active
                    </span>
                  </div>
                </div>
                <div className="popover-divider" />
                <div className="popover-actions-list">
                  <button
                    type="button"
                    className="popover-action-item"
                    onClick={() => {
                      setAppStage("landing");
                      setShowProfileMenu(false);
                    }}
                  >
                    <Globe size={14} />
                    <span>Landing Page & Trial Simulator</span>
                  </button>
                  <button
                    type="button"
                    className="popover-action-item"
                    onClick={() => {
                      setAppStage("purpose_selection");
                      setShowProfileMenu(false);
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Change Purpose / Workspace</span>
                  </button>
                  <button
                    type="button"
                    className="popover-action-item"
                    onClick={() => {
                      handleFetchTelephonySettings();
                      setShowTelephonyModal(true);
                      setShowProfileMenu(false);
                    }}
                  >
                    <PhoneForwarded size={14} />
                    <span>Real Phone & Twilio Setup</span>
                  </button>
                  <button
                    type="button"
                    className="popover-action-item"
                    onClick={() => {
                      handleFetchActionSnippets();
                      setShowActionDispatcherModal(true);
                      setShowProfileMenu(false);
                    }}
                  >
                    <Zap size={14} color="#f59e0b" />
                    <span>In-Call Action Dispatcher (WhatsApp / SMS)</span>
                  </button>
                  <button
                    type="button"
                    className="popover-action-item"
                    onClick={() => {
                      setShowNotificationsModal(true);
                      setShowProfileMenu(false);
                    }}
                  >
                    <Bell size={14} />
                    <span>Instant Alerts & Webhooks</span>
                  </button>
                </div>
                <div className="popover-divider" />
                <button
                  type="button"
                  className="popover-action-item logout"
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN CONTENT BODY
          ================================================== */}
      <main className="kira-main-body">
        {/* ==================================================
            TAB 1: CALL STUDIO (EXECUTIVE COCKPIT)
            ================================================== */}
        {activeTab === "studio" && (
          <div className="call-studio-layout">
            {/* Left: Studio Stage Card */}
            <div className="studio-stage-card">
              <div className="studio-stage-topbar">
                <div className="desk-active-pill">
                  <span>{MODES_CONFIG[activeMode]?.icon}</span>
                  <span>{activeMode} Desk</span>
                </div>

                {/* Vernacular Language Capsule */}
                {!isCallActive && (
                  <div className="language-capsule-row" title="Select Voice Language">
                    {[
                      { id: "English", label: "EN" },
                      { id: "Telugu", label: "తెలుగు" },
                      { id: "Hindi", label: "हिंदी" }
                    ].map((lang) => (
                      <button
                        key={lang.id}
                        type="button"
                        className={`lang-capsule-btn ${activeLanguage === lang.id ? "active" : ""}`}
                        onClick={() => setActiveLanguage(lang.id)}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Breathing Voice Orb */}
              <div className="orb-stage-container">
                <div
                  className={`orb-visualizer-wrapper ${
                    isListening ? "listening" : isProcessing ? "thinking" : isCallActive ? "speaking" : ""
                  }`}
                  style={isListening && micVolume > 5 ? { transform: `scale(${1 + Math.min(0.2, micVolume / 350)})` } : undefined}
                >
                  <div className="orb-ring orb-ring-1" />
                  <div className="orb-ring orb-ring-2" />
                  <div className="center-orb-sphere">
                    {isListening ? (
                      <Mic size={38} />
                    ) : isProcessing ? (
                      <BrainCircuit size={38} className="spinning" />
                    ) : (
                      <Bot size={38} />
                    )}
                  </div>
                </div>

                <h2 className="stage-status-headline">
                  {isCallActive ? `Call Active (${formatTimer(callDuration)})` : (MODES_CONFIG[activeMode]?.studioDeskTitle || "KIRA Voice Studio")}
                </h2>
                <p className="stage-status-subtext">{kiraStatus}</p>
              </div>

              {/* Caller Dock (Hidden gracefully during active call) */}
              {!isCallActive ? (
                <div className="caller-selection-dock">
                  <div className="dock-header-row">
                    <span className="dock-header-label">Caller Selection & Upfront Registration</span>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      {callersList.find((c) => c.phone === callerPhone)?.is_vip && (
                        <span className="badge-vip-contact" title="VIP Executive Priority Contact">
                          <Star size={11} fill="#eab308" color="#eab308" />
                          VIP Contact
                        </span>
                      )}
                      <div className={`caller-recognition-tag ${isNewCallerMode || !callersList.some((c) => c.phone === callerPhone) ? "first-time" : "returning"}`}>
                        <span className="tag-dot" />
                        <span>
                          {isNewCallerMode || !callersList.some((c) => c.phone === callerPhone) ? "First-Time Caller" : "Recognized Contact"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Upfront Caller Domain Registration */}
                  <div className="caller-mode-selection-header">
                    <span>1. Inbound Domain / Desk Mode (Required Upfront)</span>
                    <span style={{ fontSize: "11px", color: "var(--accent-primary-hover)", fontWeight: 600 }}>
                      Locks Persona
                    </span>
                  </div>
                  <div className="caller-mode-selector-grid">
                    {[
                      { id: "Student", icon: "🧑‍🎓", label: "Student", desc: "Academics, Projects & Coursework" },
                      { id: "Small Business", icon: "🏬", label: "Small Business", desc: "Wholesale, Orders & Vendors" },
                      { id: "Freelancer", icon: "💻", label: "Freelancer", desc: "Client Proposals & Scopes" },
                      { id: "Professional", icon: "💼", label: "Professional", desc: "Executive Inquiries & Advisory" }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className={`caller-mode-card ${callerRegisteredMode === m.id ? "active" : ""}`}
                        onClick={() => {
                          setCallerRegisteredMode(m.id);
                          handleModeChange(m.id);
                        }}
                      >
                        <span className="caller-mode-card-icon">{m.icon}</span>
                        <span className="caller-mode-card-label">{m.label}</span>
                        <span className="caller-mode-card-sub">{m.desc}</span>
                      </button>
                    ))}
                  </div>

                  <div className="caller-mode-selection-header" style={{ marginTop: "12px" }}>
                    <span>2. Caller Identity</span>
                  </div>

                  <div className="dock-caller-pills">
                    {(MODES_CONFIG[activeMode]?.presets || PRESET_CALLERS).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`dock-contact-pill ${!isNewCallerMode && callerPhone === preset.phone ? "active" : ""}`}
                        onClick={() => {
                          setIsNewCallerMode(false);
                          setCallerName(preset.name);
                          setCallerPhone(preset.phone);
                          setCallerEmail(preset.email);
                        }}
                      >
                        {preset.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={`dock-contact-pill ${isNewCallerMode ? "active" : ""}`}
                      onClick={() => {
                        const randomSuffix = Math.floor(10000 + Math.random() * 90000);
                        setIsNewCallerMode(true);
                        setCallerName("");
                        setCallerPhone(`90000${randomSuffix}`);
                        setCallerEmail("");
                      }}
                    >
                      + New Caller
                    </button>
                  </div>

                  {isNewCallerMode && (
                    <div className="dock-custom-inputs">
                      <input
                        type="text"
                        className="dock-input"
                        placeholder="Caller Name (e.g. Haribabu)"
                        value={callerName}
                        onChange={(e) => setCallerName(e.target.value)}
                        autoFocus
                      />
                      <input
                        type="text"
                        className="dock-input"
                        placeholder="Phone Number"
                        value={callerPhone}
                        onChange={(e) => {
                          setCallerPhone(e.target.value);
                          setIsNewCallerMode(false);
                        }}
                      />
                      <button
                        type="button"
                        className="dock-btn-refresh"
                        title="Generate random phone number"
                        onClick={() => {
                          const randomSuffix = Math.floor(10000 + Math.random() * 90000);
                          setCallerPhone(`90000${randomSuffix}`);
                          setIsNewCallerMode(true);
                        }}
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Action Controls */}
              <div className="stage-actions-row">
                {!isCallActive ? (
                  <button className="btn-start-call" onClick={handleStartCall} disabled={isProcessing}>
                    <PhoneCall size={16} />
                    <span>Start Inbound Call</span>
                  </button>
                ) : (
                  <>
                    <button
                      className={`mic-toggle-btn ${isListening ? "listening" : ""}`}
                      onClick={isListening ? stopListening : startListening}
                      disabled={isProcessing}
                      title={isListening ? "Tap to stop speaking" : "Tap to speak"}
                    >
                      {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                    </button>

                    <button className="btn-end-call" onClick={handleEndCall} disabled={isProcessing}>
                      <PhoneOff size={15} />
                      <span>End Call & Analyze</span>
                    </button>
                  </>
                )}
              </div>

              {/* Hands-Free Auto-VAD Toggle & Live Audio Meter */}
              <div className="hands-free-toggle-wrapper">
                <button
                  type="button"
                  className={`btn-handsfree-toggle ${handsFreeMode ? "active" : ""}`}
                  onClick={() => setHandsFreeMode(!handsFreeMode)}
                  title={handsFreeMode ? "Continuous hands-free conversation enabled (speaks & listens automatically)" : "Manual push-to-talk enabled"}
                >
                  <Zap size={13} className={handsFreeMode ? "glowing" : ""} />
                  <span>Hands-Free Auto-VAD: {handsFreeMode ? "ON" : "OFF"}</span>
                </button>
                {isListening && (
                  <div className="mic-volume-meter" title={`Audio Level: ${micVolume}%`}>
                    <div className="mic-volume-bar" style={{ width: `${Math.max(6, micVolume)}%` }} />
                  </div>
                )}
              </div>
            </div>

            {/* Right: Live Dialogue Feed */}
            <div className="studio-transcript-card">
              <div className="transcript-header">
                <h3>
                  <MessageSquare size={18} />
                  Live Dialogue Feed
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {isCallActive && (
                    <span className="active-caller-tag">
                      Caller: <strong>{callerName}</strong> ({callerPhone})
                    </span>
                  )}
                  {studioMessages.length > 0 && (
                    <button
                      type="button"
                      className="btn-copy-feed"
                      onClick={handleCopyLiveFeed}
                      title="Copy conversation transcript to clipboard"
                    >
                      {copiedFeed ? (
                        <>
                          <CheckCircle2 size={13} color="#4ade80" />
                          <span style={{ color: "#4ade80" }}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy Feed</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="transcript-messages-feed">
                {studioMessages.length === 0 ? (
                  <div className="empty-feed-placeholder">
                    <Bot size={40} />
                    <p>No active dialogue. Click "Start Inbound Call" to begin speaking with KIRA.</p>
                  </div>
                ) : (
                  studioMessages.map((msg, idx) => {
                    const isKira = msg.speaker === "kira";
                    const displayName = isKira
                      ? "KIRA (AI Assistant)"
                      : msg.speaker_name || callerName || "Caller";
                    const avatarLetter = isKira
                      ? "K"
                      : ((msg.speaker_name || callerName || "C").trim()[0]?.toUpperCase() || "C");

                    return (
                      <div key={idx} className={`chat-bubble-row ${msg.speaker}`}>
                        <div className={`bubble-avatar ${msg.speaker}`}>
                          {avatarLetter}
                        </div>
                        <div className="bubble-content-box">
                          <div className="bubble-meta">
                            <span className="bubble-author-name">{displayName}</span>
                            <span className="bubble-timestamp">{msg.timestamp}</span>
                          </div>
                          <p className="bubble-message-text">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Text fallback input */}
              {isCallActive && (
                <form className="transcript-footer-input" onSubmit={handleSendTextMessage}>
                  <input
                    type="text"
                    placeholder="Type message as caller (text fallback)..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    disabled={isProcessing}
                  />
                  <button type="submit" disabled={isProcessing || !textInput.trim()}>
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB 2: EXECUTIVE DASHBOARD
            ================================================== */}
        {activeTab === "dashboard" && (
          <div className="dashboard-view">
            {/* Persona Switcher Banner */}
            <div className="dashboard-header-banner">
              <div className="dashboard-banner-text">
                <h2>
                  Executive Dashboard — {effectiveDashboardMode === "all" ? "All Desk Operations" : `${effectiveDashboardMode} Desk`}
                </h2>
                <p>
                  {effectiveDashboardMode === "all"
                    ? "Comprehensive multi-persona analytics across campus, freelance client briefs, small business orders, and corporate advisory."
                    : (MODES_CONFIG[effectiveDashboardMode]?.dashboardSubtitle || "Track communications, actions, and inquiries.")}
                </p>
              </div>

              <div className="segmented-pill-group">
                <button
                  type="button"
                  className={`seg-pill-btn ${dashboardModeFilter === "auto" ? "active" : ""}`}
                  onClick={() => setDashboardModeFilter("auto")}
                  title={`Focus on active ${activeMode} desk`}
                >
                  {activeMode} Desk
                </button>
                <button
                  type="button"
                  className={`seg-pill-btn ${dashboardModeFilter === "all" ? "active" : ""}`}
                  onClick={() => setDashboardModeFilter("all")}
                >
                  All Personas
                </button>
                {Object.keys(MODES_CONFIG).map((m) => (
                  <button
                    key={m}
                    type="button"
                    className={`seg-pill-btn ${dashboardModeFilter === m ? "active" : ""}`}
                    onClick={() => setDashboardModeFilter(m)}
                  >
                    {MODES_CONFIG[m].shortLabel}
                  </button>
                ))}
              </div>
            </div>

            {/* Production KPI Metrics Grid */}
            <div className="stats-grid-5">
              <div className="stat-metric-card">
                <div className="stat-icon-wrapper violet">
                  <PhoneCall size={20} />
                </div>
                <div className="stat-data">
                  <p>Total Calls</p>
                  <h2>{dashboardCalls.length}</h2>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-wrapper cyan">
                  <Sparkles size={20} />
                </div>
                <div className="stat-data">
                  <p>Screened by KIRA</p>
                  <h2>{dashboardScreenedCount}</h2>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-wrapper emerald" style={{ background: "rgba(16, 185, 129, 0.12)", color: "#10b981" }}>
                  <CheckCircle2 size={20} />
                </div>
                <div className="stat-data">
                  <p>Completed Calls</p>
                  <h2>{dashboardCompletedCount}</h2>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-wrapper rose">
                  <AlertCircle size={20} />
                </div>
                <div className="stat-data">
                  <p>Urgent Inquiries</p>
                  <h2>{dashboardHighUrgencyCount}</h2>
                </div>
              </div>

              <div className="stat-metric-card">
                <div className="stat-icon-wrapper amber">
                  <CheckSquare size={20} />
                </div>
                <div className="stat-data">
                  <p>Pending Follow-ups</p>
                  <h2>{dashboardPendingActionsCount}</h2>
                </div>
              </div>
            </div>

            {/* Split Grid: Category Breakdown & Urgent Calls */}
            <div className="dashboard-split-grid">
              {/* Category Breakdown */}
              <div className="dashboard-widget-card">
                <div className="widget-title-row">
                  <h3>
                    <Sparkles size={16} />
                    <span>{MODES_CONFIG[effectiveDashboardMode]?.categoryTitle || "Call Classification Breakdown"}</span>
                  </h3>
                  <span className="widget-badge-count">{dashboardCalls.length} calls</span>
                </div>

                <div className="category-bars-list">
                  {Object.keys(dashboardTypeBreakdown).length === 0 ? (
                    <p style={{ color: "var(--text-dim)", fontSize: "12px", padding: "12px 0" }}>
                      No calls recorded for this persona yet. Start an inbound call in Call Studio!
                    </p>
                  ) : (
                    Object.entries(dashboardTypeBreakdown).map(([cat, count]) => {
                      const percentage = Math.round(
                        (count / (dashboardCalls.length || 1)) * 100
                      );
                      return (
                        <div key={cat} className="category-bar-item">
                          <div className="category-bar-meta">
                            <span>{cat}</span>
                            <strong>
                              {count} ({percentage}%)
                            </strong>
                          </div>
                          <div className="category-progress-track">
                            <div
                              className="category-progress-fill"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Urgent Attention Needed */}
              <div className="dashboard-widget-card">
                <div className="widget-title-row">
                  <h3>
                    <AlertCircle size={16} color="#f43f5e" />
                    <span>Urgent Calls Requiring Attention</span>
                  </h3>
                  <span className="widget-badge-count">{dashboardUrgentCalls.length} urgent</span>
                </div>

                <div className="urgent-calls-list">
                  {dashboardUrgentCalls.slice(0, 5).map((c) => (
                    <div key={c.call_id} className="urgent-call-snippet">
                      <div className="urgent-snippet-left">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <strong>{c.caller?.name || "Caller"}</strong>
                          <span className={`chip-mode ${MODES_CONFIG[c.mode]?.badgeClass || "badge-student"}`}>
                            {c.mode}
                          </span>
                        </div>
                        <span>{c.summary?.action_required || c.purpose || "Follow up required"}</span>
                      </div>
                      <span className={`badge-urgency ${c.summary?.urgency || "medium"}`}>
                        {c.summary?.urgency || "medium"}
                      </span>
                    </div>
                  ))}
                  {dashboardUrgentCalls.length === 0 && (
                    <p style={{ color: "var(--text-dim)", fontSize: "12px", padding: "12px 0" }}>
                      No critical high-urgency calls pending for this desk persona.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Cross-Persona Distribution Strip */}
            <div className="dashboard-widget-card">
              <div className="widget-title-row">
                <h3>
                  <Users size={16} />
                  <span>Cross-Persona Volume Distribution</span>
                </h3>
                <span className="widget-badge-count">
                  {callsList.length} Total Calls
                </span>
              </div>
              <div className="strip-cards-row">
                {Object.keys(MODES_CONFIG).map((m) => {
                  const mCalls = callsList.filter((c) => c.mode === m);
                  const mPending = actionsList.filter((a) => a.call_mode === m && !a.is_completed);
                  const isCurrent = effectiveDashboardMode === m || (effectiveDashboardMode === "all" && activeMode === m);
                  return (
                    <div
                      key={m}
                      className={`persona-volume-card ${isCurrent ? "focused" : ""}`}
                      onClick={() => setDashboardModeFilter(m)}
                    >
                      <div className="p-vol-header">
                        <span>{MODES_CONFIG[m].icon} {m}</span>
                        <span className={`chip-mode ${MODES_CONFIG[m].badgeClass}`}>{mCalls.length}</span>
                      </div>
                      <p className="p-vol-desc">{MODES_CONFIG[m].tagline}</p>
                      <div className="p-vol-footer">
                        <span>{mPending.length} pending</span>
                        <button
                          type="button"
                          className="btn-switch-persona-card"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModeChange(m);
                          }}
                        >
                          Switch →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            TAB 3: CALL LOGS & TRANSCRIPTS
            ================================================== */}
        {activeTab === "records" && (
          <div className="call-logs-container">
            {/* Unified Toolbar Strip */}
            <div className="unified-toolbar-strip">
              <div className="toolbar-left-group">
                <div className="search-field-wrapper">
                  <Search size={14} />
                  <input
                    type="text"
                    placeholder="Search calls by name, keyword, or action..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="toolbar-right-group">
                <div className="segmented-pill-group">
                  <button
                    type="button"
                    className={`seg-pill-btn ${recordsModeFilter === "auto" ? "active" : ""}`}
                    onClick={() => setRecordsModeFilter("auto")}
                  >
                    {activeMode} Desk
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${recordsModeFilter === "all" ? "active" : ""}`}
                    onClick={() => setRecordsModeFilter("all")}
                  >
                    All ({callsList.length})
                  </button>
                  {Object.keys(MODES_CONFIG).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`seg-pill-btn ${recordsModeFilter === m ? "active" : ""}`}
                      onClick={() => setRecordsModeFilter(m)}
                    >
                      {MODES_CONFIG[m].shortLabel}
                    </button>
                  ))}
                </div>

                <div className="segmented-pill-group">
                  <button
                    type="button"
                    className={`seg-pill-btn ${urgencyFilter === "all" ? "active" : ""}`}
                    onClick={() => setUrgencyFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${urgencyFilter === "high" ? "active" : ""}`}
                    onClick={() => setUrgencyFilter("high")}
                  >
                    High
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${urgencyFilter === "medium" ? "active" : ""}`}
                    onClick={() => setUrgencyFilter("medium")}
                  >
                    Medium
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${urgencyFilter === "spam" ? "active" : ""}`}
                    onClick={() => setUrgencyFilter("spam")}
                  >
                    Spam
                  </button>
                </div>

                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={handleExportCSV}
                  title="Export call records to CSV spreadsheet"
                >
                  <Download size={13} />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Calls Feed */}
            <div className="calls-feed-list">
              {filteredCalls.length === 0 ? (
                <div className="empty-feed-placeholder">
                  <FileText size={40} />
                  <p>No matching calls found for this filter.</p>
                </div>
              ) : (
                filteredCalls.map((call) => (
                  <div key={call.call_id} className={`call-card-item ${call.is_spam || call.call_type === "Spam / Robocall" ? "spam-card" : ""}`}>
                    <div className="call-card-top-row">
                      <div className="caller-identity">
                        <div className="caller-avatar-circle">
                          {call.caller?.name ? call.caller.name[0].toUpperCase() : "C"}
                        </div>
                        <div className="caller-name-phone">
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <h4>{call.caller?.name || "Unknown Caller"}</h4>
                            {call.caller?.is_vip && (
                              <span className="badge-vip-contact" title="VIP Executive Priority Contact">
                                <Star size={10} fill="#eab308" color="#eab308" />
                                VIP
                              </span>
                            )}
                          </div>
                          <p>
                            {call.caller?.phone || "No phone"} •{" "}
                            {new Date(call.started_at).toLocaleString([], {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <span className={`chip-mode ${MODES_CONFIG[call.mode]?.badgeClass || "badge-student"}`}>
                          {MODES_CONFIG[call.mode]?.icon || "📞"} {call.mode || "Student"}
                        </span>
                        {call.language && call.language !== "English" && (
                          <span className="chip-lang-badge">
                            🗣️ {call.language}
                          </span>
                        )}
                        {call.summary?.summary && (
                          <button
                            className="btn-listen-card"
                            title="Listen to call summary"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakCustomText(
                                `Summary for call from ${call.caller?.name || "caller"}: ${call.summary.summary}`
                              );
                            }}
                          >
                            <Volume2 size={12} />
                            <span>Listen</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn-notion-brief"
                          title="Copy executive Notion/Markdown brief"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyNotionBrief(call.call_id);
                          }}
                        >
                          {copiedNotionId === call.call_id ? (
                            <>
                              <CheckCircle2 size={12} color="#4ade80" />
                              <span style={{ color: "#4ade80" }}>Copied!</span>
                            </>
                          ) : (
                            <>
                              <FileDown size={12} />
                              <span>Notion Brief</span>
                            </>
                          )}
                        </button>
                        <span className={`chip-calltype ${call.is_spam || call.call_type === "Spam / Robocall" ? "spam-badge" : ""}`}>
                          {call.is_spam ? "🚫 Spam / Robocall" : (call.call_type || "General Inquiry")}
                        </span>
                        {call.summary?.urgency && (
                          <span className={`badge-urgency ${call.summary.urgency}`}>
                            {call.summary.urgency}
                          </span>
                        )}
                      </div>
                    </div>

                    {call.summary ? (
                      <>
                        <p className="call-summary-preview">{call.summary.summary}</p>
                        {call.summary.action_required && (
                          <div className="call-action-highlight">
                            <CheckSquare size={14} />
                            <span>
                              <strong>Action:</strong> {call.summary.action_required} (
                              {call.summary.suggested_follow_up || "Follow up needed"})
                            </span>
                          </div>
                        )}
                        {call.summary.meeting_detected && (
                          <div
                            className="call-action-highlight"
                            style={{ background: "rgba(6, 182, 212, 0.1)", color: "#38bdf8" }}
                          >
                            <Calendar size={14} />
                            <span>
                              <strong>Meeting Requested:</strong> {call.summary.meeting_details || "Meeting detected"}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="call-summary-preview" style={{ color: "var(--text-dim)" }}>
                        Call in progress or summary pending.
                      </p>
                    )}

                    <button
                      className="call-expand-toggle-btn"
                      onClick={async () => {
                        if (expandedCallId === call.call_id) {
                          setExpandedCallId(null);
                        } else {
                          setExpandedCallId(call.call_id);
                          // Fetch conversation if not present
                          const res = await fetch(`${BACKEND_URL}/calls/${call.call_id}`);
                          if (res.ok) {
                            const d = await res.json();
                            setCallsList((prev) =>
                              prev.map((c) => (c.call_id === call.call_id ? { ...c, fullDetails: d } : c))
                            );
                          }
                        }
                      }}
                    >
                      {expandedCallId === call.call_id ? (
                        <>
                          <ChevronUp size={14} /> Hide Full Transcript
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} /> View Full Conversation Transcript
                        </>
                      )}
                    </button>

                    {expandedCallId === call.call_id && call.fullDetails && (
                      <div className="call-expanded-transcript-drawer">
                        {call.fullDetails.conversation?.map((msg, i) => (
                          <div key={i} className={`chat-bubble-row ${msg.speaker}`}>
                            <div className={`bubble-avatar ${msg.speaker}`}>
                              {msg.speaker === "kira" ? "K" : "C"}
                            </div>
                            <div className="bubble-content-box">
                              <div className="bubble-meta">
                                <span>{msg.speaker === "kira" ? "KIRA" : call.caller?.name}</span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <p>{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB 4: ACTION CENTER ("WHAT DO I NEED TO DO?")
            ================================================== */}
        {activeTab === "actions" && (
          <div className="action-center-container">
            <div className="actions-header-banner">
              <div>
                <h2>Action Center — {effectiveActionsMode === "all" ? "All Persona Tasks" : `${effectiveActionsMode} Tasks`}</h2>
                <p>
                  {effectiveActionsMode === "all"
                    ? "Directives and follow-ups extracted from your conversations across all personas."
                    : (MODES_CONFIG[effectiveActionsMode]?.actionsSub || "AI-generated tasks from your calls. Check off items as you complete them.")}
                </p>
              </div>
            </div>

            {/* Manual Directive Creation Form */}
            {showNewActionModal && (
              <div className="action-create-card">
                <div className="action-create-header">
                  <h4>
                    <Plus size={16} color="#38bdf8" />
                    Create Manual Task or Desk Directive
                  </h4>
                  <button
                    type="button"
                    className="btn-close-mini"
                    onClick={() => setShowNewActionModal(false)}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleCreateManualTask} className="action-create-form">
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label>Task / Directive Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Send wholesale catalog / Review thesis draft"
                        value={newActionTask}
                        onChange={(e) => setNewActionTask(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div className="form-field">
                      <label>Caller or Contact Associated</label>
                      <input
                        type="text"
                        placeholder="e.g. Anita Desai or Keerthana (Directive)"
                        value={newActionCallerName}
                        onChange={(e) => setNewActionCallerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-grid-3">
                    <div className="form-field">
                      <label>Desk Persona</label>
                      <div className="readonly-mode-tag">
                        {MODES_CONFIG[activeMode]?.icon} {activeMode} Desk
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Urgency Level</label>
                      <select
                        value={newActionUrgency}
                        onChange={(e) => setNewActionUrgency(e.target.value)}
                      >
                        <option value="high">🔴 High Urgency</option>
                        <option value="medium">🟡 Medium Urgency</option>
                        <option value="low">🟢 Low Urgency</option>
                      </select>
                    </div>
                    <div className="form-field">
                      <label>Due Timeline</label>
                      <input
                        type="text"
                        placeholder="e.g. Today, by 5 PM / Tomorrow"
                        value={newActionDueDate}
                        onChange={(e) => setNewActionDueDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-field">
                    <label>Directive Details / Notes</label>
                    <textarea
                      rows={2}
                      placeholder="Specific requirements, instructions or context for this action item..."
                      value={newActionDescription}
                      onChange={(e) => setNewActionDescription(e.target.value)}
                    />
                  </div>

                  <div className="action-create-actions">
                    <button
                      type="button"
                      className="btn-cancel-action"
                      onClick={() => setShowNewActionModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-submit-action"
                      disabled={isCreatingAction || !newActionTask.trim()}
                    >
                      {isCreatingAction ? "Saving..." : "Save Directive"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Unified Action Center Toolbar */}
            <div className="unified-toolbar-strip">
              <div className="toolbar-left-group">
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                  Pending Directives ({filteredActions.filter((a) => !a.is_completed).length})
                </span>
              </div>

              <div className="toolbar-right-group">
                {/* Status Filter: All / Pending / Completed / Urgent */}
                <div className="segmented-pill-group">
                  <button
                    type="button"
                    className={`seg-pill-btn ${actionStatusFilter === "all" ? "active" : ""}`}
                    onClick={() => setActionStatusFilter("all")}
                  >
                    All ({actionsList.length})
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${actionStatusFilter === "pending" ? "active" : ""}`}
                    onClick={() => setActionStatusFilter("pending")}
                  >
                    Pending ({actionsList.filter((a) => !a.is_completed).length})
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${actionStatusFilter === "completed" ? "active" : ""}`}
                    onClick={() => setActionStatusFilter("completed")}
                  >
                    Completed ({actionsList.filter((a) => a.is_completed).length})
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${actionStatusFilter === "urgent" ? "active" : ""}`}
                    onClick={() => setActionStatusFilter("urgent")}
                  >
                    Urgent ({actionsList.filter((a) => a.urgency === "high").length})
                  </button>
                </div>

                <div className="segmented-pill-group">
                  <button
                    type="button"
                    className={`seg-pill-btn ${actionsModeFilter === "auto" ? "active" : ""}`}
                    onClick={() => setActionsModeFilter("auto")}
                  >
                    {activeMode} Desk
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${actionsModeFilter === "all" ? "active" : ""}`}
                    onClick={() => setActionsModeFilter("all")}
                  >
                    All Personas
                  </button>
                  {Object.keys(MODES_CONFIG).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`seg-pill-btn ${actionsModeFilter === m ? "active" : ""}`}
                      onClick={() => setActionsModeFilter(m)}
                    >
                      {MODES_CONFIG[m].shortLabel}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-primary-action"
                  onClick={() => setShowNewActionModal((prev) => !prev)}
                >
                  <Plus size={13} />
                  <span>{showNewActionModal ? "Close Form" : "New Directive"}</span>
                </button>
              </div>
            </div>

            <div className="actions-task-cards">
              {filteredActions.length === 0 ? (
                <div className="empty-feed-placeholder">
                  <CheckSquare size={40} />
                  <p>No action items recorded for this desk persona yet. KIRA will generate tasks automatically as calls conclude.</p>
                </div>
              ) : (
                filteredActions.map((action) => (
                  <div
                    key={action.id}
                    className={`task-item-card ${action.is_completed ? "completed" : ""}`}
                  >
                    <div className="task-left-section">
                      <button
                        className={`task-checkbox-custom ${action.is_completed ? "checked" : ""}`}
                        onClick={() => handleToggleAction(action.id)}
                      >
                        {action.is_completed && <CheckCircle2 size={16} />}
                      </button>
                      <div className="task-text-info">
                        <h4>{action.title}</h4>
                        <p>
                          Caller: <strong>{action.caller_name}</strong> ({action.caller_phone}) • {action.description}
                        </p>
                      </div>
                    </div>

                    <div className="task-right-tags">
                      <span className={`chip-mode ${MODES_CONFIG[action.call_mode]?.badgeClass || "badge-student"}`}>
                        {MODES_CONFIG[action.call_mode]?.icon || "📞"} {action.call_mode || "Student"}
                      </span>
                      <span className="due-hint-pill">⏱️ {action.due_hint || "Today"}</span>
                      <span className={`badge-urgency ${action.urgency || "medium"}`}>
                        {action.urgency}
                      </span>
                      <button
                        type="button"
                        className="btn-delete-action"
                        title="Delete action item"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================
            TAB 5: ASK KIRA (AI QUERY ASSISTANT)
            ================================================== */}
        {activeTab === "ask" && (
          <div className="ask-kira-container">
            <div className="ask-hero-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <h2>{MODES_CONFIG[activeMode]?.askHeroTitle || "Ask KIRA About Your Calls"}</h2>
                  <p>{MODES_CONFIG[activeMode]?.askHeroSub || "Query your stored phone conversations and summaries with natural language."}</p>
                </div>
                <span className={`chip-mode ${MODES_CONFIG[activeMode]?.badgeClass || "badge-student"}`}>
                  {MODES_CONFIG[activeMode]?.icon} {activeMode} Assistant
                </span>
              </div>

              <div className="sample-prompts-row">
                {(MODES_CONFIG[activeMode]?.samplePrompts || []).map((promptText, idx) => (
                  <button
                    key={idx}
                    className="sample-prompt-chip"
                    onClick={() => {
                      setAskQuestion(promptText);
                      handleAskKira(promptText);
                    }}
                  >
                    "{promptText}"
                  </button>
                ))}
              </div>
            </div>

            <form
              className="ask-input-bar"
              onSubmit={(e) => {
                e.preventDefault();
                handleAskKira();
              }}
            >
              <input
                type="text"
                placeholder="Ask KIRA any question about your calls..."
                value={askQuestion}
                onChange={(e) => setAskQuestion(e.target.value)}
                disabled={isAsking}
              />
              <button type="submit" className="btn-ask-submit" disabled={isAsking || !askQuestion.trim()}>
                {isAsking ? <RefreshCw size={16} className="spinning" /> : <Sparkles size={16} />}
                Ask
              </button>
            </form>

            <div className="autoplay-voice-toggle-row">
              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={autoPlayVoice}
                  onChange={(e) => setAutoPlayVoice(e.target.checked)}
                  style={{ accentColor: "var(--accent-cyan)", cursor: "pointer" }}
                />
                <span>Auto-read answer aloud in voice (Hands-free mode for busy multitasking)</span>
              </label>
            </div>

            {askAnswer && (
              <div className="assistant-answer-box">
                <div className="answer-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Bot size={18} />
                    <span>KIRA Response</span>
                  </div>
                  {askAudioBase64 && (
                    <button
                      className={`voice-play-btn ${isVoicePlaying ? "playing" : ""}`}
                      onClick={() => {
                        if (isVoicePlaying) {
                          stopVoiceAudio();
                        } else {
                          playVoiceAudio(askAudioBase64);
                        }
                      }}
                    >
                      {isVoicePlaying ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isVoicePlaying ? "Stop Voice" : "Listen to Voice"}</span>
                    </button>
                  )}
                </div>

                {isVoicePlaying && (
                  <div className="voice-wave-animator">
                    <div className="wave-bar bar-1" />
                    <div className="wave-bar bar-2" />
                    <div className="wave-bar bar-3" />
                    <div className="wave-bar bar-4" />
                    <div className="wave-bar bar-5" />
                    <span style={{ fontSize: "12px", color: "#38bdf8", marginLeft: "8px", fontWeight: 500 }}>
                      KIRA Voice Briefing in progress...
                    </span>
                  </div>
                )}

                <div className="answer-content">{askAnswer}</div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================
            TAB 6: CALLER PROFILES & KIRA MEMORY
            ================================================== */}
        {activeTab === "callers" && (
          <div className="callers-section-wrapper">
            <div className="actions-header-banner" style={{ marginBottom: "16px" }}>
              <div>
                <h2>
                  Memory & Caller Dossiers — {effectiveCallersMode === "all" ? "All Contacts" : `${effectiveCallersMode} Network`}
                </h2>
                <p>
                  {effectiveCallersMode === "all"
                    ? "Directory of contacts recognized across academic, freelance client, small business, and corporate advisory interactions."
                    : (MODES_CONFIG[effectiveCallersMode]?.memorySub || "Recognized caller profiles and persistent memory dossiers.")}
                </p>
              </div>
            </div>

            {/* Unified Toolbar for Memory */}
            <div className="unified-toolbar-strip">
              <div className="toolbar-left-group">
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-main)" }}>
                  Recognized Profiles ({filteredCallers.length})
                </span>
              </div>

              <div className="toolbar-right-group">
                <div className="segmented-pill-group">
                  <button
                    type="button"
                    className={`seg-pill-btn ${callersModeFilter === "auto" ? "active" : ""}`}
                    onClick={() => setCallersModeFilter("auto")}
                  >
                    {activeMode} Desk
                  </button>
                  <button
                    type="button"
                    className={`seg-pill-btn ${callersModeFilter === "all" ? "active" : ""}`}
                    onClick={() => setCallersModeFilter("all")}
                  >
                    All Contacts ({callersList.length})
                  </button>
                  {Object.keys(MODES_CONFIG).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`seg-pill-btn ${callersModeFilter === m ? "active" : ""}`}
                      onClick={() => setCallersModeFilter(m)}
                    >
                      {MODES_CONFIG[m].shortLabel}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={`seg-pill-btn btn-filter-vip ${vipOnlyFilter ? "active" : ""}`}
                    onClick={() => setVipOnlyFilter(!vipOnlyFilter)}
                    title="Filter VIP Contacts Only"
                    style={vipOnlyFilter ? { background: "rgba(234, 179, 8, 0.2)", borderColor: "rgba(234, 179, 8, 0.5)", color: "#fef08a" } : undefined}
                  >
                    <Star size={12} fill={vipOnlyFilter ? "#eab308" : "none"} color={vipOnlyFilter ? "#eab308" : "#94a3b8"} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} />
                    VIP Only
                  </button>
                </div>
              </div>
            </div>

            <div className="callers-grid">
              {filteredCallers.length === 0 ? (
                <div className="empty-feed-placeholder" style={{ gridColumn: "1 / -1" }}>
                  <Users size={40} />
                  <p>No caller profiles recorded for this desk persona yet.</p>
                </div>
              ) : (
                filteredCallers.map((caller) => (
                  <div key={caller.id} className={`caller-card-dossier ${caller.is_vip ? "vip-card" : ""}`}>
                    <div className="caller-card-header">
                      <div className="caller-dossier-info">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <h4>{caller.name}</h4>
                          {caller.is_vip && (
                            <span className="badge-vip-contact" title="VIP Executive Contact - Top Priority">
                              <Star size={11} fill="#eab308" color="#eab308" />
                              VIP Contact
                            </span>
                          )}
                          {caller.company_or_org && (
                            <span className="caller-org-tag">({caller.company_or_org})</span>
                          )}
                          {caller.registered_mode && (
                            <span className={`chip-mode-mini ${MODES_CONFIG[caller.registered_mode]?.badgeClass || "badge-student"}`} title="Caller's Registered Domain">
                              Domain: {MODES_CONFIG[caller.registered_mode]?.icon} {caller.registered_mode}
                            </span>
                          )}
                        </div>
                        <p>
                          {caller.phone} {caller.email && `• ${caller.email}`}
                        </p>
                        {caller.modes && caller.modes.length > 0 && (
                          <div style={{ display: "flex", gap: "6px", marginTop: "6px", flexWrap: "wrap" }}>
                            {caller.modes.map((m) => (
                              <span key={m} className={`chip-mode-mini ${MODES_CONFIG[m]?.badgeClass || "badge-student"}`}>
                                {MODES_CONFIG[m]?.icon} {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          className={`btn-vip-toggle ${caller.is_vip ? "is-vip" : ""}`}
                          title={caller.is_vip ? "Remove VIP Status" : "Pin as VIP Contact"}
                          onClick={() => handleToggleVIP(caller)}
                        >
                          <Star size={12} fill={caller.is_vip ? "#eab308" : "none"} color={caller.is_vip ? "#eab308" : "#94a3b8"} />
                          <span>{caller.is_vip ? "VIP Pinned" : "Pin VIP"}</span>
                        </button>
                        <button
                          type="button"
                          className="btn-edit-caller"
                          title={`Edit ${caller.name}'s Profile & Memory`}
                          onClick={() => handleOpenEditCaller(caller)}
                        >
                          <Edit2 size={12} />
                          <span>Edit</span>
                        </button>
                        <span className="chip-calltype">{caller.total_calls} Calls</span>
                        <button
                          type="button"
                          className="btn-call-in-studio"
                          title={`Open Call Studio for ${caller.name}`}
                          onClick={() => handleCallCallerInStudio(caller)}
                        >
                          <PhoneCall size={12} />
                          <span>Call</span>
                        </button>
                        <button
                          className="btn-delete-caller"
                          title={`Delete ${caller.name} from memory`}
                          onClick={async () => {
                            if (window.confirm(`Delete ${caller.name} from KIRA memory?`)) {
                              try {
                                await fetch(`${BACKEND_URL}/callers/${caller.id}`, { method: "DELETE" });
                                refreshAllData();
                              } catch (e) {
                                console.error("Delete caller failed", e);
                              }
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="memory-notes-dossier">
                      <h5>
                        <BrainCircuit size={13} />
                        KIRA Memory Dossier
                      </h5>
                      <p>
                        {caller.memory_notes ||
                          "No specific personal memory facts recorded yet for this caller."}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==================================================
          POST-CALL ANALYSIS MODAL
          ================================================== */}
      {showAnalysisModal && postCallSummary && (
        <div className="analysis-overlay">
          <div className="analysis-modal">
            <div className="analysis-header">
              <h3>
                <Sparkles size={20} color="#c084fc" />
                KIRA Call Analysis & Intelligence
              </h3>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  className="btn-listen-summary"
                  onClick={() =>
                    speakCustomText(
                      `Call summary: ${postCallSummary.summary}. ${
                        postCallSummary.action_required
                          ? "Action required: " + postCallSummary.action_required
                          : ""
                      }`
                    )
                  }
                >
                  <Volume2 size={16} />
                  <span>Listen Briefing</span>
                </button>
                <button
                  className="btn-close-analysis"
                  onClick={() => setShowAnalysisModal(false)}
                >
                  Close
                </button>
              </div>
            </div>

            <div className="analysis-body">
              <div className="summary-hero-card">
                <h4>Executive Summary</h4>
                <p>{postCallSummary.summary}</p>
              </div>

              {postCallSummary.action_required && (
                <div className="action-required-highlight">
                  <div className="action-icon-badge">
                    <CheckSquare size={20} />
                  </div>
                  <div className="action-details">
                    <h4>Action Required for Keerthana</h4>
                    <p>{postCallSummary.action_required}</p>
                    <span className="action-due-tag">
                      Suggested Follow-up:{" "}
                      <strong>{postCallSummary.suggested_follow_up || "Today"}</strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="analysis-meta-grid">
                <div className="meta-metric-card">
                  <span>Call Category</span>
                  <strong>{postCallSummary.call_type || "General Inquiry"}</strong>
                </div>
                <div className="meta-metric-card">
                  <span>Urgency Rating</span>
                  <span className={`badge-urgency ${postCallSummary.urgency}`}>
                    {postCallSummary.urgency}
                  </span>
                </div>
                <div className="meta-metric-card">
                  <span>Meeting Detected</span>
                  <strong>{postCallSummary.meeting_detected ? "Yes 📅" : "No"}</strong>
                </div>
              </div>

              {postCallSummary.meeting_details && (
                <div className="summary-hero-card" style={{ borderColor: "rgba(6, 182, 212, 0.4)" }}>
                  <h4 style={{ color: "#38bdf8" }}>Meeting Details</h4>
                  <p>{postCallSummary.meeting_details}</p>
                </div>
              )}

              {postCallSummary.key_points && postCallSummary.key_points.length > 0 && (
                <div className="key-points-list">
                  <h4>Key Information & Extracted Details</h4>
                  <ul>
                    {postCallSummary.key_points.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="analysis-footer">
              <button
                className="btn-close-analysis"
                onClick={() => setShowAnalysisModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          INSTANT NOTIFICATION & WEBHOOK SETTINGS MODAL
          ================================================== */}
      {showNotificationsModal && (
        <div className="analysis-overlay" onClick={() => setShowNotificationsModal(false)}>
          <div className="notif-settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="notif-settings-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="notif-icon-orb">
                  <Bell size={20} color="#38bdf8" />
                </div>
                <div>
                  <h3>Instant Alert & Webhook Settings</h3>
                  <p>Dispatch real-time alerts to Slack, Discord, Telegram, or custom webhooks when urgent calls conclude.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-mini"
                onClick={() => setShowNotificationsModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotificationSettings} className="notif-settings-form">
              <div className="notif-toggle-row">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={notifSettings.enabled ?? true}
                    onChange={(e) =>
                      setNotifSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                  />
                  <span>Enable Instant Notification Dispatching</span>
                </label>
              </div>

              <div className="form-field">
                <label>Webhook URL (Slack, Discord, Zapier, Make, n8n, Custom)</label>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/... or https://discord.com/api/webhooks/..."
                  value={notifSettings.webhook_url || ""}
                  onChange={(e) =>
                    setNotifSettings((prev) => ({ ...prev, webhook_url: e.target.value }))
                  }
                />
                <span className="field-hint">
                  KIRA will send a structured JSON payload with caller name, summary, and action directive when high-urgency calls arrive.
                </span>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Telegram Bot Token (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 123456789:ABCdefGhIJKlmNoPQRstuvWxyz"
                    value={notifSettings.telegram_bot_token || ""}
                    onChange={(e) =>
                      setNotifSettings((prev) => ({ ...prev, telegram_bot_token: e.target.value }))
                    }
                  />
                </div>
                <div className="form-field">
                  <label>Telegram Chat ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 987654321 or @your_channel"
                    value={notifSettings.telegram_chat_id || ""}
                    onChange={(e) =>
                      setNotifSettings((prev) => ({ ...prev, telegram_chat_id: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Alert Triggers</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "4px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={notifSettings.alert_on_high_urgency ?? true}
                      onChange={(e) =>
                        setNotifSettings((prev) => ({ ...prev, alert_on_high_urgency: e.target.checked }))
                      }
                    />
                    <span>🔴 High Urgency Calls (Immediate action required)</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={notifSettings.alert_on_meetings ?? true}
                      onChange={(e) =>
                        setNotifSettings((prev) => ({ ...prev, alert_on_meetings: e.target.checked }))
                      }
                    />
                    <span>📅 Meeting Requests Detected (Interview / Client sync / Orders)</span>
                  </label>
                </div>
              </div>

              {notifSavedMsg && (
                <div className="notif-saved-banner">
                  <CheckCircle2 size={14} color="#4ade80" />
                  <span>{notifSavedMsg}</span>
                </div>
              )}

              <div className="notif-modal-footer">
                <button
                  type="button"
                  className="btn-test-notif"
                  disabled={notifTesting}
                  onClick={handleSendTestAlert}
                >
                  {notifTesting ? <RefreshCw size={13} className="spinning" /> : <Bell size={13} />}
                  <span>{notifTesting ? "Sending Test..." : "Send Test Alert"}</span>
                </button>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    type="button"
                    className="btn-cancel-action"
                    onClick={() => setShowNotificationsModal(false)}
                  >
                    Close
                  </button>
                  <button type="submit" className="btn-submit-action">
                    Save Configuration
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT CALLER DOSSIER & VIP PINNING MODAL
          ================================================== */}
      {showEditCallerModal && editingCaller && (
        <div className="analysis-overlay" onClick={() => setShowEditCallerModal(false)}>
          <div className="notif-settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
            <div className="notif-settings-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="notif-icon-orb" style={{ background: "rgba(234, 179, 8, 0.15)", borderColor: "rgba(234, 179, 8, 0.3)" }}>
                  <Star size={20} color="#eab308" fill={editCallerIsVip ? "#eab308" : "none"} />
                </div>
                <div>
                  <h3>Edit Caller Memory & Dossier</h3>
                  <p>Update contact identity, persistent notes, and executive VIP priority.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-mini"
                onClick={() => setShowEditCallerModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCaller} className="notif-settings-form">
              <div className="notif-toggle-row" style={{ background: editCallerIsVip ? "rgba(234, 179, 8, 0.1)" : "rgba(255,255,255,0.03)", borderColor: editCallerIsVip ? "rgba(234, 179, 8, 0.4)" : "var(--border-subtle)" }}>
                <label className="toggle-label" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={editCallerIsVip}
                    onChange={(e) => setEditCallerIsVip(e.target.checked)}
                  />
                  <div>
                    <span style={{ fontWeight: 600, color: editCallerIsVip ? "#eab308" : "var(--text-primary)" }}>⭐ VIP Priority Contact</span>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                      KIRA treats this contact with executive priority and opens calls with VIP personalized greetings.
                    </p>
                  </div>
                </label>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Caller Name</label>
                  <input
                    type="text"
                    required
                    value={editCallerName}
                    onChange={(e) => setEditCallerName(e.target.value)}
                    placeholder="e.g. Meera Nair"
                  />
                </div>
                <div className="form-field">
                  <label>Company / Organization</label>
                  <input
                    type="text"
                    value={editCallerOrg}
                    onChange={(e) => setEditCallerOrg(e.target.value)}
                    placeholder="e.g. Global Talent Search"
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={editCallerEmail}
                    onChange={(e) => setEditCallerEmail(e.target.value)}
                    placeholder="e.g. caller@company.com"
                  />
                </div>
                <div className="form-field">
                  <label>Primary Domain Persona</label>
                  <select
                    value={editCallerMode}
                    onChange={(e) => setEditCallerMode(e.target.value)}
                    className="dock-input"
                    style={{ background: "rgba(0,0,0,0.4)", color: "#fff" }}
                  >
                    {Object.keys(MODES_CONFIG).map((m) => (
                      <option key={m} value={m}>
                        {MODES_CONFIG[m].icon} {m} Desk
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>KIRA Memory Notes & Dossier</label>
                <textarea
                  rows={4}
                  value={editCallerNotes}
                  onChange={(e) => setEditCallerNotes(e.target.value)}
                  placeholder="Key facts, historical preferences, past discussions, or instructions for KIRA when this caller rings..."
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    padding: "10px",
                    fontSize: "13px",
                    resize: "vertical"
                  }}
                />
                <span className="field-hint">
                  These notes are directly injected into KIRA's context memory whenever this caller calls.
                </span>
              </div>

              <div className="notif-modal-footer">
                <button
                  type="button"
                  className="btn-cancel-action"
                  onClick={() => setShowEditCallerModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit-action" disabled={isSavingCaller}>
                  {isSavingCaller ? "Saving Dossier..." : "Save Dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          REAL PHONE & TWILIO TELEPHONY GATEWAY MODAL
          ================================================== */}
      {showTelephonyModal && (
        <div className="analysis-overlay" onClick={() => setShowTelephonyModal(false)}>
          <div className="notif-settings-modal telephony-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="notif-settings-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="notif-icon-orb" style={{ background: "rgba(16, 185, 129, 0.15)", borderColor: "rgba(16, 185, 129, 0.3)" }}>
                  <PhoneForwarded size={20} color="#10b981" />
                </div>
                <div>
                  <h3>Real Phone & Twilio Telephony Gateway</h3>
                  <p>Route actual cellular & landline phone calls into KIRA with real-time AI voice conversation.</p>
                </div>
              </div>
              <button
                type="button"
                className="btn-close-mini"
                onClick={() => setShowTelephonyModal(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTelephonySettings} className="notif-settings-form">
              <div className="notif-toggle-row">
                <label className="toggle-label" style={{ cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={telephonySettings.enabled ?? false}
                    onChange={(e) =>
                      setTelephonySettings((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                  />
                  <div>
                    <span style={{ fontWeight: 600 }}>Enable Real Phone Call Inbound Gateway</span>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                      Allows Twilio to connect real phone calls to KIRA and save call logs and transcripts directly to your dashboard.
                    </p>
                  </div>
                </label>
              </div>

              <div className="form-field">
                <label>Your Public Webhook Base URL (e.g. ngrok or Cloudflare tunnel)</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="url"
                    placeholder="https://abc123xyz.ngrok-free.app"
                    value={telephonySettings.webhook_base_url || ""}
                    onChange={(e) =>
                      setTelephonySettings((prev) => ({ ...prev, webhook_base_url: e.target.value }))
                    }
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn-copy-webhook"
                    title="Copy full Twilio voice webhook URL"
                    onClick={() => {
                      const fullUrl = `${telephonySettings.webhook_base_url?.replace(/\/+$/, "") || "https://your-domain.ngrok-free.app"}/telephony/twilio/voice`;
                      navigator.clipboard.writeText(fullUrl);
                      setCopiedWebhookUrl(true);
                      setTimeout(() => setCopiedWebhookUrl(false), 2000);
                    }}
                  >
                    <Copy size={13} />
                    <span>{copiedWebhookUrl ? "Copied!" : "Copy Webhook"}</span>
                  </button>
                </div>
                <span className="field-hint">
                  Twilio Voice Webhook: <code>{telephonySettings.webhook_base_url ? `${telephonySettings.webhook_base_url.replace(/\/+$/, "")}/telephony/twilio/voice` : "https://<your-ngrok-url>/telephony/twilio/voice"}</code> (HTTP POST)
                </span>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Twilio Account SID (Optional for caller ID)</label>
                  <input
                    type="text"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={telephonySettings.account_sid || ""}
                    onChange={(e) =>
                      setTelephonySettings((prev) => ({ ...prev, account_sid: e.target.value }))
                    }
                  />
                </div>
                <div className="form-field">
                  <label>Twilio Phone Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={telephonySettings.phone_number || ""}
                    onChange={(e) =>
                      setTelephonySettings((prev) => ({ ...prev, phone_number: e.target.value }))
                    }
                  />
                </div>
              </div>

              {/* Instructions Guide Box */}
              <div className="telephony-instructions-box">
                <h4>🚀 How to Connect Your Real Phone Number in 3 Steps:</h4>
                <ol>
                  <li>
                    <strong>Expose KIRA backend locally:</strong> Run <code>ngrok http 8000</code> in your terminal. Copy the HTTPS forwarding address (e.g. <code>https://xyz.ngrok-free.app</code>) into the Webhook Base URL above.
                  </li>
                  <li>
                    <strong>Configure Twilio Number:</strong> Open your <a href="https://console.twilio.com/" target="_blank" rel="noreferrer">Twilio Console</a> &rarr; Phone Numbers &rarr; Configure &rarr; Under <em>&quot;A Call Comes In&quot;</em>, set Webhook to <code>POST</code> and paste:
                    <br />
                    <code className="code-highlight">{telephonySettings.webhook_base_url ? `${telephonySettings.webhook_base_url.replace(/\/+$/, "")}/telephony/twilio/voice` : "https://<ngrok-url>/telephony/twilio/voice"}</code>
                  </li>
                  <li>
                    <strong>Dial from any real phone:</strong> Call your Twilio number from your mobile. KIRA will answer live, converse with voice intelligence, recognize VIP contacts, and post full transcripts and action items to your dashboard!
                  </li>
                </ol>
              </div>

              {telephonySavedMsg && (
                <div className="notif-saved-banner">
                  <CheckCircle2 size={14} color="#4ade80" />
                  <span>{telephonySavedMsg}</span>
                </div>
              )}

              <div className="notif-modal-footer">
                <button
                  type="button"
                  className="btn-cancel-action"
                  onClick={() => setShowTelephonyModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn-submit-action" disabled={isSavingTelephony}>
                  {isSavingTelephony ? "Saving Settings..." : "Save Telephony Gateway"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          IN-CALL ACTION DISPATCHER & PITCH DECK MODALS
          ================================================== */}
      {renderActionDispatcherModal()}
      {renderPitchDeckModal()}

      {/* Authentication Modal */}
      {renderAuthModal()}
    </div>
  );
}