# Nuaibria Orchestrator: Dual-AI Build System

## Overview

The build orchestrator uses a **dual-AI architecture** for resilient, autonomous development:

- **Gemini**: Generates implementation plans from architectural specifications
- **Claude**: Analyzes errors and generates fixes when things go wrong

This creates a self-healing system that can recover from failures automatically.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ Continuous Loop (run_continuous.sh)                         │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Build Orchestrator (build_orchestrator.sh)           │  │
│  │                                                       │  │
│  │  1. 📋 PLANNING (Gemini)                             │  │
│  │     └─> Read ARCHITECTURE_TASKS.md                   │  │
│  │     └─> Check current state                          │  │
│  │     └─> Ask Gemini: "What's the next task?"         │  │
│  │     └─> Gemini generates shell commands              │  │
│  │                                                       │  │
│  │  2. 🛠️  EXECUTION                                     │  │
│  │     └─> Run each command                             │  │
│  │     └─> Stream output for long operations            │  │
│  │     └─> Progress indicators                          │  │
│  │                                                       │  │
│  │  3. ❌ ERROR? → 🔧 RECOVERY (Claude)                  │  │
│  │     └─> Claude analyzes error                        │  │
│  │     └─> Claude generates fix commands                │  │
│  │     └─> Execute fixes                                │  │
│  │     └─> Continue with plan                           │  │
│  │                                                       │  │
│  │  4. ✅ SUCCESS                                        │  │
│  │     └─> Update state.json                            │  │
│  │     └─> Git commit                                   │  │
│  │     └─> Loop to next task                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Sleep 10 seconds → Next iteration                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Running Modes

### Single Run
```bash
./build_orchestrator.sh
```
- Executes one planning cycle
- Runs generated commands
- Commits changes
- Exits after completion or error

### Continuous Mode (Recommended)
```bash
./run_continuous.sh
```
- Runs orchestrator in infinite loop
- Automatic retry after failures
- Self-healing with fresh Gemini context
- Monitors task completion
- Designed for unattended operation
- Press Ctrl+C to stop

---

## Dual-AI Collaboration

### Gemini's Role (Planning & Implementation)
- Reads complete project architecture
- Understands MVP scope and dependencies
- Generates implementation commands
- Follows TDD workflow (Define→Implement→Test→Review)
- Tracks which tasks are complete

### Claude's Role (Error Recovery)
- Triggered when commands fail
- Analyzes error messages
- Understands project context
- Generates fix commands
- Attempts recovery before giving up

### Example Flow

```
Gemini: "Create backend directory structure"
  ↓
Orchestrator: mkdir -p backend/src
  ↓
Error: Permission denied
  ↓
Claude: "Analyze error... fix with sudo mkdir"
  ↓
Orchestrator: sudo mkdir -p backend/src
  ↓
Success! Continue with next command
```

---

## Verbose Output Features

### Progress Indicators
- **Spinner** during Gemini API calls: `Waiting for response /`
- **Streaming output** for long commands (npm install, podman pull)
- **Command counter**: Shows `Command 3/10` for each execution
- **Context size**: Displays bytes sent to Gemini
- **Visual separators**: Box drawing characters for clarity

### Real-Time Feedback
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ Command 5/10
  npm install
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ⏳ This may take a while, streaming output...
   ────────────────────────────────────────
   │ npm WARN deprecated ...
   │ added 234 packages in 45s
   ────────────────────────────────────────
🔍 Verification:
   ✅ Success
```

### Error Recovery Flow
```
   ❌ Failed with exit code 127
   Output:
   │ command not found: xyz

🔧 Calling Claude to analyze and fix the error...
   Context size: 5432 bytes
   Response received ✓

✓ Claude provided a fix:
   💡 Analysis: Missing dependency xyz, installing it first

   🔧 Fix commands:
   → npm install xyz
   → mkdir -p required_dir

🔄 Applying Claude's fix...
   Executing fix: npm install xyz
   ✓ Fix applied
   Executing fix: mkdir -p required_dir
   ✓ Fix applied

✅ Error fixed by Claude! Continuing with plan...
```

---

## Configuration

### Required Environment
- `jq` - JSON processing
- `gemini` - Gemini CLI (@google/gemini-cli)
- `claude` - Claude CLI (optional, for error recovery)
- `podman` - Container runtime
- `git` - Version control

### State File Schema
```json
{
  "supabase_setup_complete": true,
  "backend_server_initialized": true,
  "tasks_completed": ["INFRA-001", "INFRA-002"],
  "tasks_in_progress": ["DB-001"],
  "current_sprint": 1
}
```

---

## Monitoring Progress

```bash
# Watch the build log in real-time
tail -f build.log

# Check current state
cat project_state.json

# See what Gemini is planning
cat current_plan.txt

# Check for errors
cat bug_reports.txt

# Count completed tasks
jq '.tasks_completed | length' project_state.json
```

---

## Troubleshooting

### Orchestrator won't start
- Run `./verify_setup.sh` to diagnose issues
- Ensure Supabase containers are running
- Check Gemini API credentials

### Commands failing repeatedly
- Check `bug_reports.txt` for error details
- Verify `build.log` for full execution history
- Claude will attempt auto-recovery
- If stuck, run `./clean_start.sh` and restart

### Infinite loops
- The orchestrator has exit conditions when all tasks complete
- In continuous mode, it just reports completion and waits
- Monitor `project_state.json` for task completion count

---

## Success Criteria

The orchestrator is complete when:
- `jq '.tasks_completed | length' project_state.json` returns 28 (all MVP tasks)
- All database schemas created
- Backend and frontend scaffolding complete
- Basic game loop implemented
- Tests passing

At that point, the continuous loop will just monitor and report:
```
✅ All MVP tasks complete. Infrastructure running. Ready for development.
```
