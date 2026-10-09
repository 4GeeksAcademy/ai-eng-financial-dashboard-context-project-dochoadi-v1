# Financial Metrics Dashboard

<!-- hide -->

By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors) at [4Geeks Academy](https://4geeksacademy.com/)

[![build by developers](https://img.shields.io/badge/build_by-Developers-blue)](https://4geeks.com)
[![4Geeks Academy](https://img.shields.io/twitter/follow/4geeksacademy?style=social&logo=x)](https://x.com/4geeksacademy)

_Estas instrucciones están [disponibles en español](./README.es.md)._

**Before you start**: 📗 [Read the instructions](https://4geeks.com/lesson/how-to-start-a-project) on how to start a coding project.

<!-- endhide -->

---

_Financial metrics dashboard with a React + TypeScript frontend and a FastAPI backend._

## Verified project context

The API generates synthetic data; there is no database or live financial
integration. The current screen consumes `/api/metrics` and computes KPIs
and charts in the browser.

- [Phase 1: summary, services, entry points, routes and execution (Spanish)](./memory-bank/project-context.md).
- [Phase 2: file-by-file review and findings (Spanish)](./memory-bank/phase2-analysis.md).
- [Phase 3: active rules by area (Spanish)](./.agents/rules/) and [application guidance](./AGENTS.md).
- [Agent rule-application exercise and evidence (Spanish)](./memory-bank/phase3-rule-application.md).
- Phase 5: skill `webapp-testing` evaluation & E2E testing pipeline — [skilltesting.md](./skilltesting.md).
- [E2E tests](./tests/e2e/test_dashboard.py) (Playwright + Chromium, 4 tests, 3 screenshots).
- Phase 4: current Memory Bank (Spanish) — [product](./memory-bank/productContext.md),
  [technology](./memory-bank/techContext.md), [architecture](./memory-bank/systemPatterns.md)
  and [progress/debt/priorities](./memory-bank/progress.md).
- [Historical phase 2 rules draft (Spanish)](./memory-bank/archive/phase2-proposed-rules.md).
- [Verification record and observed limitations (Spanish)](./verification.md).

## Recommended steps

1. Fork this repository to your account.
2. Open your fork in GitHub Codespaces or clone it and run it in your local environment.
3. Run your AI agent to inspect both frontend and backend.
4. Document the proposed rules and memory bank in your fork.
5. Refine and validate the rules until they fit the project's real workflow.

## Expected agents directory structure

```text
./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill-name>
      └─ /SKILL.md
```

## How to run locally

```bash
docker compose up --build
```

With Docker Compose, the frontend is configured to proxy `/api` through Vite
to `http://backend:8000`, without extra environment variables. This requires
connectivity between the containers; phase 1 verification observed a timeout
in this environment, documented in the record above.
If running without Docker or targeting another backend, copy
[`frontend/.env.example`](./frontend/.env.example) to `frontend/.env` and set
`VITE_API_BASE_URL` to an origin reachable from the browser, without `/api` or
a trailing slash. Restart Vite after changing the variable.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API documentation: http://localhost:8000/docs

---

This and many other projects are built by students as part of the [Career Programs](https://4geeksacademy.com/compare-programs) at [4Geeks Academy](https://4geeksacademy.com). By [@marcogonzalo](https://github.com/marcogonzalo) and [other contributors](https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project/graphs/contributors). Find out more about [AI Engineering](https://4geeksacademy.com/en/coding-bootcamps/ai-engineering), [Data Science & Machine Learning](https://4geeksacademy.com/en/coding-bootcamps/data-science-ml), [Cybersecurity](https://4geeksacademy.com/en/coding-bootcamps/cybersecurity) and [Full-Stack Software Developer with AI](https://4geeksacademy.com/en/coding-bootcamps/full-stack-developer).
