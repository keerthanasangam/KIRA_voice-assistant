import re

# ==================================================
# PHONETIC NAME & BRAND CORRECTIONS (Whisper mishearings)
# ==================================================

PHONETIC_REPLACEMENTS = [
    # Keerthana variations
    (r"\b(kirtna|kirthna|keerthna|kirtana|kiratna|kirthana|keerthana's|kirtna's)\b", "Keerthana"),
    (r"\bkira ai\b", "KIRA"),
    
    # Delivery Brands & Local Services
    (r"\b(swigi|swigy|swigie|suiggy)\b", "Swiggy"),
    (r"\b(dunjo|dunzho|dunzoo)\b", "Dunzo"),
    (r"\b(zomatto|jomato|zomatoo)\b", "Zomato"),
    (r"\b(watsap|whatsap|watsapp|whats app)\b", "WhatsApp"),
    (r"\b(pay tm|paytm|pay team)\b", "Paytm"),
    (r"\bgpay|g pay\b", "Google Pay"),
    (r"\bphonpe|phone pe|phonepe\b", "PhonePe"),
    
    # Common Indian honorifics / colloquial terms
    (r"\b(baya|bhayya|bhaya|bhaiyya)\b", "bhaiya"),
    (r"\b(yaar|yar|yaaar)\b", "yaar"),
    
    # Academic & Tech terms
    (r"\b(dbms|d b m s)\b", "DBMS"),
    (r"\b(hackaton|hackathon)\b", "hackathon"),
    (r"\b(calender|calendly)\b", "Calendly"),
]

# ==================================================
# INDIAN ENGLISH COLLOQUIAL PHRASES
# ==================================================

COLLOQUIAL_CLARIFIERS = [
    # "Having a doubt" -> question
    (r"\b(i have a doubt|having a doubt|got a doubt)\b", "I have a question"),
    (r"\b(do one thing)\b", "here is an idea"),
    (r"\b(out of station)\b", "out of town"),
    (r"\b(revert back)\b", "reply"),
    (r"\b(prepone|preponed)\b", "rescheduled earlier"),
]

def normalize_speech_input(raw_text: str) -> str:
    """
    Cleans up phonetic mishearings from speech-to-text without altering
    the caller's genuine voice or intent.
    """
    if not raw_text:
        return ""

    text = raw_text.strip()

    # Apply phonetic brand & name corrections
    for pattern, replacement in PHONETIC_REPLACEMENTS:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)

    # Clean double spaces
    text = re.sub(r"\s+", " ", text).strip()

    return text


def detect_slang_intent(text: str) -> dict:
    """
    Analyzes colloquial and slang speech to extract high-value caller metadata.
    Detects if the caller is a friend, delivery agent, recruiter, or peer.
    """
    tl = text.lower()

    is_friend = bool(re.search(r"\b(friend|buddy|pal|yaar|bro|batchmate|classmate|roommate)\b", tl))
    is_delivery = bool(re.search(r"\b(swiggy|zomato|dunzo|delivery|parcel|gate|package|flat|bhaiya)\b", tl))
    is_urgent = bool(re.search(r"\b(urgent|asap|emergency|fast|immediately|critical)\b", tl))
    is_academic = bool(re.search(r"\b(assignment|submission|project|deadline|lab|exam|college|professor|sir|ma'am)\b", tl))

    return {
        "is_friend": is_friend,
        "is_delivery": is_delivery,
        "is_urgent": is_urgent,
        "is_academic": is_academic
    }
