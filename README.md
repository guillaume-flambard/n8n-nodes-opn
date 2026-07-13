# n8n-nodes-opn

[![npm version](https://img.shields.io/npm/v/n8n-nodes-opn)](https://www.npmjs.com/package/n8n-nodes-opn)
[![CI](https://github.com/guillaume-flambard/n8n-nodes-opn/actions/workflows/ci.yml/badge.svg)](https://github.com/guillaume-flambard/n8n-nodes-opn/actions/workflows/ci.yml)

n8n community nodes for [Opn Payments](https://www.opn.ooo/) (formerly Omise): charges, refunds, customers, and a webhook trigger.

## Why

n8n has no node for Opn or Omise — the integrations page only offers a generic HTTP Request against their API. Opn is one of the larger payment processors in Thailand and Southeast Asia, so anyone automating payment flows there ends up hand-rolling auth headers and endpoint URLs. This package wraps the common operations and adds signature-free webhook verification for the trigger side.

## Install

In n8n: **Settings → Community Nodes → Install**, enter `n8n-nodes-opn`.

## Credentials

Create an **Opn API** credential with your secret key from the Opn dashboard (**Keys**):

- `skey_test_...` — test mode
- `skey_...` — live mode

Docs: https://docs.opn.ooo/

## Opn node

| Resource | Operation | Notes |
|---|---|---|
| Charge | Create | `amount` (subunits) and `currency` required. Optional card token, source ID (PromptPay, TrueMoney, …), customer ID, description, capture flag. |
| Charge | Get | By charge ID (`chrg_...`). |
| Charge | Get Many | Paginated with limit/offset. |
| Charge | Capture | Captures a charge created with `capture: false` (authorize-only). |
| Refund | Create | On a charge ID. `amount` (subunits) is **required** — Omise has no "empty amount = full refund" shortcut, you must state it. |
| Customer | Create | Email plus optional card token and description. |
| Customer | Get | By customer ID (`cust_...`). |

## Opn Trigger

Register the workflow's webhook URL in the Opn dashboard (**Webhooks**). Opn posts every account event to that URL; the node filters by the **Events** parameter (or `*` for all) before doing anything else.

### Security

Opn webhook payloads are **not signed**. Anyone who finds the URL could POST a fabricated event body. To guard against that, the node re-fetches the event from `GET /events/{id}` using the node's own credential before emitting it, and only forwards data it just retrieved from Opn — not the raw POST body. If the fetch fails (event doesn't exist, wrong account, credential mismatch), the event is silently dropped and the webhook still returns 200 so Opn doesn't retry.

This is controlled by the **Verify Event** parameter, on by default. Turning it off skips the re-fetch and emits the raw webhook body — faster, but trusts whatever hits the URL.

## Amounts are subunits

> All `amount` fields (charge create, refund create) are in the smallest currency unit and are never converted. `10000` on a THB charge is 100.00 THB, the same way Stripe/Omise APIs work. Pass the value your currency's minor unit expects.

## Example workflow

Manual trigger → Opn node (Charge / Create, TEST secret key, small amount) → separately, an Opn Trigger node listening for `charge.complete` fires when that charge settles.

```json
{
  "nodes": [
    { "name": "When clicking \"Execute workflow\"", "type": "n8n-nodes-base.manualTrigger" },
    {
      "name": "Opn",
      "type": "n8n-nodes-opn.opn",
      "parameters": { "resource": "charge", "operation": "create", "amount": 10000, "currency": "thb" },
      "credentials": { "opnApi": "Opn API (test)" }
    },
    {
      "name": "Opn Trigger",
      "type": "n8n-nodes-opn.opnTrigger",
      "parameters": { "events": ["charge.complete"], "verifyEvent": true },
      "credentials": { "opnApi": "Opn API (test)" }
    }
  ]
}
```

## License

MIT © Guillaume Flambard
