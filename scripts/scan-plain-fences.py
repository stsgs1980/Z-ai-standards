#!/usr/bin/env python3
"""
Scan all standards .md files for code fences opened with exactly 3 backticks
that have NO language tag (STD-DOC-002 §4.3 + §5.4 violation).

Logic (CommonMark spec):
- A fence of N backticks (N >= 3) opens a code block.
- It is closed by a line with >= N backticks (and nothing else).
- Inside a fence of N backticks, any line with < N backticks is just content
  (including lines that look like 3-backtick fences).
- So we track `current_backticks`. When we see a line starting with >= 3 backticks:
    * If not in a fence (current == 0): OPEN with that count. If count == 3
      and the rest of the line is empty/whitespace -> VIOLATION.
    * Else if count >= current: CLOSE.
    * Else: content (skip).
"""

import os
import re
import sys

# RELATIVE paths — works standalone, as submodule, or in CI.
# Layout: <repo-root>/upload/ and <repo-root>/scripts/
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
STANDARDS_DIR = os.path.join(REPO_ROOT, 'upload', 'standards-v2', 'standards')
EXTRA_FILES = [
    os.path.join(REPO_ROOT, 'upload', 'Hooks-in-Z.ai-Guide.md'),
    os.path.join(REPO_ROOT, 'upload', 'Z.ai-Sandbox-Guide.md'),
]

FENCE_RE = re.compile(r'^( `{3,} )(.*?)\s*$')

def scan_file(path):
    """Return list of (line_number, line_content) for plain 3-backtick openings."""
    violations = []
    try:
        with open(path, encoding='utf-8') as f:
            lines = f.readlines()
    except FileNotFoundError:
        return violations

    current_backticks = 0  # 0 = not inside any fence
    for i, raw_line in enumerate(lines, 1):
        line = raw_line.rstrip('\n')
        m = FENCE_RE.match(line)
        if not m:
            continue
        count = len(m.group(1))
        rest = m.group(2)

        if current_backticks == 0:
            # Opening fence
            if count == 3 and rest.strip() == '':
                violations.append((i, line))
            current_backticks = count
        else:
            # We are inside a fence. Is this a closing fence?
            # Closing fence: count >= current_backticks, and rest must be empty/whitespace
            if count >= current_backticks and rest.strip() == '':
                current_backticks = 0
            # else: content, skip
    return violations

def main():
    files = []
    for fname in sorted(os.listdir(STANDARDS_DIR)):
        if fname.endswith('.md'):
            files.append(os.path.join(STANDARDS_DIR, fname))
    files.extend(EXTRA_FILES)

    total_violations = 0
    print(f"{'FILE':<55} {'VIOLATIONS':>10}")
    print('-' * 70)
    for path in files:
        if not os.path.exists(path):
            continue
        viols = scan_file(path)
        name = os.path.basename(path)
        count = len(viols)
        if count:
            print(f"{name:<55} {count:>10}")
            for line_no, content in viols:
                print(f"    L{line_no}: {content!r}")
        total_violations += count
    print('-' * 70)
    print(f"{'TOTAL':<55} {total_violations:>10}")

    return 0 if total_violations == 0 else 1

if __name__ == '__main__':
    sys.exit(main())
