---
name: Daily tasks app scope
description: Scope decision for the daily-tasks artifact — keep it minimal.
---

The user explicitly asked for a single-screen desktop task app with only add/delete/edit task capabilities. No completion status, priority, categories, due dates, filters, or sorting were requested.

**Why:** the user said "не придумывай ничего лишнего" (don't invent anything extra) — an explicit instruction to avoid scope creep.

**How to apply:** if extending this app later, confirm with the user before adding fields/features beyond plain text tasks (add/edit/delete), since the original request was intentionally minimal.
