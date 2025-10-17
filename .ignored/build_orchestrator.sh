#!/bin/bash

# ----------------------------------------------------------------------------
# build_orchestrator.sh (v17 - TDD Workflow)
#
# Implements the 4-stage TDD workflow for each task:
# 1. DEFINE: Generate tests first.
# 2. IMPLEMENT: Write code to pass the tests.
# 3. TEST: Run the tests.
# 4. REVIEW: AI reviews the code and test results.
# ----------------------------------------------------------------------------

# --- Configuration ---
readonly AI_PROMPT_FILE="ai_prompt.txt"


readonly MVP_GOAL="Set up the core infrastructure for Project Chimera MVP, including self-hosted Supabase and backend server initialization."
readonly MAX_FIX_ATTEMPTS=5

STATE_FILE="project_state.json"
echo "DEBUG: STATE_FILE defined as: '$STATE_FILE'" >&2 # Add this line
readonly PLAN_FILE="current_plan.txt"

# --- Helper Functions ---
check_supabase_health() {
    if $CONTAINER_COMPOSE_COMMAND -f supabase/docker/docker-compose.yml ps 2>&1 | grep -q "supabase-db.*Up"; then
        return 0
    else
        return 1
    fi
}

reset_state_if_needed() {
    if [ -f "supabase/docker/docker-compose.yml" ]; then
        if ! grep -q "docker.io" supabase/docker/docker-compose.yml;
 then
            echo "🔄 Detected unmodified docker-compose.yml, resetting Supabase state..."
            jq '.supabase_setup_complete = false' "$STATE_FILE" > "${STATE_FILE}.tmp"
            mv "${STATE_FILE}.tmp" "$STATE_FILE"
        fi
    fi
}

get_state_value() {
    local state_file_path=$1 # New argument for state file path
    local key=$2
    echo "DEBUG: get_state_value: state_file_path is '$state_file_path'" >&2 # Debug with new variable
    local value=$(jq -r ".$key // \"\"" "$state_file_path" 2>/dev/null) # Use new variable
    local jq_exit_code=$?
    if [ $jq_exit_code -ne 0 ]; then
        echo "ERROR: jq failed to get state for key '$key'. Exit code: $jq_exit_code" >&2
    fi
    echo "DEBUG: Getting state: key='$key', value='$value'" >&2
    echo "$value"
}

update_state_value() {
    local state_file_path=$1 # New argument for state file path
    local key=$2
    local value=$3
    echo "DEBUG: Attempting to update state: state_file_path='$state_file_path', key='$key', value='$value'" >&2
    jq --arg val "$value" ".$key = \"$val\"" "$state_file_path" > "${state_file_path}.tmp"
    local jq_exit_code=$?
    if [ $jq_exit_code -ne 0 ]; then
        echo "ERROR: jq failed to update state for key '$key'. Exit code: $jq_exit_code" >&2
        cat "${state_file_path}.tmp" >&2
    fi
    mv "${state_file_path}.tmp" "$state_file_path"
    local mv_exit_code=$?
    if [ $mv_exit_code -ne 0 ]; then
        echo "ERROR: mv failed to update state file for key '$key'. Exit code: $mv_exit_code" >&2
    fi
    sync
    echo "DEBUG: State file '$state_file_path' content after update for key '$key':" >&2
    cat "$state_file_path" >&2
}

# --- AI Interaction Functions ---

call_gemini_api() {
    local context_file=$1
    local response_file=$2
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📡 GEMINI API CALL"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    echo "📝 Prompt Preview:"
    echo "   ┌─ Current State ─────────────────────────"
    cat "$STATE_FILE" | sed 's/^/   │ /'
    echo "   └─────────────────────────────────────────"
    echo ""
    
    local completed=$(jq -r '.tasks_completed | length' "$STATE_FILE" 2>/dev/null || echo "0")
    echo "   Completed: $completed/30 MVP tasks"
    echo "   Context: $(cat $context_file | wc -c) bytes sent to Gemini"
    echo ""
    echo "   Full Prompt to Gemini:"
    echo "   ┌─────────────────────────────────────────"
    echo "   │ Prompt Instructions (Unique Part):"
    local start_pattern=$(grep -E -m 1 'INSTRUCTIONS:|REVIEW INSTRUCTIONS:|Your goal is to implement the task described above.|Generate a detailed test specification that defines success criteria for this task.' "$context_file")

    if [ -n "$start_pattern" ]; then
        # Use awk to print from the line matching the pattern to the end of the file
        awk -v pattern="$start_pattern" 'BEGIN {found=0} $0 ~ pattern {found=1} found {print}' "$context_file" | sed 's/^/   │ /'
    else
        # Fallback: show last 15 lines if no specific instruction block is found
        cat "$context_file" | tail -n 15 | sed 's/^/   │ /'
    fi
    echo "   └─────────────────────────────────────────"
    echo ""

    local gemini_output=$(mktemp)
    echo -n "   Waiting for response"

    (while true; do for s in / - \ \|; do printf "\r   Waiting for response $s"; sleep 0.2; done; done) &
    local spinner_pid=$!

    timeout 300s npx gemini -m gemini-2.5-flash "$(cat "$context_file")" > "$gemini_output" 2>&1
    local exit_code=$?

    kill $spinner_pid 2>/dev/null
    wait $spinner_pid 2>/dev/null

    if [ $exit_code -eq 0 ]; then
        printf "\r   Response received ✓     \n"
    elif [ $exit_code -eq 124 ]; then # 124 is the exit code for timeout
        printf "\r   API call timed out ✗     \n" >&2
        echo "ERROR: Gemini API call timed out after 300 seconds." >&2
        return 1
    else
        printf "\r   API call failed ✗     \n"
    fi

    grep -v "^Loaded\|^Initializing\|^Connecting\|^Using model" "$gemini_output" | grep -v "^$" > "$response_file" || true
    
    rm -f "$gemini_output"
    return $exit_code
}

# --- TDD Workflow Stage Functions ---

run_define_stage() {
    local task_id=$1
    echo "🔍 Stage 1: DEFINE for task $task_id"
    
    local prompt_template="prompts/${task_id}_1_define.txt"
    local test_spec_file="test_results/${task_id}_spec.sh"

    local task_description=$(grep -A 2 "### ${task_id}:" ARCHITECTURE_TASKS.md | grep "Description:" | sed -E 's/^\*\*Description\*\*:\s*//; s/^Description:\s*//')

    cat > "$AI_PROMPT_FILE" <<-EOF
Task: $task_id
Description: $task_description

Generate a detailed test specification that defines success criteria for this task.
OUTPUT FORMAT (plain text):
1. List all directories and files that must exist
2. Define any file content requirements
3. Specify validation checks (e.g., valid package.json, correct file permissions)
4. Provide a shell script to verify completion
Example verification script format:
#!/bin/bash
# Verify $task_id completion
test -d backend/src || exit 1
test -f backend/package.json || exit 1
echo "✓ $task_id complete"
EOF

    call_gemini_api "$AI_PROMPT_FILE" "$test_spec_file"
    if [ ! -s "$test_spec_file" ]; then
        echo "❌ AI failed to generate a test specification for $task_id."
        return 1
    fi
    
    chmod +x "$test_spec_file"
    echo "✅ Test specification for $task_id saved to $test_spec_file"
    update_state_value "$STATE_FILE" "current_task_step" "implement"
    return 0
}

run_implement_stage() {
    local task_id=$1
    echo "💻 Stage 2: IMPLEMENT for task $task_id"
    
    local test_spec_file="test_results/${task_id}_spec.sh"
    local impl_file="test_results/${task_id}_impl.sh"

    # Create prompt for implementation
    local task_description=$(grep -A 2 "### ${task_id}:" ARCHITECTURE_TASKS.md | grep "Description:" | sed -E 's/^\*\*Description\*\*:\s*//; s/^Description:\s*//')

    cat > "$AI_PROMPT_FILE" <<-EOF
Task: $task_id
Description: $task_description
TEST SPECIFICATION:
$(cat "$test_spec_file")
CURRENT STATE:
$(cat "$STATE_FILE")
Your goal is to implement the task described above.
Generate ONLY executable shell commands. Each command must be on a new line.
DO NOT include any explanations, comments, or markdown.
The commands should implement the task and pass all verification checks in the TEST SPECIFICATION.
Include commands to:
1. Create all required directories and files.
2. Add content to files as needed.
3. Set proper permissions.
EOF

    call_gemini_api "$AI_PROMPT_FILE" "$impl_file"
    if [ ! -s "$impl_file" ]; then
        echo "❌ AI failed to generate implementation for $task_id."
        return 1
    fi
    
    echo "✅ Implementation plan for $task_id saved to $impl_file"
    update_state_value "$STATE_FILE" "current_task_step" "test"
    return 0
}

run_test_stage() {
    local task_id=$1
    echo "⚙️ Stage 3: TEST for task $task_id"
    
    local impl_file="test_results/${task_id}_impl.sh"
    local test_spec_file="test_results/${task_id}_spec.sh"
    local execution_log="test_results/${task_id}_execution.log"
    local verification_log="test_results/${task_id}_verification.log"
    local status_file="test_results/${task_id}_status.txt"

    echo "Executing implementation..."
    bash -e "$impl_file" > "$execution_log" 2>&1
    
    echo "Running verification script..."
    bash "$test_spec_file" > "$verification_log" 2>&1
    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        echo "PASS" > "$status_file"
        echo "✅ Tests for $task_id PASSED"
                    update_state_value "$STATE_FILE" "current_task_step" "review"        update_state_value "$STATE_FILE" "review_iteration" 0 # Reset review iteration for a fresh review
        update_state_value "$STATE_FILE" "fix_attempt_iteration" 0 # Reset fix attempts on success
        return 0
    else
        echo "FAIL" > "$status_file"
        echo "❌ Tests for $task_id FAILED."

        local fix_iteration=$(get_state_value "fix_attempt_iteration")
        update_state_value "$STATE_FILE" "fix_attempt_iteration" $((fix_iteration + 1))

        if [ "$fix_iteration" -ge "$MAX_FIX_ATTEMPTS" ]; then
            echo "⚠️ Max AI fix attempts reached for $task_id. Transitioning to review for manual intervention or rewrite."
            echo "AI_FIX_FAILED" > "$status_file" # Indicate AI couldn't fix
        update_state_value "$STATE_FILE" "current_task_step" "review"
            update_state_value "$STATE_FILE" "review_iteration" 0 # Start review iteration from 0
            echo "🚨 ORCHESTRATOR REQUIRES MANUAL INTERVENTION FOR TASK $task_id: AI failed to fix tests after $MAX_FIX_ATTEMPTS attempts. Please review logs and intervene."
            return 1 # Indicate failure to main loop, will be caught by review stage
        fi

        echo "Requesting AI fix (Attempt: $((fix_iteration + 1))/$MAX_FIX_ATTEMPTS)..."

        # Create prompt for fix
        cat > "$AI_PROMPT_FILE" <<-EOF
Task: $task_id
TEST RESULTS:\nStatus: FAIL
Execution Log:\n$(cat "$execution_log")
Verification Log:\n$(cat "$verification_log")
IMPLEMENTATION CODE:\n$(cat "$impl_file")

$( 
            if [ "$fix_iteration" -gt 0 ]; then
                echo "PREVIOUS FIX ATTEMPTS:"
                for i in $(seq 0 $((fix_iteration - 1))); do
                    if [ -f "test_results/${task_id}_fix_attempt_${i}.txt" ]; then
                        echo "--- Attempt $((i + 1)) ---"
                        cat "test_results/${task_id}_fix_attempt_${i}.txt"
                        echo ""
                    fi
                done
            fi
        )
INSTRUCTIONS:
The tests for the current implementation have FAILED. Analyze the error messages and identify the root cause.
If there were previous fix attempts, analyze them to understand why they failed and propose a *different* approach this time.
Output ONLY shell commands to fix the issue. DO NOT include any explanations, comments, or markdown.
The commands should modify the existing implementation to pass the tests.
EOF

        local fix_response_file="test_results/${task_id}_fix_attempt_${fix_iteration}.txt"
        call_gemini_api "$AI_PROMPT_FILE" "$fix_response_file"

        if [ ! -s "$fix_response_file" ]; then
            echo "❌ AI failed to generate fixes for $task_id in this attempt. Retrying or escalating."
            # If AI can't generate a response, it's a failure, but we still increment fix_attempt_iteration
            # and let the loop continue to the next fix attempt or hit MAX_FIX_ATTEMPTS.
            # For now, we'll just let it continue and potentially hit the max_fix_attempts check.
            update_state_value "$STATE_FILE" "current_task_step" "test"
            return 2 # Indicate a re-test is needed
        fi

        local fix_commands=$(cat "$fix_response_file")
        echo "🔧 AI suggested fixes for $task_id. Applying fixes and re-testing."

        # Update the implementation script with the fixes
        echo -e "\n# --- Fixes from test stage iteration $fix_iteration ---\n" >> "$impl_file"
        echo "$fix_commands" >> "$impl_file"

        # Stay in the test stage to re-run tests immediately
                        update_state_value "$STATE_FILE" "current_task_step" ""        return 2 # Indicate a re-test is needed
    fi
}

run_review_stage() {
    local task_id=$1
    local max_iterations=10
    
    while true; do
        local iteration=$(get_state_value "$STATE_FILE" "review_iteration")
        if [ "$iteration" -ge "$max_iterations" ]; then
            echo "⚠️ Max review iterations reached for $task_id. Rewriting feature from DEFINE stage."
            update_state_value "current_task_step" "define"
            update_state_value "review_iteration" 0 # Reset review iteration for the new attempt
            update_state_value "fix_attempt_iteration" 0 # Reset fix attempts for the new attempt
            echo "🚨 ORCHESTRATOR REQUIRES MANUAL INTERVENTION FOR TASK $task_id: AI failed to approve or fix after $max_iterations review iterations. Resetting task to DEFINE stage. Please review logs and intervene."
            return 2 # Indicate that we need to re-enter the workflow for this task
        fi
        
        echo "🤔 Stage 4: REVIEW for task $task_id (Iteration: $((iteration + 1))/$max_iterations)"
        update_state_value "$STATE_FILE" "review_iteration" $((iteration + 1))

        local status=$(cat "test_results/${task_id}_status.txt")
        
        # Create prompt for review
        cat > "$AI_PROMPT_FILE" <<-EOF
Task: $task_id
TEST RESULTS:
Status: $status
Execution Log:
$(cat "test_results/${task_id}_execution.log")
Verification Log:
$(cat "test_results/${task_id}_verification.log")
IMPLEMENTATION CODE:
$(cat "test_results/${task_id}_impl.sh")

REVIEW INSTRUCTIONS:
1. If status is PASS:
   - Verify implementation quality and best practices.
   - If satisfactory, output: APPROVED
   - If improvements needed, output: IMPROVEMENTS_NEEDED followed by shell commands to fix.
     When suggesting improvements, analyze the current implementation and explain *why* the improvements are necessary, then provide the shell commands.
2. If status is FAIL:
   - Analyze error messages and identify the root cause.
   - Output: FIX_REQUIRED followed by shell commands to fix the issue.
     When providing a fix, analyze the current implementation, test results, and logs to identify the root cause. Explain *what* needs to be fixed and *why*, then provide the shell commands.
OUTPUT FORMAT:
First line: APPROVED, IMPROVEMENTS_NEEDED, or FIX_REQUIRED
Following lines: Shell commands (if fixes needed) OR explanation of approval.
EOF

        local review_response_file="test_results/${task_id}_review.txt"
        call_gemini_api "$AI_PROMPT_FILE" "$review_response_file"
        
        local review_result=$(head -1 "$review_response_file")
        
        if [[ "$review_result" == "APPROVED" ]]; then
            echo "✅ Task $task_id approved by AI."
            jq ".tasks_completed += [\"$task_id\"] | .tasks_completed |= unique | .current_task_id = \"\" | .current_task_step = \"\"" "$STATE_FILE" > "${STATE_FILE}.tmp"
            mv "${STATE_FILE}.tmp" "$STATE_FILE"
            echo "DEBUG: State after approval for $task_id:"
            cat "$STATE_FILE"
            
            echo "💾 Committing changes to Git..."
            git add .
            git commit -m "AI: Complete task $task_id"
            return 0
elif [[ "$review_result" == "IMPROVEMENTS_NEEDED" || "$review_result" == "FIX_REQUIRED" ]]; then
            echo "🔧 AI suggested fixes for $task_id. Applying fixes and re-testing."
            local fix_commands=$(tail -n +2 "$review_response_file")
            
            # Update the implementation script with the fixes
            echo -e "\n# --- Fixes from review iteration $iteration ---\n" >> "test_results/${task_id}_impl.sh"
            echo "$fix_commands" >> "test_results/${task_id}_impl.sh"
            
            # Go back to the test stage
            update_state_value "$STATE_FILE" "current_task_step" "test"
            return 2 # Indicates a re-test is needed
        else
            echo "⚠️ Unexpected review output from AI for $task_id. Manual review required."
            return 1
        fi
    done
}

# --- Main Orchestration Logic ---
main() {
    local STATE_FILE="project_state.json" # Add this line
        # Load environment variables from .env file if it exists
    if [ -f ".env" ]; then
        source .env
    fi

    # Check for GEMINI_API_KEY
    if [ -z "${GEMINI_API_KEY}" ]; then
        echo "ERROR: GEMINI_API_KEY is not set. Please set it in your environment or in a .env file." >&2
        #return 1
    fi

    echo "🚀 Starting the AI-driven build orchestrator for the $PROJECT_NAME MVP..."

    # Create required directories
    mkdir -p prompts test_results task_history

    # Run verification before starting
    if [ -x "./verify_setup.sh" ]; then
        echo "🔍 Running pre-flight verification checks..."
        if ! ./verify_setup.sh; then
            echo "⚠️  Verification checks found issues. The orchestrator will attempt to fix them."
        fi
        echo ""
    fi

    # Initialize Git repo if not present
    if [ ! -d ".git" ]; then
        echo "Initializing Git repository..."
        git init
        # create_github_repo (optional)
        git add .
        git commit -m "Initial commit: Starting the AI-driven build of Project Chimera"
    fi

    # Initialize state file if it doesn't exist or is invalid
    if [ ! -f "$STATE_FILE" ] || ! jq empty "$STATE_FILE" 2>/dev/null; then
        echo "DEBUG: Initializing/Re-initializing project_state.json due to missing file or invalid content." >&2
        # Add a unique timestamp to prove if the file is being reset
        local init_timestamp=$(date +%s)
        jq -n --arg ts "$init_timestamp" '{ 
          supabase_setup_complete: false,
          backend_server_initialized: false,
          tasks_completed: [],
          tasks_in_progress: [],
          current_sprint: 1,
          current_task_id: "",
          current_task_step: "",
          review_iteration: 0,
          fix_attempt_iteration: 0,
          initialized_at: $ts
        }' > "$STATE_FILE"
    fi

    while true; do
        echo "---"
        echo "DEBUG: Start of main loop iteration."
        local current_task_id=$(get_state_value "$STATE_FILE" "current_task_id")
        local current_task_step=$(get_state_value "$STATE_FILE" "current_task_step")
        echo "DEBUG: current_task_id = '$current_task_id', current_task_step = '$current_task_step'"

        # If a task is in progress but the step is unknown/empty, default to 'define'
        if [ -n "$current_task_id" ] && [ -z "$current_task_step" ]; then
            echo "⚠️ Task $current_task_id has no defined step. Defaulting to 'define'."
            update_state_value "current_task_step" "define"
            current_task_step="define" # Update local variable too
        fi

        if [ -z "$current_task_id" ]; then
            echo "📋 Phase 1: Planning - Identifying next task"
            
            # AI prompt to select the next task
            cat > "$AI_PROMPT_FILE" <<-EOF
You are an AI build orchestrator. Review the task architecture and the current state to select the next task to work on.
TASK ARCHITECTURE:
$(cat ARCHITECTURE_TASKS.md)
CURRENT STATE:
$(cat "$STATE_FILE")
INSTRUCTIONS:
1. Identify all tasks that are not in the 'tasks_completed' array.
2. From those, find the tasks whose dependencies are all met.
3. From the ready tasks, select the one with the highest priority (INFRA > DB > BE > FE > ...).
4. Output only the single ID of the selected task (e.g., "INFRA-001").
5. If all tasks are complete, output "ALL_TASKS_COMPLETE".
EOF
            
            local next_task_file="next_task.txt"
            call_gemini_api "$AI_PROMPT_FILE" "$next_task_file"
            
            current_task_id=$(cat "$next_task_file")
            
            if [ "$current_task_id" == "ALL_TASKS_COMPLETE" ]; then
                echo "✅ All MVP tasks are complete. Build process finished."
                break
            fi
            
            if [ -z "$current_task_id" ]; then
                echo "⚠️ AI did not select a next task. Waiting and retrying."
                sleep 10
                continue
            fi
            
            update_state_value "$STATE_FILE" "current_task_id" "$current_task_id"
            update_state_value "$STATE_FILE" "current_task_step" "define"
            current_task_step="define" # Update local variable here
            echo "DEBUG: State after new task selection and update:"
            cat "$STATE_FILE" # Add this debug line
        fi
        
        case "$current_task_step" in
            "define")
                run_define_stage "$current_task_id"
                current_task_step=$(get_state_value "current_task_step") # Re-read after stage
                ;;
            "implement")
                run_implement_stage "$current_task_id"
                current_task_step=$(get_state_value "current_task_step") # Re-read after stage
                ;;
            "test")
                run_test_stage "$current_task_id"
                local test_exit_code=$? # Capture exit code
                current_task_step=$(get_state_value "current_task_step") # Re-read after stage
                if [ $test_exit_code -eq 2 ]; then # If re-test is needed, continue to next iteration
                    continue
                fi
                ;;
            "review")
                run_review_stage "$current_task_id"
                local review_exit_code=$?
                current_task_step=$(get_state_value "current_task_step") # Re-read after stage
                if [ $review_exit_code -eq 1 ]; then
                    echo "❌ Task $current_task_id failed review and could not be fixed. Stopping build."
                    break
                elif [ $review_exit_code -eq 2 ]; then
                    # Re-run the test stage after fixes or re-enter workflow
                    continue
                fi
                ;;
            *)
                echo "Unknown task step: $current_task_step for task $current_task_id. Resetting task."
                update_state_value "$STATE_FILE" "current_task_id" ""
                current_task_id="" # Update local variable
                current_task_step="" # Update local variable
                ;;
        esac
        
    done

    echo "🎉 Build process has completed or stopped."
}

main | tee -a "$LOG_FILE"
