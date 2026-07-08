# Code Examples Guide — Chapter 1: Foundations

> Parent: STD-DOC-005 v1.2

---

## 1. Introduction

**Document Purpose:** Learn to create code examples that:

- Are understandable at first glance
- Copy correctly without extra characters
- Run without modifications
- Are safe for accidental use
- Are accessible to all users (including screen reader users)

---

## 2. Basic Formatting Principles

### 2.1. Syntax Highlighting

**What it is:** Different colors for keywords, strings, comments.

**How to specify in Markdown:**

````markdown
```python
def greet(name):
    # This is a comment
    return f"Hello, {name}!"
```
````

**Why important:** Without highlighting, code blends into a gray mass, eyes get tired.

**Limitation:** Do not rely ONLY on color to convey meaning — screen readers do not see colors.

---

### 2.2. Code Formatting

**What it is:** Proper indentation, spaces, line breaks.

**Bad:**

```python
def add(x,y):return x+y
```

**Good:**

```python
def add(x, y):
    return x + y
```

**Tools:** Prettier, Black (Python), gofmt (Go), ESLint (JavaScript).

---

### 2.3. Code Style

**What it is:** Unified rules for the entire project or language.

**Example for Python (PEP 8):**

- 4 spaces for indentation
- Maximum 79 characters per line
- Names: `snake_case` for functions, `CamelCase` for classes

**Bad:**

```python
def CalculateSum( A, B ): return A+B
```

**Good:**

```python
def calculate_sum(a, b):
    return a + b
```

---

## 3. Copy and Use Principles

### 3.1. Copy-Paste Ready Example

**What it is:** Code can be copied and pasted without removing extra characters.

**Bad (extra characters present):**

```python
5: def hello():
6:     print("Hi")
```

```bash
$ pip install requests
$ python script.py
```

**Good (clean code):**

```python
def hello():
    print("Hi")
```

```bash
pip install requests
python script.py
```

---

### 3.2. Self-Contained Example

**What it is:** Code works immediately after pasting, does not require external files, network, or database.

**Bad (depends on missing variable):**

```python
result = process(data)  # where is data?
```

**Good (self-contained):**

```python
data = [1, 2, 3, 4, 5]

def process(numbers):
    return [n * 2 for n in numbers]

result = process(data)
print(result)  # [2, 4, 6, 8, 10]
```

---

### 3.3. Idempotent Example

**What it is:** Example can be run many times — result is the same each time.

**Bad (depends on time or counter):**

```python
import time
print(time.time())  # different each time
```

**Good (predictable result):**

```python
print(2 + 2)  # always 4
```

---

### 3.4. Executable / Testable Example

**What it is:** Code from documentation is automatically checked during build.

**Python doctest example:**

```python
def multiply(a, b):
    """
    >>> multiply(3, 4)
    12
    """
    return a * b
```

**Why cool:** Example never becomes outdated — test will fail when code changes.

---

## 4. Showing Changes and Output

### 4.1. Diff / Patch — Showing Changes

**When needed:** Explaining what changed between two versions.

**How to format:**

```diff
def calculate(x):
-    return x * 2  # old formula
+    return x ** 2  # new formula
```

Green (`+`) — added, red (`-`) — removed.

---

### 4.2. Code Blocks with Output (REPL-style)

**When needed:** Show not only code but also its result.

**Example:**

```python
>>> squares = [x**2 for x in range(5)]
>>> squares
[0, 1, 4, 9, 16]
```

**Important for copying:** User should copy only lines **without `>>>`**! Better to provide code and output separately:

````markdown
**Code:**

```python
squares = [x**2 for x in range(5)]
print(squares)
```

**Output:**

```
[0, 1, 4, 9, 16]
```
````

---

## 5. Annotations and Explanations

### 5.1. Comments and Arrows (Decorating Code)

**When needed:** Explain a specific place in a long example.

**Good (with comments):**

```python
def process(user_data):
    # Check for empty dictionary
    if not user_data:
        return None

    # Extract name
    name = user_data.get("name", "Anonymous")
    return name.upper()
```

---

### 5.2. Accessibility

**Problem:** Not all users see colors or use screen readers.

**Rules:**

1. Do not rely ONLY on color to convey meaning
2. Add text comments
3. Use explicit indicators (`# IMPORTANT:`, `WARNING:`)

**Bad (color only):**

```python
# (red text) change this line
api_key = "key"
```

**Good (text explanation):**

```python
# CHANGE THIS LINE:
api_key = "your-key-here"
```

---

## 6. Minimization and Cleanliness

### 6.1. Minimal Reproduction

**Principle:** Example should be **minimal** but **sufficient**.

**Bad (too much extra):**

```python
import sys
import json
import datetime
from collections import defaultdict

x = 42  # this variable not needed for example

def main():
    print("Hello")
    # ... 50 lines of code ...
```

**Good (essence only):**

```python
numbers = [1, 2, 3]
result = sum(numbers)
print(result)  # 6
```

---

### 6.2. Case Sensitivity

**Problem:** Many languages (Python, Java, C, Go) are case-sensitive.

**Bad (wrong case):**

```python
Print("Hello")   # NameError: name 'Print' is not defined
```

**Good:**

```python
print("Hello")
```
