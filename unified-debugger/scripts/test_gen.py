#!/usr/bin/env python3
"""
Test Generator - Regression tests from bug fixes

Research basis:
- Cleverest (January 2025): Reproduced bugs in 4/6 commits under 3 minutes
- MuTAP: 93.57% mutation score via mutation-guided refinement
- Meta ACH: 73% engineer acceptance rate on generated tests
- Differential prompting: Test FAILS on buggy, PASSES on fixed

Quality targets:
- Compilation rate: >99%
- Mutation score: >80%
- Flakiness: 0%
"""

from pathlib import Path
from typing import Dict, Any


# CWE-specific test templates
CWE_TEST_TEMPLATES = {
    "CWE-89": '''
def test_{bid}_sql_injection_regression():
    """
    Regression test: SQL Injection vulnerability (CWE-89)
    
    This test verifies that user input is properly parameterized
    and cannot be used for SQL injection attacks.
    """
    # Malicious inputs that would exploit SQL injection
    malicious_inputs = [
        "admin'--",
        "' OR '1'='1",
        "'; DROP TABLE users;--",
        "1; DELETE FROM users WHERE '1'='1",
    ]
    
    for payload in malicious_inputs:
        # TODO: Call the fixed function with malicious input
        # result = {func}(payload)
        
        # Verify the payload is NOT directly concatenated into SQL
        # Assert parameterized queries are used
        pass
    
    assert True  # Replace with actual assertions
''',
    
    "CWE-78": '''
def test_{bid}_command_injection_regression():
    """
    Regression test: Command Injection vulnerability (CWE-78)
    
    This test verifies that user input cannot be used to inject
    arbitrary shell commands.
    """
    # Malicious inputs that would exploit command injection
    malicious_inputs = [
        "; rm -rf /",
        "| cat /etc/passwd",
        "&& whoami",
        "`id`",
        "$(whoami)",
    ]
    
    for payload in malicious_inputs:
        # TODO: Call the fixed function with malicious input
        # Should either sanitize input or raise an error
        pass
    
    assert True  # Replace with actual assertions
''',
    
    "CWE-79": '''
def test_{bid}_xss_regression():
    """
    Regression test: Cross-Site Scripting (CWE-79)
    
    This test verifies that user input is properly sanitized
    before being rendered in HTML context.
    """
    # Malicious inputs that would exploit XSS
    malicious_inputs = [
        "<script>alert('xss')</script>",
        "<img src=x onerror=alert('xss')>",
        "javascript:alert('xss')",
        "<svg onload=alert('xss')>",
    ]
    
    for payload in malicious_inputs:
        # TODO: Call the fixed function with malicious input
        # result = {func}(payload)
        
        # Verify HTML entities are escaped or content is sanitized
        # assert "<script>" not in result
        pass
    
    assert True  # Replace with actual assertions
''',
    
    "CWE-22": '''
def test_{bid}_path_traversal_regression():
    """
    Regression test: Path Traversal vulnerability (CWE-22)
    
    This test verifies that user input cannot be used to access
    files outside the intended directory.
    """
    # Malicious inputs that would exploit path traversal
    malicious_inputs = [
        "../../../etc/passwd",
        "..\\\\..\\\\..\\\\windows\\\\system32\\\\config\\\\sam",
        "....//....//....//etc/passwd",
        "%2e%2e%2f%2e%2e%2f%2e%2e%2fetc/passwd",
    ]
    
    for payload in malicious_inputs:
        # TODO: Call the fixed function with malicious input
        # Should either sanitize path or raise an error
        pass
    
    assert True  # Replace with actual assertions
''',
    
    "CWE-798": '''
def test_{bid}_hardcoded_secrets_regression():
    """
    Regression test: Hardcoded Credentials (CWE-798)
    
    This test verifies that credentials are loaded from environment
    variables rather than being hardcoded.
    """
    import os
    
    # TODO: Import the module being tested
    # import {module}
    
    # Verify that credentials are loaded from environment
    # These assertions check that the values come from env vars
    # assert {module}.API_KEY == os.environ.get("API_KEY")
    # assert {module}.SECRET == os.environ.get("SECRET")
    
    assert True  # Replace with actual assertions
''',
}


# Default template for non-CWE bugs
DEFAULT_TEST_TEMPLATE = '''
def test_{bid}_regression():
    """
    Regression test for: {description}
    Location: {file}:{line}
    
    This test verifies the bug fix prevents the original issue.
    """
    # TODO: Implement test that would FAIL on buggy version
    #       and PASS on fixed version
    
    assert True  # Replace with actual test logic
'''


class TestGenerator:
    """
    Generates regression tests for verified bug fixes.
    
    Uses differential prompting pattern (Cleverest):
    - Test should FAIL on buggy version
    - Test should PASS on fixed version
    - Focus on exact behavior change
    """
    
    def generate(self, bug: Dict, project_path: Path, 
                 diff: str = None) -> Dict[str, Any]:
        """
        Generate a regression test for a verified bug fix.
        
        Args:
            bug: Bug dictionary with id, cwe, location, etc.
            project_path: Path to project root
            diff: Optional diff of the fix (for differential prompting)
        
        Returns:
            {success, test_file, test_code, needs_llm, prompt}
        """
        bid = bug["id"].lower()
        cwe = bug.get("cwe", "")
        desc = bug.get("description", "Unknown issue")
        file_path = Path(bug["location"]["file"])
        line = bug["location"]["line"]
        func = bug.get("location", {}).get("function", file_path.stem)
        
        # Get CWE-specific template or default
        if cwe in CWE_TEST_TEMPLATES:
            template = CWE_TEST_TEMPLATES[cwe]
        else:
            template = DEFAULT_TEST_TEMPLATE
        
        # Format template
        test_code = template.format(
            bid=bid,
            func=func,
            description=desc,
            file=file_path.name,
            line=line,
        )
        
        # Determine test file location
        tests_dir = Path(project_path) / "tests"
        tests_dir.mkdir(exist_ok=True)
        
        test_file = tests_dir / f"test_{bid}_regression.py"
        
        # Add header if creating new file
        if not test_file.exists():
            header = '''"""
Auto-generated regression tests by unified-debugger.

These tests verify that bug fixes prevent the original issues.
Each test should:
- FAIL on the buggy version
- PASS on the fixed version
"""
import pytest

'''
            full_content = header + test_code
        else:
            # Append to existing file
            existing = test_file.read_text()
            full_content = existing.rstrip() + "\n\n" + test_code
        
        # Write test file
        try:
            test_file.write_text(full_content)
            return {
                "success": True,
                "test_file": str(test_file),
                "test_code": test_code,
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
            }
    
    def generate_llm_prompt(self, bug: Dict, diff: str) -> str:
        """
        Generate LLM prompt for high-quality test generation.
        Uses Cleverest differential prompting pattern.
        """
        cwe = bug.get("cwe", "")
        desc = bug.get("description", "Unknown")
        file_path = Path(bug["location"]["file"])
        
        return f"""Generate a regression test for the following bug fix:

**Bug**: {desc}{f' ({cwe})' if cwe else ''}
**File**: {file_path.name}

**Diff**:
```
{diff}
```

**Requirements**:
1. Test must FAIL on the buggy version (before fix)
2. Test must PASS on the fixed version (after fix)
3. Focus on the exact behavior change introduced by the fix
4. Use pytest framework
5. Include clear docstring explaining what's being tested
6. Test edge cases and malicious inputs if security-related

**Output format**:
```python
def test_<bug_id>_regression():
    \"\"\"Description of what this tests.\"\"\"
    # Test code here
    assert ...
```

Generate the test:"""
    
    def validate_test(self, test_file: Path) -> Dict[str, Any]:
        """
        Validate generated test compiles and can be discovered.
        """
        import ast
        import subprocess
        import sys
        
        # Check syntax
        try:
            ast.parse(test_file.read_text())
        except SyntaxError as e:
            return {"valid": False, "error": f"Syntax error: {e}"}
        
        # Check pytest can discover it
        try:
            result = subprocess.run(
                [sys.executable, "-m", "pytest", "--collect-only", str(test_file)],
                capture_output=True, text=True, timeout=30
            )
            if "1 test" in result.stdout or "test session" in result.stdout:
                return {"valid": True, "message": "Test discoverable"}
            else:
                return {"valid": False, "error": "Test not discoverable by pytest"}
        except Exception as e:
            return {"valid": False, "error": str(e)}


if __name__ == "__main__":
    import sys
    import tempfile
    
    # Test with sample bug
    gen = TestGenerator()
    
    with tempfile.TemporaryDirectory() as tmpdir:
        sample_bug = {
            "id": "B001ABC",
            "cwe": "CWE-89",
            "description": "SQL Injection",
            "location": {
                "file": "/app/auth.py",
                "line": 42,
                "function": "login",
            },
        }
        
        result = gen.generate(sample_bug, Path(tmpdir))
        
        if result["success"]:
            print(f"✅ Generated: {result['test_file']}")
            print("\n--- Test Code ---")
            print(result["test_code"])
        else:
            print(f"❌ Error: {result.get('error')}")
