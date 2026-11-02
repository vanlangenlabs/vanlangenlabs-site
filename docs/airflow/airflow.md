# AIRFlow AI Development Workflow

Use this workflow for software development work in this repository. It guides
the process alongside this repository's other instructions and existing tool
permissions; it does not authorize commands, deployments or other side effects.

## AIRFlow Entry Point

Before acting or resuming, read [Project](flows/project.mmd). Resolve this path
relative to this `airflow.md` source URL or local directory. Resolve subsequent
subflow references relative to their calling source. Keep this file and all flows
from the same source version; never combine a pinned source with latest flows.

Read the original Mermaid source, not the HTML viewer. A `.mmd` file is a
workflow diagram, not an executable script. Use an available web-fetch tool or a
configured local copy. If Project is inaccessible, report the limitation and
ask for an accessible copy; do not invent its contents.

## Human interaction

Whenever a workflow step requires user communication, artifact review or explicit
approval, follow the [Interaction Protocol](#interaction-protocol) below. It defines
platform-independent interaction semantics; the Mermaid flows remain authoritative
for when each question, review or approval gate occurs.

## Execute Subflows

1. Follow Project's edges and decisions in order. It is the orchestrator, not
   a menu from which to independently select a convenient phase.
2. Treat a node referencing another `.mmd` file as a subflow call. Resolve
   the filename relative to the calling source URL or local file directory.
3. Read that source and follow its steps, decisions and feedback loops. For
   nested calls, apply the same rule and retain the calling step.
4. Pause for explicit human approval at approval decisions. Never approve your
   own work or infer approval merely because an artifact exists.
5. Return the explicit terminal outcome to the caller: success, repair needed,
   deferred, rejected, cancelled or blocked. Follow only its matching edge.
   Only success satisfies completion; other outcomes never imply approval.
   A blocked outcome pauses the affected work until the missing input is resolved.
   Internal failed reviews follow their repair loop before returning.
6. If a referenced file or transition is unclear, stop and ask. A selected
   diagram, viewer breadcrumb or navigation index does not change the entry point.

## Node Context

Any flow may include `%% @airflow-context <node-id>` comment blocks ending with
`%% @end-airflow-context`. Read these as Markdown context for the matching
Mermaid node. Use them to understand the node's purpose, focus and expected
outcome; they do not replace the referenced subflow or its approval decisions.
Empty lines inside a context block separate Markdown paragraphs. These comments
are part of the Mermaid source even though they are not rendered in the diagram.

## Workspace and incremental context

Keep project records in the consuming repository's `.air/`, not the method source.
After reading Project, inspect README and relevant index entries. Initialize missing
files from the templates below; preserve existing records and ask before replacing
conflicting content. Read only the active subflow, embedded context and relevant
records. Phase record outlines and transitions live in the flows.

## Change handling and autonomy

Record old/new digests, classification, rationale, affected IDs, invalidated checks
and approvals, and next state for each change. Editorial changes with no semantic
impact retain approval only through a documented derivation from the approved
version. Material changes invalidate affected approvals; return records to draft
and self-review before reapproval. Treat uncertain meaning changes as material.
Project's impact node owns cross-phase invalidation and repair routes.

Work autonomously within approved scope and fix internal review findings. Escalate
missing product decisions, conflicts, unbounded impact, external blockers,
unauthorized actions or repeated lack of progress with evidence and a focused question.
Blocked is a hold: save prior status and pending node; restore only when invariants
hold, otherwise follow the responsible phase's revision route. Deferral requires
explicit reopening. Subflow outcomes are routing results, not lifecycle statuses.

## Authority and source ownership

Follow the actual instruction hierarchy and tool permissions of the host environment.
AIRFlow cannot override system, developer, organization, repository instructions or
permissions. If a higher-priority instruction disallows an action, stop and report it.

| Information | Authoritative source |
| --- | --- |
| General execution constraints and access | Applicable host and repository instructions |
| Process order, decisions and return paths | `flows/project.mmd` and its referenced subflows |
| Shared status, evidence, resume and change rules | These instructions |
| Approved product intent, feature content and release design | The corresponding approved `.air/` records |
| AIRFlow-specific execution rules | This `airflow.md`, subject to higher-priority instructions |
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

### Status ownership

All mutable statuses live only in `.air/index.md`, never in the content files.
Use separate tables so a release has exactly one lifecycle status:

| Entity / index table | Field | Meaning |
| --- | --- | --- |
| Concept, Definition, scope and Design / Records | `record_status` | Approval state of that content version. |
| README and index / Records | `record_status: none` | Operational files; `none` means not applicable, not approval. |
| Feature / Features | `feature_status` | Delivery state of that feature ID. |
| Release / Releases | `release_status` | Delivery state of the whole version, never of an individual file. |
| Current execution | `status` | Whether the current workflow action can run. |

A Design uses `record_status: draft`, `pending-approval` or `approved`; it never
uses these values as `release_status`. A release can be `design-pending-approval`
while its Design record is still being revised in `draft`. Lifecycle status alone
never proves that an artifact is approved or ready to present.

### Record revision

For every approval-gated record, material revision or invalidated approval moves
`approved -> draft`. Self-review then permits `draft -> pending-approval`; only
explicit approval permits `pending-approval -> approved`. Requested changes move
`pending-approval -> draft`. Preserve earlier versions and their approval events.
Editorial descendants follow Changes after approval without a new approval.

A human may withdraw an active record (`draft`, `pending-approval` or `approved`)
into `withdrawn`; reopening explicitly moves it to `draft`. Mark a historical
version `superseded` only when a replacement exists; this is terminal for that
historical version. Neither withdrawal nor supersession approves a replacement.

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
| `decision` | `approved`, `deferred`, `rejected`, `withdrawn`, `cancelled`, `reopened` or `publication-authorized` |
| `actor` | Human identity if known; otherwise literal `unknown` |
| `timestamp` | Reliable timestamp if available; otherwise literal `unknown` |
| `evidence` | Durable review/chat/tracker reference, or a quoted approval with its source context |

Never fabricate an identity, timestamp, link, quote, digest or approval. If the hash
cannot be computed or the approval cannot be tied to the exact version, leave the
record `pending-approval` and ask the user to approve through a version-bound review
or provide an authorized hashing method. Do not proceed on a generic “looks good” if
multiple records or versions are pending.

Approval events are append-only. Record invalidation in a new change event that
references the old event, reason and replacement event if available. Derive current
validity from these events; never edit or delete the original approval event. The current
record status must describe the current digest, not a historical approved version.

## `.air/README.md` template

Initialize the project workspace with this notice, preserving any additional
project instructions that do not conflict with these instructions:

```markdown
# AIRFlow project workspace

This directory contains AI-managed project records used by AIRFlow. It is not a
general-purpose documentation folder.

Do not edit these records directly. Ask the AIRFlow agent to update them through
the workflow, then review and approve proposed changes before they are merged.

Do not store secrets or credentials here.
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
- entry: <airflow.md source URL or repository-relative path>

| Source path | Role | Ref (commit/tag) | SHA-256 |
| --- | --- | --- | --- |
| <airflow.md, Project and each subflow used> | <source role> | <immutable ref or unpinned> | <digest or unknown> |

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
| ID | Type | Path | record_status | Current SHA-256 | Approved SHA-256 | Depends on | Tracker reference |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Features
| Feature ID | Definition record ID | feature_status | Active release ID or none | Prior status if blocked | Event reference |
| --- | --- | --- | --- | --- | --- |

## Releases
| Release ID | Scope record ID | Design record ID or none | release_status | Prior status if blocked | Event reference |
| --- | --- | --- | --- | --- | --- |

Record IDs are unique across Records. Feature and release IDs identify their own
entity tables and reference Records by ID; do not duplicate lifecycle statuses in
Records or content files. Use `none` only for explicitly non-applicable fields.

## Approval and change events
| Event ID | Kind: decision/change | Record/entity | Old/new SHA-256 | Decision or change classification | Actor | Timestamp | Evidence and rationale | Affected records/checks/events | Next state |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

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

## Resume validation

Before resuming, verify all of the following against the current files:

1. Workflow source/ref matches the recorded version. Prefer an immutable commit or
   tag. If the source is unpinned, compare the recorded digests of `airflow.md` and exact Mermaid files used.
2. The recorded subflow, node ID and call stack exist in that workflow version and
   form a valid path from Project.
3. Each active record path exists and its current digest matches the index. If a
   digest changed, classify it using Change handling; do not assume approval or
   corruption. Update the index with a change event only when its origin and impact
   are clear; otherwise block and ask.
4. Approval evidence matches the current digest or has a documented editorial
   derivation. Verification evidence is current for the current feature/design.
5. The index, records and optional tracker do not have an unresolved conflict.

If a record/index check fails, set execution status to `blocked`, list the exact
mismatch and ask how to reconcile it. Do not skip nodes, reconstruct missing
approvals, or infer current state from a tracker, branch name, issue order or artifact.

If the shared workflow version changed, do not silently replace the recorded ref.
Compare old and new sources and any node-ID migration map. A user must authorize
resuming under the new version. Set execution to `waiting-human` during this decision.
Preserve the old ref and record a migration event.
If transition, criteria or approval-gate semantics changed, invalidate dependent
approvals/evidence and resume at the earliest affected state. If compatibility is
unclear, remain blocked and ask.

## Interaction Protocol

This chapter defines how an AIRFlow agent communicates with a user. It is
platform-independent: it specifies what must be communicated and when, not which
chat, terminal, issue tracker, pull request or messaging tool must carry it. It
complements the Mermaid flows; it does not replace them.

### Authority and scope

- This document is the method entry point and defines how to load context incrementally.
- `flows/project.mmd` determines the current phase and next transition.
- The active subflow and its `@airflow-context` define phase-specific work and gates.
- This chapter governs Questions, Reviews, Approvals and resumable interactions.
- `.air/` records project-specific facts and current state as defined above.

Follow the host's instruction hierarchy and tool permissions. This protocol cannot
authorize actions that another applicable instruction or permission disallows. Never
skip a Mermaid transition or approval gate because a communication channel makes it
convenient.

### Interaction types

#### Question

Use a Question when required information or a user decision is missing.

1. Inspect the active `.air/` records, relevant previous interactions and active
    subflow before asking. Do not ask for information already available.
2. Ask only focused questions needed for the current phase. In interactive channels,
    ask incrementally when an answer can narrow the next question. In asynchronous
    channels, combine related questions into one concise request.
3. Explain why the answer is needed when that is not self-evident. Offer bounded
    options when the workflow defines them; do not make up choices that change scope.
4. Never invent product requirements, user intent, decisions or approval. A partial
    answer resolves only the questions it actually answers; ask only about what remains.

#### Review

Use a Review when an artifact is ready for human evaluation.

1. Identify the artifact path and exact current version (SHA-256 when approval may
    follow). Link it or present the relevant diff/content through the available channel.
2. Summarize what changed, key decisions and assumptions, acceptance coverage, and
    unresolved items or risks. Keep the requested review focused on the artifact's
    purpose and the active phase.
3. Invite specific feedback or a change request. A review request is not an approval.
4. If the user requests changes, incorporate them, update the artifact and digest,
    then request another review when the workflow requires it. Preserve prior review
    evidence as history.

#### Approval

Use an Approval only at an approval gate in Project or the active subflow.

1. Name the exact decision, artifact or scope, its path/ID, version and content digest.
2. State the consequence of approval and the valid alternatives (for example revise,
    defer or reject) when those alternatives exist in the active flow.
3. Require an explicit, unambiguous human decision. Silence, unrelated comments,
    agent completion, passing tests, a mergeable branch or a merged pull request do
    not imply approval of an artifact, phase or release. The user must explicitly
    authorize the named target through the current interaction.
4. Record the decision and evidence according to Approval evidence above and
    `.air/index.md`. Never invent actor, time, source, digest or consent.
5. If the artifact changes materially after approval, use Change handling above to
    determine which approvals/checks are stale before continuing.

### Interaction states and transitions

These states describe the current user interaction, not a feature, release, record
or Mermaid phase. Do not write them into a record's lifecycle-status field. They are
distinct from Workflow execution status above.

| State | Meaning | Next action |
| --- | --- | --- |
| `working` | The agent has enough information and authority for the next in-scope step. | Follow the active subflow. |
| `awaiting-input` | A specific answer or user decision is needed before safe progress. | Ask a Question and pause the affected work. |
| `awaiting-review` | A named artifact/version is ready for human evaluation. | Present a Review; do not treat it as approval. |
| `awaiting-approval` | A workflow gate requires explicit authorization for a named artifact/scope/version. | Request Approval and do not cross the gate. |
| `blocked` | A technical, dependency, permission or unresolved procedural issue prevents safe progress. | Record the blocker, prior state and unblock condition; pause affected work. |

Missing product description, requirements or a user decision normally means
`awaiting-input`, not `blocked`. Reserve `blocked` for a non-interaction obstacle
such as unavailable tools/sources, a dependency failure, or a conflict with no
resolvable owner.

Valid transitions:

- `working -> awaiting-input` when missing information prevents the next valid step.
- `awaiting-input -> working` only when the answer is sufficient; otherwise remain
   `awaiting-input` and ask only the unresolved part.
- `working -> awaiting-review` when the reviewable artifact is ready.
- `awaiting-review -> working` when feedback requires revision, or when review is
   complete and no separate approval gate is required.
- `awaiting-review -> awaiting-approval` only when the review is complete and the
   workflow requires a separate explicit decision.
- `working` or `awaiting-review -> awaiting-approval` when an explicit approval gate
   is reached and its exact target is ready.
- `awaiting-approval -> working` only after an explicit approval and successful
   validation of its evidence against the current artifact digest.
- `awaiting-approval -> working` after requested changes only by returning the artifact
   to draft/review through the active flow; the prior approval was not granted.
- A defer, reject or cancel follows only the matching Mermaid outcome. If no matching
   edge exists, transition to `blocked` and ask rather than inventing a route.
- Any active interaction may become `blocked` when a non-question obstacle prevents
   safe progress. After resolution, restore the saved prior state only if its inputs,
   approvals and evidence remain valid; otherwise follow the required revision route.

No response leaves the interaction in its current awaiting state. Do not keep running
past a human boundary or convert a timeout into consent.

### Interactive and asynchronous channels

The protocol is identical in both kinds of environment:

- **Interactive:** ask in chat/terminal/IDE, accept the reply, update the relevant
   record, then continue only along the valid workflow edge.
- **Asynchronous:** publish the same Question, Review or Approval request in an
   available channel, save the pending interaction and next action, then stop. On a
   later session, inspect the repository state and interaction evidence before
   resuming. Do not assume a PR comment, issue update or merge is approval by itself.

Examples include GitHub Copilot Coding Agent comments/reviews, Copilot CLI terminal
interaction, VS Code Copilot chat, and Claude Code terminal/IDE interaction. Other
agents can use any supported channel. None is mandatory; the channel transports the
interaction but does not change its meaning or approval requirements.

### Resumable interaction record

Do not create a separate interaction file for every exchange by default. Reuse the
`.air/index.md`, the relevant project record and the available conversation/review
history. Preserve enough information to resume without repeating questions or
reconstructing decisions:

- interaction ID, type and current interaction state;
- target record ID/path and current content digest, if an artifact is involved;
- the exact unanswered question, requested review, or approval decision and its
   allowed outcomes;
- received response, decision evidence, actor/time when available, and a durable
   reference or exact quoted text with source context;
- workflow source/version, active phase, stable node ID, nested call stack and any
   feature/release arguments;
- prior execution state, next action, blocker/unblock condition, and affected records
   or invalidated approvals/checks.

Update only relevant index entries. Do not copy entire chat transcripts or full
artifacts into the index. If required information is unavailable, state that fact and
keep the interaction waiting or blocked.

When a user response is pending asynchronously, the existing `.air/index.md` may
include this optional section; omit it when there is no pending interaction:

```markdown
## Pending interaction
| ID | Type | State | Target record/digest | Request and allowed outcomes | Response/evidence | Prior node/call stack | Next action or blocker |
| --- | --- | --- | --- | --- | --- | --- | --- |
```

This is a resume pointer, not a second copy of the conversation or artifact. Keep
the complete approval/change evidence in the existing approval-event record and
the actual artifact in its normal `.air/` path.

### Incomplete answers, changes and conflicts

- **Incomplete answer:** incorporate only what was answered, retain the unresolved
   items and ask a focused follow-up. Do not assume the missing parts.
- **Change request during review:** revise the draft, preserve the old version, and
   resubmit the changed artifact for review/approval as required.
- **Rejection or deferral:** record the user's decision and follow the active flow's
   rejected/deferred edge. Do not reopen automatically.
- **Change to approved requirements:** classify its impact using Change handling
   above; stale only dependent approvals and checks, preserve unaffected evidence,
   and resume at the earliest affected phase. If impact is unclear, stop and ask.
- **Instruction or record conflict:** obey the host instruction hierarchy and the
   source-ownership rules above. Do not silently overwrite a source. Ask only when
   explicit ownership and existing rules cannot resolve the conflict.
- **Unrelated instruction:** never interpret an unrelated user request as approval to
   bypass a pending interaction, phase gate or repository permission.

### Concept phase example

For a new repository where the user initially says, “I want to create a new software
product”:

1. Read this document, Project and the Concept subflow. Initialize `.air/` only if
    missing; inspect existing records first. The initial sentence establishes intent
    but does not yet define or approve a Concept.
2. Check existing `.air/` records and prior interactions. Do not ask for facts already
    supplied. Start a Question interaction for the missing project-level information.
3. In an interactive environment, ask a small number of focused questions, for
    example: who has the problem, what are they trying to achieve, how is it handled
    today, and what outcome would make the product useful? Ask further questions only
    when the answers reveal a material gap. In an asynchronous environment, send the
    related questions together and pause in `awaiting-input`.
4. Draft `.air/concept.md` from the answers. Distinguish confirmed facts from
    assumptions and open questions. Do not add technical design or turn every idea
    into an approved feature.
5. Start `awaiting-review`: summarize the problem, intended users, outcome, boundaries,
    success measures, assumptions and unresolved points; provide the artifact path/diff.
    Incorporate feedback and resubmit if changed.
6. When review is complete, request explicit `awaiting-approval` for the exact Concept
    digest. Record approval evidence. A review response alone is not approval.
7. Only after Concept approval does Project enter Feature intake/Definition. If the
    user provides sufficient Concept information in one message, use it and avoid
    unnecessary questions; the review and approval gates still apply.

This is a documentation walkthrough, not an automatically executed workflow.
