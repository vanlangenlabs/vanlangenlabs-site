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
