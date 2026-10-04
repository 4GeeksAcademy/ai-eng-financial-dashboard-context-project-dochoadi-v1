"""Validate active rule structure, source traceability and local documentation links."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RULE_NAMES = {
    "backend-conventions.md",
    "frontend-structure.md",
    "testing-verification.md",
    "development-environment.md",
    "git-workflow.md",
}
REQUIRED_HEADINGS = (
    "## Nombre", "## Alcance", "## Justificación", "## Guía específica del proyecto",
)


def main():
    rules_dir = ROOT / ".agents/rules"
    rules = sorted(rules_dir.glob("*.md"))
    assert {p.name for p in rules} == RULE_NAMES, "Unexpected/missing active rule files"
    source_ids = set()
    guidance = (ROOT / "AGENTS.md").read_text()
    for rule in rules:
        text = rule.read_text()
        for heading in REQUIRED_HEADINGS:
            assert heading in text.splitlines(), f"{rule.name}: missing {heading}"
        assert "Activa desde fase 3" in text, f"{rule.name}: missing active status"
        assert "```" in text, f"{rule.name}: missing code/repository example"
        assert re.search(r"\bH\d{2}\b", text), f"{rule.name}: missing finding reference"
        assert f"./.agents/rules/{rule.name}" in guidance, f"{rule.name}: not indexed"
        for start, end in re.findall(r"\bR(\d{2})(?:-R(\d{2}))?", text):
            source_ids.update(range(int(start), int(end or start) + 1))
    assert source_ids == set(range(1, 20)), "R01-R19 not fully mapped to active rules"
    assert not (rules_dir / "proposed-rules.md").exists(), "Historical draft still active"
    archive = ROOT / "memory-bank/archive/phase2-proposed-rules.md"
    assert archive.exists(), "Historical proposal missing"

    docs = [
        ROOT / "AGENTS.md", ROOT / "README.md", ROOT / "README.es.md",
        ROOT / "verification.md", *rules, *sorted((ROOT / "memory-bank").rglob("*.md")),
    ]
    checked_links = 0
    for doc in docs:
        for target in re.findall(r"\]\(([^)]+)\)", doc.read_text()):
            if target.startswith(("http://", "https://", "#")):
                continue
            path = (doc.parent / target.split("#", 1)[0]).resolve()
            assert path.is_relative_to(ROOT), f"{doc.name}: link outside repository"
            assert path.exists(), f"{doc.name}: broken link {target}"
            checked_links += 1
    print("PASS: five active rules; four required sections and real examples per file.")
    print("PASS: R01-R19 mapped, AGENTS indexes all rules, historical draft archived.")
    print(f"PASS: {checked_links} local documentation links resolve (not a prose/anchor audit).")


if __name__ == "__main__":
    main()
