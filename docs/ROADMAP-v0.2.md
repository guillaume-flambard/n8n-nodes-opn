# n8n-nodes-opn — v0.2.0 roadmap

From the whole-package review (2026-07-13, post-v0.1.0 publish). v0.1.0 is honest and well-scoped;
these are the next-iteration items. Ordered by priority.

## Must verify before staking a demo

1. **JSON vs form-encoding (potentially package-breaking on writes).** The declarative node sends
   request bodies as `application/json` (n8n default for `send: { type: 'body' }`), but Omise/Opn is
   a Stripe-style API whose docs use form-encoded (`curl -d`). Docs don't state whether JSON is
   accepted. **Verify with one live TEST charge**: if it 4xxs on content-type, set
   `Content-Type: application/x-www-form-urlencoded` in `requestDefaults.headers` and confirm n8n
   url-encodes the body. If the live charge succeeds, JSON is accepted → close this as non-issue.
   Tests never execute a request, so this is uncovered by design.

## Important

2. **`getAll` returns the list envelope as one item.** Add `routing.output.postReceive` rootProperty
   `data` so `GET /charges` splits into per-charge items (Omise returns `{object:'list', data:[...]}`).
   Every n8n "Get Many" does this; its absence is the #1 tell a Get Many wasn't tested on real data.
3. **No `returnAll`/pagination + no `limit` cap.** Add a `returnAll` boolean that pages via `offset`
   until exhausted (hide `limit` when true); cap `limit` at `maxValue: 100` (Opn's max).

## Minor / polish

4. Trigger filters on the unverified `body.key` then emits the refetched event without re-checking
   `payload.key` — re-apply the filter on the verified key. Also validate `body.id`
   (`/^evnt(_test)?_[0-9a-zA-Z]+$/`) before the refetch.
5. `usableAsTool` for read-only ops (charge/get, customer/get) — keep writes off for safety, say so.
6. `required: true` on the `secretKey` credential field.
7. Strip `.d.ts` + `.js.map` from the published tarball (build tsconfig `declaration:false`/`sourceMap:false`).
8. README refund row shows `` `amount` `` but the field is `refundAmount`; add `Array.isArray` guard
   on the trigger `events` param; `minValue: 1` on amount fields; document the one suppressed lint rule.
9. Consider acking the webhook before the verify round-trip (latency, not correctness).

## Test debt

Action node has shape-only coverage (asserts the description object, executes nothing). Add one
integration-style test that runs the declarative RoutingNode (or a recorded HTTP exchange) so
create/getAll wiring is behaviorally covered.
