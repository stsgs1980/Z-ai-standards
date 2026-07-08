# Code Examples Guide — Chapter 2: Advanced Techniques

> Parent: STD-DOC-005 v1.2

---

## 7. Multilingual and Versioning

### 7.1. Polyglot Examples

When you need to show **the same algorithm** in multiple languages:

````markdown
```python
print("Hello, world!")
```

```javascript
console.log("Hello, world!");
```

```bash
echo "Hello, world!"
```
````

**Rule:** Specify language for each block, even if repeated.

---

### 7.2. Versioning (language / library versions)

Example may work in Python 3.11 but not in 3.7.

**Rule:** Specify minimum version.

````markdown
```python
# Requires: Python 3.10+
match value:
    case 1:
        print("One")
```
````

---

## 8. Folding and Security

### 8.1. Collapsible Long Code

When example is long but not all is needed for understanding:

````markdown
<details>
<summary>Full server code (click to expand)</summary>

```python
from flask import Flask
app = Flask(__name__)

@app.route('/')
def hello():
    return "Hello"

if __name__ == '__main__':
    app.run()
```

</details>
````

**Principle:** Can be copied, but long code does not distract.

---

### 8.2. Example Security

**Problem:** User might copy and run dangerous code.

**Good (danger warning):**

```bash
# WARNING: This will delete the temp folder!
rm -rf ./temp_folder
```

```sql
-- DANGEROUS in production: deletes all data
-- DROP DATABASE production;
-- Use safe example instead:
DROP DATABASE IF EXISTS test_db;
```

**Rules:**

- Mark dangerous commands
- Use placeholders (test, example)
- For destructive operations, show them commented out

---

## 9. Advanced Techniques

### 9.1. Live / Interactive Code

**What it is:** Code that can be run directly in the browser.

**Formats:**

- **MDX** (React in Markdown)
- **CodePen / JSFiddle** (iframe embedding)
- **Jupyter Notebooks** (`.ipynb`)

**Where useful:** Learning platforms, UI library documentation.

---

### 9.2. Auto-generating Examples from Real Code (Single source of truth)

In professional documentation, code in Markdown is **not written by hand**, but **imported** from the repository.

**Docusaurus (React):**

```jsx
import CodeBlock from "@theme/CodeBlock";

<CodeBlock language="jsx" title="/src/App.js">
  {require("!!raw-loader!../examples/App.js").default}
</CodeBlock>;
```

**Sphinx (Python):**

```rst
.. literalinclude:: ../examples/quick_start.py
   :language: python
   :lines: 10-20
```

**Why important:** Example never becomes outdated because it is real working code from the project.

---

### 9.3. License and Attribution (legal aspect)

When you take someone else's code for an educational document:

**Rules:**

1. Specify **source** (author, license)
2. Some licenses **prohibit** or limit copying without copyright

**Example formatting:**

````markdown
> Example from [Requests](https://docs.python-requests.org/) documentation, Apache 2.0 license

```python
import requests
response = requests.get('https://api.github.com')
```
````

---

## 10. Tool Markup

### 10.1. Copy Button Attributes

On websites there is often a "Copy" button. For it to work correctly:

```html
<pre><code class="language-python" data-copyable>print("Hello")</code></pre>
```

In Markdown this is not always supported, but the principle: **code block should be clean** (no line numbers, no `>>>`, no arrows).
