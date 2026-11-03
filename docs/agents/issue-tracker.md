# Issue tracker: Gitea

Issues and specs for this repo live as Gitea issues in `zypy333/metal-dog` on the self-hosted Gitea instance `http://8.137.146.136:3000`. Use the Gitea REST API for all operations.

## Conventions

Base API URL: `http://8.137.146.136:3000/api/v1/repos/zypy333/metal-dog`

Auth: a Gitea personal access token supplied via the `GITEA_TOKEN` environment variable, sent as `Authorization: token $GITEA_TOKEN`. Never write the token into a file, an issue body, or a commit.

- **Create an issue**: `POST /issues` with `{"title": "...", "body": "..."}`. Use a heredoc for multi-line bodies.
- **Read an issue**: `GET /issues/<index>`, plus `GET /issues/<index>/comments` for the discussion.
- **List issues**: `GET /issues?state=open&type=issues&labels=<comma-separated>`, then filter the JSON with `jq`. Always pass `type=issues`: without it Gitea returns pull requests from the same endpoint.
- **Comment on an issue**: `POST /issues/<index>/comments` with `{"body": "..."}`.
- **Apply / remove labels**: `POST /issues/<index>/labels` with `{"labels": ["..."]}` / `DELETE /issues/<index>/labels/<label-id>`. Existing label ids come from `GET /labels`.
- **Close**: `PATCH /issues/<index>` with `{"state": "closed"}`.

`<index>` is the per-repo issue number shown in the UI as `#<index>`.

## Pull requests as a triage surface

**PRs as a request surface: no.** _(Set to `yes` if this repo treats external PRs as feature requests; `/triage` reads this flag.)_

When set to `yes`, PRs run through the same labels and states as issues, using the Gitea pull request endpoints (`GET /pulls?state=open&type=pulls`, `GET /pulls/<index>`, `POST /pulls/<index>/comments`). Gitea shares one index space across issues and PRs, so a bare `#42` may be either: resolve with `GET /pulls/42` and fall back to `GET /issues/42`.

## When a skill says "publish to the issue tracker"

Create a Gitea issue in `zypy333/metal-dog`.

## When a skill says "fetch the relevant ticket"

Run `GET /issues/<index>` and `GET /issues/<index>/comments`.

## Wayfinding operations

Used by `/wayfinder`. The **map** is a single issue with **child** issues as tickets.

- **Map**: a single issue labelled `wayfinder:map`, holding the Notes / Decisions-so-far / Fog body.
- **Child ticket**: an issue with `Part of #<map>` at the top of the body. Labels: `wayfinder:<type>` (`research`/`prototype`/`grilling`/`task`). Once claimed, the ticket is assigned to the driving dev.
- **Blocking**: Gitea has no native issue dependencies, so a `Blocked by: #<n>, #<n>` line at the top of the child body is the canonical representation. A ticket is unblocked when every blocker is closed.
- **Frontier query**: list the map's open children (`GET /issues?state=open&type=issues&labels=wayfinder:<type>`, cross-checked with `Part of #<map>`), drop any with an open issue in its `Blocked by` line or with an assignee; first in map order wins.
- **Claim**: `PATCH /issues/<index>` with `{"assignees": ["<user>"]}`, the session's first write.
- **Resolve**: comment the answer, close the issue, then append a context pointer (gist + link) to the map's Decisions-so-far.

Note: the `wayfinder:*` labels must exist in the repository before they can be applied; create them via `POST /labels` if they are missing.
