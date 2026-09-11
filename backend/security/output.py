import re


PATTERNS = {
    "api_key": [
        r"\bsk-[A-Za-z0-9_-]{20,}\b",
        r"\bAIza[A-Za-z0-9_-]{20,}\b",
    ],

    "password": [
        r"\bpassword\s*[:=]\s*\S+",
        r"\bpasswd\s*[:=]\s*\S+",
    ],

    "system_prompt": [
        r"\bsystem prompt\b",
        r"\bhidden instructions\b",
        r"\binternal instructions\b",
    ],

    "prompt_injection": [
        r"\bignore\s+(all\s+)?previous\s+instructions\b",
        r"\bdisregard\s+(all\s+)?previous\s+instructions\b",
        r"\breveal\s+(the\s+)?system\s+prompt\b",
        r"\bshow\s+(the\s+)?system\s+prompt\b",
    ],

    "credit_card": [
        r"\b(?:\d[ -]*?){13,19}\b",
    ],

    "email": [
        r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
    ],

    "phone": [
        r"\b(?:\+91[\s-]?)?[6-9]\d{9}\b",
    ],
}


def scan_output(answer, user=None):
    answer_lower = answer.lower()

    detected = []

    # --------------------------------
    # 1. CHECK KNOWN USER DETAILS
    # --------------------------------

    if user:

        sensitive_fields = [
            "email",
            "phone",
            "password",
            "phone_number",
            "address",
            "full_name",
        ]

        for field in sensitive_fields:

            value = user.get(field)

            if value and len(str(value).strip()) >= 4:

                value = str(value).strip()

                if value.lower() in answer_lower:

                    detected.append({
                        "type": "user_sensitive_data",
                        "field": field,
                        "evidence": value
                    })

    # --------------------------------
    # 2. CHECK SECURITY PATTERNS
    # --------------------------------

    for threat_type, patterns in PATTERNS.items():

        for pattern in patterns:

            match = re.search(
                pattern,
                answer,
                re.IGNORECASE
            )

            if match:

                detected.append({
                    "type": threat_type,
                    "evidence": match.group(0)
                })

                break

    # --------------------------------
    # 3. FINAL DECISION
    # --------------------------------

    if detected:

        return {
            "safe": False,
            "status": "blocked",
            "threats": detected
        }

    return {
        "safe": True,
        "status": "safe",
        "threats": []
    }