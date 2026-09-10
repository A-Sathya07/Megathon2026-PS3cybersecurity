import re


PATTERNS = {
    "instruction_override": {
        "score": 0.40,
        "patterns": [
            r"\bignore\s+(all\s+)?previous\s+instructions\b",
            r"\bdisregard\s+(all\s+)?previous\s+instructions\b",
            r"\bforget\s+(all\s+)?previous\s+instructions\b",
            r"\boverride\s+(all\s+)?previous\s+instructions\b",
        ]
    },

    "system_prompt_extraction": {
        "score": 0.40,
        "patterns": [
            r"\breveal\s+(the\s+)?system\s+prompt\b",
            r"\bshow\s+(the\s+)?system\s+prompt\b",
            r"\bprint\s+(the\s+)?system\s+prompt\b",
            r"\bexpose\s+(the\s+)?system\s+prompt\b",
        ]
    },

    "security_bypass": {
        "score": 0.30,
        "patterns": [
            r"\bbypass\s+(the\s+)?security\b",
            r"\bbypass\s+(the\s+)?security\s+controls\b",
            r"\bdisable\s+(the\s+)?security\b",
            r"\bdisable\s+(the\s+)?safety\b",
        ]
    },

    "confidential_data_extraction": {
        "score": 0.40,
        "patterns": [
            r"\breveal\s+confidential\s+(information|data)\b",
            r"\bdisclose\s+confidential\s+(information|data)\b",
            r"\bexpose\s+confidential\s+(information|data)\b",
            r"\breveal\s+private\s+(information|data)\b",
        ]
    }
}


THRESHOLD = 0.70


def scan_text(text):
    threats = []

    for threat_type, config in PATTERNS.items():

        for pattern in config["patterns"]:

            match = re.search(
                pattern,
                text,
                re.IGNORECASE
            )

            if match:
                threats.append({
                    "threat_type": threat_type,
                    "score": config["score"],
                    "matched_text": match.group(0)
                })

                break

    return threats


def scan_document(pages):

    detected_threats = []

    for page in pages:

        page_threats = scan_text(page["text"])

        for threat in page_threats:
            detected_threats.append({
                "page_number": page["page_number"],
                "threat_type": threat["threat_type"],
                "score": threat["score"],
                "matched_text": threat["matched_text"]
            })

    threat_score = sum(
        threat["score"]
        for threat in detected_threats
    )

    threat_score = min(threat_score, 1.0)

    if threat_score >= THRESHOLD:

        return {
            "safe": False,
            "status": "quarantined",
            "threat_score": threat_score,
            "threats": detected_threats
        }

    return {
        "safe": True,
        "status": "safe",
        "threat_score": threat_score,
        "threats": detected_threats
    }