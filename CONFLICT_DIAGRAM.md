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

## 🔄 Rebase Commands Explained

### `git pull --rebase origin/main` vs `git rebase origin/main`

#### `git pull --rebase origin/main`:
```
This command does TWO things:
1. git fetch origin main    (downloads latest changes)
2. git rebase origin/main   (replays your commits on top)
```

#### `git rebase origin/main`:
```
This command does ONE thing:
1. git rebase origin/main   (replays your commits on top)
```

### 📊 Visual Difference

#### `git pull --rebase origin/main`:
```
Before:                    After:
Local: A---B---C          Local: A---B'---C'
Remote: A---D---E         Remote: A---D---E

Steps:
1. Fetch: Downloads D and E from remote
2. Rebase: Replays B and C on top of E
```

#### `git rebase origin/main`:
```
Before:                    After:
Local: A---B---C          Local: A---B'---C'
Remote: A---D---E         Remote: A---D---E

Steps:
1. Rebase: Replays B and C on top of E
   (Assumes you already have latest remote changes)
```

### ⚠️ Important Difference

**`git rebase origin/main`** will fail if you don't have the latest remote changes!

```
❌ If you run: git rebase origin/main
   But remote has new commits you don't have locally:
   
   Error: "Your branch is behind 'origin/main'"
```

### 🎯 When to Use Each

#### Use `git pull --rebase` when:
- ✅ You want to be safe and ensure you have latest changes
- ✅ You're not sure if remote has new commits
- ✅ You want a single command that does everything

#### Use `git rebase origin/main` when:
- ✅ You know you have the latest remote changes
- ✅ You want more control over the process
- ✅ You want to be explicit about each step

### 💡 Pro Tip

You can also do it in two steps:
```bash
git fetch origin main    # Get latest changes
git rebase origin/main   # Rebase your commits
```

This gives you the same result as `git pull --rebase origin/main` but with more control!

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
