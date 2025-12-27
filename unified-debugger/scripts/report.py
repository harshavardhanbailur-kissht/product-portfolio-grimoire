#!/usr/bin/env python3
"""
Report Generator - Session reporting with trajectory logging

Research basis:
- SWE-agent trajectory format for observability
- Success metrics: 12 steps @ $1.21 vs 21 steps @ $2.52
- Early termination at 15-18 steps without test passage
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any


class ReportGenerator:
    """
    Generates debugging session reports in multiple formats.
    
    Formats:
    - summary: Quick overview
    - detailed: Full bug breakdown
    - markdown: GitHub-compatible
    - json: Machine-readable
    - trajectory: SWE-agent style (for debugging/replay)
    """
    
    def generate(self, state: Dict, format: str = "summary") -> str:
        """Generate report in specified format."""
        if format == "json":
            return self._json_report(state)
        elif format == "markdown":
            return self._markdown_report(state)
        elif format == "detailed":
            return self._detailed_report(state)
        elif format == "trajectory":
            return self._trajectory_report(state)
        else:
            return self._summary_report(state)
    
    def _summary_report(self, state: Dict) -> str:
        """Quick summary for console output."""
        session = state.get("session", {})
        bugs = state.get("bugs", [])
        stats = state.get("stats", {})
        
        # Count by status
        by_status = {}
        for b in bugs:
            status = b.get("status", "unknown")
            by_status[status] = by_status.get(status, 0) + 1
        
        tokens_saved = stats.get("tokens_saved", 0)
        tokens_used = stats.get("tokens_used", 0)
        total_tokens = tokens_saved + tokens_used
        reduction = (tokens_saved / max(total_tokens, 1)) * 100 if total_tokens > 0 else 0
        
        return f"""
{'='*60}
UNIFIED DEBUGGER REPORT
{'='*60}
Session: {session.get('id', 'N/A')}
Goal: {session.get('goal', 'N/A')}
Mode: {session.get('mode', 'N/A')}

📊 BUG SUMMARY
{'-'*40}
Total found: {len(bugs)}
  ✅ Verified: {by_status.get('verified', 0)}
  🔧 Fixed: {by_status.get('fixed', 0)}
  ⏳ Pending: {by_status.get('pending', 0)}
  🚫 Ignored: {by_status.get('ignored', 0)}
  ⚠️  Needs review: {by_status.get('needs_review', 0)}

💰 TOKEN EFFICIENCY
{'-'*40}
Tokens saved: ~{tokens_saved:,}
Tokens used: ~{tokens_used:,}
Reduction: {reduction:.1f}%

{'='*60}
"""
    
    def _detailed_report(self, state: Dict) -> str:
        """Full breakdown with per-bug details."""
        lines = [self._summary_report(state)]
        lines.append("\n📋 BUG DETAILS")
        lines.append("-" * 50)
        
        bugs = state.get("bugs", [])
        
        for b in bugs:
            loc = b.get("location", {})
            status_icon = {
                "verified": "✅",
                "fixed": "🔧",
                "pending": "⏳",
                "ignored": "🚫",
                "needs_review": "⚠️",
            }.get(b.get("status"), "?")
            
            lines.append(f"\n{status_icon} [{b['id']}] {b.get('description', 'N/A')}")
            lines.append(f"   File: {Path(loc.get('file', '?')).name}:{loc.get('line', '?')}")
            lines.append(f"   Category: {b.get('category', '?')} | Severity: {b.get('severity', '?')}")
            
            if b.get("cwe"):
                lines.append(f"   CWE: {b['cwe']}")
            
            if b.get("fix"):
                fix = b["fix"]
                lines.append(f"   Fix confidence: {fix.get('confidence', 0):.0%}")
                if fix.get("attempts", 1) > 1:
                    lines.append(f"   Attempts: {fix['attempts']}")
            
            if b.get("verification"):
                v = b["verification"]
                lines.append(f"   Verification: {'passed' if v.get('passed') else 'failed'}")
            
            if b.get("test_generated"):
                lines.append(f"   Test: {Path(b['test_generated']).name}")
        
        return '\n'.join(lines)
    
    def _markdown_report(self, state: Dict) -> str:
        """GitHub-compatible markdown report."""
        session = state.get("session", {})
        bugs = state.get("bugs", [])
        stats = state.get("stats", {})
        
        # Count by status
        by_status = {}
        by_severity = {}
        for b in bugs:
            status = b.get("status", "unknown")
            by_status[status] = by_status.get(status, 0) + 1
            sev = b.get("severity", "unknown")
            by_severity[sev] = by_severity.get(sev, 0) + 1
        
        lines = [
            "# Unified Debugger Report",
            "",
            f"**Session**: `{session.get('id', 'N/A')}`",
            f"**Goal**: {session.get('goal', 'N/A')}",
            f"**Mode**: {session.get('mode', 'N/A')}",
            "",
            "## Summary",
            "",
            "| Status | Count |",
            "|--------|-------|",
            f"| ✅ Verified | {by_status.get('verified', 0)} |",
            f"| 🔧 Fixed | {by_status.get('fixed', 0)} |",
            f"| ⏳ Pending | {by_status.get('pending', 0)} |",
            f"| 🚫 Ignored | {by_status.get('ignored', 0)} |",
            f"| **Total** | **{len(bugs)}** |",
            "",
            "## By Severity",
            "",
            "| Severity | Count |",
            "|----------|-------|",
        ]
        
        for sev in ["critical", "high", "medium", "low", "info"]:
            if sev in by_severity:
                lines.append(f"| {sev.title()} | {by_severity[sev]} |")
        
        # Add bugs table
        if bugs:
            lines.extend([
                "",
                "## Bug Details",
                "",
                "| ID | Severity | Description | Location | Status |",
                "|----|----------|-------------|----------|--------|",
            ])
            
            for b in bugs[:20]:  # Limit to 20 in markdown
                loc = b.get("location", {})
                file_loc = f"`{Path(loc.get('file', '?')).name}:{loc.get('line', '?')}`"
                cwe = f" ({b['cwe']})" if b.get("cwe") else ""
                lines.append(
                    f"| {b['id']} | {b.get('severity', '?')} | "
                    f"{b.get('description', '?')}{cwe} | {file_loc} | {b.get('status', '?')} |"
                )
            
            if len(bugs) > 20:
                lines.append(f"\n*... and {len(bugs) - 20} more bugs*")
        
        # Token efficiency
        tokens_saved = stats.get("tokens_saved", 0)
        tokens_used = stats.get("tokens_used", 0)
        total = tokens_saved + tokens_used
        reduction = (tokens_saved / max(total, 1)) * 100 if total > 0 else 0
        
        lines.extend([
            "",
            "## Token Efficiency",
            "",
            f"- Tokens saved: ~{tokens_saved:,}",
            f"- Tokens used: ~{tokens_used:,}",
            f"- **Reduction: {reduction:.1f}%**",
        ])
        
        return '\n'.join(lines)
    
    def _json_report(self, state: Dict) -> str:
        """Machine-readable JSON report."""
        return json.dumps(state, indent=2, default=str)
    
    def _trajectory_report(self, state: Dict) -> str:
        """
        SWE-agent style trajectory for debugging/replay.
        
        Format:
        {
            "trajectory": [
                {"thought": "...", "action": "...", "observation": "..."}
            ],
            "info": {"exit_status": "...", "model_stats": {...}}
        }
        """
        trajectory = []
        
        session = state.get("session", {})
        bugs = state.get("bugs", [])
        stats = state.get("stats", {})
        checkpoints = state.get("checkpoints", [])
        
        # Session init
        trajectory.append({
            "thought": f"Starting debugging session: {session.get('goal', 'Debug code')}",
            "action": f"init_session --mode {session.get('mode', 'auto')}",
            "observation": f"Session {session.get('id', 'unknown')} started",
        })
        
        # Per-bug trajectory
        for b in bugs:
            loc = b.get("location", {})
            file_name = Path(loc.get("file", "?")).name
            
            # Scan
            trajectory.append({
                "thought": f"Found {b.get('description', 'issue')} at {file_name}:{loc.get('line', '?')}",
                "action": f"scan --file {file_name}",
                "observation": f"Bug {b['id']} ({b.get('cwe', 'N/A')}) confidence {b.get('confidence', 0):.0%}",
            })
            
            # Fix (if attempted)
            if b.get("fix"):
                fix = b["fix"]
                trajectory.append({
                    "thought": f"Generating fix for {b['id']}",
                    "action": f"fix {b['id']}",
                    "observation": f"Fix applied with {fix.get('confidence', 0):.0%} confidence, {fix.get('attempts', 1)} attempts",
                })
            
            # Verify (if attempted)
            if b.get("verification"):
                v = b["verification"]
                trajectory.append({
                    "thought": f"Verifying fix for {b['id']}",
                    "action": f"verify {b['id']}",
                    "observation": "Verification passed" if v.get("passed") else f"Verification failed: {v.get('issues', [])}",
                })
            
            # Test (if generated)
            if b.get("test_generated"):
                trajectory.append({
                    "thought": f"Generating regression test for {b['id']}",
                    "action": f"gen_test {b['id']}",
                    "observation": f"Test created: {Path(b['test_generated']).name}",
                })
        
        # Summary
        info = {
            "exit_status": "completed",
            "model_stats": {
                "bugs_found": len(bugs),
                "bugs_fixed": sum(1 for b in bugs if b.get("status") == "fixed"),
                "bugs_verified": sum(1 for b in bugs if b.get("status") == "verified"),
                "tokens_saved": stats.get("tokens_saved", 0),
                "checkpoints": len(checkpoints),
            },
        }
        
        return json.dumps({
            "trajectory": trajectory,
            "info": info,
        }, indent=2)


if __name__ == "__main__":
    import sys
    
    # Test with sample state
    sample_state = {
        "session": {
            "id": "sess-20241222-test",
            "goal": "Fix security vulnerabilities",
            "mode": "auto",
        },
        "bugs": [
            {
                "id": "B001ABC",
                "status": "verified",
                "category": "security",
                "severity": "high",
                "cwe": "CWE-89",
                "description": "SQL Injection",
                "location": {"file": "/app/auth.py", "line": 42},
                "confidence": 0.85,
                "fix": {"confidence": 0.9, "attempts": 1},
                "verification": {"passed": True},
                "test_generated": "tests/test_b001abc_regression.py",
            },
            {
                "id": "B002DEF",
                "status": "pending",
                "category": "security",
                "severity": "high",
                "cwe": "CWE-79",
                "description": "Cross-Site Scripting",
                "location": {"file": "/app/views.py", "line": 18},
                "confidence": 0.7,
            },
        ],
        "stats": {
            "tokens_saved": 8500,
            "tokens_used": 1500,
        },
        "checkpoints": [{"sha": "abc123", "msg": "Fixed B001"}],
    }
    
    gen = ReportGenerator()
    
    fmt = sys.argv[1] if len(sys.argv) > 1 else "summary"
    print(gen.generate(sample_state, fmt))
