# Agent Guidance

This project was developed using Specification-Driven Development (SDD) through Microsoft Spec Kit.

Spec Kit version used in this project:

```text
specify 0.8.11.dev0
```

Reference repository for the adopted standard:

[https://github.com/github/spec-kit](https://github.com/github/spec-kit)

## SDD Workflow

The project follows a specification-first workflow. Requirements, implementation direction, and task execution should be driven by explicit specifications before code changes are made.

Main Spec Kit commands used by the project:

```text
/speckit.constitution - Establish project principles
/speckit.specify - Create baseline specification
/speckit.plan - Create implementation plan
/speckit.tasks - Generate actionable tasks
/speckit.implement - Execute implementation
```

## Local Agent Setup

After cloning the repository locally, configure your AI agent integration with Spec Kit before working with the SDD workflow.

Run the following command from the repository root:

```bash
specify init . --script ps
```

Replace `<your-agent>` with one of the supported integrations below:

- `agy` - Antigravity
- `amp` - Amp
- `auggie` - Auggie CLI
- `bob` - IBM Bob
- `claude` - Claude Code
- `codebuddy` - CodeBuddy
- `codex` - Codex CLI
- `copilot` - GitHub Copilot
- `cursor-agent` - Cursor
- `devin` - Devin for Terminal
- `forge` - Forge
- `gemini` - Gemini CLI
- `generic` - Generic bring your own agent
- `goose` - Goose
- `iflow` - iFlow CLI
- `junie` - Junie
- `kilocode` - Kilo Code
- `kimi` - Kimi Code

## Additional Documentation

Read the local project documentation before changing architecture, behavior, routing, localization, theme customization, or deployment:

- [`README.md`](./README.md)
- [`Specify folder`](./specify)
