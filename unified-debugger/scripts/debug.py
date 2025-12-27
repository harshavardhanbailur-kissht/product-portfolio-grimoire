#!/usr/bin/env python3
"""
Unified Debugger - Main Orchestrator

Research basis:
- LangGraph StateGraph: Sequential orchestration with conditional edges
- Aider: Git-integrated workflow with checkpoints
- SWE-agent: Linter guardrails, early termination at 15-18 steps
- ChatRepair: Iterative refinement, converges in ~3 turns
- FixAgent: Multi-agent verification (1.25-2.56× more bugs fixed)

Pipeline: EXTRACT → SCAN → FILTER → FIX → VERIFY → TEST → COMMIT

Usage:
    python debug.py /path/to/project --auto
    python debug.py /path/to/project --scan-only
    python debug.py --fix B001
    python debug.py --rollback B001
    python debug.py --resume
"""

import argparse
import fnmatch
import re
import subprocess
import sys
import uuid
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional

# Install pyyaml if needed
try:
    import yaml
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "pyyaml", "-q"])
    import yaml

# Import components
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

from extract import ContextExtractor
from scan import BugScanner
from fix import FixGenerator
from verify import Verifier
from test_gen import TestGenerator
from report import ReportGenerator


class UnifiedDebugger:
    """
    Main orchestrator implementing LangGraph-style state management.
    
    State persists in .debugger/state.yaml
    Git checkpoints enable instant rollback (Aider pattern)
    Max 5 fix attempts before escalation (ChatRepair)
    Early termination at 15-18 steps (SWE-agent)
    """
    
    def __init__(self, project_path: Path, mode: str = "auto"):
        self.project = project_path.resolve()
        self.mode = mode
        self.dbg_dir = self.project / ".debugger"
        self.state_file = self.dbg_dir / "state.yaml"
        self.ignore_file = self.dbg_dir / "ignore-rules.yaml"
        self.state: Dict[str, Any] = {}
        
        # Initialize components
        self.extractor = ContextExtractor()
        self.scanner = BugScanner()
        self.fixer = FixGenerator()
        self.verifier = Verifier()
        self.test_gen = TestGenerator()
        self.reporter = ReportGenerator()
        
        # Counters for early termination
        self.total_steps = 0
        self.max_steps = 50  # SWE-agent: terminate at high step count
    
    def init_session(self, goal: str = "Debug and fix code issues") -> bool:
        """Initialize a new debugging session."""
        self.dbg_dir.mkdir(exist_ok=True)
        
        self.state = {
            "session": {
                "id": f"sess-{datetime.now():%Y%m%d}-{uuid.uuid4().hex[:6]}",
                "started": datetime.now().isoformat(),
                "goal": goal,
                "mode": self.mode,
                "project": str(self.project),
            },
            "context": {
                "files_extracted": 0,
                "tokens_saved": 0,
            },
            "bugs": [],
            "stats": {
                "total": 0,
                "pending": 0,
                "fixed": 0,
                "verified": 0,
                "ignored": 0,
                "tokens_saved": 0,
                "tokens_used": 0,
            },
            "checkpoints": [],
        }
        
        self._save()
        self._init_ignore_rules()
        self._checkpoint("Session initialized")
        
        print(f"✅ Session: {self.state['session']['id']}")
        print(f"   Project: {self.project}")
        print(f"   Mode: {self.mode}")
        
        return True
    
    def _init_ignore_rules(self):
        """Initialize default ignore rules."""
        if not self.ignore_file.exists():
            default_rules = {
                "rules": [
                    {
                        "id": "test-files",
                        "file_glob": "**/test_*.py",
                        "categories": ["security"],
                        "reason": "Test files may contain intentional vulnerable patterns",
                    },
                    {
                        "id": "test-files-js",
                        "file_glob": "**/*.test.{js,ts}",
                        "categories": ["security"],
                        "reason": "Test files",
                    },
                    {
                        "id": "todos",
                        "pattern": "TODO:|FIXME:",
                        "categories": ["quality"],
                        "reason": "Informational markers",
                    },
                    {
                        "id": "console",
                        "pattern": "console\\.(log|error|warn)",
                        "categories": ["logic"],
                        "reason": "Development logging",
                    },
                ]
            }
            self.ignore_file.write_text(yaml.dump(default_rules))
    
    def _load(self) -> bool:
        """Load existing session state."""
        if not self.state_file.exists():
            return False
        self.state = yaml.safe_load(self.state_file.read_text())
        return True
    
    def _save(self):
        """Save current state."""
        self.state_file.write_text(
            yaml.dump(self.state, default_flow_style=False, sort_keys=False)
        )
    
    def _update_stats(self):
        """Update statistics from bug list."""
        stats = {
            "total": 0, "pending": 0, "fixed": 0, "verified": 0,
            "ignored": 0, "needs_review": 0,
            "tokens_saved": self.state.get("context", {}).get("tokens_saved", 0),
            "tokens_used": self.state.get("stats", {}).get("tokens_used", 0),
        }
        
        for b in self.state.get("bugs", []):
            stats["total"] += 1
            status = b.get("status", "pending")
            if status in stats:
                stats[status] += 1
        
        self.state["stats"] = stats
    
    def _checkpoint(self, message: str) -> Optional[str]:
        """Create Git checkpoint for rollback."""
        try:
            # Check if git repo
            subprocess.run(
                ["git", "rev-parse", "--git-dir"],
                cwd=self.project, capture_output=True, check=True
            )
            
            # Stage and commit
            subprocess.run(["git", "add", "-A"], cwd=self.project, capture_output=True)
            subprocess.run(
                ["git", "commit", "-m", f"[unified-debugger] {message}", "--allow-empty"],
                cwd=self.project, capture_output=True
            )
            
            # Get SHA
            result = subprocess.run(
                ["git", "rev-parse", "HEAD"],
                cwd=self.project, capture_output=True, text=True
            )
            sha = result.stdout.strip()
            
            self.state.setdefault("checkpoints", []).append({
                "sha": sha,
                "msg": message,
                "ts": datetime.now().isoformat(),
            })
            
            return sha
        except:
            return None
    
    def _rollback_to(self, sha: str) -> bool:
        """Rollback to a specific checkpoint."""
        try:
            subprocess.run(
                ["git", "reset", "--hard", sha],
                cwd=self.project, capture_output=True, check=True
            )
            return True
        except:
            return False
    
    def _matches_ignore(self, bug: Dict) -> Optional[str]:
        """Check if bug matches any ignore rule."""
        if not self.ignore_file.exists():
            return None
        
        rules = yaml.safe_load(self.ignore_file.read_text()).get("rules", [])
        file_path = bug["location"]["file"]
        
        for rule in rules:
            # Check category filter
            cats = rule.get("categories", [])
            if cats and bug.get("category") not in cats:
                continue
            
            # Check file glob
            if rule.get("file_glob"):
                if fnmatch.fnmatch(file_path, rule["file_glob"]):
                    return rule["id"]
            
            # Check pattern in code
            if rule.get("pattern"):
                try:
                    code = bug.get("location", {}).get("code", "")
                    if re.search(rule["pattern"], code, re.I):
                        return rule["id"]
                except:
                    pass
        
        return None
    
    def scan(self, categories: List[str] = None) -> List[Dict]:
        """Phase 2: Scan for bugs."""
        print(f"\n🔍 Scanning {self.project}...")
        self.total_steps += 1
        
        bugs = self.scanner.scan(self.project, categories)
        
        # Apply ignore rules
        for b in bugs:
            b["status"] = "pending"
            ignore_rule = self._matches_ignore(b)
            if ignore_rule:
                b["status"] = "ignored"
                b["ignore_rule"] = ignore_rule
        
        self.state["bugs"] = bugs
        self._update_stats()
        self._save()
        
        stats = self.state["stats"]
        print(f"   Found {len(bugs)} issues")
        print(f"   Pending: {stats['pending']} | Ignored: {stats['ignored']}")
        
        # Show summary by severity
        summary = self.scanner.summary(bugs)
        if summary["by_severity"]:
            sev_str = ", ".join(f"{k}: {v}" for k, v in summary["by_severity"].items())
            print(f"   Severity: {sev_str}")
        
        return bugs
    
    def fix(self, bug_id: str, previous_error: str = None) -> Dict[str, Any]:
        """Phase 3: Generate and apply fix."""
        self.total_steps += 1
        
        bug = next((b for b in self.state.get("bugs", []) if b["id"] == bug_id), None)
        if not bug:
            return {"success": False, "error": "Bug not found"}
        
        if bug["status"] not in ["pending", "fixing", "needs_review"]:
            return {"success": False, "error": f"Bug status: {bug['status']}"}
        
        print(f"\n🔧 Fixing {bug_id}...")
        
        # Create checkpoint before fix (Aider pattern)
        bug["status"] = "fixing"
        checkpoint = self._checkpoint(f"Before fixing {bug_id}")
        bug["checkpoint"] = checkpoint
        self._save()
        
        # Extract minimal context
        fp = Path(bug["location"]["file"])
        ctx = self.extractor.extract_for_bug(fp, bug["location"]["line"])
        self.state["context"]["tokens_saved"] += ctx.get("tokens_saved", 0)
        self.state["context"]["files_extracted"] += 1
        
        print(f"   Context: {ctx.get('reduction_percent', 0):.0f}% token reduction")
        
        # Generate fix
        result = self.fixer.generate_fix(bug, ctx, previous_error)
        
        if result.get("success"):
            # Verify before applying (SWE-agent linter guardrails)
            pre_check = self.verifier.verify_before_apply(
                result["new_content"], fp
            )
            
            if not pre_check.get("valid"):
                print(f"   ⚠️  Fix rejected: {pre_check.get('message')}")
                bug["fix"] = {
                    "rejected": True,
                    "reason": pre_check.get("message"),
                    "attempts": bug.get("fix", {}).get("attempts", 0) + 1,
                }
                self._save()
                return {"success": False, "error": pre_check.get("message")}
            
            # Apply fix
            fp.write_text(result["new_content"])
            bug["status"] = "fixed"
            bug["fix"] = {
                "diff": result.get("diff"),
                "confidence": result.get("confidence", 0.5),
                "attempts": bug.get("fix", {}).get("attempts", 0) + 1,
            }
            self._checkpoint(f"Fixed {bug_id}")
            
            print(f"   ✅ Fixed (confidence: {result.get('confidence', 0):.0%})")
        elif result.get("needs_llm"):
            print(f"   ⚠️  No template - LLM prompt generated")
            bug["fix"] = {
                "needs_llm": True,
                "prompt": result.get("prompt"),
            }
        else:
            print(f"   ❌ {result.get('error', 'Fix failed')}")
        
        self._update_stats()
        self._save()
        return result
    
    def verify(self, bug_id: str) -> Dict[str, Any]:
        """Phase 4: Verify fix."""
        self.total_steps += 1
        
        bug = next((b for b in self.state.get("bugs", []) if b["id"] == bug_id), None)
        if not bug:
            return {"passed": False, "error": "Bug not found"}
        
        if bug["status"] != "fixed":
            return {"passed": False, "error": f"Bug status: {bug['status']}"}
        
        print(f"\n🔍 Verifying {bug_id}...")
        
        fp = Path(bug["location"]["file"])
        result = self.verifier.verify(fp, bug)
        
        if result["passed"]:
            bug["status"] = "verified"
            bug["verification"] = {
                "passed": True,
                "confidence": result.get("confidence", 0.9),
                "checks": [c["name"] for c in result.get("checks", [])],
            }
            print(f"   ✅ Verified (confidence: {result.get('confidence', 0):.0%})")
        else:
            bug["verification"] = {
                "passed": False,
                "issues": result.get("issues", []),
            }
            print(f"   ❌ Failed: {result.get('issues', [])}")
        
        self._update_stats()
        self._save()
        return result
    
    def gen_test(self, bug_id: str) -> Dict[str, Any]:
        """Phase 5: Generate regression test."""
        self.total_steps += 1
        
        bug = next((b for b in self.state.get("bugs", []) if b["id"] == bug_id), None)
        if not bug:
            return {"success": False, "error": "Bug not found"}
        
        if bug["status"] != "verified":
            return {"success": False, "error": f"Bug status: {bug['status']}"}
        
        print(f"\n🧪 Generating test for {bug_id}...")
        
        diff = bug.get("fix", {}).get("diff", "")
        result = self.test_gen.generate(bug, self.project, diff)
        
        if result.get("success"):
            bug["test_generated"] = result["test_file"]
            print(f"   ✅ {Path(result['test_file']).name}")
        else:
            print(f"   ❌ {result.get('error', 'Test generation failed')}")
        
        self._save()
        return result
    
    def run_pipeline(self, confirm: bool = False) -> Dict[str, int]:
        """Run full debugging pipeline."""
        results = {
            "scanned": 0, "fixed": 0, "verified": 0,
            "tests": 0, "failed": 0, "skipped": 0,
        }
        
        # Phase 2: Scan
        bugs = self.scan()
        results["scanned"] = len(bugs)
        
        if self.mode == "scan-only":
            return results
        
        # Get pending bugs
        pending = [b for b in self.state["bugs"] if b["status"] == "pending"]
        print(f"\n📋 {len(pending)} bugs to process")
        
        for i, bug in enumerate(pending):
            # Early termination (SWE-agent)
            if self.total_steps >= self.max_steps:
                print(f"\n⚠️  Step limit reached ({self.max_steps}). Stopping.")
                results["skipped"] = len(pending) - i
                break
            
            print(f"\n{'='*50}")
            print(f"Bug {i+1}/{len(pending)}: {bug['id']} - {bug.get('description', 'Unknown')}")
            print(f"{'='*50}")
            
            # Confirmation mode
            if confirm:
                resp = input("Process? [Y/n/s/q]: ").strip().lower()
                if resp in ('n', 's'):
                    results["skipped"] += 1
                    continue
                if resp == 'q':
                    results["skipped"] = len(pending) - i
                    break
            
            # Phase 3: Fix
            fix_result = self.fix(bug["id"])
            if not fix_result.get("success"):
                if fix_result.get("needs_llm"):
                    results["skipped"] += 1
                else:
                    results["failed"] += 1
                continue
            
            results["fixed"] += 1
            
            # Phase 4: Verify (with retry loop - ChatRepair pattern)
            max_attempts = 5
            for attempt in range(max_attempts):
                verify_result = self.verify(bug["id"])
                
                if verify_result.get("passed"):
                    results["verified"] += 1
                    break
                
                if not verify_result.get("can_retry"):
                    break
                
                # Retry with error feedback
                print(f"   Retry {attempt + 1}/{max_attempts}...")
                error_msg = "; ".join(verify_result.get("issues", []))
                
                # Rollback and retry
                if bug.get("checkpoint"):
                    self._rollback_to(bug["checkpoint"])
                
                bug["status"] = "pending"
                self._save()
                
                fix_result = self.fix(bug["id"], previous_error=error_msg)
                if not fix_result.get("success"):
                    break
            else:
                # Max attempts reached
                bug["status"] = "needs_review"
                self._save()
                results["failed"] += 1
                continue
            
            # Phase 5: Generate test (only for verified fixes)
            if bug["status"] == "verified":
                test_result = self.gen_test(bug["id"])
                if test_result.get("success"):
                    results["tests"] += 1
        
        # Final checkpoint
        self._checkpoint("Pipeline complete")
        
        return results
    
    def rollback(self, bug_id: str) -> bool:
        """Rollback a specific bug fix."""
        bug = next((b for b in self.state.get("bugs", []) if b["id"] == bug_id), None)
        if not bug:
            print(f"❌ Bug {bug_id} not found")
            return False
        
        checkpoint = bug.get("checkpoint")
        if not checkpoint:
            print(f"❌ No checkpoint for {bug_id}")
            return False
        
        if self._rollback_to(checkpoint):
            bug["status"] = "pending"
            bug.pop("fix", None)
            bug.pop("verification", None)
            bug.pop("test_generated", None)
            self._update_stats()
            self._save()
            print(f"✅ Rolled back {bug_id} to {checkpoint[:8]}")
            return True
        
        print(f"❌ Rollback failed")
        return False
    
    def status(self) -> Dict[str, Any]:
        """Get current session status."""
        if not self._load():
            return {"error": "No active session"}
        
        return {
            "session": self.state.get("session"),
            "stats": self.state.get("stats"),
            "bugs": len(self.state.get("bugs", [])),
        }
    
    def report(self, format: str = "summary") -> str:
        """Generate session report."""
        if not self._load():
            return "No active session"
        
        return self.reporter.generate(self.state, format)


def main():
    parser = argparse.ArgumentParser(
        description="Unified Debugger - Find, fix, verify, and test bugs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python debug.py /path/to/project --auto       # Full auto pipeline
  python debug.py /path/to/project --scan-only  # Just scan
  python debug.py --fix B001                    # Fix specific bug
  python debug.py --rollback B001               # Undo fix
  python debug.py --report --report-format md   # Generate report
        """
    )
    
    parser.add_argument("path", nargs="?", help="Project path")
    parser.add_argument("--auto", action="store_true", help="Full auto mode")
    parser.add_argument("--confirm", action="store_true", help="Confirm each fix")
    parser.add_argument("--scan-only", action="store_true", help="Scan only")
    parser.add_argument("--fix", metavar="ID", help="Fix specific bug")
    parser.add_argument("--verify", metavar="ID", help="Verify specific bug")
    parser.add_argument("--rollback", metavar="ID", help="Rollback fix")
    parser.add_argument("--status", action="store_true", help="Show status")
    parser.add_argument("--report", action="store_true", help="Generate report")
    parser.add_argument("--report-format", default="summary",
                       choices=["summary", "detailed", "json", "markdown", "trajectory"])
    parser.add_argument("--resume", action="store_true", help="Resume session")
    parser.add_argument("--goal", default="Debug and fix code issues")
    parser.add_argument("--categories", default="security,auth,logic",
                       help="Bug categories to scan (comma-separated)")
    
    args = parser.parse_args()
    
    # Determine mode
    mode = "scan-only" if args.scan_only else ("confirm" if args.confirm else "auto")
    
    # Project path
    project = Path(args.path).resolve() if args.path else Path.cwd()
    
    # Create debugger
    dbg = UnifiedDebugger(project, mode)
    
    # Handle commands
    if args.status:
        s = dbg.status()
        if "error" in s:
            print(f"❌ {s['error']}")
        else:
            print(f"Session: {s['session']['id']}")
            print(f"Stats: {s['stats']}")
        return
    
    if args.report:
        if not dbg._load():
            print("❌ No active session")
            return
        print(dbg.report(args.report_format))
        return
    
    if args.rollback:
        if not dbg._load():
            print("❌ No active session")
            return
        dbg.rollback(args.rollback)
        return
    
    if args.fix:
        if not dbg._load():
            print("❌ No active session")
            return
        dbg.fix(args.fix)
        return
    
    if args.verify:
        if not dbg._load():
            print("❌ No active session")
            return
        dbg.verify(args.verify)
        return
    
    # Resume or new session
    if args.resume:
        if not dbg._load():
            print("❌ No session to resume")
            return
        print(f"📂 Resuming session: {dbg.state['session']['id']}")
    else:
        dbg.init_session(args.goal)
    
    # Run pipeline
    results = dbg.run_pipeline(args.confirm)
    
    # Print summary
    print(f"\n{'='*60}")
    print("COMPLETE")
    print(f"{'='*60}")
    print(f"  Scanned: {results['scanned']}")
    print(f"  Fixed: {results['fixed']}")
    print(f"  Verified: {results['verified']}")
    print(f"  Tests: {results['tests']}")
    print(f"  Failed: {results['failed']}")
    print(f"  Skipped: {results['skipped']}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
