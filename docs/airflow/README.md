# AIRFlow

AIRFlow (AI Routing Flow) describes AI-assisted software development workflows
with Mermaid diagrams. The shared rules live in `airflow.md`; each `.mmd` file defines a phase for
both the visual viewer and AI agents. The viewer fetches the original file at
runtime; no workflow definitions are embedded in HTML or JavaScript.

The AIRFlow website is a read-only viewer, not an editor. Source files can be viewed,
copied and downloaded; changes must be made to the original files in the repository.
It is specifically for AI software development workflows: the diagrams describe
stages, decisions, feedback loops and human approval gates for AI-assisted work.
AIRFlow visualizes that process; it does not run agents or execute workflow steps.

## Open a workflow

- Default workflow: `airflow/` or `airflow/index.html`
- Named workflow: `airflow/index.html?flow=project`
- Another workflow: `airflow/index.html?flow=design`

Choose a workflow from the navigation tree on the left. Branches can be expanded
and collapsed; the current workflow is highlighted. On narrow screens the
collapsible navigation appears above the diagram. There is no name-entry field.

The tree is fetched from `index.json` next to `index.html`. Static hosting does
not provide directory discovery, so new workflows must be listed there to appear
in the tree. Direct `?flow=...` URLs still work for unlisted workflows.

## Navigation index

`index.json` is an array of workflow entries. Each entry has a display `title`,
a safe `flow` name without the `.mmd` extension, and optional `children`:

```json
[
   {
      "title": "Project",
      "flow": "project",
      "children": [
         { "title": "Concept", "flow": "concept" },
         { "title": "Definition", "flow": "definition" }
      ]
   }
]
```

Nest `children` to add deeper levels, or add entries to the outer array for
additional roots. Flow names must be unique across the tree and use the safe
filename rules below. The index contains only navigation metadata, never Mermaid
definitions. Each selected workflow is still fetched from `flows/<flow>.mmd`.
Changing the tree requires no HTML or JavaScript edits. A missing or invalid
index shows a navigation error without preventing direct workflow URLs from loading.

## Separate workflows

`flows/project.mmd` is the orchestrating entry point. Its subroutine nodes
call separate files relative to that source URL; it does not duplicate their
internal steps. Return each subflow outcome to its caller and follow the matching edge; only
success satisfies its required approvals and checks. The phases are not independently chosen.
Concept is the product rationale and is approved once per product direction. Feature intake and
Definition create separately approved feature records in the backlog. Release
planning selects a set of feature IDs for a version; Design describes that set
as one coherent release. Implementation and Verification then run per feature
in the approved scope. Only after every scoped feature and the release-level
checks pass, and the user authorizes publication, is the release published.
Later releases return to Feature intake, not Concept. Verification returns evidence-backed outcomes; Project selects features and
routes repairs to Implementation, Definition or Design. Each repair invalidates
affected evidence before feature and release checks are repeated.

The consuming project stores its AI-managed records under `.air/`, not in this
AIRFlow method repository. The downloaded Copilot file only points to `airflow.md`. The agent uses its
workspace templates and the phase-specific record outlines in the flows. Optional
GitHub or GitLab tracking does not replace the `.air/` records.

Each phase has a separate Mermaid diagram with its relevant decisions and loops:

| Workflow | Viewer | Raw source |
| --- | --- | --- |
| Project overview | [project](index.html?flow=project) | [project.mmd](flows/project.mmd) |
| Concept | [concept](index.html?flow=concept) | [concept.mmd](flows/concept.mmd) |
| Feature intake | [feature intake](index.html?flow=feature-intake) | [feature-intake.mmd](flows/feature-intake.mmd) |
| Definition | [definition](index.html?flow=definition) | [definition.mmd](flows/definition.mmd) |
| Release planning | [release planning](index.html?flow=release-planning) | [release-planning.mmd](flows/release-planning.mmd) |
| Design | [design](index.html?flow=design) | [design.mmd](flows/design.mmd) |
| Implementation | [implementation](index.html?flow=implementation) | [implementation.mmd](flows/implementation.mmd) |
| Verification | [verification](index.html?flow=verification) | [verification.mmd](flows/verification.mmd) |

The viewer renders only the selected file. It does not merge or automatically
load referenced workflows. Click a node with context to read its Markdown in a
panel. If it references a subflow, use **Open phase diagram** in that panel;
workflow nodes without context open their diagram directly.
The breadcrumb trail above the diagram navigates back to ancestors. The trail
is stored in the URL, so reloading, sharing and browser Back/Forward preserve it.
Opening a listed workflow directly uses its ancestors from `index.json`; clicking
a tree entry uses that entry's path. Diagram links preserve the traversal path
in the URL, including workflows that are not in the index.
After reading `airflow.md`, an agent reads Project to discover subflow filenames,
resolves each against its calling source and fetches only the phase it needs.

### Add node context

Add Markdown context to a node using Mermaid comments in the same `.mmd` file.
The text stays out of the graphic, appears in the viewer when its node is
clicked, and remains available to agents reading the source:

```mermaid
%% @airflow-context concept
%% ## Purpose
%% Agree on the problem before defining a solution.

%% **Outcome:** A concept approved by the user.
%% @end-airflow-context
```

The context key must match the Mermaid node ID, not its visible label.
Use an empty line between Markdown paragraphs. The viewer formats headings,
paragraphs, bullet lists, bold text and inline code. Context explains a node but
does not replace its diagram or subflow; agents should follow both.

### Link child workflows

In a flowchart, use a node label containing a filename alone, or a description
followed by a colon and filename:

```mermaid
flowchart LR
   concept["Concept: concept.mmd"]
```

The viewer turns that node into a keyboard-accessible link to `?flow=concept`.
The filename must follow the same safe naming rules as the navigation index;
paths, external URLs and Mermaid JavaScript callbacks are not supported.
The same convention works in child diagrams for deeper trees. Link targets
come from the Mermaid source, not a hardcoded mapping in the viewer. Mermaid
remains in strict security mode. The unmodified source is still available to AI
agents through its raw URL.

Zoom using the buttons or mouse wheel, and drag to pan. With the diagram focused,
use `+` / `-` to zoom, `0` to fit, and arrow keys to pan. Resizing the viewer fits
the diagram again. The theme defaults to the system preference and your choice
is saved locally when storage is available.

Expand Mermaid source to inspect or copy the same source used by the diagram.
Raw source opens the original URL; Download saves the fetched file. Clipboard
access normally requires HTTPS or localhost; when unavailable, the viewer
selects the source for manual copying.

## Add a workflow

1. Create a UTF-8 Mermaid file such as `flows/issue.mmd`.
2. Use valid Mermaid syntax, for example `flowchart TD`, followed by your nodes
   and edges. See `flows/concept.mmd` for approvals and feedback loops.
3. Add a `{"title": "Issue", "flow": "issue"}` entry to `index.json`, under the
   appropriate parent's `children` or as another root.
4. Open it from the tree or navigate directly to `index.html?flow=issue`.

Names must start with an ASCII letter or digit and contain only ASCII letters,
digits, hyphens and underscores, up to 80 characters. Do not include an extension
or path. The viewer always resolves `flows/<name>.mmd` relative to its page.
Path separators, dots and traversal sequences are rejected before fetching.

Edit the Mermaid file to change the diagram; no viewer changes or build step are
needed. Other Mermaid diagram types can use the same file convention. Diagram
links and HTML are restricted by Mermaid's strict security mode.

## Direct AI access

An agent starts with `airflow.md`, then follows its links to the original
Mermaid sources without loading the viewer or executing JavaScript:

```text
https://<domain>/airflow/airflow.md
https://<domain>/airflow/flows/project.mmd
https://<domain>/airflow/flows/concept.mmd
https://<domain>/airflow/flows/feature-intake.mmd
https://<domain>/airflow/flows/definition.mmd
https://<domain>/airflow/flows/release-planning.mmd
https://<domain>/airflow/flows/design.mmd
https://<domain>/airflow/flows/implementation.mmd
https://<domain>/airflow/flows/verification.mmd
https://<owner>.github.io/<repository>/airflow/airflow.md
```

Provide the `airflow.md` URL as the method entry. Individual `.mmd` URLs are
phase references and do not replace that entry. These URLs serve the original
files, not generated JSON or HTML copies.

Global storage, approval and resume rules are in [airflow.md](airflow.md).
Phase-specific record outlines and transitions are embedded in Mermaid context.
The instructions and flows define the full method.

## Use with AI and Copilot

Use the viewer URL for people and the method entry for agents:

| Audience | URL |
| --- | --- |
| Human diagram viewer | `https://vanlangen.org/airflow/?flow=project` |
| AI method entry | `https://vanlangen.org/airflow/airflow.md` |

### Quick setup

1. Download [the standard copilot-instructions.md](copilot-instructions.md).
2. Place it at `.github/copilot-instructions.md` in your consuming repository.
   If that file already exists, merge the instructions instead of replacing it.
3. On the first AIRFlow-assisted project run, the agent initializes the
   project-local `.air/` workspace and its README/index as described in `airflow.md`.
   AIRFlow's own `docs/airflow/` remains the method reference.
4. Commit the instructions with your project and use Copilot with repository
   instructions enabled.

The small downloaded file references `airflow.md`, which contains the shared rules
and links to `flows/project.mmd` relative to its own source. It is a
downloadable template, not an active instruction file for this website repository.
No changes to the viewer or navigation index are needed for consumers.

Open **Get started**, next to the theme switch, for the download and explanation.
Alternatively, **Copy AI reference** fetches that same standard file and appends
the selected diagram's raw URL as reference context only. The agent first reads `airflow.md`; Project remains the workflow entry even when
viewing Design or another child. If clipboard access
fails, the popup opens and selects the text for manual copying.

The standard file's entry URL targets the public `airflow.md`. The optional
selected-diagram context uses the current viewer's host and path; a localhost
URL only works where that server is reachable. Copy from the public viewer when
sharing that context remotely. To self-host or use local files, change the entry
URL/path in your repository's copy of the instructions.

### Shared remote workflows

The standard instructions are also directly accessible at
`https://vanlangen.org/airflow/copilot-instructions.md`. It is only a short
reference. The full method stays in `airflow.md` and the adjacent `flows/` directory
in this repository, so consumers do not maintain a copied method definition.

A URL in instructions does **not** guarantee automatic retrieval. The agent needs
a web-fetch tool, network access and any required permissions. In a restricted
environment, use local files or attach the original source as context instead.
The instructions guide the agent; they do not enforce approvals or execute steps.

The Pages URL follows the latest published version. For reproducible shared
workflows, pin a Git commit or release tag using a raw repository URL, for example:

```text
https://raw.githubusercontent.com/vanlangenlabs/vanlangenlabs-site/<commit-or-tag>/docs/airflow/airflow.md
```

Replace `<commit-or-tag>` with a real commit SHA or tag. Relative phase references
and the Project link then resolve within that same version. Publish `airflow.md`
and the flows together. A latest-version URL can change during a run; recorded
source digests and resume checks detect changes but do not provide an immutable
snapshot. Pin the method entry when reproducibility is required. The copy button
does not pin a version automatically.

### Project orchestrates subflows

The viewer does not route agents automatically. Mermaid defines the process;
`index.json` describes navigation, not project progress. Start with Project and
the active subflow, then read only relevant `.air/` records:

1. Read `airflow.md`, then Project (`flows/project.mmd`), even when resuming or
   viewing a child.
2. Follow its first pending node in order. A node referencing another Mermaid
   file calls that subflow; resolve the filename relative to the caller's source.
3. Read and follow the subflow, including its loops and human approval gates.
   For nested calls, retain the calling step and apply the same rule recursively.
4. Return the explicit terminal outcome to the caller. Follow its matching edge;
   only success satisfies completion. Blocked outcomes pause affected work.
5. On resume, inspect only the active `.air/index.md` entries and referenced
   records. Apply global resume rules and active phase context; block on unresolved
   inconsistencies.

The consuming repository's `.air/index.md` is the inventory and status register
for its AI-managed records. The canonical schema, approvals and resume rules are
in `airflow.md`; phase transitions and outlines live in the flows.
Detailed definitions, scope and design stay in their
individual `.air/` Markdown files.

### Project-specific workflows in your repository

Prefer local, version-controlled files when a workflow belongs to one project.
For example, store `airflow.md` and its `flows/` directory under
`docs/ai-workflows/`, preserving their relative layout. Reference the local method
entry from `.github/copilot-instructions.md`:

```markdown
For development work, read and follow docs/ai-workflows/airflow.md before acting
or resuming. If inaccessible, report the limitation; do not guess its contents.
```

Commit the method and flows together. Keep one authoritative source: a local copy
or a shared version. Navigation metadata does not replace the method or its flows.

## GitHub Pages deployment

This repository publishes `docs/`. AIRFlow therefore lives in `docs/airflow/`
and is served at `/airflow/` (or `/<repository>/airflow/` for a project site).
Keep the existing Pages configuration and publish these files with the site.
For another repository, copy the complete `airflow/` directory into its published
directory. Viewer assets and method links use relative paths. When self-hosting, update the
absolute `airflow.md` URL in `copilot-instructions.md` to your deployment; the
download and copy button both use that file.

There is no backend, Node.js runtime or build process. Mermaid 11.12.0 loads
from jsDelivr; internet access to that CDN is required. The optional Google Fonts
stylesheet falls back to local sans-serif and monospace fonts if unavailable.

For local development, serve `docs/` using the existing VS Code Serve docs task,
or run this from the repository root:

```sh
python -m http.server 8000 --directory docs
```

Open `http://localhost:8000/airflow/`. Use HTTP rather than opening `index.html`
as a local file, because browsers restrict fetching local Mermaid files.
