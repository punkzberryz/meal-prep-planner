---
name: state-hygiene
description: "Keep UI state local and avoid unnecessary lifting. Use when working with React/Next.js state management and component composition."
---

# State Hygiene

## Overview

Use this skill to keep UI state local, reduce re-renders, and avoid lifting state unless sharing is required.

## Guidelines

1. Keep state local
   - Store UI state closest to the component that needs it.
   - Avoid lifting state unless multiple siblings truly depend on it.

2. Minimize re-renders
   - Derive values with `useMemo` only when needed.
   - Avoid propagating large state objects through multiple layers.
