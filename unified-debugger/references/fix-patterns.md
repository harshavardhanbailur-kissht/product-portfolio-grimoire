# CWE Fix Patterns

Template-based fixes for common vulnerability classes.

## Python

### CWE-89: SQL Injection

**Before:**
```python
query = f"SELECT * FROM users WHERE username='{username}'"
cursor.execute(query)
```

**After:**
```python
query = "SELECT * FROM users WHERE username=?"
cursor.execute(query, (username,))
```

**Confidence:** 85%

### CWE-78: Command Injection

**Before:**
```python
os.system(f"echo {user_input}")
# or
subprocess.call(cmd, shell=True)
```

**After:**
```python
subprocess.run(["echo", user_input], shell=False, check=True)
```

**Confidence:** 90%

### CWE-22: Path Traversal

**Before:**
```python
path = base_dir + "/" + filename
with open(path, 'r') as f:
    content = f.read()
```

**After:**
```python
sanitized = os.path.basename(filename)
if '..' in filename or sanitized != filename:
    raise ValueError("Path traversal detected")
full_path = (Path(base_dir) / sanitized).resolve()
if not str(full_path).startswith(str(Path(base_dir).resolve())):
    raise ValueError("Path escape detected")
with open(full_path, 'r') as f:
    content = f.read()
```

**Confidence:** 80%

### CWE-798: Hardcoded Credentials

**Before:**
```python
API_KEY = "sk-1234567890abcdef"
PASSWORD = "supersecret123"
```

**After:**
```python
API_KEY = os.environ.get("API_KEY")
PASSWORD = os.environ.get("PASSWORD")
```

**Confidence:** 85%

### CWE-502: Unsafe Deserialization

**Before:**
```python
import yaml
data = yaml.load(user_input)
```

**After:**
```python
import yaml
data = yaml.safe_load(user_input)
```

**Confidence:** 90%

---

## JavaScript/TypeScript

### CWE-79: Cross-Site Scripting

**Before (vanilla):**
```javascript
element.innerHTML = userInput;
```

**After:**
```javascript
element.textContent = userInput;
// or if HTML needed:
element.innerHTML = DOMPurify.sanitize(userInput);
```

**Before (React):**
```jsx
<div dangerouslySetInnerHTML={{__html: userInput}} />
```

**After:**
```jsx
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(userInput)}} />
```

**Before (Vue):**
```vue
<div v-html="userInput"></div>
```

**After:**
```vue
<div v-text="userInput"></div>
```

**Confidence:** 85%

### CWE-89: SQL Injection

**Before:**
```javascript
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);
```

**After:**
```javascript
const query = 'SELECT * FROM users WHERE id = ?';
db.query(query, [userId]);
```

**Confidence:** 80%

### CWE-78: Command Injection

**Before:**
```javascript
const { exec } = require('child_process');
exec(userInput);
```

**After:**
```javascript
const { spawn } = require('child_process');
// Validate userInput first
spawn('command', [validatedArg], { shell: false });
```

**Confidence:** 85%

### CWE-798: Hardcoded Credentials

**Before:**
```javascript
const apiKey = "sk-secret-12345";
const config = {
    password: "admin123",
};
```

**After:**
```javascript
const apiKey = process.env.API_KEY;
const config = {
    password: process.env.PASSWORD,
};
```

**Confidence:** 85%

### CWE-601: Open Redirect

**Before:**
```javascript
app.get('/redirect', (req, res) => {
    res.redirect(req.query.url);
});
```

**After:**
```javascript
const ALLOWED_HOSTS = ['example.com', 'api.example.com'];

app.get('/redirect', (req, res) => {
    const url = new URL(req.query.url);
    if (!ALLOWED_HOSTS.includes(url.hostname)) {
        return res.status(400).send('Invalid redirect URL');
    }
    res.redirect(req.query.url);
});
```

**Confidence:** 75%

### CWE-942: Permissive CORS

**Before:**
```javascript
app.use(cors({
    origin: '*'
}));
```

**After:**
```javascript
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://example.com']
}));
```

**Confidence:** 90%

### CWE-1321: Prototype Pollution

**Before:**
```javascript
function merge(target, source) {
    for (let key in source) {
        target[key] = source[key];
    }
}
```

**After:**
```javascript
function merge(target, source) {
    for (let key in source) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
            continue;
        }
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
        }
    }
}
```

**Confidence:** 80%

---

## Confidence Thresholds

| Confidence | Action |
|------------|--------|
| 90-100% | Auto-apply, minimal review |
| 70-89% | Auto-apply with review recommended |
| 50-69% | Human review required |
| <50% | Manual fix recommended |

## Pattern-Based Fixes (Non-CWE)

### Bare Exception Handler

**Before:**
```python
try:
    risky_operation()
except:
    pass
```

**After:**
```python
try:
    risky_operation()
except Exception as e:
    logger.error(f"Operation failed: {e}")
```

### Loose Equality (JavaScript)

**Before:**
```javascript
if (value == null) { }
if (value != undefined) { }
```

**After:**
```javascript
if (value === null) { }
if (value !== undefined) { }
```
