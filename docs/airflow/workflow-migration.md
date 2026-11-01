# Workflow revision: explicit orchestration and self-review

This revision changes transition semantics. Existing runs must follow the contract's
Resume validation rules and receive user authorization before changing versions.
Retain the old source and call stack until the pending work is reconciled.

| Old position | New position / required reconciliation |
| --- | --- |
| Project start -> concept | restore; validate saved position or current Concept approval |
| Verification implementation | Project implementation; preserve target and repair findings |
| Verification definition | Project definition; preserve target and proposed change |
| Verification releasePlanning | Project releasePlanning; preserve impact and decision evidence |
| Verification design / designForChangedDefinition | Project design; preserve required reapproval |
| Verification impact / scopeImpact / designImpact | Corresponding Project node; preserve impact evidence |
| Verification moreUnverified | Project select; inspect current feature evidence |
| Verification releaseDiagnosis / releaseRootCause | Verification diagnosis / rootCause in release mode |
| Verification testing / featureChecksPassed | Same node in feature mode; add explicit target |
| Verification releaseChecks / releaseChecksPassed | Same node in release mode; validate feature evidence |
| Implementation start / plan | Same node with explicit feature ID and new-work/rework mode |
| Design review | Same node, followed by mandatory quality decision |
| Definition specify | Same node, followed by mandatory self-review |
| Project releaseApproval / awaitingPublication | Same node; successful authorization leads to publish |

Other retained IDs do not by themselves establish semantic compatibility. Remove
obsolete nested repair frames only after reconciling their pending outcome with
Project. Never infer approval or publication success from migration. Re-evaluate
only evidence affected by changed criteria; block when mapping is ambiguous.
