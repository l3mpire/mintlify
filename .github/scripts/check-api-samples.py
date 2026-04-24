#!/usr/bin/env python3
"""Fail CI if a PR adds real lemlist PII or production-like IDs to the docs.

Scans only lines ADDED in the PR diff (vs the given base ref) so pre-existing
content in the repo doesn't break every PR. Pre-existing leaks are the
responsibility of a separate cleanup pass.

Usage:
    python3 check-api-samples.py [base_ref]

Default base ref is `origin/main`. In GitHub Actions the workflow passes the
PR base SHA explicitly.

Exit code 0 = clean, 1 = one or more suspicious patterns found.

Output is both human-readable (for local runs) and in GitHub Actions
annotation format (`::error file=...,line=...::message`) so failures appear
inline on the PR diff.
"""
from __future__ import annotations

import re
import subprocess
import sys

# ---------------------------------------------------------------------------
# Rules
# ---------------------------------------------------------------------------

# Internal emails — bar any address on a lemlist-owned domain in samples.
INTERNAL_EMAIL_RE = re.compile(
    r"\b[a-zA-Z0-9._%+-]+@(?:lemlist\.(?:co|com)|lemtest\.com|lempire\.co)\b",
    re.IGNORECASE,
)
# Addresses that are public-facing and therefore safe to appear in samples.
EMAIL_ALLOWLIST = {
    "support@lemlist.com",
}

# Production-looking entity IDs. lemlist uses `<prefix>_<random>` (usually
# 17-char bodies in mixed case). A body with no obvious-fake marker is flagged.
ID_RE = re.compile(
    r"\b(ctc|cam|tea|lea|usr|usm|seq|stp|clt|skd|smb|wha|con|tsk|fil|act|hoo|mbx|itg|fld)_"
    r"([A-Za-z0-9]{15,25})\b"
)
# Bodies containing any of these are considered obvious placeholders.
ID_SAFE_MARKERS = (
    "Example", "example",
    "Fake", "FAKE", "fake",
    "123", "ABC", "XYZ", "abc", "xyz",
    "A1B2C3", "B2C3D4", "C3D4E5", "D4E5F6",
    "aBCdEf", "xYzAbCd",
    "haha",
)

# Known real employee names / identifiers. Extend this list as needed; keeping
# it in the script (not an external file) makes the check self-contained.
REAL_NAME_RE = re.compile(
    r"\b(Velitchkine|Bastien|INGOUF|Ingouf|OPOIX|Opoix|Christophe|"
    r"Chafik|Victoire|Mickael|Ariadne|Mael|Azovtsev)\b"
)

# Personal domains / handles that have shown up in past leaks.
REAL_HANDLE_RE = re.compile(
    r"\b(bvelitchkine\.com|ilya-azovtsev|camille-ingouf|christophe-opoix)\b",
    re.IGNORECASE,
)

# ---------------------------------------------------------------------------
# Diff parsing
# ---------------------------------------------------------------------------

HUNK_RE = re.compile(r"@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")


def iter_added_lines(base_ref: str):
    """Yield (file_path, new_line_number, line_text) for each added line."""
    out = subprocess.check_output(
        [
            "git", "diff", "--no-color", "--unified=0", "--diff-filter=AM",
            f"{base_ref}...HEAD", "--",
            "api-reference/", "*.mdx", "*.json", "docs.json",
        ],
        text=True,
    )
    cur_file = None
    cur_line = 0
    for line in out.splitlines():
        if line.startswith("+++ b/"):
            cur_file = line[6:]
            cur_line = 0
        elif line.startswith("@@"):
            m = HUNK_RE.match(line)
            if m:
                cur_line = int(m.group(1))
        elif line.startswith("+") and not line.startswith("+++"):
            yield cur_file, cur_line, line[1:]
            cur_line += 1
        elif line.startswith(" "):
            cur_line += 1
        # '-' lines don't advance the new-file counter


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    base_ref = sys.argv[1] if len(sys.argv) > 1 else "origin/main"
    errors: list[tuple[str, int, str]] = []

    def emit(file: str, line: int, msg: str) -> None:
        errors.append((file, line, msg))
        # GitHub Actions annotation — renders inline on the PR diff.
        print(f"::error file={file},line={line}::{msg}")

    for file, line_no, text in iter_added_lines(base_ref):
        if file is None:
            continue

        for m in INTERNAL_EMAIL_RE.finditer(text):
            if m.group(0).lower() not in EMAIL_ALLOWLIST:
                emit(file, line_no,
                     f"Internal email leaked in sample: {m.group(0)}")

        for m in ID_RE.finditer(text):
            body = m.group(2)
            if not any(mk in body for mk in ID_SAFE_MARKERS):
                emit(file, line_no,
                     f"Production-like ID in sample: {m.group(0)} "
                     "— use an obvious placeholder (e.g. "
                     f"{m.group(1)}_Example{m.group(1).capitalize()}01)")

        for m in REAL_NAME_RE.finditer(text):
            emit(file, line_no,
                 f"Real lemlist employee name in sample: {m.group(0)}")

        for m in REAL_HANDLE_RE.finditer(text):
            emit(file, line_no,
                 f"Real personal domain/handle in sample: {m.group(0)}")

    if errors:
        print(
            f"\nX {len(errors)} suspicious pattern(s) found in PR-added content.",
            file=sys.stderr,
        )
        print(
            "Replace with obvious placeholders, or extend the allowlist in "
            ".github/scripts/check-api-samples.py if it's a false positive.",
            file=sys.stderr,
        )
        return 1

    print("OK - no suspicious patterns in PR-added content.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
