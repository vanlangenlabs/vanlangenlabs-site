# AIRFlow Project Record Contract

This file is the canonical definition of project-record statuses, approval evidence,
resume state, change impact and source ownership for AIRFlow. Copilot instructions,
Mermaid flows and `.air/` templates must follow this contract rather than redefining
these rules.

## Authority and source ownership

Follow the actual instruction hierarchy and tool permissions of the host environment.
AIRFlow cannot override system, developer, organization, repository instructions or
permissions. If a higher-priority instruction disallows an action, stop and report it.

| Information | Authoritative source |
| --- | --- |
| General execution constraints and access | Applicable host and repository instructions |
| Process order, decisions and return paths | `flows/project.mmd` and its referenced subflows |
| Shared status, evidence, resume and change rules | This contract |
| Approved product intent, feature content and release design | The corresponding approved `.air/` records |
| AIRFlow-specific execution rules | Downloaded `copilot-instructions.md`, subject to higher-priority instructions |
| Record inventory, lifecycle status and active run | `.air/index.md` |
| Optional issue, board or milestone view | Configured GitHub/GitLab tracker; it does not silently replace `.air/` |

When a tracker disagrees with `.air/index.md`, treat the index as AIRFlow's status
source. Record the discrepancy. If permissions allow, propose reconciling the tracker
to the index; do not silently overwrite tracker data. If a project explicitly assigns
a field to an external system, follow that mapping and record it in `.air/README.md`.

If two applicable instructions conflict, obey the higher-priority instruction. For
conflicts between approved project records, an index/record mismatch, or an
unmapped tracker disagreement, stop the affected transition, record the discrepancy,
and ask the user. Do not silently overwrite a source or infer which one is newer.

## Record and lifecycle statuses

Keep record approval status separate from feature/release lifecycle status and from
the workflow execution phase. Use only these values; do not invent new status labels.

### Record approval status

| Status | Meaning and allowed transition |
| --- | --- |
| `draft` | AI or user is preparing a record. May transition to `pending-approval` or `withdrawn`. |
| `pending-approval` | Exact content version is awaiting a human decision. May transition to `approved`, `draft` for requested changes, or `withdrawn`. |
| `approved` | A human approved the recorded content digest. Content changes follow Change impact below. |
| `superseded` | Replaced by a newer record/version. Preserve the old file or history and its evidence. |
| `withdrawn` | Explicitly withdrawn by the user. Do not resume it without a new user request. |

Only a human can cause an approval transition to `approved`. The AI may prepare
records, request approval, and update operational statuses when supported by evidence;
it must not approve its own work or infer approval from silence, mergeability, tests,
or existence of an artifact.

Each record type uses the common `record_status` above. In addition:

| Record type | Additional lifecycle field and transition rules |
| --- | --- |
| `.air/concept.md` | No per-feature lifecycle field. A materially revised approved concept returns to `pending-approval`; dependent records require impact analysis. |
| Feature `definition.md` | Has `feature_status` from the feature lifecycle table below. `backlog` requires `record_status: approved`. |
| Release `scope.md` | Has `release_status`; `planning -> scope-pending-approval -> scope-approved`. A changed feature set, version, exclusions or goal returns it to `scope-pending-approval`. |
| Release `design.md` | Has `release_status`; `draft -> pending-approval -> approved`. A material design change returns it to `pending-approval`. |
| `.air/README.md` | AI-workspace instructions copied from the canonical template. Changes are infrastructure changes and follow repository review; they do not approve product records. |
| `.air/index.md` | Operational inventory/run state, not an approval-gated project decision. It records statuses and evidence; it does not grant them. |

For `scope.md` and `design.md`, requested revisions return to `draft`, then to
`pending-approval` when ready for review. Human approval is required for every
transition to `approved` or `scope-approved`.

### Project concept

`.air/concept.md` is the project-level rationale, not a feature list. Its record status
moves `draft -> pending-approval -> approved`. A material change to product purpose,
users, outcomes or boundaries returns it to `pending-approval`; the user decides
whether to approve or withdraw the change. Concept is not repeated for each feature
or release.

### Feature definition and lifecycle

Each `.air/features/<feature-id>/definition.md` has a record status and a separate
`feature_status`. It does not repeat `record_status`; for example, a feature can be
`feature_status: clarifying` while its Definition is `record_status: pending-approval`.
Allowed feature lifecycle statuses and transitions are:

| From | To | Condition and decision owner |
| --- | --- | --- |
| `proposed` | `clarifying` | AI records the proposal and asks only for missing information. |
| `clarifying` | `backlog` | User approves Definition at its exact digest; set `record_status: approved`. |
| `clarifying` | `deferred` | User explicitly defers; keep the draft unapproved. |
| `clarifying` | `rejected` | User explicitly rejects; keep the draft unapproved and preserve the decision event. |
| `backlog` | `selected` | User approves inclusion in a release scope. |
| `backlog` | `deferred` | User explicitly defers the feature; its approved Definition remains valid. |
| `selected` | `implementing` | Release design is approved and implementation begins. |
| `implementing` | `verifying` | Scoped implementation tasks and focused checks are complete. |
| `verifying` | `implementing` | Verification identifies an implementation defect or deviation. |
| `verifying` | `verified` | Feature acceptance checks pass against the approved definition and design. |
| `verified` | `released` | Its containing release is published with required authorization. |
| `selected` / `implementing` / `verifying` / `verified` | `backlog` | User cancels the containing release; record which implementation/check evidence remains reusable. |
| Active state | `blocked` | A documented blocker prevents the next transition; record evidence and next action. |
| `blocked` | Prior active state | The blocker is resolved and evidence is recorded. |
| `deferred` | `proposed` | User explicitly reopens the proposal; preserve prior status and decision events. |
| `rejected` | `proposed` | User explicitly reopens the same proposal; set its record to `draft` and preserve rejection evidence. |

`released` is terminal for that feature ID. `rejected` is terminal unless the user
explicitly reopens it, preserving the rejection event. A later independent proposal
uses a new feature ID. A feature is not in the backlog until its Definition has
`record_status: approved`.

### Release scope, design and publication

A release has its own lifecycle, independent of individual feature record statuses:

`planning -> scope-pending-approval -> scope-approved -> design-pending-approval ->
 design-approved -> implementing -> verifying -> release-ready ->
 pending-publication-authorization -> published`

Exceptional states are `deferred`, `blocked` and `cancelled`. A deferred release
returns to `planning` only on explicit user request; `cancelled` is terminal, and
a later attempt requires a new release version. Only the user may
approve a scope, approve an integrated design, authorize publication, defer or cancel
a release. The AI may propose these transitions but may not perform the human decision.

| Transition | Required condition and evidence | Decision owner |
| --- | --- | --- |
| `planning -> scope-pending-approval` | Draft scope lists exact feature IDs and version. | AI prepares; index records draft. |
| `scope-pending-approval -> scope-approved` | Scope digest is explicitly approved; append approval event. | Human. |
| `scope-approved -> design-pending-approval` | Integrated design covers every scoped feature and records the scope digest it used. | AI prepares; index records draft. |
| `design-pending-approval -> design-approved` | Design digest is explicitly approved; append approval event. | Human. |
| `design-approved -> implementing` | Current scope/design digests still match their approvals and tool permissions allow the work. | AI, based on evidence. |
| `implementing -> verifying` | All scoped features have current passing feature checks; release integration checks begin. | AI, based on evidence. |
| `verifying -> release-ready` | Every feature and release-level check passes against current approved inputs. | AI, based on evidence. |
| `release-ready -> pending-publication-authorization` | Record check results and request publication authorization for current scope/design digests. | AI requests; human decides. |
| `pending-publication-authorization -> published` | Explicit authorization matches the current release digests; publication action is permitted and its success is confirmed. | Human authorizes; AI executes only if permitted. |
| Any active release -> `blocked` | Conflict, missing approval/evidence, failing checks or external blocker is recorded. | AI records; user resolves decision/blocker. |
| `blocked -> prior active status` | Cause resolved and required approvals/checks refreshed. | AI based on evidence; human for approval transitions. |
| Pre-publication status -> `deferred` / `cancelled` | User explicitly defers or cancels the release. | Human. |
| `deferred -> planning` | User explicitly reopens planning; revalidate the backlog and release goals. | Human. |

- `.air/releases/<version>/scope.md` lists the exact approved feature IDs. Scope
  changes return it to `scope-pending-approval` and invalidate approval of the
  integrated design and release-level verification.
- `.air/releases/<version>/design.md` covers all features in that scope. It moves
  `draft -> pending-approval -> approved`; material design changes require approval
  again.
- Feature-level implementation and verification are tracked per feature. Release
  integration checks run only after every feature in the approved scope is verified.
- Publication requires successful release checks and an explicit human authorization
  bound to the current scope and design digests. A feature being verified or released
  does not itself authorize project/release publication.

### Workflow execution status

Execution status is separate from all record and feature/release statuses. Use only:

- `ready`: next action is known and can proceed under the workflow.
- `running`: an authorized subflow is in progress.
- `waiting-human`: an explicit decision or approval is required.
- `blocked`: a conflict, missing evidence, unavailable source or external blocker
  prevents safe continuation.
- `complete`: the relevant subflow reached its successful terminal node.

Do not use a record status such as `approved` to imply the current workflow phase, or
an execution status such as `running` to imply record approval.

## Approval evidence

Every human approval must bind to the exact content version before a status transitions
to approved. Compute SHA-256 over the exact bytes of each approved file; this works
before commit and does not require adding or staging the file. Use an available,
permitted local SHA-256 tool. For a scope/design approval that covers multiple files,
list the path and digest for every file.

Append an approval event in `.air/index.md` with at least:

| Field | Required value |
| --- | --- |
| `event_id` | Stable, unique decision ID |
| `record` | Record ID and repository-relative path |
| `sha256` | Digest of the exact approved file bytes |
| `decision` | `approved`, `deferred`, `rejected` or `publication-authorized` |
| `actor` | Human identity if known; otherwise literal `unknown` |
| `timestamp` | Reliable timestamp if available; otherwise literal `unknown` |
| `evidence` | Durable review/chat/tracker reference, or a quoted approval with its source context |

Never fabricate an identity, timestamp, link, quote, digest or approval. If the hash
cannot be computed or the approval cannot be tied to the exact version, leave the
record `pending-approval` and ask the user to approve through a version-bound review
or provide an authorized hashing method. Do not proceed on a generic “looks good” if
multiple records or versions are pending.

Approval events are append-only. A later change never deletes earlier evidence; mark
it `stale` or `superseded` with the reason and the replacement event ID. The current
record status must describe the current digest, not a historical approved version.

## `.air/README.md` template

Initialize the project workspace with this notice, preserving any additional
project instructions that do not conflict with this contract:

```markdown
# AIRFlow project workspace

This directory contains AI-managed project records used by AIRFlow. It is not a
general-purpose documentation folder.

Do not edit these records directly. Ask the AIRFlow agent to update them through
the workflow, then review and approve proposed changes before they are merged.

Do not store secrets or credentials here.
```

## Project record templates

Use these as minimal content structures. Do not copy lifecycle status or approval
state into the records; `.air/index.md` owns those fields. Add detail only when the
project needs it.

### `.air/concept.md`

```markdown
# Product concept

## Problem
## Intended users
## Desired outcome
## Product boundaries and non-goals
## Success measures
## Decisions and evidence
```

### `.air/features/F-0001/definition.md`

```markdown
# F-0001: <feature name>

## Proposal source
## Problem and user outcome
## In scope
## Out of scope
## Acceptance criteria
## Dependencies and constraints
## Open questions
## Decisions and evidence
```

### `.air/releases/1.2.0/scope.md`

```markdown
# Release 1.2.0 scope

## Release goal
## Included feature IDs
## Excluded or deferred feature IDs
## Dependencies and ordering
## Release-level acceptance criteria
```

### `.air/releases/1.2.0/design.md`

```markdown
# Release 1.2.0 design

## Scope reference
## Integrated approach
## Components and interfaces
## Data and end-to-end behavior
## Feature-to-design traceability
## Risks and tradeoffs
## Rollout and test strategy
```

## `.air/index.md` inventory and resume template

The index is the canonical inventory and resume point, not a copy of the records.
Use this structure and keep detailed content in its individual files:

Use stable project-local IDs: `F-0001` for features, the user-visible version string
(for example `1.2.0`) for releases, and `A-0001` for approval/change events. Never
reuse an ID.

```markdown
# AIRFlow project index

## Workflow source
- entry: <Project source URL or repository-relative path>

| Source path | Role | Ref (commit/tag) | SHA-256 |
| --- | --- | --- | --- |
| <contract, instructions, Project and each subflow used> | <source role> | <immutable ref or unpinned> | <digest or unknown> |

## Tracker integration
- provider: <none|github|gitlab>
- project_or_board: <reference or none>

## Current execution
- status: <ready|running|waiting-human|blocked|complete>
- phase: <stable subflow ID>
- node_id: <stable Mermaid node ID>
- call_stack: <caller node -> subflow node -> current node>
- call_arguments: <feature/release mode, target IDs, new-work/rework, findings>
- pending_targets: <affected feature IDs in dependency order or none>
- feature_id: <ID or none>
- release_id: <version or none>
- next_action: <specific action, decision or evidence needed>

## Records
| ID | Type | Path | Record status | Feature/release status | Blocked from / event | Current SHA-256 | Approved SHA-256 | Depends on | Tracker reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

For concept/scope/design rows, use `none` in Feature/release status where it does
not apply. Use only the enumerated record, feature, release and execution statuses.

## Approval and change events
| Event ID | Record/path | SHA-256 | Decision | Actor | Timestamp | Evidence | Current/stale and reason |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Verification evidence
| Feature/release | Check | Result | Evidence path/reference | Digest | Current/stale and reason |
| --- | --- | --- | --- | --- | --- |
```

Use stable node IDs in every Mermaid flow and keep them stable across compatible
workflow revisions. If an ID must change, document an old-to-new mapping in the new
workflow version. Store the source-level Mermaid ID (for example `definitionApproval`),
not a generated SVG DOM ID whose numeric suffix can change when nodes are inserted.
Use `unknown` or `none` where the information is genuinely unavailable; never fill
a field from assumption.

## Subflow calls and outcomes

Project owns feature selection and cross-phase repair routing. Verification takes
`feature` or `release` mode and returns evidence-backed outcomes. Implementation
receives a feature ID, `new-work` or `rework` mode and findings; it returns to its
actual caller without changing target. Store these arguments with the call frame.
For multiple affected features, record the pending target IDs and process them in
dependency order. Invalidate affected verification before selection; preserve
unaffected evidence with an impact rationale. Run release checks only when every
scoped feature has current passing evidence.

Explicit non-success terminal outcomes return to the caller's matching edge; they
do not satisfy completion or approval. Blocked outcomes pause the affected work.
Internal self-review failures loop autonomously while concrete progress is possible;
missing product decisions, unbounded impact or repeated lack of progress require a
focused blocker report. On resolution, resume the recorded blocked step with the
new evidence, not an assumed successful outcome.

## Resume validation

Before resuming, verify all of the following against the current files:

1. Workflow source/ref matches the recorded version. Prefer an immutable commit or
   tag. If the source is unpinned, compare the recorded digests of the contract,
   Copilot instructions and exact Mermaid files used.
2. The recorded subflow, node ID and call stack exist in that workflow version and
   form a valid path from Project.
3. Each active record path exists and its current digest matches the index. If a
   digest changed, classify it using Change impact; do not assume approval or
   corruption. Update the index with a change event only when its origin and impact
   are clear; otherwise block and ask.
4. Approval evidence matches the current digest or has a documented editorial
   derivation. Verification evidence is current for the current feature/design.
5. The index, records and optional tracker do not have an unresolved conflict.

If a record/index check fails, set execution status to `blocked`, list the exact
mismatch and ask how to reconcile it. Do not skip nodes, reconstruct missing
approvals, or infer current state from a tracker, branch name, issue order or artifact.

For this orchestration revision, consult `workflow-migration.md` for old-to-new
node mappings and changed call semantics.

If the shared workflow version changed, do not silently replace the recorded ref.
Compare old and new sources and any node-ID migration map. A user must authorize
resuming under the new version. Set execution to `waiting-human` during this decision.
Preserve the old ref and record a migration event.
If transition, criteria or approval-gate semantics changed, invalidate dependent
approvals/evidence and resume at the earliest affected state. If compatibility is
unclear, remain blocked and ask.

## Changes after approval

Classify every change before continuing. If unsure whether meaning changed, treat it
as material.

| Change | Approval/evidence impact | Resume point |
| --- | --- | --- |
| Formatting, spelling or link correction with no meaning change | Keep approval bound to its original digest; record the current digest as an editorial descendant with rationale and author. | Continue current phase; preserve historical approval unchanged. |
| Project purpose, users, outcome or boundary | Concept approval becomes stale; assess dependencies and mark only affected feature definitions, scopes and designs for reapproval. | Concept approval, then affected records; preserve unaffected approvals with evidence. |
| Feature behavior, scope, non-goals, dependencies or acceptance criteria | Definition approval becomes stale. Use dependency impact analysis to mark only affected scope/design approvals and feature verification stale; preserve unaffected approvals with evidence. | Definition; then reapprove only affected scope/design before continuing. |
| Release feature set, version, exclusions or goals | Scope approval and integrated design approval become stale; release-level verification becomes stale. | Release planning. |
| Integrated design architecture, interface, data flow or constraints | Design approval becomes stale; implementation and verification evidence for impacted features becomes stale. | Design approval, then reimplement/reverify impacted features. |
| Implementation code or configuration | Design/definition approval remains only if inputs are unchanged; checks covering changed behavior become stale. | Implementation checks and affected feature verification; rerun release integration checks for shared behavior. |

Append a change event with old/new digests, classification, rationale, impacted record
IDs, invalidated approvals/checks and the next required state. Preserve old evidence as
historical, but never count stale evidence as current. Do not restart the entire project
when impact analysis proves only a subset is affected. If impact cannot be bounded,
block and ask.

## Required scenario checks

Use these traces when reviewing changes to the contract or workflows:

1. New project: initialize `.air/`; approve Concept; define and approve features;
   select a release scope; approve integrated Design; implement/verify scoped
   features; pass release checks; obtain publication authorization.
2. Next release: retain approved Concept; return to Feature intake; define/select
   features; create a new scope/design; do not repeat Concept without a direction change.
3. Nested resume: validate workflow ref, node ID, call stack, record digests and
   evidence before resuming the exact child transition.
4. Rejected Design: keep scope; revise Design; bind new approval to its new digest;
   implementation remains blocked until approval.
5. Changed feature definition: stale that approval and impacted scope/design and
   verification evidence; preserve unaffected approvals only with explicit impact proof.
6. Verification failure: diagnose against definition/design; route code defect to
   Implementation, design gap through Design approval, or unresolved cause to Blocked.
7. Missing approval or tracker mismatch: keep `waiting-human` or `blocked`; follow
   `.air/index.md` ownership, record the discrepancy and ask only if unresolved.
8. Changed workflow version: validate node mapping and transition semantics; block
   incompatible resume rather than silently translating or skipping state.
