import os
import tempfile

from faster_whisper import WhisperModel
import edge_tts


# ==================================================
# WHISPER MODEL
# ==================================================

# "tiny" model with int8 quantization and multi-threading for near-instant (<400ms) CPU transcription
whisper_model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8",
    cpu_threads=4
)


from app.services.slang_normalizer import normalize_speech_input


# ==================================================
# SPEECH-TO-TEXT
# ==================================================

WHISPER_LANG_MAP = {
    "English": "en",
    "Telugu": "te",
    "Hindi": "hi",
    "en": "en",
    "te": "te",
    "hi": "hi"
}

WHISPER_INITIAL_PROMPTS = {
    "Student": (
        "This is an Indian English phone call for Keerthana Sangam. "
        "Common words: Keerthana, friend, buddy, yaar, bro, bhaiya, college, campus, "
        "project, assignment, deadline, submission, hackathon, lab, faculty, DBMS, "
        "semester, internship, sir, ma'am, WhatsApp."
    ),
    "Small Business": (
        "This is an Indian English phone call for Keerthana's business and store operations. "
        "Common words: Flat 402, Tower B, Gate 2, Swiggy, Dunzo, Zomato, bhaiya, parcel, "
        "order, wholesale, catalog, discount, delivery, PIN, UPI, payment, invoice."
    ),
    "Freelancer": (
        "This is an Indian English client call for Keerthana's freelance studio. "
        "Common words: Keerthana, client brief, UI/UX, budget, Figma, milestone, quote, "
        "turnaround, retainer, deliverables, revision."
    ),
    "Professional": (
        "This is an Indian English executive career call for Keerthana Sangam. "
        "Common words: Keerthana, recruiter, interview, hiring, package, CTC, resume, "
        "portfolio, Calendly, meeting, executive advisory, speaking invitation."
    )
}

def transcribe_audio(audio_path: str, language: str = "en", mode: str = "Student") -> str:
    """
    Convert caller's audio into text using optimized Whisper with Indian English
    vocabulary conditioning and phonetic slang normalization.
    """
    target_lang = WHISPER_LANG_MAP.get(language, "en")
    init_prompt = WHISPER_INITIAL_PROMPTS.get(mode, WHISPER_INITIAL_PROMPTS["Student"])

    try:
        segments, info = whisper_model.transcribe(
            audio_path,
            beam_size=1,
            vad_filter=True,
            language=target_lang,
            initial_prompt=init_prompt
        )

        text = " ".join(
            segment.text.strip()
            for segment in segments
        )
        return normalize_speech_input(text.strip())
    except Exception as e:
        print(f"Fast Whisper transcription failed with language '{target_lang}': {e}. Retrying auto-detect...")
        try:
            segments, info = whisper_model.transcribe(
                audio_path,
                beam_size=1,
                vad_filter=True,
                initial_prompt=init_prompt
            )
            raw = " ".join(segment.text.strip() for segment in segments).strip()
            return normalize_speech_input(raw)
        except Exception as fallback_err:
            print(f"Fallback Whisper error: {fallback_err}")
            return ""


# ==================================================
# TEXT-TO-SPEECH
# ==================================================

LANGUAGE_VOICES = {
    "English": "en-IN-NeerjaNeural",
    "Telugu": "te-IN-ShrutiNeural",
    "Hindi": "hi-IN-SwaraNeural"
}

def get_voice_for_language(language: str = "English") -> str:
    if not language:
        return "en-IN-NeerjaNeural"
    return LANGUAGE_VOICES.get(language, "en-IN-NeerjaNeural")


async def generate_speech(
    text: str,
    output_path: str,
    voice: str = "en-IN-NeerjaNeural",
    rate: str = "+10%"
):
    """
    Convert KIRA's text response into speech using Edge TTS with conversational rate.
    """

    communicate = edge_tts.Communicate(
        text,
        voice,
        rate=rate
    )

    await communicate.save(output_path)


# ==================================================
# TEXT-TO-SPEECH HELPER
# ==================================================

async def text_to_speech(
    text: str,
    output_path: str,
    voice: str = None,
    language: str = None
) -> str:
    """
    Async Text-to-Speech function with language-aware voice routing.
    """

    selected_voice = voice or get_voice_for_language(language or "English")

    await generate_speech(
        text,
        output_path,
        voice=selected_voice
    )

    return output_path