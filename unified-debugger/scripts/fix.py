#!/usr/bin/env python3
"""
Fix Generator - CWE-specific templates + LLM-generated patches

Research basis:
- RepairAgent (ICSE 2025): 164 bugs fixed with specialized tools
- ChatRepair: $0.42/bug via iterative refinement, converges in ~3 turns
- Replit: Numbered line diff format > unified diff for LLMs
- Cursor: Two-stage "sketch + apply" model

Implements: Template-based fixes for known CWEs, LLM prompts for novel bugs.
"""

import re
from pathlib import Path
from typing import Dict, Any, Optional


# CWE-specific fix templates with before/after patterns
CWE_TEMPLATES = {
    # Python templates
    "python": {
        "CWE-89": {
            "name": "SQL Injection",
            "patterns": [
                {
                    "match": r'f["\']SELECT.*\{(\w+)\}',
                    "fix": "Parameterized query",
                    "transform": "sqli_fstring",
                },
                {
                    "match": r'["\']SELECT.*%s',
                    "fix": "Parameterized query",
                    "transform": "sqli_format",
                },
            ],
            "confidence": 0.85,
        },
        "CWE-78": {
            "name": "Command Injection",
            "patterns": [
                {"match": r'os\.system\(', "fix": "subprocess with shell=False", "transform": "cmdi_os"},
                {"match": r'shell=True', "fix": "shell=False", "transform": "cmdi_shell"},
            ],
            "confidence": 0.90,
        },
        "CWE-22": {
            "name": "Path Traversal",
            "patterns": [
                {"match": r'open\(.*\+', "fix": "basename + containment", "transform": "path_open"},
            ],
            "confidence": 0.80,
        },
        "CWE-798": {
            "name": "Hardcoded Credential",
            "patterns": [
                {"match": r'(\w*(?:password|secret|api_key|token)\w*)\s*=\s*["\']', 
                 "fix": "Environment variable", "transform": "secret_env"},
            ],
            "confidence": 0.85,
        },
        "CWE-502": {
            "name": "Unsafe Deserialization",
            "patterns": [
                {"match": r'yaml\.load\(', "fix": "yaml.safe_load", "transform": "yaml_safe"},
                {"match": r'pickle\.load', "fix": "Use JSON or validate source", "transform": "pickle_warn"},
            ],
            "confidence": 0.90,
        },
    },
    # JavaScript/TypeScript templates
    "javascript": {
        "CWE-79": {
            "name": "Cross-Site Scripting",
            "patterns": [
                {"match": r'innerHTML\s*=', "fix": "textContent or sanitize", "transform": "xss_inner"},
                {"match": r'dangerouslySetInnerHTML', "fix": "DOMPurify.sanitize", "transform": "xss_react"},
                {"match": r'v-html', "fix": "v-text", "transform": "xss_vue"},
            ],
            "confidence": 0.85,
        },
        "CWE-89": {
            "name": "SQL Injection",
            "patterns": [
                {"match": r'`SELECT.*\$\{', "fix": "Parameterized query", "transform": "sqli_template"},
            ],
            "confidence": 0.80,
        },
        "CWE-78": {
            "name": "Command Injection",
            "patterns": [
                {"match": r'exec\(', "fix": "Avoid exec, use spawn with validation", "transform": "cmdi_exec"},
                {"match": r'execSync\(', "fix": "Avoid shell execution", "transform": "cmdi_execsync"},
            ],
            "confidence": 0.85,
        },
        "CWE-798": {
            "name": "Hardcoded Credential",
            "patterns": [
                {"match": r'(\w*(?:password|secret|apiKey|token|api_key)\w*)\s*[:=]\s*["\']',
                 "fix": "process.env", "transform": "secret_env_js"},
            ],
            "confidence": 0.85,
        },
        "CWE-601": {
            "name": "Open Redirect",
            "patterns": [
                {"match": r'res\.redirect\(req\.', "fix": "Validate against whitelist", "transform": "redirect_validate"},
            ],
            "confidence": 0.75,
        },
        "CWE-942": {
            "name": "Permissive CORS",
            "patterns": [
                {"match": r'origin:\s*[\'\"]\*[\'\"]', "fix": "Restrict origin", "transform": "cors_restrict"},
            ],
            "confidence": 0.90,
        },
        "CWE-1321": {
            "name": "Prototype Pollution",
            "patterns": [
                {"match": r'__proto__', "fix": "Validate keys or use Map", "transform": "proto_validate"},
            ],
            "confidence": 0.80,
        },
    },
}

# Pattern-based fixes (non-CWE)
PATTERN_FIXES = {
    "except": {
        "match": r'^(\s*)except:',
        "replace": r'\1except Exception as e:',
        "confidence": 0.85,
    },
    "eqeq": {
        "match": r' == (null|undefined)',
        "replace": r' === \1',
        "confidence": 0.90,
    },
}


class FixGenerator:
    """
    Multi-language fix generator using:
    1. CWE-specific templates for instant, high-confidence fixes
    2. Pattern-based transformations for common issues
    3. LLM prompts for novel/complex bugs (ChatRepair pattern)
    """
    
    def __init__(self):
        self.max_attempts = 5  # ChatRepair: converges in ~3 turns
    
    def generate_fix(self, bug: Dict, context: Dict, 
                     previous_error: str = None) -> Dict[str, Any]:
        """
        Generate a fix for the given bug.
        
        Args:
            bug: Bug dictionary from scanner
            context: Context from extractor
            previous_error: Error from previous fix attempt (for iterative refinement)
        
        Returns:
            {success, diff, confidence, reasoning, new_content, needs_llm, prompt}
        """
        fp = Path(bug["location"]["file"])
        if not fp.exists():
            return {"success": False, "error": "File not found"}
        
        lines = fp.read_text().split('\n')
        ln = bug["location"]["line"]
        if ln < 1 or ln > len(lines):
            return {"success": False, "error": "Line out of range"}
        
        orig_line = lines[ln - 1]
        lang = bug.get("language", "python")
        cwe = bug.get("cwe", "")
        pattern_id = bug.get("pattern_id", "")
        
        # Try CWE-specific template fix first
        if cwe:
            result = self._apply_cwe_fix(orig_line, cwe, lang, ln)
            if result["success"]:
                lines[ln - 1] = result["fixed_line"]
                return {
                    "success": True,
                    "diff": f"-{ln}: {orig_line}\n+{ln}: {result['fixed_line']}",
                    "confidence": result["confidence"],
                    "reasoning": f"Template fix for {cwe}: {result['fix_name']}",
                    "new_content": '\n'.join(lines),
                    "apply": True,
                    "attempts": 1,
                }
        
        # Try pattern-based fix
        if pattern_id in PATTERN_FIXES:
            result = self._apply_pattern_fix(orig_line, pattern_id, ln)
            if result["success"]:
                lines[ln - 1] = result["fixed_line"]
                return {
                    "success": True,
                    "diff": f"-{ln}: {orig_line}\n+{ln}: {result['fixed_line']}",
                    "confidence": result["confidence"],
                    "reasoning": f"Pattern fix for {pattern_id}",
                    "new_content": '\n'.join(lines),
                    "apply": True,
                    "attempts": 1,
                }
        
        # Fall back to LLM prompt generation
        return {
            "success": False,
            "needs_llm": True,
            "error": "No template available",
            "prompt": self._generate_llm_prompt(bug, context, orig_line, previous_error),
        }
    
    def _apply_cwe_fix(self, line: str, cwe: str, lang: str, 
                       line_num: int) -> Dict[str, Any]:
        """Apply CWE-specific fix template."""
        templates = CWE_TEMPLATES.get(lang, {}).get(cwe, {})
        if not templates:
            return {"success": False}
        
        indent = ' ' * (len(line) - len(line.lstrip()))
        
        for pattern in templates.get("patterns", []):
            if re.search(pattern["match"], line, re.I):
                fixed = self._transform_line(line, pattern["transform"], indent)
                if fixed and fixed != line:
                    return {
                        "success": True,
                        "fixed_line": fixed,
                        "confidence": templates.get("confidence", 0.8),
                        "fix_name": pattern["fix"],
                    }
        
        return {"success": False}
    
    def _transform_line(self, line: str, transform: str, indent: str) -> Optional[str]:
        """Apply specific transformation to a line."""
        
        # Python transforms
        if transform == "sqli_fstring":
            # f"SELECT * FROM users WHERE id = {user_id}" -> parameterized
            vars_found = re.findall(r'\{(\w+)\}', line)
            if vars_found:
                new_line = re.sub(r'\{(\w+)\}', '?', line)
                new_line = re.sub(r'^(\s*)(\w+\s*=\s*)f(["\'])', r'\1\2\3', new_line)
                return f"{new_line}  # TODO: cursor.execute(query, ({', '.join(vars_found)},))"
        
        elif transform == "cmdi_os":
            return f"{indent}subprocess.run(cmd.split(), shell=False, check=True)  # Safer than os.system"
        
        elif transform == "cmdi_shell":
            return line.replace("shell=True", "shell=False")
        
        elif transform == "secret_env":
            match = re.search(r'(\w*(?:password|secret|api_key|token)\w*)\s*=\s*["\']([^"\']+)["\']', line, re.I)
            if match:
                var_name = match.group(1)
                env_name = re.sub(r'([a-z])([A-Z])', r'\1_\2', var_name).upper()
                return f'{indent}{var_name} = os.environ.get("{env_name}")'
        
        elif transform == "yaml_safe":
            return line.replace("yaml.load(", "yaml.safe_load(")
        
        elif transform == "pickle_warn":
            return f"{indent}# SECURITY: Validate pickle source or use JSON instead\n{line}"
        
        elif transform == "path_open":
            return f"{indent}# SECURITY: Validate path - use os.path.basename() and check containment\n{line}"
        
        # JavaScript transforms
        elif transform == "xss_inner":
            return line.replace("innerHTML", "textContent")
        
        elif transform == "xss_react":
            return f"{indent}// SECURITY: Sanitize with DOMPurify.sanitize() before dangerouslySetInnerHTML"
        
        elif transform == "xss_vue":
            return line.replace("v-html", "v-text")
        
        elif transform == "sqli_template":
            return f"{indent}// SECURITY: Use parameterized query - db.query('SELECT...WHERE id=?', [id])"
        
        elif transform == "cmdi_exec":
            return f"{indent}// SECURITY: Avoid exec() - use spawn() with input validation instead"
        
        elif transform == "cmdi_execsync":
            return f"{indent}// SECURITY: Avoid execSync() - use spawnSync() with validated input"
        
        elif transform == "secret_env_js":
            match = re.search(r'(\w*(?:password|secret|apiKey|token|api_key)\w*)\s*[:=]\s*["\']', line, re.I)
            if match:
                var_name = match.group(1)
                env_name = re.sub(r'([a-z])([A-Z])', r'\1_\2', var_name).upper()
                if ':' in line:
                    return f"{indent}{var_name}: process.env.{env_name},"
                else:
                    return f"{indent}const {var_name} = process.env.{env_name};"
        
        elif transform == "redirect_validate":
            return f"{indent}// SECURITY: Validate redirect URL against allowlist before redirecting"
        
        elif transform == "cors_restrict":
            return line.replace("'*'", "process.env.ALLOWED_ORIGINS").replace('"*"', "process.env.ALLOWED_ORIGINS")
        
        elif transform == "proto_validate":
            return f"{indent}// SECURITY: Prototype pollution - validate object keys or use Map"
        
        return None
    
    def _apply_pattern_fix(self, line: str, pattern_id: str, 
                           line_num: int) -> Dict[str, Any]:
        """Apply pattern-based fix."""
        pattern = PATTERN_FIXES.get(pattern_id)
        if not pattern:
            return {"success": False}
        
        match = re.match(pattern["match"], line)
        if match:
            fixed = re.sub(pattern["match"], pattern["replace"], line)
            return {
                "success": True,
                "fixed_line": fixed,
                "confidence": pattern["confidence"],
            }
        
        return {"success": False}
    
    def _generate_llm_prompt(self, bug: Dict, context: Dict, 
                             orig_line: str, previous_error: str = None) -> str:
        """
        Generate LLM prompt for fix generation.
        Uses numbered line diff format (Replit research) and
        iterative refinement with error feedback (ChatRepair pattern).
        """
        lang = bug.get("language", "python")
        cwe = bug.get("cwe", "")
        desc = bug.get("description", "Unknown issue")
        file_name = Path(bug["location"]["file"]).name
        line_num = bug["location"]["line"]
        
        prompt = f"""Fix the following {lang.upper()} vulnerability:

**Bug**: {desc}{f' ({cwe})' if cwe else ''}
**File**: {file_name}
**Line {line_num}**: `{orig_line.strip()}`

"""
        
        # Add context if available
        if context.get("code"):
            prompt += f"""**Context**:
```{lang}
{context['code'][:2000]}
```

"""
        
        # Add previous error for iterative refinement (ChatRepair pattern)
        if previous_error:
            prompt += f"""**Previous fix failed with**:
{previous_error}

Please fix the issue while addressing this error.

"""
        
        # Output format (numbered line diff)
        prompt += """**Output format** (numbered line diff):
```
-LINE_NUM: original line
+LINE_NUM: fixed line
```

**Requirements**:
1. Minimal fix (2-5 lines max)
2. Preserve indentation
3. No new dependencies unless necessary
4. Brief reasoning (1 sentence)

**Fix**:"""
        
        return prompt


if __name__ == "__main__":
    import sys
    import json
    
    # Test with sample bugs
    fixer = FixGenerator()
    
    # Create test file
    test_file = Path("/tmp/test_vuln.py")
    test_file.write_text('''import os
API_KEY = "sk-secret-12345"
query = f"SELECT * FROM users WHERE id = {user_id}"
os.system(f"echo {user_input}")
''')
    
    bugs = [
        {"id": "B001", "cwe": "CWE-798", "pattern_id": "secret", 
         "location": {"file": str(test_file), "line": 2}, "language": "python",
         "description": "Hardcoded Credential"},
        {"id": "B002", "cwe": "CWE-89", "pattern_id": "sqli",
         "location": {"file": str(test_file), "line": 3}, "language": "python",
         "description": "SQL Injection"},
        {"id": "B003", "cwe": "CWE-78", "pattern_id": "cmdi",
         "location": {"file": str(test_file), "line": 4}, "language": "python",
         "description": "Command Injection"},
    ]
    
    for bug in bugs:
        result = fixer.generate_fix(bug, {})
        print(f"\n{bug['description']} ({bug['cwe']}):")
        if result.get("success"):
            print(f"  ✓ Fixed (confidence: {result['confidence']:.0%})")
            print(f"  {result['diff']}")
        else:
            print(f"  ✗ {result.get('error', 'No template')}")
    
    test_file.unlink()
