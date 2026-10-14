<div align="center">

<img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=700&size=30&duration=2800&pause=900&color=FF5555&center=true&vCenter=true&width=720&height=55&lines=You+have+to+step+away.;The+work+keeps+moving.;niztal-afk+%E2%80%94+owner+mode." alt="You have to step away. The work keeps moving. niztal-afk — owner mode." />

<br/>

```text
╭────────────────────────────────────────╮
│  N I Z T A L   /   A F K               │
│  AUTONOMOUS OWNER MODE                  │
╰────────────────────────────────────────╯
```

**Hand off the outcome. Come back to a real handoff.**

[![Stars](https://img.shields.io/github/stars/NISTALTALSON/niztal-afk?style=for-the-badge&color=FF5555&labelColor=1a1a1a)](https://github.com/NISTALTALSON/niztal-afk/stargazers)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge&labelColor=1a1a1a)](LICENSE)
[![Claude Skill](https://img.shields.io/badge/Claude-Skill-orange?style=for-the-badge&logo=anthropic&logoColor=white&labelColor=1a1a1a)](niztal-afk.skill)

<br/>

> *You leave for a meeting. The task shouldn't turn into a stack of questions waiting for you when you get back.*
>
> **niztal-afk is built for that gap..**

</div>

---

## ⚡ What it does

`niztal-afk` is a portable Claude skill bundle for **away-from-keyboard work**. It takes a task someone has handed over, sets a concrete finish line, works with the tools and context available, verifies the result, and leaves a short report.

| Move | What happens |
|---|---|
| 🎯 **FRAME** | Turn the handoff into a checkable definition of done |
| 🧭 **INSPECT** | Find the tools, project context, and constraints that are actually available |
| 🛠️ **DO** | Make sensible, reversible decisions and carry the work forward |
| ✅ **VERIFY** | Check the result before calling it finished |
| 📨 **HAND BACK** | Share what’s done, what was checked, and anything that truly needs you |

## 🕒 When to use it

When you’re stepping away, busy, or want an agent to take a task end to end:

```text
“I’m away for a while. Take this through to a finished result
and leave me a short handoff.”
```

It’s designed to make progress on everyday choices without turning each one into a question. Missing access, failed checks, and human decisions are called out clearly so the rest of the work can still move.

## 📦 Install

Download [`niztal-afk.skill`](./niztal-afk.skill) and import it into a Claude environment that supports skill bundles. The archive carries the instructions and reference guides together; there’s no app to build or runtime to install.

## 🧾 The handoff

The bundled report template puts the useful parts first:

| | |
|---|---|
| **Done** | What exists and where to find it |
| **Verified** | Checks actually run and their results |
| **Decisions** | Assumptions made, why, and how to undo them |
| **Needs you** | Real approvals, access gaps, or human calls |
| **Next step** | One follow-up, if there is one |

## 🛡️ Guardrails

Autonomy has edges. The skill protects secrets and original data; it does not treat a missing permission as something to bypass. Spending, account security changes, high-impact decisions, and messages sent as the user remain with the person who owns them.

## 🗂️ Inside the bundle

```text
niztal-afk.skill
└── niztal-afk/
    ├── SKILL.md
    └── references/
        ├── capability-discovery.md
        ├── github-workflow.md
        └── handoff-report.md
```

The `.skill` archive is the source for these files; they aren’t duplicated as loose files in this repository. The references cover capability discovery, GitHub workflow, and the final handoff.

## 📄 License

[MIT](./LICENSE)
