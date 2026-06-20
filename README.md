# Capsule Skills

Internal Claude skills for the Capsule team, packaged for one-step install.

**Browse and download:** https://capsule-brand.github.io/skills/

These are skills for the **Claude macOS app** (Cowork), not Claude Code plugins. To install one: download its `.skill` file from the catalog above, then in the Claude app go to **Settings -> Claude Cowork -> Upload skill** and pick the file. After that you use the skill by describing what you want, or with its slash command.

> Looking for the Claude Code plugin marketplace instead? That's a separate repo: `capsule-brand/CapsulePlugins` (terminal install via `claude plugin marketplace add`).

## What's here

| Skill | What it does |
| --- | --- |
| **eBillity Timesheet** | Log and manage your TimeTracker hours by talking to Claude. |
| **ColorProof** | Brand color preflight and auto-corrector for Adobe Illustrator. |
| **Illustrator Data Merge** | One template + a list of records = one finished file per record. |
| **PanelProof** | Read-only content and visual proofer for Illustrator artwork. Pairs with Data Merge. |

## Repo layout

```
index.html            Catalog page (GitHub Pages)
skills.json           Manifest the catalog reads
skills/<slug>/
  <name>.skill        The installable skill file
  install-guide.html  Plain-language setup + troubleshooting guide
```

## Adding or updating a skill

1. Create `skills/<slug>/` and drop in the new `<name>.skill` and its `install-guide.html`.
2. Add (or update the `version` of) an entry in `skills.json` pointing at those two files.
3. Commit and push. GitHub Pages redeploys and the catalog picks it up automatically, no edit to `index.html` needed.

Hosted on GitHub Pages from the `main` branch. The site is public; the skills contain methodology and setup guides only, no client data or secrets.
