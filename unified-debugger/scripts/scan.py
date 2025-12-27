#!/usr/bin/env python3
"""
Bug Scanner - Multi-language vulnerability detection with CWE classification

Research basis:
- CWE-specific patterns for 15+ vulnerability types
- SAST-like static analysis
- Confidence scoring per detection

Supports: Python, JavaScript, TypeScript, React, Vue, Java
"""

import hashlib
import json
import re
from pathlib import Path
from typing import Dict, List, Any


# Comprehensive CWE patterns by language
PATTERNS = {
    "python": {
        "security": [
            {"id": "sqli", "cwe": "CWE-89", "desc": "SQL Injection",
             "indicators": ["execute(", 'f"SELECT', "f'SELECT", ".format(", "% (", "+ query", '+ "SELECT'],
             "severity": "high"},
            {"id": "cmdi", "cwe": "CWE-78", "desc": "Command Injection",
             "indicators": ["os.system(", "subprocess.call(", "shell=True", "eval(", "exec(", "os.popen("],
             "severity": "high"},
            {"id": "path", "cwe": "CWE-22", "desc": "Path Traversal",
             "indicators": ["open(user", "open(req", "open(input", "../", "..\\"],
             "severity": "high"},
            {"id": "secret", "cwe": "CWE-798", "desc": "Hardcoded Credential",
             "indicators": ['PASSWORD = "', 'password = "', 'API_KEY = "', 'SECRET = "', 'TOKEN = "',
                           'api_key = "', 'secret_key = "', 'aws_secret'],
             "severity": "high"},
            {"id": "xxe", "cwe": "CWE-611", "desc": "XXE Injection",
             "indicators": ["xml.etree", "lxml.etree", "XMLParser", "parse("],
             "severity": "high"},
            {"id": "ssrf", "cwe": "CWE-918", "desc": "Server-Side Request Forgery",
             "indicators": ["requests.get(user", "urllib.request.urlopen(", "httpx.get("],
             "severity": "high"},
            {"id": "deser", "cwe": "CWE-502", "desc": "Unsafe Deserialization",
             "indicators": ["pickle.load", "yaml.load(", "yaml.unsafe_load", "marshal.load"],
             "severity": "high"},
        ],
        "logic": [
            {"id": "except", "desc": "Bare Exception Handler",
             "indicators": ["except:", "except Exception:"],
             "severity": "medium"},
            {"id": "assert", "desc": "Assert in Production",
             "indicators": ["assert "],
             "severity": "low"},
        ],
        "quality": [
            {"id": "todo", "desc": "TODO/FIXME Marker",
             "indicators": ["TODO:", "FIXME:", "HACK:", "XXX:"],
             "severity": "info"},
        ],
    },
    "javascript": {
        "security": [
            {"id": "xss", "cwe": "CWE-79", "desc": "Cross-Site Scripting",
             "indicators": ["innerHTML", "outerHTML", "document.write(", "dangerouslySetInnerHTML",
                           ".html(", "v-html", "insertAdjacentHTML"],
             "severity": "high"},
            {"id": "sqli", "cwe": "CWE-89", "desc": "SQL Injection",
             "indicators": ["query(`SELECT", "query('SELECT", '`SELECT', "` + ", " + `", "${",
                           "execute(`", "raw(`"],
             "severity": "high"},
            {"id": "cmdi", "cwe": "CWE-78", "desc": "Command Injection",
             "indicators": ["exec(", "execSync(", "spawn(", "child_process", "shelljs"],
             "severity": "high"},
            {"id": "eval", "cwe": "CWE-95", "desc": "Code Injection",
             "indicators": ["eval(", "new Function(", "setTimeout(str", "setInterval(str"],
             "severity": "high"},
            {"id": "secret", "cwe": "CWE-798", "desc": "Hardcoded Credential",
             "indicators": ['password:', 'apiKey:', 'secret:', 'token:', 'api_key:',
                           'PASSWORD =', 'API_KEY =', 'SECRET =', 'apiKey =', 'password ='],
             "severity": "high"},
            {"id": "proto", "cwe": "CWE-1321", "desc": "Prototype Pollution",
             "indicators": ["__proto__", "constructor.prototype", "Object.assign(target,"],
             "severity": "high"},
            {"id": "path", "cwe": "CWE-22", "desc": "Path Traversal",
             "indicators": ["req.params", "req.query", "req.body", "../", "path.join(",
                           "fs.readFile(req", "fs.readFileSync("],
             "severity": "high"},
            {"id": "redirect", "cwe": "CWE-601", "desc": "Open Redirect",
             "indicators": ["res.redirect(req.", "location.href =", "window.location =",
                           "location.replace("],
             "severity": "medium"},
            {"id": "nosqli", "cwe": "CWE-943", "desc": "NoSQL Injection",
             "indicators": ["$where", "$regex", "$ne", "$gt", "$lt", ".find({$", "$or"],
             "severity": "high"},
            {"id": "ssrf", "cwe": "CWE-918", "desc": "Server-Side Request Forgery",
             "indicators": ["fetch(req.", "axios.get(req.", "http.get(user"],
             "severity": "high"},
        ],
        "auth": [
            {"id": "jwt-none", "cwe": "CWE-347", "desc": "JWT Algorithm None",
             "indicators": ["algorithm: 'none'", 'algorithm: "none"', "algorithms: ['none"],
             "severity": "critical"},
            {"id": "cors", "cwe": "CWE-942", "desc": "Permissive CORS",
             "indicators": ["origin: '*'", 'origin: "*"', "Access-Control-Allow-Origin: *",
                           "origin: true"],
             "severity": "high"},
            {"id": "csrf", "cwe": "CWE-352", "desc": "Missing CSRF Protection",
             "indicators": ["csrf: false", "csrfProtection: false", "ignoreCsrf"],
             "severity": "high"},
            {"id": "noauth", "cwe": "CWE-306", "desc": "Missing Authentication Check",
             "indicators": ["// TODO: add auth", "// FIXME: auth", "authenticate: false",
                           "requireAuth: false"],
             "severity": "high"},
        ],
        "logic": [
            {"id": "eqeq", "desc": "Loose Equality",
             "indicators": [" == null", " == undefined", " != null", " != undefined"],
             "severity": "low"},
            {"id": "console", "desc": "Console Statement",
             "indicators": ["console.log(", "console.error(", "console.warn("],
             "severity": "info"},
        ],
    },
    "java": {
        "security": [
            {"id": "sqli", "cwe": "CWE-89", "desc": "SQL Injection",
             "indicators": ["executeQuery(", "createQuery(", "+ \"SELECT", "Statement("],
             "severity": "high"},
            {"id": "cmdi", "cwe": "CWE-78", "desc": "Command Injection",
             "indicators": ["Runtime.getRuntime().exec(", "ProcessBuilder("],
             "severity": "high"},
            {"id": "xxe", "cwe": "CWE-611", "desc": "XXE Injection",
             "indicators": ["XMLInputFactory", "DocumentBuilder", "SAXParser"],
             "severity": "high"},
            {"id": "deser", "cwe": "CWE-502", "desc": "Unsafe Deserialization",
             "indicators": ["ObjectInputStream", "readObject(", "XMLDecoder"],
             "severity": "high"},
            {"id": "path", "cwe": "CWE-22", "desc": "Path Traversal",
             "indicators": ["new File(request", "Paths.get(request", "../"],
             "severity": "high"},
        ],
    },
}

SEVERITY_ORDER = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}

LANG_MAP = {
    ".py": "python",
    ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
    ".ts": "javascript", ".tsx": "javascript", ".jsx": "javascript",
    ".vue": "javascript", ".svelte": "javascript",
    ".java": "java", ".kt": "java",
}


class BugScanner:
    """
    Multi-language bug scanner with CWE classification.
    Implements SAST-like pattern matching with confidence scoring.
    """
    
    def __init__(self):
        self.exclude_dirs = {
            '.git', 'node_modules', '__pycache__', 'venv', '.venv',
            'dist', 'build', '.next', '.nuxt', 'coverage', '.debugger',
            'vendor', 'target', 'out', '.idea', '.vscode'
        }
        self.extensions = set(LANG_MAP.keys())
    
    def scan(self, path: Path, categories: List[str] = None) -> List[Dict[str, Any]]:
        """
        Scan path for bugs.
        
        Args:
            path: File or directory to scan
            categories: List of categories to scan (security, auth, logic, quality)
        
        Returns:
            List of bug dictionaries sorted by severity
        """
        path = Path(path)
        categories = categories or ["security", "auth", "logic"]
        
        if path.is_file():
            files = [path]
        else:
            files = [
                f for f in path.rglob("*")
                if f.is_file()
                and f.suffix in self.extensions
                and not any(d in f.parts for d in self.exclude_dirs)
            ]
        
        bugs, seen = [], set()
        
        for fp in files:
            lang = LANG_MAP.get(fp.suffix, "python")
            patterns = PATTERNS.get(lang, {})
            
            try:
                content = fp.read_text(errors='ignore')
                lines = content.split('\n')
            except:
                continue
            
            for cat in categories:
                for pat in patterns.get(cat, []):
                    for ln, line_content in enumerate(lines, 1):
                        # Skip comments
                        stripped = line_content.strip()
                        if stripped.startswith('#') or stripped.startswith('//'):
                            continue
                        
                        if any(ind in line_content for ind in pat["indicators"]):
                            # Generate unique bug ID
                            hash_input = f"{fp}:{ln}:{pat['id']}"
                            bid = "B" + hashlib.md5(hash_input.encode()).hexdigest()[:6].upper()
                            
                            if bid not in seen:
                                seen.add(bid)
                                
                                # Calculate confidence based on pattern specificity
                                confidence = self._calculate_confidence(line_content, pat)
                                
                                bugs.append({
                                    "id": bid,
                                    "status": "pending",
                                    "category": cat,
                                    "severity": pat.get("severity", "medium"),
                                    "location": {
                                        "file": str(fp),
                                        "line": ln,
                                        "code": line_content.strip()[:100],
                                    },
                                    "description": pat["desc"],
                                    "pattern_id": pat["id"],
                                    "language": lang,
                                    "confidence": confidence,
                                    **({} if "cwe" not in pat else {"cwe": pat["cwe"]}),
                                })
        
        # Sort by severity, then confidence
        bugs.sort(key=lambda b: (
            SEVERITY_ORDER.get(b["severity"], 5),
            -b["confidence"]
        ))
        
        return bugs
    
    def _calculate_confidence(self, line: str, pattern: Dict) -> float:
        """
        Calculate confidence score for a detection.
        Higher scores for more specific patterns.
        """
        base_confidence = 0.7
        
        # Boost for multiple indicators matching
        matching = sum(1 for ind in pattern["indicators"] if ind in line)
        if matching > 1:
            base_confidence += 0.1
        
        # Boost for known dangerous patterns
        dangerous = ["eval(", "exec(", "shell=True", "innerHTML", "__proto__"]
        if any(d in line for d in dangerous):
            base_confidence += 0.1
        
        # Reduce for common false positive patterns
        false_positive_hints = ["test", "mock", "example", "sample", "demo"]
        if any(hint in line.lower() for hint in false_positive_hints):
            base_confidence -= 0.2
        
        return max(0.3, min(0.95, base_confidence))
    
    def to_json(self, bugs: List[Dict], compact: bool = True) -> str:
        """
        Convert bugs to JSON format.
        Compact mode uses minimal field names for token efficiency.
        """
        if compact:
            return json.dumps({"bugs": [
                {
                    "id": b["id"],
                    "loc": f"{Path(b['location']['file']).name}:{b['location']['line']}",
                    "lang": b.get("language", "?")[:2],
                    "cat": b["category"][:3],
                    "sev": b["severity"][:1].upper(),
                    "desc": b["description"],
                    "conf": round(b["confidence"], 2),
                    **({} if "cwe" not in b else {"cwe": b["cwe"]}),
                }
                for b in bugs
            ]}, separators=(',', ':'))
        else:
            return json.dumps({"bugs": bugs}, indent=2)
    
    def summary(self, bugs: List[Dict]) -> Dict[str, Any]:
        """Generate a summary of scan results."""
        by_severity = {}
        by_category = {}
        by_language = {}
        by_cwe = {}
        
        for b in bugs:
            sev = b["severity"]
            by_severity[sev] = by_severity.get(sev, 0) + 1
            
            cat = b["category"]
            by_category[cat] = by_category.get(cat, 0) + 1
            
            lang = b.get("language", "unknown")
            by_language[lang] = by_language.get(lang, 0) + 1
            
            cwe = b.get("cwe", "N/A")
            by_cwe[cwe] = by_cwe.get(cwe, 0) + 1
        
        return {
            "total": len(bugs),
            "by_severity": by_severity,
            "by_category": by_category,
            "by_language": by_language,
            "top_cwes": dict(sorted(by_cwe.items(), key=lambda x: -x[1])[:5]),
        }


if __name__ == "__main__":
    import sys
    
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(".")
    categories = sys.argv[2].split(",") if len(sys.argv) > 2 else None
    
    scanner = BugScanner()
    bugs = scanner.scan(path, categories)
    
    print(f"Found {len(bugs)} potential issues:\n")
    
    for b in bugs[:20]:  # Show first 20
        cwe = f" ({b['cwe']})" if 'cwe' in b else ""
        sev = b['severity'].upper()[:4]
        conf = f"{b['confidence']:.0%}"
        print(f"  [{b['id']}] [{sev}] {b['description']}{cwe}")
        print(f"           {Path(b['location']['file']).name}:{b['location']['line']} ({conf})")
    
    if len(bugs) > 20:
        print(f"\n  ... and {len(bugs) - 20} more")
    
    summary = scanner.summary(bugs)
    print(f"\nSummary: {summary['by_severity']}")
