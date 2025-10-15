# Project Chimera: AI-Driven Task Workflow

## 4-Step Development Cycle for Each Task

Every task in ARCHITECTURE_TASKS.md follows this process:

```
Task → Define Tests → Implement → Test → Review → (Loop until satisfied) → Next Task
```

---

## Step 1: DEFINE (How should tests work?)

**Objective**: Define success criteria and test specification before writing code

**Prompt Template**: `prompts/{TASK_ID}_1_define.txt`

**Example** (INFRA-001):
```
Task: INFRA-001 - Project Structure Setup

Generate a detailed test specification that defines success criteria for this task.

OUTPUT FORMAT (plain text):
1. List all directories and files that must exist
2. Define any file content requirements
3. Specify validation checks (e.g., valid package.json, correct file permissions)
4. Provide a shell script to verify completion

Example verification script format:
#!/bin/bash
# Verify INFRA-001 completion
test -d backend/src || exit 1
test -f backend/package.json || exit 1
echo "✓ INFRA-001 complete"
```

---

## Step 2: IMPLEMENT (Write the task)

**Objective**: Generate shell commands to implement the task

**Prompt Template**: `prompts/{TASK_ID}_2_implement.txt`

**Example** (INFRA-001):
```
Task: INFRA-001 - Project Structure Setup

TEST SPECIFICATION:
{output from step 1}

CURRENT STATE:
{state.json content}

Generate shell commands to implement this task and pass all verification checks.

OUTPUT FORMAT:
Generate ONLY executable shell commands, one per line.
Include commands to:
1. Create all required directories
2. Initialize package.json files
3. Create gitignore files
4. Set proper permissions
5. Mark task as complete: jq '.tasks_completed += ["INFRA-001"]' ...
```

---

## Step 3: TEST (Run verification)

**Objective**: Execute the test specification from Step 1

**Process**:
1. Execute the shell commands from Step 2
2. Run the verification script from Step 1
3. Capture all output and error messages
4. Save results to `test_results/{TASK_ID}.txt`

**Automated**:
```bash
# Execute implementation
bash -e implementation_commands.sh > test_results/${TASK_ID}_execution.log 2>&1

# Run verification
bash test_spec.sh > test_results/${TASK_ID}_verification.log 2>&1
exit_code=$?

# Save results
if [ $exit_code -eq 0 ]; then
    echo "PASS" > test_results/${TASK_ID}_status.txt
else
    echo "FAIL" > test_results/${TASK_ID}_status.txt
fi
```

---

## Step 4: REVIEW (Analyze and fix)

**Objective**: Have Gemini review test results and generate fixes

**Prompt Template**: `prompts/{TASK_ID}_4_review.txt`

**Example** (INFRA-001):
```
Task: INFRA-001 - Project Structure Setup

TEST RESULTS:
Status: {PASS or FAIL}

Execution Log:
{content of execution.log}

Verification Log:
{content of verification.log}

IMPLEMENTATION CODE:
{commands that were executed}

REVIEW INSTRUCTIONS:
1. If status is PASS:
   - Verify implementation quality
   - Check for best practices
   - Look for potential issues
   - If satisfactory, output: APPROVED
   - If improvements needed, output: IMPROVEMENTS_NEEDED followed by shell commands to fix

2. If status is FAIL:
   - Analyze error messages
   - Identify root cause
   - Output: FIX_REQUIRED followed by shell commands to fix the issue

OUTPUT FORMAT:
First line: APPROVED, IMPROVEMENTS_NEEDED, or FIX_REQUIRED
Following lines: Shell commands (if fixes needed) OR explanation of approval
```

**Review Loop**:
```python
max_iterations = 5
iteration = 0

while iteration < max_iterations:
    review_result = call_gemini(review_prompt)

    if review_result.starts_with("APPROVED"):
        print(f"✓ {TASK_ID} approved!")
        break
    elif review_result.starts_with("IMPROVEMENTS_NEEDED") or review_result.starts_with("FIX_REQUIRED"):
        fix_commands = extract_commands(review_result)
        execute(fix_commands)
        run_tests()  # Go back to Step 3
        iteration += 1
    else:
        print("⚠️  Unexpected review output")
        break

if iteration >= max_iterations:
    print("⚠️  Max iterations reached. Manual review required.")
```

---

## Orchestrator Integration

### Modified State File Schema

```json
{
  "supabase_setup_complete": true,
  "backend_server_initialized": false,
  "tasks_completed": ["INFRA-001", "INFRA-002"],
  "tasks_in_progress": ["DB-001"],
  "current_sprint": 1,
  "current_task_step": "review",
  "review_iteration": 2
}
```

### Orchestrator Workflow

```bash
# Phase 1: Planning (Select next task)
next_task = identify_next_task_from_architecture()

# Phase 2: Define Tests
call_gemini(prompts/${next_task}_1_define.txt)
save_test_spec(test_results/${next_task}_spec.sh)

# Phase 3: Implement
call_gemini(prompts/${next_task}_2_implement.txt)
save_commands(test_results/${next_task}_impl.sh)

# Phase 4: Test
execute(test_results/${next_task}_impl.sh)
run_verification(test_results/${next_task}_spec.sh)

# Phase 5: Review Loop
iteration = 0
while iteration < 5:
    review = call_gemini(prompts/${next_task}_4_review.txt)
    if review starts with "APPROVED":
        mark_task_complete()
        break
    else:
        extract_and_execute_fixes()
        run_tests_again()
        iteration++
```

---

## Benefits of This Approach

1. **Test-Driven**: Tests defined before implementation
2. **Quality Assurance**: AI reviews its own work
3. **Self-Healing**: Automatically fixes issues found in testing
4. **Traceable**: Each task has complete audit trail
5. **Iterative**: Improvement loop before moving forward
6. **Safe**: Verification at each step prevents compounding errors

---

## Directory Structure for Task Execution

```
/srv/project-chimera/
├── prompts/                    # AI prompts for each task step
│   ├── INFRA-001_1_define.txt
│   ├── INFRA-001_2_implement.txt
│   ├── INFRA-001_4_review.txt
│   ├── INFRA-002_1_define.txt
│   └── ...
├── test_results/               # Execution logs and verification
│   ├── INFRA-001_spec.sh
│   ├── INFRA-001_impl.sh
│   ├── INFRA-001_execution.log
│   ├── INFRA-001_verification.log
│   ├── INFRA-001_status.txt (PASS/FAIL)
│   └── ...
└── task_history/               # Complete record of each task
    ├── INFRA-001/
    │   ├── definition.txt
    │   ├── implementation_v1.sh
    │   ├── implementation_v2.sh (if fixes needed)
    │   ├── review_1.txt
    │   ├── review_2.txt
    │   └── final_approval.txt
    └── ...
```

---

## Next Steps for Orchestrator Enhancement

1. Create prompt generation functions for each step
2. Implement review loop with max iterations
3. Add test result parsing and analysis
4. Track review iterations in state file
5. Generate audit trail for each task
6. Implement rollback if task fails after max iterations
