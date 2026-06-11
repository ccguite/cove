# COVE — AI Workflow Rules

These rules govern how an AI coding agent must behave when contributing to the COVE codebase. They are not suggestions. Every rule applies to every task, every session, without exception. If a rule conflicts with an instruction, flag the conflict before proceeding — do not silently override a rule.

---

## 1. Overall Approach

**Work spec-first. Always.**

Before writing a single line of code, state:
1. What unit of work you are about to implement.
2. Which file(s) you will create or modify.
3. What the expected outcome is (in plain English).
4. Which invariants from `architecture.md` this task touches.

Do not begin implementation until this declaration is complete and unambiguous. If you cannot make this declaration, the task is not yet scoped — scope it first.

**Treat documentation as source code.**

`project-overview.md`, `architecture.md`, `code-standards.md`, and this file are authoritative. When implementation conflicts with these documents, the documents are correct and the implementation is wrong. Fix the implementation, not the document — unless you have been explicitly told to update a document.

**Build incrementally, vertically.**

Complete one full vertical slice (database → API → UI → test) before starting the next unit. Do not scaffold ten files and fill them in later. A file should never be created without all of its core logic being implemented in the same step.

---

## 2. Scoping Rules

**Implement exactly what was asked. Nothing more.**

If the task says "implement the Husk room booking API route," do not also update the UI, add a helper you think might be needed later, or refactor an adjacent file you noticed was messy. Make the smallest change that satisfies the stated requirement.

**Do not make speculative changes.**

Do not add a field to the database schema "in case it's needed later." Do not add a utility function "that will be useful for the next step." Do not extract a component "while you're in the area." Every change must be traceable to a specific, stated requirement.

**Do not touch files outside the scope of the current task.**

If implementing the booking API route, do not edit CSS files, update the menu service, or modify `architecture.md`. If you identify a problem in an out-of-scope file, note it explicitly and stop — do not fix it silently.

**One logical unit per step.**

A logical unit is one of:
- One database table migration
- One API route (one HTTP method)
- One `lib/` function and its test
- One React component
- One page (which may compose existing components)
- One CSS module or token block

If the step feels too large to describe in a single sentence, split it.

---

## 3. When to Split Work into Smaller Steps

Split any task into smaller steps when any of the following is true:

- The task requires creating more than two new files simultaneously.
- The task touches both the database schema and the API layer in a non-trivial way.
- The task involves a payment flow, an auth flow, or a slot-locking mechanism — these are high-stakes and must be implemented one concern at a time.
- The task requires modifying a file you did not create in the current session and you are not certain of its full contents.
- You cannot write the verification checklist (Section 7) for the task without including more than five distinct checks — that is a sign the task is too large.

When splitting, declare the split explicitly:

> "This task is too large for a single step. I will split it into: (1) … (2) … (3) … I will now implement step 1."

Do not implement multiple steps simultaneously, even if they appear independent.

---

## 4. Handling Missing or Ambiguous Requirements

**Stop and ask before assuming.**

If a requirement is missing or ambiguous, do not guess. State the ambiguity explicitly and ask one focused question to resolve it. Do not ask multiple questions at once. Do not proceed with a "reasonable assumption" and implement before getting confirmation.

Example of correct behaviour:
> "The spec says delivery addresses must be within 5km, but it does not specify how to handle addresses that cannot be geocoded (e.g. incomplete addresses). Should the order be blocked or should the customer be prompted to correct the address? I will wait for an answer before implementing the radius check."

**Never invent requirements.**

If the spec does not mention a feature, that feature does not exist. Do not add email confirmations because "they seem standard," do not add a loading skeleton because "it would be a nice touch," and do not add pagination because "the list might get long." Build only what is specified.

**Surface assumptions you have made.**

If you had to make a minor implementation decision that was not explicitly specified (e.g. which HTTP status code to return for a specific error case), state it after completing the step:
> "Assumption made: I returned 409 Conflict for a slot overlap, as this is the most semantically correct HTTP status. Let me know if a different code is preferred."

---

## 5. Files That Must Not Be Modified Without Explicit Instruction

Never modify the following without being explicitly told to do so:

| File / Directory | Reason |
|---|---|
| `project-overview.md` | Authoritative product spec — changes require product-level decision |
| `architecture.md` | Authoritative system design — changes require architectural review |
| `code-standards.md` | Authoritative coding rules — changes require deliberate team decision |
| `ai-workflow-rules.md` | This file — changes require explicit owner instruction |
| `supabase/migrations/` | Database migrations are permanent and irreversible — never edit an existing migration file; always create a new one |
| Any file listed as a dependency in `package.json` or `package-lock.json` that was not part of the current task | Dependency changes have side effects across the whole codebase |
| `.env.local` and `.env.example` | Only add variables when a new secret is introduced by a task you are currently implementing |
| `styles/tokens.css` | Design token changes affect every component — only modify when explicitly implementing a design change |

If you believe a file in this list must be changed to complete the current task, stop, explain why, and wait for confirmation before touching it.

---

## 6. Keeping Documentation in Sync with Implementation

Apply these rules after every completed unit of work:

- **If you add a new API route**, check whether `architecture.md` describes its system boundary. If the route represents a new boundary not described there, flag it.
- **If you add a new database table or column**, check that the schema in `architecture.md` reflects it. If it does not, note the discrepancy and ask whether to update the document.
- **If you change a business rule** (e.g. the slot-lock TTL, the minimum order value, or the delivery radius), identify every `.md` file that mentions that rule and list them. Do not update the documents yourself unless instructed — but do not leave the discrepancy undocumented.
- **If you add a new environment variable**, update `.env.example` immediately in the same step. This is the one documentation update you must always make without being asked.
- **If a behaviour you implement contradicts a rule in `code-standards.md`**, stop. Do not implement the contradiction. Raise it and wait for a resolution.

Do not write inline code comments that restate what the code does. Write comments only to explain *why* a non-obvious decision was made, or to flag a constraint that isn't visible from the code alone.

```ts
// ✅ Correct comment — explains a non-obvious constraint
// We snapshot unit_price here rather than joining to menu_items at query time
// because admin price changes must not retroactively alter historical order totals.
const unitPrice = item.price;

// ❌ Useless comment — restates the code
// Set the unit price to the item's price
const unitPrice = item.price;
```

---

## 7. Verification Checklist Before Moving to the Next Unit

Do not mark a unit of work as complete and do not begin the next unit until every applicable item in this checklist is confirmed:

### Code Quality
- [ ] No `any` types are present in the files you created or modified.
- [ ] All functions in `lib/` have explicit return types.
- [ ] No Supabase service role key is used in browser-facing code.
- [ ] No inline styles are present in components (except dynamic CSS custom property assignments).
- [ ] No hardcoded colour values or pixel values appear in CSS files.
- [ ] No `console.log` statements remain in committed code.

### Correctness
- [ ] The implementation matches the stated requirement exactly — no more, no less.
- [ ] All invariants from `architecture.md` that this unit touches are satisfied.
- [ ] If the unit involves a booking, the 11PM cutoff and 5-hour maximum duration are enforced server-side.
- [ ] If the unit involves a payment, the total is calculated server-side and not trusted from the client.
- [ ] If the unit involves an API route, input is validated with Zod before any DB or payment call.
- [ ] If the unit involves an API route, authentication is checked before any business logic runs.
- [ ] If the unit involves a food order, the minimum ₹299 order value is enforced for delivery.

### Security
- [ ] No secret environment variable (service role key, Razorpay secret, webhook secret) is referenced in any file under `app/(public)/`, `app/(auth)/`, `app/(customer)/`, or `components/`.
- [ ] No user-supplied value is used in a Supabase query without being validated first.

### Tests
- [ ] If the unit is a `lib/` function, a test file exists and covers the happy path, at least two boundary conditions, and at least one invalid input case.
- [ ] All existing tests still pass after your changes.

### Documentation
- [ ] `.env.example` is updated if a new environment variable was added.
- [ ] If a new API route was created, you have confirmed it is consistent with the system boundary rules in `architecture.md`.
- [ ] Any assumption made during this unit is written down and surfaced to the developer.

### Hand-off
- [ ] State the next logical unit of work that should follow this one.
- [ ] State any known risks or open questions that the next unit will encounter.

Only after this checklist is complete may you proceed.
