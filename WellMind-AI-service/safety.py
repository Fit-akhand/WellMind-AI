"""WellMind AI - safety layer for mental wellness conversations.

Responsibilities:
  - Conservative crisis/self-harm detection (keyword + pattern based)
  - Input validation and sanitization
  - Crisis resource messaging (never relies solely on keyword detection)
  - Safe refusal templates for unsupported requests

NOTE: Keyword detection is a first line of defense only. It is not a
clinical risk assessment. Real deployments should combine this with
model-level safety tuning and human review.
"""
import re

# Conservative set of crisis indicators. Kept intentionally broad to
# minimize false negatives; a match always triggers escalation text.
CRISIS_PATTERNS = [
    r"\bsuicid\w*\b",
    r"\bkill(ing)? myself\b",
    r"\bend(ing)? (my|it all|everything)\b",
    r"\bwant to die\b",
    r"\bself[- ]?harm\w*\b",
    r"\bcut(ting)? (myself|my skin)\b",
    r"\bhurt myself\b",
    r"\bno reason to (live|go on)\b",
    r"\bbetter off without me\b",
    r"\bcan'?t go on\b",
    r"\boverdose\b",
]

# Geographic scope is stated explicitly. Hours and eligibility vary.
# International users should use a local directory rather than a US number.
CRISIS_RESOURCES = [
    "If you are in immediate danger, contact local emergency services now. Emergency numbers differ by country (for example 911 in the US, 999 in the UK, 112 in many countries including India).",
    "United States and territories: 988 Suicide & Crisis Lifeline — call or text 988, or visit https://988lifeline.org. This number is for the US.",
    "United Kingdom and Republic of Ireland: Samaritans — call 116 123 or visit https://www.samaritans.org. In the UK, call 999 if you are in immediate danger. NHS 111 is urgent medical advice, not an emergency number.",
    "India: Tele-MANAS — call 14416 or 1-800-891-4416 (Ministry of Health and Family Welfare). KIRAN mental health rehabilitation helpline — 1800-599-0019 (Department of Empowerment of Persons with Disabilities).",
    "Find a local helpline (international): IASP directory at https://www.iasp.info/suicidalthoughts/",
]

SUPPORT_DISCLAIMER = (
    "I'm an AI support tool, not a licensed therapist or medical "
    "professional. I can offer general support and information, but "
    "I'm not a substitute for professional care."
)

MAX_MESSAGE_LENGTH = 2000


class SafetyResult:
    def __init__(self, is_crisis: bool, message: str = ""):
        self.is_crisis = is_crisis
        self.message = message


def detect_crisis(text: str) -> SafetyResult:
    """Return a SafetyResult indicating whether crisis patterns match."""
    if not text:
        return SafetyResult(False)
    lowered = text.lower()
    for pattern in CRISIS_PATTERNS:
        if re.search(pattern, lowered):
            return SafetyResult(
                True,
                build_crisis_response(),
            )
    return SafetyResult(False)


def build_crisis_response() -> str:
    """Compose an immediate, compassionate crisis response."""
    lines = [
        "I'm really glad you reached out, and I want to take what "
        "you're sharing seriously.",
        "If you might be in danger or thinking about harming yourself, "
        "please contact someone who can help right now. Keyword checks "
        "like this are not a clinical assessment.",
        "",
        *[f"- {line}" for line in CRISIS_RESOURCES],
        "",
        "You don't have to go through this alone. Reach out to local "
        "emergency services or a trusted person if you are unsafe.",
    ]
    return "\n".join(lines)


def validate_message(text: str):
    """Validate a user message. Returns (is_valid, error_message)."""
    if not isinstance(text, str):
        return False, "Message must be a string"
    stripped = text.strip()
    if not stripped:
        return False, "Message must not be empty"
    if len(stripped) > MAX_MESSAGE_LENGTH:
        return False, f"Message exceeds {MAX_MESSAGE_LENGTH} characters"
    return True, ""


def sanitize(text: str) -> str:
    """Trim and collapse whitespace without altering meaning."""
    return re.sub(r"\s+", " ", (text or "").strip())
