---
name: no-coauthor
description: User does not want Co-Authored-By trailer in commit messages
metadata:
  type: feedback
---`

Do not add the `Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>` line to commit messages.

**Why:** GitHub treats the Co-Authored-By trailer as a contributor, and the user does not want Claude showing as a contributor on their repos.

**How to apply:** When creating any git commit, omit the Co-Authored-By line entirely.
