# Research Notes

Summary of academic findings underlying unified-debugger implementation.

## Context Extraction

### LLMxCPG (2025)
- **Finding**: 67-91% code reduction via Code Property Graphs
- **Approach**: Integrate Control Flow, Data Flow, AST into unified graph
- **Result**: 15-40% improvement in vulnerability detection F1 scores
- **Implementation**: Tree-sitter parsing + dependency graph analysis

### Aider Repository Map
- **Pattern**: PageRank on file dependency graphs
- **Token default**: 1K tokens for repo map
- **Key insight**: Rank files/symbols by relevance, include top-k

### Context Modes
| Mode | Reduction | Use Case |
|------|-----------|----------|
| Signature-only | 80-90% | Quick scan |
| Minimal (target + signatures) | 70-80% | Single bug fix |
| Full (target + implementations) | 40-50% | Complex bug |

## Fix Generation

### RepairAgent (ICSE 2025)
- **Result**: 164 bugs fixed on Defects4J
- **Innovation**: 39 unique bugs not fixed by prior techniques
- **Approach**: Dynamic prompting with 10 specialized repair tools

### ChatRepair
- **Cost**: $0.42 per bug average
- **Convergence**: ~3 turns with error feedback
- **Pattern**: Include failed patch feedback in next prompt

### Diff Format (Replit)
- **Finding**: Numbered line diff > unified diff
- **Reason**: LLMs struggle with context line counting
- **Format**: `-LINE: old\n+LINE: new`

### Cursor Two-Stage Model
- Stage 1: Primary LLM generates change intent
- Stage 2: Specialized model handles diff integration
- **Benefit**: Correct indentation and context matching

## Verification

### FixAgent/UniDebugger
- **Result**: 1.25× to 2.56× more bugs fixed than single-agent
- **Architecture**: Specialized agents for fault localization, repair, analysis
- **Pattern**: "Rubber duck debugging" - agents explain work in detail

### Multi-Stage Architecture
```
Stage 1: Syntax (immediate, <1s)
Stage 2: Semantic (fast, <30s) - unit tests
Stage 3: Functional (thorough, <60s) - integration
Stage 4: Quality (optional) - style, SAST
```

### Self-Refine Iteration
- Iteration 1: +8-12% accuracy
- Iteration 2: +5-8% accuracy
- Diminishing returns beyond iteration 5

### SWE-agent Guardrails
- **Success rate**: 90.5% eventual success on edits
- **Recovery**: 57.2% after first failed attempt
- **Pattern**: Reject invalid edits before applying

## Test Generation

### Cleverest (January 2025)
- **Result**: Reproduced bugs in 4/6 commits under 3 minutes
- **Pattern**: Differential prompting (test FAILS on buggy, PASSES on fixed)
- **Model comparison**: GPT-4o score 1.32 vs GPT-4o mini 0.81

### MuTAP
- **Result**: 93.57% mutation score
- **Approach**: Mutation-guided refinement
- **Loop**: Generate → Mutate → Find survivors → Improve

### Meta ACH
- **Scale**: 10,795 Android Kotlin classes
- **Result**: 571 privacy-hardening tests, 73% acceptance rate
- **Metric**: Mutation score > coverage for quality

## Token Optimization

### Layered Approach
| Layer | Technique | Reduction |
|-------|-----------|-----------|
| 1 | Incremental analysis | 60% |
| 2 | LLMLingua compression | 92% cumulative |
| 3 | Prompt caching (90% hit) | 90% on cached |
| 4 | Batch API | 50% cost reduction |

### Anthropic Caching
- **Discount**: 90% on cached reads
- **TTL**: 5 minutes, refreshes on use
- **Priority**: tool defs > system > codebase > session

## Production Patterns

### OpenHands V1
- Stateless agents, event-sourced state
- Immutable configuration (Pydantic models)
- Context condensation for long conversations

### Aider Git Integration
```python
# Before AI edit
if repo.is_dirty(file_path):
    repo.commit("Pre-AI: User changes")

# After AI edit
repo.commit(message, author="User (aider)")

# Rollback
repo.reset_hard("HEAD~1")
```

### SWE-agent Metrics
- Successful runs: 12 steps, $1.21 average
- Failed runs: 21 steps, $2.52 average
- **Recommendation**: Terminate at 15-18 steps without progress

## Confidence Thresholds

| Confidence | Action | Use Case |
|------------|--------|----------|
| ≥80% | Auto-accept | Production |
| 60-80% | Lightweight review | Time-sensitive |
| 50-60% | Human verification | Critical systems |
| <50% | Reject/escalate | High-risk |

## Hallucination Prevention

### Package Hallucination Rates
- Python: 5.2%
- JavaScript: 21.7%
- **Risk**: Attackers publish malicious packages with hallucinated names

### Multi-Layer Defense
1. RAG grounding
2. Import verification
3. API validation (MARIN framework)
4. Cross-agent validation
5. Confidence thresholding

## Key Citations

- RepairAgent: https://arxiv.org/abs/2403.17134
- LLMxCPG: https://arxiv.org/html/2507.16585v1
- FixAgent: https://arxiv.org/abs/2404.17153
- SWE-agent: https://swe-agent.com
- OpenHands: https://docs.openhands.dev
- Aider: https://aider.chat
