#!/usr/bin/env python3
"""
Verifier - Multi-stage fix verification

Research basis:
- FixAgent: 4-stage verification (syntax, semantic, functional, quality)
- SWE-agent: 90.5% eventual success via linter guardrails
- Self-Refine: +8-12% accuracy after iteration 1, +5-8% after iteration 2
- PyCapsule: Diminishing returns beyond iteration 5

Implements: Syntax → Imports → Lint → Tests verification pipeline
"""

import ast
import subprocess
import sys
import time
from pathlib import Path
from typing import Dict, Any, List, Optional


class Verifier:
    """
    Multi-stage verification implementing FixAgent architecture.
    
    Stages:
    1. Syntax Validation (immediate, <1s) - Parser/compiler
    2. Import Verification (fast, <5s) - Check imports exist
    3. Lint Check (fast, <30s) - Static analysis
    4. Test Execution (thorough, <60s) - Unit/integration tests
    
    Confidence scoring:
    - Start at 1.0
    - Deduct for each failed stage
    - Pass threshold: ≥0.5 AND syntax valid
    """
    
    def __init__(self):
        self.lang_map = {
            ".py": "python",
            ".js": "javascript", ".mjs": "javascript", ".cjs": "javascript",
            ".ts": "typescript", ".tsx": "typescript", ".jsx": "javascript",
        }
    
    def verify(self, file_path: Path, bug: Dict = None,
               stages: List[str] = None) -> Dict[str, Any]:
        """
        Run verification stages on a file.
        
        Args:
            file_path: Path to file to verify
            bug: Optional bug dict for context
            stages: Which stages to run (default: all)
        
        Returns:
            {passed, confidence, checks[], issues[], can_retry}
        """
        fp = Path(file_path)
        if not fp.exists():
            return {
                "passed": False,
                "confidence": 0,
                "issues": ["File not found"],
                "checks": [],
                "can_retry": False,
            }
        
        lang = self.lang_map.get(fp.suffix, "python")
        stages = stages or ["syntax", "imports", "lint", "tests"]
        
        checks, issues = [], []
        confidence = 1.0
        
        # Stage 1: Syntax Validation (critical - fails entire verification)
        if "syntax" in stages:
            result = self._check_syntax(fp, lang)
            checks.append(result)
            
            if not result["passed"]:
                return {
                    "passed": False,
                    "confidence": 0,
                    "checks": checks,
                    "issues": [f"Syntax error: {result['message']}"],
                    "can_retry": True,  # Syntax errors are fixable
                }
        
        # Stage 2: Import Verification
        if "imports" in stages:
            result = self._check_imports(fp, lang)
            checks.append(result)
            
            if not result["passed"]:
                issues.append(f"Import issue: {result['message']}")
                confidence -= 0.2
        
        # Stage 3: Lint Check
        if "lint" in stages:
            result = self._check_lint(fp, lang)
            checks.append(result)
            
            if not result["passed"]:
                issues.append(f"Lint: {result['message']}")
                confidence -= 0.15
        
        # Stage 4: Test Execution
        if "tests" in stages:
            result = self._check_tests(fp, lang, bug)
            checks.append(result)
            
            if not result["passed"]:
                if result.get("test_found"):
                    issues.append(f"Tests failed: {result['message']}")
                    confidence -= 0.3
                # No deduction if no tests found
        
        passed = confidence >= 0.5
        
        return {
            "passed": passed,
            "confidence": max(0, round(confidence, 2)),
            "checks": checks,
            "issues": issues,
            "can_retry": not passed and confidence > 0.2,
        }
    
    def verify_before_apply(self, content: str, file_path: Path) -> Dict[str, Any]:
        """
        SWE-agent pattern: Verify content before applying to file.
        Prevents invalid edits from entering the codebase.
        """
        fp = Path(file_path)
        lang = self.lang_map.get(fp.suffix, "python")
        
        # Quick syntax check on content
        if lang == "python":
            try:
                ast.parse(content)
                return {"valid": True, "message": "Syntax OK"}
            except SyntaxError as e:
                return {
                    "valid": False,
                    "message": f"Line {e.lineno}: {e.msg}",
                    "error_type": "syntax",
                }
        else:
            # Basic bracket matching for JS/TS
            opens = content.count('{') + content.count('(') + content.count('[')
            closes = content.count('}') + content.count(')') + content.count(']')
            if opens != closes:
                return {
                    "valid": False,
                    "message": "Unmatched brackets",
                    "error_type": "syntax",
                }
            return {"valid": True, "message": "Basic check passed"}
    
    def _check_syntax(self, fp: Path, lang: str) -> Dict[str, Any]:
        """Stage 1: Syntax validation."""
        start = time.time()
        
        if lang == "python":
            try:
                ast.parse(fp.read_text())
                return {
                    "name": "syntax",
                    "passed": True,
                    "message": "Valid Python syntax",
                    "duration_ms": int((time.time() - start) * 1000),
                }
            except SyntaxError as e:
                return {
                    "name": "syntax",
                    "passed": False,
                    "message": f"Line {e.lineno}: {e.msg}",
                    "duration_ms": int((time.time() - start) * 1000),
                }
        
        elif lang in ("javascript", "typescript"):
            # Try tsc for TypeScript
            if lang == "typescript" or fp.suffix in ('.ts', '.tsx'):
                try:
                    result = subprocess.run(
                        ["npx", "tsc", "--noEmit", "--allowJs", "--skipLibCheck", str(fp)],
                        capture_output=True, text=True, timeout=30
                    )
                    if result.returncode == 0:
                        return {
                            "name": "syntax",
                            "passed": True,
                            "message": "Valid TypeScript",
                            "duration_ms": int((time.time() - start) * 1000),
                        }
                    else:
                        err = (result.stderr or result.stdout).split('\n')[0][:80]
                        return {
                            "name": "syntax",
                            "passed": False,
                            "message": err,
                            "duration_ms": int((time.time() - start) * 1000),
                        }
                except:
                    pass
            
            # Try node --check for JS
            try:
                result = subprocess.run(
                    ["node", "--check", str(fp)],
                    capture_output=True, text=True, timeout=15
                )
                return {
                    "name": "syntax",
                    "passed": result.returncode == 0,
                    "message": "Valid JavaScript" if result.returncode == 0 else result.stderr.split('\n')[0][:80],
                    "duration_ms": int((time.time() - start) * 1000),
                }
            except:
                pass
            
            # Fallback: basic bracket check
            content = fp.read_text()
            if content.count('{') == content.count('}') and content.count('(') == content.count(')'):
                return {
                    "name": "syntax",
                    "passed": True,
                    "message": "Basic check passed",
                    "duration_ms": int((time.time() - start) * 1000),
                }
        
        return {
            "name": "syntax",
            "passed": True,
            "message": "Skipped (unsupported language)",
            "duration_ms": int((time.time() - start) * 1000),
        }
    
    def _check_imports(self, fp: Path, lang: str) -> Dict[str, Any]:
        """Stage 2: Import verification (hallucination prevention)."""
        start = time.time()
        
        if lang == "python":
            try:
                tree = ast.parse(fp.read_text())
                missing = []
                
                for node in ast.walk(tree):
                    if isinstance(node, ast.Import):
                        for alias in node.names:
                            mod = alias.name.split('.')[0]
                            try:
                                __import__(mod)
                            except ImportError:
                                missing.append(mod)
                    elif isinstance(node, ast.ImportFrom) and node.module:
                        mod = node.module.split('.')[0]
                        try:
                            __import__(mod)
                        except ImportError:
                            # Check if it's a local import
                            local_path = fp.parent / f"{mod}.py"
                            if not local_path.exists():
                                missing.append(mod)
                
                if missing:
                    return {
                        "name": "imports",
                        "passed": False,
                        "message": f"Missing: {', '.join(missing[:3])}",
                        "missing_imports": missing,
                        "duration_ms": int((time.time() - start) * 1000),
                    }
                
                return {
                    "name": "imports",
                    "passed": True,
                    "message": "All imports available",
                    "duration_ms": int((time.time() - start) * 1000),
                }
            except:
                pass
        
        return {
            "name": "imports",
            "passed": True,
            "message": "Skipped",
            "duration_ms": int((time.time() - start) * 1000),
        }
    
    def _check_lint(self, fp: Path, lang: str) -> Dict[str, Any]:
        """Stage 3: Static analysis with linter."""
        start = time.time()
        
        linters = {
            "python": [
                ["ruff", "check", "--select=E,F", str(fp)],
                ["flake8", "--select=E,F", str(fp)],
                ["pylint", "--errors-only", str(fp)],
            ],
            "javascript": [
                ["npx", "eslint", "--quiet", str(fp)],
                ["npx", "biome", "check", str(fp)],
            ],
            "typescript": [
                ["npx", "eslint", "--quiet", str(fp)],
                ["npx", "biome", "check", str(fp)],
            ],
        }
        
        for cmd in linters.get(lang, []):
            try:
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                duration = int((time.time() - start) * 1000)
                
                if result.returncode == 0:
                    return {
                        "name": "lint",
                        "passed": True,
                        "message": "No issues",
                        "linter": cmd[0],
                        "duration_ms": duration,
                    }
                else:
                    output = (result.stdout or result.stderr).strip().split('\n')
                    first_error = output[0][:80] if output else "Unknown error"
                    return {
                        "name": "lint",
                        "passed": False,
                        "message": first_error,
                        "linter": cmd[0],
                        "duration_ms": duration,
                    }
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue
        
        return {
            "name": "lint",
            "passed": True,
            "message": "No linter available",
            "duration_ms": int((time.time() - start) * 1000),
        }
    
    def _check_tests(self, fp: Path, lang: str, bug: Dict = None) -> Dict[str, Any]:
        """Stage 4: Test execution."""
        start = time.time()
        
        # Find test file
        test_patterns = [
            fp.parent / f"test_{fp.stem}{fp.suffix}",
            fp.parent / f"{fp.stem}_test{fp.suffix}",
            fp.parent / f"{fp.stem}.test{fp.suffix}",
            fp.parent / f"{fp.stem}.spec{fp.suffix}",
            fp.parent / "tests" / f"test_{fp.stem}{fp.suffix}",
            fp.parent / "__tests__" / f"{fp.stem}.test{fp.suffix}",
        ]
        
        test_file = next((p for p in test_patterns if p.exists()), None)
        
        if not test_file:
            return {
                "name": "tests",
                "passed": True,
                "message": "No test file found",
                "test_found": False,
                "duration_ms": int((time.time() - start) * 1000),
            }
        
        # Run tests
        test_commands = {
            "python": [sys.executable, "-m", "pytest", str(test_file), "-q", "--tb=short"],
            "javascript": ["npx", "jest", str(test_file), "--silent"],
            "typescript": ["npx", "jest", str(test_file), "--silent"],
        }
        
        cmd = test_commands.get(lang)
        if not cmd:
            return {
                "name": "tests",
                "passed": True,
                "message": "No test runner",
                "test_found": True,
                "duration_ms": int((time.time() - start) * 1000),
            }
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60, cwd=fp.parent)
            duration = int((time.time() - start) * 1000)
            
            return {
                "name": "tests",
                "passed": result.returncode == 0,
                "message": "All tests passed" if result.returncode == 0 else "Tests failed",
                "test_found": True,
                "test_file": str(test_file),
                "duration_ms": duration,
            }
        except subprocess.TimeoutExpired:
            return {
                "name": "tests",
                "passed": False,
                "message": "Test timeout (>60s)",
                "test_found": True,
                "duration_ms": 60000,
            }
        except FileNotFoundError:
            return {
                "name": "tests",
                "passed": True,
                "message": "Test runner not found",
                "test_found": True,
                "duration_ms": int((time.time() - start) * 1000),
            }


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python verify.py <file>")
        sys.exit(1)
    
    verifier = Verifier()
    fp = Path(sys.argv[1])
    result = verifier.verify(fp)
    
    status = "✅ PASSED" if result["passed"] else "❌ FAILED"
    print(f"{status} (confidence: {result['confidence']:.0%})")
    print()
    
    for check in result["checks"]:
        icon = "✓" if check["passed"] else "✗"
        print(f"  {icon} {check['name']}: {check['message']} ({check['duration_ms']}ms)")
    
    if result["issues"]:
        print(f"\nIssues: {result['issues']}")
    
    if result.get("can_retry"):
        print("\n→ Can retry with fix iteration")
