# AIRFlow AI Development Workflow

Use this workflow for software development work in this repository. It guides
the process alongside this repository's other instructions and existing tool
permissions; it does not authorize commands, deployments or other side effects.

## Entry Point

Always retrieve and read the Project workflow before beginning or resuming work:

https://vanlangen.org/airflow/flows/project.mmd

Read the original Mermaid source, not the HTML viewer. A `.mmd` file is a
workflow diagram, not an executable script. Use an available web-fetch tool to
retrieve remote sources, or read the files directly when a local workflow copy
has been configured. If a required source is inaccessible, report the limitation
and ask for the file or an accessible copy. Do not invent its contents.

## Project Workspace Setup

Keep project-specific, AIRFlow-managed working records in `.air/` at the root
of the consuming project repository. This is infrastructure for the AI workflow,
not part of the AIRFlow method source repository. Do not put these records in
AIRFlow's own `docs/airflow/` directory.

After reading Project and before following its first pending node, inspect
`.air/README.md` and `.air/index.md`. If `.air/` does not exist, create it with
a README and index before creating project records. The README must identify `.air/` as an
AI-managed project workspace and tell users to request changes through AIRFlow
rather than editing records out of band. Never overwrite existing records;
inspect and preserve them, and ask before replacing conflicting or unrecognized
content.

Initialize `.air/README.md` with this notice:

```markdown
# AIRFlow project workspace

This directory contains AI-managed project records used by AIRFlow. It is not a
general-purpose documentation folder.

Do not edit these records directly. Ask the AIRFlow agent to update them through
the workflow, then review and approve the proposed changes before they are merged.

Do not store secrets or credentials here.
```

Initialize `.air/index.md` as the inventory and resume point. Include the
configured tracker provider (`none`, `github` or `gitlab`), the active project
phase, active feature and release, and a table of every project record with its
ID, type, path, status, release and optional tracker reference. Update the index
whenever any record or status changes; keep full definitions and designs in
their own files.

Use this layout as records are needed:

- `.air/concept.md` for the approved, project-level purpose and problem.
- `.air/features/<feature-id>/definition.md` for each feature's proposal,
   definition, acceptance criteria and decisions.
- `.air/releases/<version>/scope.md` for the approved feature IDs in a release.
- `.air/releases/<version>/design.md` for the integrated design of that scope.
- `.air/index.md` as the inventory and status register for all project records
   under `.air/`, including their IDs, types, paths, statuses, release links and
   external tracker references.

Keep detailed content in its individual record; do not copy it into the index.
Update the index whenever a record is created, approved, deferred, blocked,
completed or released. Also use it to record the active phase and the approval
evidence needed to resume. Never invent statuses or approvals.

These Markdown files are the durable project records. GitHub or GitLab features
may be used when the project configures them and the agent has the required
access. Record external IDs and links in the index. The index remains AIRFlow's
project inventory and status register; a tracker can provide a planning view,
but its changes must be reconciled into the index before AIRFlow resumes. Avoid
maintaining duplicate feature definitions. A tracker does not replace required
human approvals.

## Execute Subflows

1. Follow Project's edges and decisions in order. It is the orchestrator, not
   a menu from which to independently select a convenient phase.
2. Treat a node referencing another `.mmd` file as a subflow call. Resolve
   the filename relative to the calling source URL or local file directory.
3. Read that source and follow its steps, decisions and feedback loops. For
   nested calls, apply the same rule and retain the calling step.
4. Pause for explicit human approval at approval decisions. Never approve your
   own work or infer approval merely because an artifact exists.
5. Return to the caller only when the subflow reaches its successful terminal
   node and all required approvals and checks have been satisfied. Then follow
   the caller's next edge. Failed reviews or tests follow the stated feedback loop.
6. If a referenced file or transition is unclear, stop and ask. A selected
   diagram, viewer breadcrumb or navigation index does not change the entry point.

## Project and Release Lifecycle

Concept is the product-level rationale and is approved once. Keep it in
`.air/concept.md`; do not repeat Concept for each feature or release. New feature
ideas enter Feature intake through the conversation or a configured tracker.
Refine each one into `.air/features/<feature-id>/definition.md`; only add it to
the backlog after the user approves that definition.

Release planning selects a set of approved backlog feature IDs. The AI may
propose a coherent set, but the user must approve it before recording the
version and scope in `.air/releases/<version>/scope.md`. Design then covers all
features in that scope and is saved in `.air/releases/<version>/design.md`.
Obtain human approval before implementation starts.

Implement and verify each feature in the approved release scope. After all
scoped features pass, run release-level integration and acceptance checks.
Publish only when those checks pass and the user explicitly authorizes release.
A subsequent release starts at Feature intake, not at Concept. Do not carry
feature approvals or verification evidence into another feature or release.

## Implementation Autonomy

After the release Design is approved, work through Implementation autonomously
for routine coding decisions, one feature in the approved release scope at a
time. Derive tasks from its approved Definition and the release Design, run
focused checks, and follow repository instructions and tool permissions. Pause
and report unclear or conflicting requirements, blockers, scope changes, or
unauthorized actions. Verification handles each scoped feature, then runs
release-level integration and acceptance checks. Return to Project only after
all scoped features and release checks pass. Diagnose failures against the
approved Design and acceptance criteria before routing: implementation defects
go to Implementation; design gaps go through Design and its approval gate;
unclear causes or external blockers are reported instead of guessed or retried
indefinitely.

## Node Context

Project may include `%% @airflow-context <node-id>` comment blocks ending with
`%% @end-airflow-context`. Read these as Markdown context for the matching
Mermaid node. Use them to understand the node's purpose, focus and expected
outcome; they do not replace the referenced subflow or its approval decisions.
Empty lines inside a context block separate Markdown paragraphs. These comments
are part of the Mermaid source even though they are not rendered in the diagram.

## Resume and Record Progress

Read `.air/index.md` and its referenced artifacts before beginning or resuming
work. The index records the active feature or release, phase, artifact paths,
checks and human approval evidence. Update it as work progresses; never invent
approvals or completion evidence. Resume a subflow only when its calling context
and evidence for earlier required approvals and completed steps are available.
Otherwise ask the user; do not skip required phases based only on the task name.

For project-specific workflows, local repository files avoid a web dependency.
For reproducible shared workflows, replace the entry URL with a raw URL pinned
to a real commit or release tag and keep relative subflow references in that version.