# Code Examples Guide — Chapter 3: Reference

> Parent: STD-DOC-005 v1.2

---

## 11. Anti-patterns

| Do Not                                     | Do This Instead                   |
| ------------------------------------------ | --------------------------------- |
| `5: def hello():`                          | `def hello():`                    |
| `>>> print("Hi")`                          | `print("Hi")`                     |
| `$ pip install x`                          | `pip install x`                   |
| `result = process(data)  # where is data?` | All code self-contained           |
| `# (red text)`                             | `# CHANGE THIS LINE:`             |
| `Print("Hello")`                           | `print("Hello")`                  |
| `rm -rf /` without warning                 | `# WARNING: DO NOT RUN: rm -rf /` |

---

## 12. Practical Exercise

Format the following example correctly:

**Original (bad):**

```python
$ python
>>> def foo(x,y):
...     return x+y
...
>>> foo(5,3)
8
```

**Requirements:**

1. Remove shell prompts (`$`, `>>>`, `...`)
2. Add syntax language
3. Make example self-contained
4. Add comments
5. Show code and output separately

**Expected answer:**

````markdown
```python
def add(x, y):
    """Returns the sum of two numbers."""
    return x + y

# Usage example
result = add(5, 3)
print(result)  # 8
```

**Output:**

```
8
```
````

---

## 13. Cheat Sheet

| Task               | Syntax                                                |
| ------------------ | ----------------------------------------------------- |
| Regular code block | `` `code` `` (inline) or ` ``` ` (block)              |
| Specify language   | ` ```python `                                         |
| Diff changes       | ` ```diff `                                           |
| No highlighting    | ` ```text `                                           |
| Collapsible block  | `<details><summary>...</summary>```code```</details>` |
| Warning            | `WARNING:` or `> **WARNING:**`                        |

---

## 14. Checklist for Good Code Example

- [ ] Syntax highlighting present (language specified)
- [ ] Indentation and line breaks correct
- [ ] No extra characters (`$`, `>>>`, line numbers, arrows inside)
- [ ] Example is self-contained
- [ ] No unnecessary imports and variables
- [ ] Clear comments present (not just color)
- [ ] Expected result shown (separate from code)
- [ ] Language/library version specified (if important)
- [ ] Dangerous commands marked with warning
- [ ] (Optional) Example is automatically tested
- [ ] (If borrowed code) License and source specified

---

## 15. Glossary

| Term                       | Meaning                                       |
| -------------------------- | --------------------------------------------- |
| **Copy-paste ready**       | Code copies without removing extra characters |
| **Self-contained**         | Does not require external files or network    |
| **Idempotent**             | Repeated run gives same result                |
| **Isolated**               | Does not depend on global state               |
| **Minimal reproduction**   | Shortest example that shows the problem       |
| **Polyglot**               | Same algorithm in multiple languages          |
| **REPL**                   | Read-Eval-Print Loop (with `>>>`)             |
| **Diff**                   | Showing changes (`+`/`-`)                     |
| **Single source of truth** | Code generated from real file                 |

---

## 16. Cross-References

| Standard     | Relationship                                                                            |
| ------------ | --------------------------------------------------------------------------------------- |
| STD-DOC-002  | Markdown formatting for code blocks (language tags, 4-backtick nesting)                 |
| STD-DOC-003  | Unicode Policy: no emoji in code examples                                               |
| STD-A11Y-001 | Accessible code examples: color-only indicators forbidden, screen reader considerations |
| STD-SEC-001  | Security in examples: no real API keys, mark dangerous commands                         |

---

## 16A. Known Issues and Proposed Solutions

This section documents discovered inconsistencies, missing content, and proposed corrections. Each issue has an ID, status, and proposed action. Issues resolved in the current version are marked `[RESOLVED]`; outstanding issues are marked `[OPEN]`.

### CEG-001 `[RESOLVED in v1.2]` — §9.3 code block was malformed (missing closing fence)

**Problem:** Prior to v1.2, §9.3 (License and Attribution) contained a malformed code block. The example intended to show a Python snippet with attribution, but the closing fence was written as ` ```text ` instead of ` ``` `. This turned the closing fence into the opening of a new `text` block, leaving the Python block unclosed and breaking the rest of the section's Markdown rendering.

Original (broken):

````markdown
````markdown
> Example from [Requests](https://docs.python-requests.org/) documentation, Apache 2.0 license

````python
import requests
response = requests.get('https://api.github.com')
```text
````
````
````

The `markdown` outer fence used only 3 backticks while the inner `python` block also used 3 backticks — making the inner block's opening fence close the outer block prematurely. The ` ```text ` line then opened a new block that was never closed.

**Resolution:** Rewrote §9.3 to use the 4-backtick outer fence convention (per STD-DOC-002 §5.4), which allows 3-backtick inner fences to nest correctly:

````markdown
> Example from [Requests](https://docs.python-requests.org/) documentation, Apache 2.0 license

```python
import requests
response = requests.get('https://api.github.com')
```
````

The outer 4-backtick `markdown` fence wraps the entire example; the inner 3-backtick `python` fence is now properly nested and closed.

### CEG-002 `[OPEN]` — §4.2 "Code Blocks with Output" uses 4-backtick outer fence, but most other examples use 3-backtick

**Problem:** §4.2 wraps its "Code + Output" example in a 4-backtick outer `markdown` fence (correct for nesting). However, most other examples in this standard (§2.1, §2.2, §2.3, §3.1, §3.2, §5.1, §7.1, §7.2, §8.1, §8.2, §9.1, §9.2) use 3-backtick fences without an outer wrapper. When those inner examples contain their own 3-backtick code blocks (e.g., §2.1 shows a `markdown` block containing a `python` block), the rendering breaks in the same way CEG-001 described.

Most existing examples happen to not contain nested 3-backtick blocks, so they render correctly today. But the pattern is fragile — any future edit that adds a nested code block to one of those examples will silently break.

**Proposed solution:** Audit all 3-backtick example blocks in this standard. Wherever an example shows a Markdown snippet that itself contains a fenced code block, wrap the outer example in a 4-backtick fence. Add a note in §5.4 (Code Formatting) recommending the 4-backtick outer fence whenever the example contains nested code blocks.

### CEG-003 `[OPEN]` — §11 Anti-patterns table uses `>>>` and `$` as examples of what NOT to do, but the surrounding text does not flag them as `(ref)`

**Problem:** §11 (Anti-patterns) shows `>>> print("Hi")` and `$ pip install x` in the "Do Not" column. These are correct demonstrations of forbidden patterns. However, per STD-DOC-002 §3, the `(ref)` exception should be applied when a character or pattern is shown as the object of description. The `>>>` and `$` characters are not themselves prohibited — they are shell/REPL prompts that should not appear in copy-paste-ready code. The current table is technically correct but does not invoke the `(ref)` convention that STD-DOC-002 §3 establishes.

**Proposed solution:** No change needed if the project adopts the position that `(ref)` applies only to Unicode typographic characters, not to ASCII shell prompts. If `(ref)` is meant to apply to any character used as the object of description, add `(ref)` markers to the `>>>` and `$` entries in §11. This is a policy decision for STD-DOC-002 to make; this standard will follow whichever convention STD-DOC-002 §3 settles on.

---

## 17. Version History

| Version | Date    | Changes                                                                                                                                                                                                        |
| ------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2025-05 | Initial version                                                                                                                                                                                                |
| 1.1     | 2026-05 | Added accessibility section (§5.2), security section (§8.2), advanced techniques (§9), glossary (§15)                                                                                                          |
| 1.2     | 2026-06 | Fixed malformed code block in §9.3 (closing fence was ` ```text ` instead of ` ``` `); rewrote §9.3 to use the 4-backtick outer fence convention. Added §16A Known Issues documenting CEG-001 through CEG-003. |

---

**This document can be used as:**

- Introduction for beginners
- Cheat sheet for the team
- Code example formatting standard in your project
- Checklist for documentation code review

Built with: Next.js 16 + TypeScript + Tailwind CSS
