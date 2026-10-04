import os
import json
import time

from dotenv import load_dotenv
from google import genai
from google.genai import errors, types


load_dotenv()


# ==================================================
# GEMINI SETUP
# ==================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

# Fail-fast client configuration for ultra-low latency conversational voice responses
client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=types.HttpOptions(
        retry_options=types.HttpRetryOptions(attempts=1),
        timeout=10000
    )
)

PRIMARY_MODEL = os.getenv("KIRA_MODEL", "gemini-3-flash-preview")
RAW_MODELS = [
    PRIMARY_MODEL,
    "gemini-3-flash-preview",
    "gemini-3.6-flash"
]
MODELS = []
for _m in RAW_MODELS:
    if _m and _m not in MODELS:
        MODELS.append(_m)


# ==================================================
# ==================================================
# KIRA SYSTEM PROMPTS & STRICT PERSONA DOMAINS
# ==================================================

MODE_CONFIGS = {
    "Student": {
        "desk_name": "Academic & Campus Reception Desk",
        "role_instruction": (
            "You are Keerthana's Academic & Campus Assistant. You represent her for coursework, "
            "team projects, hackathons, lab research, study groups, and student internship inquiries.\n"
            "STRICT PERSONA BOUNDARY: Under NO circumstances discuss commercial retail, wholesale billing, "
            "freelance client contracts, or corporate recruitment. "
            "Focus exclusively on academic deadlines, project repositories/tech stacks, professors, and teammates."
        ),
        "purpose_examples": "coursework project, team hackathon, lab session, student internship application, study group",
        "key_details": "course/subject, project tech stack, submission deadline, team members, meeting preference"
    },
    "Freelancer": {
        "desk_name": "Freelance & Client Inbound Studio",
        "role_instruction": (
            "You are Keerthana's Freelance Client Representative. You handle client design & development briefs, "
            "UI/UX scopes, project quotes, milestones, deliverables, and retainer contracts.\n"
            "STRICT PERSONA BOUNDARY: Under NO circumstances discuss college homework, coursework, university exams, "
            "or retail storefront inventory. Treat every caller as a valued client, prospect, or agency partner. "
            "Focus on deliverable scope, project budget/pricing, turnaround milestones, and design assets."
        ),
        "purpose_examples": "UI/UX design brief, web/mobile app quote, project scope, retainer contract, milestone review",
        "key_details": "deliverable scope, estimated budget/rate, target launch date or turnaround sprint, required assets"
    },
    "Small Business": {
        "desk_name": "Business Operations & Customer Desk",
        "role_instruction": (
            "You are the professional front-desk receptionist for Keerthana's Business & Store Operations. "
            "You handle customer product inquiries, wholesale/bulk orders, catalog requests, delivery schedules, "
            "pricing tiers, and supplier/vendor partnerships.\n"
            "CRITICAL STRICT PERSONA BOUNDARY: NEVER discuss college, homework, hackathons, academic projects, or student internships! "
            "This is strictly a business desk. Speak and act purely as a business receptionist. "
            "Focus on order quantities, product specifications, volume discount tiers, delivery locations, and dates."
        ),
        "purpose_examples": "product/catalog inquiry, bulk or wholesale order, pricing & volume discount, order status, delivery dispatch, vendor supply",
        "key_details": "product SKU/name, quantity/volume, delivery location, requested delivery date, company/billing name"
    },
    "Professional": {
        "desk_name": "Executive Suite & Career Advisory Liaison",
        "role_instruction": (
            "You are Keerthana's Executive Assistant and Professional Liaison. You handle corporate executive outreach, "
            "technical recruiters, speaking invitations, board advisory requests, and strategic industry partnerships.\n"
            "STRICT PERSONA BOUNDARY: Under NO circumstances discuss student homework, coursework, or retail customer orders. "
            "Maintain an executive, polished, and confidential demeanor. "
            "Focus on role seniority, organizational scope, interview scheduling, and strategic consultation agenda."
        ),
        "purpose_examples": "executive recruiter outreach, advisory board invitation, speaking engagement, consulting engagement, strategic partnership",
        "key_details": "organization/firm name, executive role/topic, compensation/equity overview, proposed interview schedule"
    }
}

def build_system_prompt(mode: str = "Student", caller_context: dict | None = None, language: str = "English") -> str:
    cfg = MODE_CONFIGS.get(mode, MODE_CONFIGS["Student"])

    prompt = f"""You are KIRA, an intelligent AI communication agent and receptionist for Keerthana.

Keerthana is currently unavailable to take calls.

Active Desk: {cfg['desk_name']} ({mode} Mode)
Desk Role:
{cfg['role_instruction']}

Your responsibilities:
- Greet the caller warmly, professionally, and naturally.
- Identify the clear purpose of their call relevant to this desk (e.g. {cfg['purpose_examples']}).
- Collect key details for Keerthana: {cfg['key_details']}.
- Ask only ONE or TWO focused questions at a time. Keep responses concise, warm, and natural (1-3 sentences max).
- Never pretend to be Keerthana.
- Never invent information or make promises about Keerthana's personal schedule.
- When the caller is ready to finish, politely confirm you have recorded their message and will pass it directly to Keerthana.
"""

    # Language Directives
    if language == "Telugu":
        prompt += """
LANGUAGE DIRECTIVE:
- Speak to the caller fluently in TELUGU (తెలుగు).
- Greet and respond in natural, polite, conversational Telugu script.
- Example: "నమస్కారం, కీర్తన గారు ప్రస్తుతం అందుబాటులో లేరు. నేను మీకు ఎలా సహాయపడగలను?"
"""
    elif language == "Hindi":
        prompt += """
LANGUAGE DIRECTIVE:
- Speak to the caller fluently in HINDI (हिंदी).
- Greet and respond in natural, polite, conversational Hindi script.
- Example: "नमस्ते, कीर्तना जी अभी उपलब्ध नहीं हैं। मैं आपकी किस प्रकार सहायता कर सकती हूँ?"
"""
    else:
        prompt += """
LANGUAGE DIRECTIVE:
- Converse in clear, warm, and professional English.
"""

    prompt += """
INDIAN ACCENT & COLLOQUIAL SLANG ROBUSTNESS:
- The caller may speak with an Indian English accent, use regional slang ('yaar', 'bro', 'da', 'bhaiya', 'doubt', 'prepone', 'revert back', 'do one thing', 'passed out'), or colloquial phrasing.
- Seamlessly interpret their underlying intent and meaning. Never question their wording or correct their slang.
- If the caller says they are Keerthana's friend (e.g. "I'm her friend", "friend of Keerthana", "this is her batchmate/buddy"), acknowledge them warmly as a friend.
- If a delivery agent calls (Swiggy, Zomato, parcel delivery), treat them with immediate clarity and practical gate/flat guidance.
"""

    # AI Spam & Telemarketing Screening
    prompt += """
AI SPAM & TELEMARKETING SCREENING:
- If the caller is pitching unsolicited personal loans, credit cards, insurance, lottery prizes, real estate investments, or spam robocalls:
  1. Politely and firmly decline: "Keerthana is not interested in marketing or unsolicited commercial offers. Thank you, goodbye."
  2. Do not collect contact details or engage in extended dialogue.
  3. Close the call politely.
"""

    has_known_name = (
        caller_context
        and caller_context.get("name")
        and caller_context["name"].strip().lower() not in ["guest caller", "unknown", "unknown caller", ""]
    )

    if has_known_name:
        name = caller_context["name"].strip()
        calls_count = caller_context.get("calls_count", 0)
        notes = caller_context.get("memory_notes", "")
        is_returning = caller_context.get("is_returning", False) or calls_count > 1

        prompt += f"""
IMPORTANT CALLER IDENTIFICATION:
- The caller's name is ALREADY KNOWN: {name}.
- Do NOT ask for the caller's name under any circumstances! You already know who they are.
- Address them directly and warmly by their name ({name}).
"""
        if is_returning:
            prompt += f"""- Status: RETURNING CONTACT ({calls_count} prior calls).
- Memory context about them: {notes if notes else 'Known contact'}.
- Acknowledge them warmly as a returning contact (e.g., "Hello {name}, good to hear from you again!").
"""
        else:
            prompt += f"""- Status: FIRST-TIME CALLER whose name is {name}.
- Greet and address them politely by name (e.g., "Hello {name}! How can I help you today?").
"""
    else:
        prompt += """
CALLER IDENTITY:
- The caller's name is NOT yet known. Politely ask for their name early in the conversation so Keerthana knows who called.
"""

    if caller_context and caller_context.get("is_vip"):
        prompt += f"""
⭐ VIP EXECUTIVE PRIORITY:
- This caller is designated as an exclusive VIP contact of Keerthana ({caller_context.get('name') or 'VIP'})!
- Give them executive priority, maximum warmth, and expedited assistance.
- Explicitly emphasize that their message or request will be personally prioritized for Keerthana.
"""

    return prompt


# ==================================================
# SAFE PERSONA FALLBACK RESPONSES
# ==================================================

def get_persona_fallback(mode: str = "Student", conversation: list | None = None) -> str:
    # If the conversation already has multiple turns, gracefully wrap up without interrogating again
    turn_count = len(conversation or [])
    if turn_count >= 3:
        return "Understood, I've noted down all these details for Keerthana. I'll make sure she receives your message promptly."

    fallbacks = {
        "Student": "I've noted that down for Keerthana's academic desk. Is there anything else you'd like me to pass along?",
        "Freelancer": "Thank you, I've captured those project details for Keerthana. Is there anything else you'd like to add?",
        "Small Business": "Understood, I've recorded this for Keerthana's store operations. Is there any other detail needed?",
        "Professional": "Thank you, I've noted this for Keerthana's executive desk. I will ensure she receives this promptly."
    }
    return fallbacks.get(mode, fallbacks["Student"])

KIRA_FALLBACK_RESPONSE = (
    "I've recorded that for Keerthana. Is there anything else you'd like me to pass on?"
)


# ==================================================
# FAST CONVERSATIONAL REFLEX (0ms Ultra-Low Latency)
# ==================================================

def check_fast_conversational_reflex(caller_text: str, mode: str = "Student", caller_name: str | None = None) -> str | None:
    if not caller_text:
        return None
    tl = caller_text.lower().strip()

    # 1. Greetings
    if tl in ["hello", "hi", "hey", "hello?", "hi there", "hey there", "are you there", "can you hear me"]:
        greet = f"Hello {caller_name}!" if caller_name else "Hello!"
        return f"{greet} I'm KIRA, Keerthana's AI voice assistant. She is currently unavailable—how can I help you today?"

    # 2. Availability inquiry
    if any(p in tl for p in [
        "is keerthana free", "is keerthana available", "is keerthana there",
        "can i speak to keerthana", "can i talk to keerthana", "where is keerthana",
        "is she available", "is she free", "is she there"
    ]):
        return "Keerthana is currently unavailable to take calls. Would you like to leave a message or schedule a callback?"

    # 3. Identity inquiry
    if any(p in tl for p in [
        "who is this", "who are you", "who am i speaking with", "is this an ai",
        "am i speaking to a robot", "what is this", "who is speaking"
    ]):
        return "I'm KIRA, Keerthana's autonomous AI voice agent. I manage her calls when she's busy. Who is calling, please?"

    # 4. Callback requests
    if any(p in tl for p in [
        "call me back", "tell her to call me", "ask her to call me",
        "have her call me", "please call back", "ask keerthana to call"
    ]):
        return "Understood. I will pass an urgent callback notification to Keerthana. What is the best number or detail to reach you at?"

    # 5. Urgent / emergency
    if any(p in tl for p in [
        "this is urgent", "it's urgent", "emergency", "asap", "need to speak urgently"
    ]):
        return "Understood, I am flagging this as high priority for Keerthana right now. Please tell me your key message and I'll notify her immediately."

    # 6. Friend / Batchmate introductions
    if any(p in tl for p in [
        "her friend", "keerthana's friend", "i am a friend", "i'm a friend",
        "friend of keerthana", "this is her friend", "batchmate", "classmate", "roommate"
    ]):
        return "Hey! Great to connect with you. Keerthana is currently caught up, but I will make sure she gets your message directly. Who is this, and what's going on?"

    # 7. Questions / Doubts
    if any(p in tl for p in [
        "i have a question", "i have a doubt", "had a doubt", "need to ask something", "want to ask something"
    ]):
        return "Sure, please go ahead and tell me what you'd like to ask. I'll record the details for Keerthana to review."

    # 8. Gratitude, Wrap-up & Acknowledgments
    if any(p in tl for p in [
        "thank you", "thanks", "thank u", "no thank you", "no thanks",
        "that's all", "that is all", "that's it", "that is it", "nothing else",
        "nothing more", "no more", "bye", "goodbye", "all good", "done"
    ]):
        return "You're welcome! I have recorded your message and will pass it directly to Keerthana. Have a wonderful day, goodbye!"

    return None


# ==================================================
# GEMINI REQUEST WITH AUTO-MODEL FALLBACK
# ==================================================

def _generate_content(prompt: str, max_tokens: int = 100) -> str:
    """
    Calls Gemini with multi-model fallback, fast failover, and token limiting for low latency.
    """
    config = types.GenerateContentConfig(
        max_output_tokens=max_tokens,
        temperature=0.65
    )
    tested_models = []
    for model_name in MODELS:
        if not model_name or model_name in tested_models:
            continue
        tested_models.append(model_name)

        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=config
            )

            if hasattr(response, "text") and response.text:
                return response.text.strip()
            if hasattr(response, "candidates") and response.candidates:
                content = getattr(response.candidates[0], "content", None)
                if content and getattr(content, "parts", None):
                    text = "".join(getattr(p, "text", "") for p in content.parts if hasattr(p, "text"))
                    if text.strip():
                        return text.strip()

        except errors.ServerError as e:
            print(f"Gemini {model_name} server error: {e}, failing fast to backup model...")
            continue

        except errors.ClientError as e:
            print(f"Gemini {model_name} client error: {e}, failing fast to backup model...")
            continue

        except Exception as e:
            print(f"Unexpected error on {model_name}: {e}, failing fast to backup model...")
            continue

    return KIRA_FALLBACK_RESPONSE


# ==================================================
# GENERATE KIRA RESPONSE
# ==================================================

def generate_kira_response(
    conversation: list,
    mode: str = "Student",
    caller_context: dict | None = None,
    language: str = "English"
) -> str:
    # 1. Fast conversational reflex check on latest caller message
    last_caller_text = ""
    for msg in reversed(conversation):
        if msg.get("speaker") == "caller":
            last_caller_text = msg.get("content", "")
            break

    caller_name = (caller_context or {}).get("name")
    reflex_answer = check_fast_conversational_reflex(last_caller_text, mode=mode, caller_name=caller_name)
    if reflex_answer:
        return reflex_answer

    # 2. Otherwise generate response with low-latency LLM
    system_prompt = build_system_prompt(mode=mode, caller_context=caller_context, language=language)

    history = ""
    for message in conversation:
        speaker = message["speaker"].capitalize()
        content = message["content"]
        history += f"{speaker}: {content}\n"

    prompt = f"""{system_prompt}

Conversation so far:
{history}

Respond as KIRA to the caller's latest message. Keep it conversational, brief (1-2 sentences), and helpful.
KIRA:"""

    response = _generate_content(prompt, max_tokens=100)
    if response == KIRA_FALLBACK_RESPONSE:
        return get_persona_fallback(mode, conversation)
    return response


# ==================================================
# GENERATE DEEP CALL SUMMARY & CLASSIFICATION
# ==================================================

MODE_CALL_TYPES = {
    "Student": [
        "Internship", "Academic Project", "Hackathon", "College & Lab", "Team Coordination", "General Inquiry", "Spam / Robocall"
    ],
    "Freelancer": [
        "Client Brief", "Scope & Quote", "UI/UX Sprints", "Retainer Lead", "Revision Request", "General Inquiry", "Spam / Robocall"
    ],
    "Small Business": [
        "Order Inquiry", "Bulk & Wholesale", "Product Catalog", "Customer Support", "Vendor & Supply", "Delivery Logistics", "Spam / Robocall"
    ],
    "Professional": [
        "Recruiter", "Executive Advisory", "Interview Request", "Speaking Invitation", "Strategic Partnership", "General Inquiry", "Spam / Robocall"
    ]
}

def generate_call_summary(conversation: list, mode: str = "Student") -> dict:
    history = ""
    for message in conversation:
        speaker = message["speaker"].capitalize()
        content = message["content"]
        history += f"{speaker}: {content}\n"

    valid_types = MODE_CALL_TYPES.get(mode, MODE_CALL_TYPES["Student"])
    valid_types_str = " | ".join(valid_types)

    prompt = f"""You are the intelligence analysis system for KIRA (AI Assistant for Keerthana).
Analyze this phone conversation and extract structured insights strictly within the '{mode}' domain.

Active Mode: {mode}
Conversation:
{history}

STRICT PERSONA DOMAIN RULE:
- This call was handled by the '{mode}' desk.
- If mode is 'Small Business': The call MUST be classified as a commercial business interaction ({valid_types_str}). NEVER label it as an Internship or Academic Project! The action_required must be a clear business follow-up (e.g. 'Send corporate gift catalog and volume discount pricing', 'Confirm dispatch date for bulk order').
- If mode is 'Student': The call is strictly academic ({valid_types_str}). NEVER classify as retail or client contract.
- If mode is 'Freelancer': The call is strictly freelance client work ({valid_types_str}).
- If mode is 'Professional': The call is strictly executive career, recruiter, or board advisory ({valid_types_str}).
- If the call is an unsolicited marketing pitch, pre-approved loan, insurance spam, or robocall: classify call_type as 'Spam / Robocall', urgency as 'low', and action_required as null.
- LANGUAGE RULE: Regardless of whether the caller spoke in Telugu, Hindi, or English, ALWAYS write the 'summary', 'key_points', and 'action_required' in clear, professional ENGLISH so Keerthana can read it immediately.

Return ONLY valid JSON (no markdown formatting, no code blocks, no backticks).
Use exactly this JSON schema:
{{
    "call_type": "{valid_types_str}",
    "is_spam": false,
    "summary": "Short 1-2 sentence overview of the conversation in English",
    "key_points": [
        "First key detail or request",
        "Second key detail (e.g. deadline, volume/scope, timing)"
    ],
    "action_required": "Clear, specific action directive for Keerthana, or null if spam",
    "suggested_follow_up": "Today | Tomorrow | This week | Not needed",
    "urgency": "high | medium | low",
    "meeting_detected": false,
    "meeting_details": "Date, time, and topic if a meeting was requested, otherwise empty string",
    "lead_info": "Budget, order volume, or project scope if applicable, otherwise empty string",
    "caller_memory_update": "Short summary of persistent facts to remember about this caller for future calls"
}}

Rules:
- call_type MUST be chosen from: {', '.join(valid_types)}.
- urgency MUST be one of: high, medium, low.
- key_points MUST be a JSON array of strings (2-4 bullets).
- If caller mentioned meeting or times like 'tomorrow at 4pm', set meeting_detected: true and describe in meeting_details.
"""

    result = _generate_content(prompt, max_tokens=400)

    default_type = valid_types[0] if valid_types else "General Inquiry"
    fallback_data = {
        "call_type": default_type,
        "is_spam": False,
        "summary": "KIRA received a call and recorded the message for Keerthana.",
        "key_points": ["Caller contacted Keerthana while she was unavailable."],
        "action_required": "Review the call record and follow up if needed.",
        "suggested_follow_up": "This week",
        "urgency": "medium",
        "meeting_detected": False,
        "meeting_details": "",
        "lead_info": "",
        "caller_memory_update": ""
    }

    if result == KIRA_FALLBACK_RESPONSE:
        return fallback_data

    cleaned = result.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        print(f"Failed to parse JSON summary: {cleaned}")
        return fallback_data

    all_known_valid_types = [
        "Internship", "Academic Project", "Hackathon", "College & Lab", "Team Coordination",
        "Client Brief", "Scope & Quote", "UI/UX Sprints", "Retainer Lead", "Revision Request",
        "Order Inquiry", "Bulk & Wholesale", "Product Catalog", "Customer Support", "Vendor & Supply", "Delivery Logistics",
        "Recruiter", "Executive Advisory", "Interview Request", "Speaking Invitation", "Strategic Partnership",
        "General Inquiry", "Spam / Robocall"
    ]
    if data.get("call_type") not in all_known_valid_types:
        data["call_type"] = default_type

    is_spam = data.get("call_type") == "Spam / Robocall" or bool(data.get("is_spam", False))
    data["is_spam"] = is_spam

    if is_spam:
        data["urgency"] = "low"
        data["action_required"] = None
        data["suggested_follow_up"] = "Not needed"

    if data.get("urgency") not in ["high", "medium", "low"]:
        data["urgency"] = "medium"

    if not isinstance(data.get("key_points"), list):
        data["key_points"] = [str(data.get("key_points", ""))] if data.get("key_points") else []

    if not data.get("action_required"):
        data["action_required"] = "Review call and contact caller."

    data["requested_action"] = data["action_required"]

    if not data.get("suggested_follow_up"):
        data["suggested_follow_up"] = "Today" if data["urgency"] == "high" else "This week"

    data["meeting_detected"] = bool(data.get("meeting_detected", False))
    data["meeting_details"] = str(data.get("meeting_details") or "")
    data["lead_info"] = str(data.get("lead_info") or "")
    data["caller_memory_update"] = str(data.get("caller_memory_update") or "")

    return data


# ==================================================
# ASK KIRA ABOUT YOUR CALLS (AI CALL ASSISTANT)
# ==================================================

def ask_kira_about_calls(
    question: str,
    calls_context: list,
    mode: str = "Student"
) -> str:
    """
    Answer user queries about their calls using Gemini with active persona mode awareness.
    """
    if not calls_context:
        return f"Keerthana, no stored calls were found in the database for your active {mode} desk yet."

    formatted_context = ""
    for idx, c in enumerate(calls_context[:30], 1):
        caller_name = c.get("caller_name") or "Unknown caller"
        phone = c.get("phone") or "No phone"
        call_type = c.get("call_type") or "General"
        urgency = c.get("urgency") or "medium"
        started_at = c.get("started_at") or "Recent"
        summary = c.get("summary") or "No summary"
        action = c.get("action_required") or "None"
        key_pts = c.get("key_points") or []

        formatted_context += f"""
Call #{idx}:
- Caller: {caller_name} ({phone})
- Date/Time: {started_at}
- Category: {call_type} | Urgency: {urgency}
- Summary: {summary}
- Action Required: {action}
- Key Points: {', '.join(key_pts) if isinstance(key_pts, list) else key_pts}
"""

    mode_domain_rules = {
        "Small Business": (
            "You are Keerthana's Business Operations Receptionist. Answer strictly regarding customer orders, "
            "bulk purchase inquiries, product catalogs, volume discounts, delivery dispatch, and vendor communications. "
            "CRITICAL: Under NO circumstances discuss or mix up academic projects, student internships, college coursework, or hackathons!"
        ),
        "Student": (
            "You are Keerthana's Academic & Campus Assistant. Answer strictly regarding coursework, academic team projects, "
            "hackathons, lab syncs, college professors, and student internship applications."
        ),
        "Freelancer": (
            "You are Keerthana's Freelance Client Representative. Answer strictly regarding client design/dev briefs, "
            "quotes, project scopes, UI/UX sprints, turnaround times, and contract deliverables."
        ),
        "Professional": (
            "You are Keerthana's Executive Assistant. Answer strictly regarding executive recruiter outreach, "
            "consulting retainers, advisory board syncs, and corporate speaking invitations."
        )
    }
    desk_rule = mode_domain_rules.get(mode, mode_domain_rules["Student"])

    prompt = f"""You are KIRA, Keerthana's intelligent communication assistant.
Active Desk Rule:
{desk_rule}

Keerthana is asking you a question about her calls.

Calls Database Context:
{formatted_context}

Keerthana's Question:
"{question}"

Instructions:
- Provide a direct, concise, and helpful answer strictly tailored to Keerthana's active desk ({mode}).
- Mention caller names, dates/times, and actions required clearly.
- If multiple people called about a topic, list them clearly with bullet points.
- If no matching calls exist for the question in this desk, inform Keerthana politely.
- Keep the tone confident, intelligent, professional, and efficient.
"""

    return _generate_content(prompt)