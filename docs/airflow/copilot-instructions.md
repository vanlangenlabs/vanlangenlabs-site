# AIRFlow AI Development Workflow

Use this workflow for software development work in this repository. It guides
the process alongside this repository's other instructions and existing tool
permissions; it does not authorize commands, deployments or other side effects.

## Entry Point

Always retrieve and read the Project workflow before beginning or resuming work:

https://vanlangen.org/airflow/flows/project.air.mmd

Read the original Mermaid source, not the HTML viewer. A `.air.mmd` file is a
workflow diagram, not an executable script. Use an available web-fetch tool to
retrieve remote sources, or read the files directly when a local workflow copy
has been configured. If a required source is inaccessible, report the limitation
and ask for the file or an accessible copy. Do not invent its contents.

## Execute Subflows

1. Follow Project's edges and decisions in order. It is the orchestrator, not
   a menu from which to independently select a convenient phase.
2. Treat a node referencing another `.air.mmd` file as a subflow call. Resolve
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

## Resume and Record Progress

Consult the repository's existing project-state record and artifacts after
reading Project. Resume a recorded subflow only when its calling context and
the evidence for earlier required approvals and completed steps are available.
Otherwise ask the user; do not skip required phases based only on the task name.

Use an existing project-state convention where one is defined. If none exists,
agree with the user on a small version-controlled record, for example
`docs/ai-workflow-state.json`. Record the workflow source/version, active subflow,
calling step, current step, artifact paths, checks and human approval evidence.
Update it as agreed with the user, without fabricating approvals. AIRFlow does
not create or update this record automatically.

For project-specific workflows, local repository files avoid a web dependency.
For reproducible shared workflows, replace the entry URL with a raw URL pinned
to a real commit or release tag and keep relative subflow references in that version.