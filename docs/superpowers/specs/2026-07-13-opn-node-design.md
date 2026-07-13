# n8n-nodes-opn — Design Spec (approved 2026-07-13)

Community node package for **Opn Payments (formerly Omise)** — Thai/SEA payment provider.
Purpose: real gap in the n8n ecosystem (no Opn/Omise node exists; the n8n integration page is
programmatic SEO with 0 integrations) AND interview proof for the n8n Community Software Engineer
role (call 2026-07-22): live the full community-node pipeline — build, publish, submit, get vetted.

## Package

- npm name: `n8n-nodes-opn` (fallback if taken: `n8n-nodes-opn-payments`) — verify at task 1.
- Keywords: `n8n-community-node-package`, omise, opn, payments, thailand.
- Repo: `guillaume-flambard/n8n-nodes-opn` (public, MIT). Local: `~/projects/n8n-nodes-opn`.
- **Zero runtime dependencies** (n8n verified-node rule): no omise SDK — all HTTP via
  `this.helpers.httpRequest` / declarative routing.
- Node.js >= 18.10, n8n-workflow peer dep. TypeScript. Build via `tsc` + gulp icon copy
  (standard n8n-nodes-starter layout).

## Components

### 1. Credential: `OpnApi` (`credentials/OpnApi.credentials.ts`)
- Field: `secretKey` (password-masked). Basic auth: username = secretKey, password = empty.
- Base URL: `https://api.omise.co`.
- Mode: derived from key prefix (`skey_test_` = test, `skey_` = live) — display hint only, no
  separate field.
- Credential test: `GET /account`.
- Security: never log the key; demo/docs use TEST keys only.

### 2. Action node: `Opn` (`nodes/Opn/Opn.node.ts`) — **declarative style**
Resources → operations (v1, YAGNI):

| Resource | Operation | HTTP |
|---|---|---|
| Charge | Create | `POST /charges` (amount subunits, currency, card/customer/source, description, capture, metadata) |
| Charge | Get | `GET /charges/{id}` |
| Charge | Get Many | `GET /charges` (limit, offset, from/to) |
| Charge | Capture | `POST /charges/{id}/capture` |
| Refund | Create | `POST /charges/{chargeId}/refunds` (amount **required** in subunits — corrected 2026-07-13 against live Omise docs; original "full refund if empty" was wrong) |
| Customer | Create | `POST /customers` (email, description, card token, metadata) |
| Customer | Get | `GET /customers/{id}` |

- Amounts are **subunits** (satang/cents) — field description states it explicitly; no magic
  conversion (predictability > convenience).
- Error surface: n8n standard `NodeApiError` mapping; Omise error body (`object: "error"`,
  `code`, `message`) passed through.

### 3. Trigger node: `Opn Trigger` (`nodes/OpnTrigger/OpnTrigger.node.ts`) — programmatic webhook
- n8n webhook (POST) receives Opn Event objects (`object: "event"`, `key`, `data`).
- Parameter `events`: multi-select filter (`charge.create`, `charge.complete`, `charge.update`,
  `refund.create`, `customer.create`, `transfer.pay`, … + "All events" option). Non-matching
  events → 200 OK, no workflow emission.
- **Verify event (default ON)** — Opn webhooks are unsigned, so the trigger re-fetches
  `GET /events/{event.id}` with the credential before emitting; mismatch/404 → drop + log.
  Documented in README as the anti-spoofing pattern (vetting-mindset showcase).
- Setup note in node description: user must register the n8n webhook URL in the Opn dashboard
  (no programmatic webhook-endpoint API in v1 scope).

## Quality bar

- Lint: `eslint-plugin-n8n-nodes-base` (community preset) + prettier. Zero warnings.
- Tests (jest): node description shape (resources/operations/props), declarative routing of each
  operation (request assembled correctly), trigger filter + verify logic (mocked httpRequest).
- CI: GitHub Actions — install, lint, test, build on push/PR.
- README: what/why, install (community nodes UI), credential setup, operations table, trigger
  setup incl. verify-by-refetch explanation, screenshots, TEST-mode walkthrough.
- Versioning: 0.1.0 → publish.

## Delivery pipeline (the interview story)

1. GitHub public + CI green.
2. `npm publish` (`n8n-nodes-opn`).
3. Submit to n8n community-node registry (docs.n8n.io submit flow) — "submitted, pending review"
   is the expected state by 22/07.
4. Demo on `n8n.phangan.ai`: install node → TEST charge via action node → webhook trigger fires →
   notification (Telegram). Screenshots + 5-min screen-share script for the call.

## Out of scope (v1)

Sources/tokens creation (client-side concern), transfers/recipients/disputes/schedules, vault.omise.co
data endpoint, programmatic webhook registration, currency conversion helpers.

## Risks

- npm name taken → fallback name (checked task 1).
- Omise TEST account access broken → verify Echo Travel test keys day 1; fallback: new free Opn
  test account.
- Registry review slower than 9 days → fine; "submitted" is the story, approval is upside.
