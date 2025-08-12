# Merge Conflict Resolution - Visual Guide

## 🎯 The Problem

```
Local (master)     Remote (main)
    │                 │
    │                 │
    ▼                 ▼
┌─────────┐       ┌─────────┐
│Custom   │       │Default  │
│README   │       │GitLab   │
│Content  │       │Template │
└─────────┘       └─────────┘
    │                 │
    └───── CONFLICT ──┘
```

## 🔄 What Happened

1. **You worked on `master` branch** with custom content
2. **Remote had `main` branch** with default GitLab template
3. **When trying to sync**, Git found different content in same file
4. **Conflict markers appeared** in README.md

## 🛠️ Resolution Process

```
Step 1: Rename branch
master → main

Step 2: Rebase
git pull --rebase origin main

Step 3: Resolve conflict
Choose: Keep our custom content
Remove: Default GitLab template

Step 4: Push to main
git push -u origin main

Step 5: Clean up
Delete old master branch
```

## ✅ Final Result

```
Local (main)       Remote (main)
    │                 │
    │                 │
    ▼                 ▼
┌─────────┐       ┌─────────┐
│Custom   │       │Custom   │
│README   │◄──────►│README   │
│Content  │       │Content  │
└─────────┘       └─────────┘
    │                 │
    └─── SYNCED ──────┘
```

## 🎉 Success!

- ✅ Conflict resolved
- ✅ Custom content preserved
- ✅ Using main as default branch
- ✅ Repository cleaned up
