---
name: component-hygiene
description: "Keep React/Next.js components small and maintainable; prefer extracting helpers into src/lib. Use when editing or reviewing UI components."
---

# Component Hygiene

## Overview

Use this skill when editing or reviewing components to keep files concise and logic reusable.

## Guidelines

1. Keep components small
   - Split files around ~200–300 lines when practical.
   - Extract sections into focused components if a file grows too large.

2. Prefer helpers in `src/lib`
   - Move reusable logic out of components.
   - Avoid large inline blocks for parsing, transformations, or shared utilities.
