# Contributing to formato-financiero

Thanks for your interest in improving this financial analysis skill!

## How to Contribute

### 1. Reporting Issues
- Open an issue describing the rule, the data scenario, and what the skill
  incorrectly flagged or missed.
- Include a minimal JSON snippet (3–5 movements) that reproduces the problem.

### 2. Adding a New Rule
- Add the rule function in `scripts/financial_review.py` following the
  existing naming convention (`RX_name`).
- Register the rule in the `main()` dispatch list of the same file.
- Document the rule in `SKILL.md` under a new `RX — Title` heading
  with: objective, analysis, red flags, formula, recommendation.
- Add an example in `examples/` showing the rule in action.

### 3. Modifying an Existing Rule
- Update the function **and** the corresponding `SKILL.md` section.
- Re-run the quick pulse and full review against a representative data
  set to confirm the change behaves as expected.
- Update the sample report under `examples/`.

### 4. Thresholds
- Thresholds (e.g., 15 % overhead, 50 % MoM spike, 3-month revenue
  decline) live **inside** the rule functions.  Document the rationale
  in the `SKILL.md` rule body.

### Code Style
- Python: `ruff` + `black` with default settings.
- Markdown: wrap at 80 characters, use fenced code blocks for scripts.

### Commit Messages
```
feat(rule): add R11 — Working Capital Coverage Ratio
fix(threshold): lower administrative-cost threshold from 20% to 15%
docs(examples): add multi-year comparison example
```

## License
Apache 2.0 — see `LICENSE.txt`.