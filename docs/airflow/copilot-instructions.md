# AIRFlow AI Development Workflow

Use this workflow for software development work in this repository. It guides
the process alongside this repository's other instructions and existing tool
permissions; it does not authorize commands, deployments or other side effects.

## AIRFlow Entry Point

Before acting or resuming, retrieve and read Project:

https://vanlangen.org/airflow/flows/project.mmd

Read the original Mermaid source, not the HTML viewer. A `.mmd` file is a
workflow diagram, not an executable script. Use an available web-fetch tool or a
configured local copy. If Project is inaccessible, report the limitation and
ask for an accessible copy; do not invent its contents.

The shared contract is `../record-lifecycle.md` relative to the Project source
URL or local path, not relative to the consuming repository's instructions file.

## Project Workspace Setup

After reading Project and before following its first pending node, inspect
`.air/README.md` and the relevant part of `.air/index.md`. If `.air/` is missing,
initialize it using only the `.air/README.md` and `.air/index.md` template sections
in `record-lifecycle.md`. Never overwrite existing records. Do not load unrelated
feature or release records.

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

## Load Phase Context Incrementally

Follow Project's next edge and read only the active subflow plus the `.air/`
records it names. The active subflow's `@airflow-context` blocks carry the
operational criteria for that phase. Do not fetch every subflow or dump the full
`.air/index.md` into each prompt; read only the active feature/release rows and
their dependencies.

`record-lifecycle.md` is a detailed reference, not a required full read on every
prompt. Read only the relevant section when a status transition, approval/hash,
revision impact, resume mismatch or source conflict is not resolved by the active
flow. Ask only if that applicable rule still leaves the decision ambiguous.

## Implementation Autonomy

After release Design approval, implement scoped features autonomously for routine
in-scope coding decisions, following Implementation and Verification and all
repository/tool constraints. Pause for ambiguity, blockers, scope change or
unauthorized actions. Use the canonical contract for failure diagnosis,
invalidation and return paths; never retry indefinitely or claim checks passed
without evidence.

## Node Context

Any flow may include `%% @airflow-context <node-id>` comment blocks ending with
`%% @end-airflow-context`. Read these as Markdown context for the matching
Mermaid node. Use them to understand the node's purpose, focus and expected
outcome; they do not replace the referenced subflow or its approval decisions.
Empty lines inside a context block separate Markdown paragraphs. These comments
are part of the Mermaid source even though they are not rendered in the diagram.

## Resume

When resuming, use the relevant `.air/index.md` entries to identify the active
feature/release, phase, node ID and call stack. Validate their referenced records
and evidence. Consult only the applicable resume/version section of
`record-lifecycle.md` if state is inconsistent; do not load unrelated project state.
Never skip steps or reconstruct missing approval evidence from assumptions.

For project-specific workflows, local repository files avoid a web dependency.
For reproducible shared workflows, replace the entry URL with a raw URL pinned
to a real commit or release tag and keep relative subflow references in that version.