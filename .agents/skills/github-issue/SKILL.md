---
name: github-issue
description: Create or update a Tokiwagi UI GitHub Issue for a concrete remaining task, bug, or design decision.
---

# GitHub Issue

Use this skill for work tracked in `HikariTakahashi/tokiwagi-ui`.

1. Confirm the repository and `gh auth status`. Inspect the relevant source or documentation, then search open and closed Issues for duplicates with `gh issue list --state all --search`.
2. If an Issue already covers the work, report its URL and update it only when the requested scope requires it. Otherwise, write a focused title and body using the fields in `.github/ISSUE_TEMPLATE/task.md`: background, work, completion criteria, and references. State observed facts separately from proposals.
3. Create the Issue with `gh issue create --repo HikariTakahashi/tokiwagi-ui --title ... --body-file ...`. Use a temporary UTF-8 body file so Markdown and Japanese text retain their formatting. Do not add work outside the user's requested scope.
4. Report the Issue URL and a brief description of its completion criteria.
