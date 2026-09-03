# AM Network API

The public scoring quiz calculates on the visitor's device. It does **not**
upload its questionnaire to `/score`. That rule-based API remains available
for explicit integrations. Chat and Academy use the Anthropic API through
this server and have shared request budgets.

## Local use

From `ai_scoring/`:

```sh
python -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/python api.py
```

The development server listens on port 8000. Production uses the included
Dockerfile with Gunicorn, one worker and eight threads. `/health` version 2.2
identifies the security release. `ANTHROPIC_API_KEY` belongs only in the server
environment. It is unnecessary for local scoring or mocked security tests.

## Validation

```sh
python -m unittest test_security.py
python test_api.py
```

The security suite verifies shared budgets, concurrent requests, malformed
inputs, emergency shutdown and fail-closed behavior with no paid provider
calls. The HTTP suite starts the actual local API and checks scoring responses.

See [security deployment](../docs/security-deployment.md) for limit settings,
Render deployment, proxy trust, persistent storage and the separately deployed
Google Sheets intake. A GitHub Pages release alone does not update either
server. Verify the running Render version and account spending settings.

Scoring is preliminary assessment only. It does not verify identity or decide
an applicant's eligibility for assistance; human review is required.
