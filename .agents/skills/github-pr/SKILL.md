---
name: github-pr
description: Create a Tokiwagi UI GitHub pull request for completed changes, with Issue links, verification, and human review notes.
---

# GitHub pull request

Use this skill when implementation in `HikariTakahashi/tokiwagi-ui` is ready for a PR.

1. Confirm the repository, `gh auth status`, branch, working tree, and diff. Keep unrelated changes out of the commit and PR. Use a work branch; do not push implementation directly to `main`.
2. Run relevant checks from `README.md` and inspect their results. Summarize the change, linked Issue, verification, and specific points for human review using `.github/PULL_REQUEST_TEMPLATE.md`. Write `Closes #N` only if the PR fully satisfies that Issue; otherwise use `Refs #N`.
3. Commit and push the intended changes, then create the PR with `gh pr create --repo HikariTakahashi/tokiwagi-ui --base main --body-file ...`. Use a temporary UTF-8 body file. Leave the PR open for human comments and corrections; do not merge it as part of PR creation.
4. Report the PR URL, checks performed, and anything still requiring human review. When the PR author is `HikariTakahashi`, do not request that same account as a formal reviewer: GitHub does not count self-approval.
