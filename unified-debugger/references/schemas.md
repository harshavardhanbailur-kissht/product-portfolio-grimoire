# Data Format Specifications

All schemas used by unified-debugger.

## State Schema (state.yaml)

```yaml
session:
  id: string          # sess-YYYYMMDD-XXXXXX
  started: datetime   # ISO format
  goal: string        # User-defined debugging goal
  mode: string        # auto | confirm | scan-only
  project: string     # Absolute path to project

context:
  files_extracted: int      # Number of files processed
  tokens_saved: int         # Cumulative tokens saved

bugs:
  - id: string              # BXXXXXX (6 hex chars)
    status: string          # pending | fixing | fixed | verified | ignored | needs_review
    category: string        # security | auth | logic | quality
    severity: string        # critical | high | medium | low | info
    language: string        # python | javascript | typescript | java
    location:
      file: string          # Absolute path
      line: int             # Line number
      code: string          # Snippet of code (truncated)
      function: string      # Optional: containing function
    description: string     # Human-readable description
    pattern_id: string      # Internal pattern identifier
    cwe: string             # Optional: CWE-XX
    confidence: float       # 0.0-1.0 detection confidence
    checkpoint: string      # Git SHA before fix attempt
    ignore_rule: string     # If ignored, which rule matched
    fix:                    # Present after fix attempt
      diff: string          # Numbered line diff format
      confidence: float     # Fix confidence
      attempts: int         # Number of attempts
      rejected: bool        # If linter rejected it
      needs_llm: bool       # If requires LLM generation
      prompt: string        # LLM prompt if needed
    verification:           # Present after verification
      passed: bool
      confidence: float
      checks: list          # Which stages passed
      issues: list          # Human-readable issues
    test_generated: string  # Path to regression test

stats:
  total: int
  pending: int
  fixed: int
  verified: int
  ignored: int
  needs_review: int
  tokens_saved: int
  tokens_used: int

checkpoints:
  - sha: string             # Git commit SHA
    msg: string             # Checkpoint message
    ts: datetime            # ISO timestamp
```

## Ignore Rules Schema (ignore-rules.yaml)

```yaml
rules:
  - id: string              # Unique rule identifier
    file_glob: string       # Glob pattern, e.g., "**/test_*.py"
    pattern: string         # Regex pattern to match in code
    categories: list        # Categories this rule applies to
    reason: string          # Why this rule exists
    expires: date           # Optional expiration date
```

## Bug Output (Concise JSON)

Token-optimized format for wire transfer:

```json
{
  "bugs": [
    {
      "id": "BXXXXXX",
      "loc": "file.py:10",
      "lang": "py",
      "cat": "sec",
      "sev": "H",
      "desc": "SQL Injection",
      "cwe": "CWE-89",
      "conf": 0.85
    }
  ]
}
```

## Context Extraction Output

```yaml
code: string              # Extracted minimal code
language: string          # Source language
functions_included: list  # Functions in the extraction
original_tokens: int      # Estimated original token count
extracted_tokens: int     # Estimated extracted token count
tokens_saved: int         # Difference
reduction_percent: float  # Percentage reduction
```

## Fix Generation Output

```yaml
success: bool
diff: string              # -LINE: old\n+LINE: new
confidence: float         # 0.0-1.0
reasoning: string         # Brief explanation
new_content: string       # Full file content after fix
apply: bool               # Whether to apply immediately
attempts: int             # Number of attempts made
needs_llm: bool           # If LLM generation required
prompt: string            # LLM prompt for manual generation
error: string             # Error message if failed
```

## Verification Output

```yaml
passed: bool
confidence: float         # 0.0-1.0 overall confidence
checks:
  - name: string          # syntax | imports | lint | tests
    passed: bool
    message: string       # Human-readable result
    duration_ms: int      # Time taken
    linter: string        # Which linter used (if applicable)
    test_file: string     # Test file path (if applicable)
    test_found: bool      # Whether tests were discovered
issues: list              # Human-readable issue descriptions
can_retry: bool           # Whether retry might help
```

## Test Generation Output

```yaml
success: bool
test_file: string         # Path to generated test file
test_code: string         # The test code itself
needs_llm: bool           # If better test needs LLM
prompt: string            # LLM prompt for improvement
error: string             # Error message if failed
```

## Report Formats

### Summary (default)
```
==================================================
UNIFIED DEBUGGER REPORT
==================================================
Session: sess-20241222-abc123
Goal: Fix security vulnerabilities
Mode: auto

📊 BUG SUMMARY
----------------------------------------
Total found: 15
  ✅ Verified: 10
  🔧 Fixed: 12
  ⏳ Pending: 2
  🚫 Ignored: 1

💰 TOKEN EFFICIENCY
----------------------------------------
Tokens saved: ~8,500
Tokens used: ~1,500
Reduction: 85.0%
==================================================
```

### Trajectory (SWE-agent format)
```json
{
  "trajectory": [
    {
      "thought": "Starting debugging session",
      "action": "init_session --mode auto",
      "observation": "Session sess-xxx started"
    },
    {
      "thought": "Found SQL injection at auth.py:42",
      "action": "scan --file auth.py",
      "observation": "Bug B001ABC (CWE-89) confidence 85%"
    }
  ],
  "info": {
    "exit_status": "completed",
    "model_stats": {
      "bugs_found": 15,
      "bugs_fixed": 12,
      "bugs_verified": 10,
      "tokens_saved": 8500
    }
  }
}
```

## Numbered Line Diff Format

Research shows this outperforms unified diff for LLMs:

```
-42: old_code_line_here
+42: new_code_line_here
-43: another_old_line
+43: another_new_line
+44: inserted_line
```

Key rules:
- Line numbers are always explicit
- Minus for removal, plus for addition
- Preserves indentation in content
- No context lines (only changed lines)
