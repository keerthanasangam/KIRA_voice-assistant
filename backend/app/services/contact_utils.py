import re


def normalize_email(text: str) -> str | None:
    if not text:
        return None

    email = text.lower().strip()

    replacements = {
        " at the rate ": "@",
        " at rate ": "@",
        " at ": "@",
        " dot ": ".",
        " point ": ".",
        " underscore ": "_",
        " hyphen ": "-",
        " dash ": "-",
        " space ": "",
    }

    for old, new in replacements.items():
        email = email.replace(old, new)

    email = email.replace(" ", "")

    if email.startswith("www."):
        email = email[4:]

    email = email.rstrip(".,!?")

    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"

    if re.match(pattern, email):
        return email

    return None


def extract_email(text: str) -> str | None:
    """
    Extract an email from normal text or spoken email.
    """

    if not text:
        return None

    # First try normal written email
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"

    match = re.search(pattern, text)

    if match:
        return match.group(0).lower()

    # Then try spoken format
    return normalize_email(text)
def is_confirmation(text: str) -> bool:
    """
    Detect whether caller is confirming the information.
    """

    if not text:
        return False

    text = text.lower().strip()

    confirmation_words = [
        "yes",
        "yeah",
        "yep",
        "correct",
        "that's correct",
        "that is correct",
        "right",
        "exactly",
        "yes that's right",
        "yes that is right",
    ]

    return any(
        phrase in text
        for phrase in confirmation_words
    )


def is_rejection(text: str) -> bool:
    """
    Detect whether caller is rejecting the information.
    """

    if not text:
        return False

    text = text.lower().strip()

    rejection_words = [
        "no",
        "no that's wrong",
        "that's wrong",
        "not correct",
        "incorrect",
        "wrong",
    ]

    return any(
        phrase in text
        for phrase in rejection_words
    )