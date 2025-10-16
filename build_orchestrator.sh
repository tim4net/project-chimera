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
readonly PROJECT_NAME="Project Chimera"
readonly STATE_FILE="project_state.json"
readonly PLAN_FILE="current_plan.txt"
readonly FEEDBACK_FILE="feedback.txt"
readonly BUG_REPORT_FILE="bug_reports.txt"
readonly AI_PROMPT_FILE="ai_prompt.txt"
readonly AI_RESPONSE_FILE="ai_response.txt"
readonly GIT_REPO_NAME="project-chimera"
readonly GIT_USERNAME="tim4net"
readonly CONTAINER_COMPOSE_COMMAND="podman compose"
readonly LOG_FILE="build.log"
readonly MVP_GOAL="Set up the core infrastructure for Project Chimera MVP, including self-hosted Supabase and backend server initialization."

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
        if ! grep -q "docker.io" supabase/docker/docker-compose.yml; then
            echo "🔄 Detected unmodified docker-compose.yml, resetting Supabase state..."
            jq '.supabase_setup_complete = false' "$STATE_FILE" > "${STATE_FILE}.tmp"
            mv "${STATE_FILE}.tmp" "$STATE_FILE"
        fi
    fi
}

get_state_value() {
    local key=$1
    jq -r ".$key // \"\"" "$STATE_FILE" 2>/dev/null || echo ""
}

update_state_value() {
    local key=$1
    local value=$2
    jq --arg val "$value" ".$key = \$val" "$STATE_FILE" > "${STATE_FILE}.tmp"
    mv "${STATE_FILE}.tmp" "$STATE_FILE"
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
    cat "$context_file" | sed 's/^/   │ /'
    echo "   └─────────────────────────────────────────"
    echo ""

    local gemini_output=$(mktemp)
    echo -n "   Waiting for response"

    (while true; do for s in / - \ |; do printf "\r   Waiting for response $s"; sleep 0.2; done; done) &
    local spinner_pid=$!

    gemini "$(cat $context_file)" > "$gemini_output" 2>&1
    local exit_code=$?

    kill $spinner_pid 2>/dev/null
    wait $spinner_pid 2>/dev/null

    if [ $exit_code -eq 0 ]; then
        printf "\r   Response received ✓     \n"
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

    # Create prompt for defining tests
    cat > "$AI_PROMPT_FILE" <<-EOF
Task: $task_id
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
    update_state_value "current_task_step" "implement"
    return 0
}

run_implement_stage() {
    local task_id=$1
    echo "💻 Stage 2: IMPLEMENT for task $task_id"
    
    local test_spec_file="test_results/${task_id}_spec.sh"
    local impl_file="test_results/${task_id}_impl.sh"

    # Create prompt for implementation
    cat > "$AI_PROMPT_FILE" <<-EOF
Task: $task_id
TEST SPECIFICATION:
$(cat "$test_spec_file")
CURRENT STATE:
$(cat "$STATE_FILE")
Generate shell commands to implement this task and pass all verification checks.
OUTPUT FORMAT:
Generate ONLY executable shell commands, one per line.
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
    update_state_value "current_task_step" "test"
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
        update_state_value "current_task_step" "review"
        update_state_value "review_iteration" 0
        return 0
    else
        echo "FAIL" > "$status_file"
        echo "❌ Tests for $task_id FAILED"
        update_state_value "current_task_step" "review"
        update_state_value "review_iteration" 0
        return 1
    fi
}

run_review_stage() {
    local task_id=$1
    local max_iterations=5
    
    while true; do
        local iteration=$(get_state_value "review_iteration")
        if [ "$iteration" -ge "$max_iterations" ]; then
            echo "⚠️ Max review iterations reached for $task_id. Manual review required."
            return 1
        fi
        
        echo "🤔 Stage 4: REVIEW for task $task_id (Iteration: $((iteration + 1))/$max_iterations)"
        update_state_value "review_iteration" $((iteration + 1))

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
2. If status is FAIL:
   - Analyze error messages and identify the root cause.
   - Output: FIX_REQUIRED followed by shell commands to fix the issue.
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
            
            echo "💾 Committing changes to Git..."
            git add .
            git commit -m "AI: Complete task $task_id"
            return 0
        elif [[ "$review_result" == "IMPROVEMENTS_NEEDED" || "$review_result" == "FIX_REQUIRED" ]]; then
            echo "🔧 AI suggested fixes for $task_id. Applying fixes and re-testing."
            local fix_commands=$(tail -n +2 "$review_response_file")
            
            # Update the implementation script with the fixes
            echo -e "\n# --- Fixes from review iteration $iteration ---
" >> "test_results/${task_id}_impl.sh"
            echo "$fix_commands" >> "test_results/${task_id}_impl.sh"
            
            # Go back to the test stage
            update_state_value "current_task_step" "test"
            return 2 # Indicates a re-test is needed
        else
            echo "⚠️ Unexpected review output from AI for $task_id. Manual review required."
            return 1
        fi
    done
}

# --- Main Orchestration Logic ---
main() {
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
    if [ ! -f "$STATE_FILE" ] || ! jq empty "$STATE_FILE" 2>/dev/null;
 then
        jq -n '{ 
          supabase_setup_complete: false,
          backend_server_initialized: false,
          tasks_completed: [],
          tasks_in_progress: [],
          current_sprint: 1,
          current_task_id: "",
          current_task_step: "",
          review_iteration: 0
        }' > "$STATE_FILE"
    fi

    while true; do
        echo "---"
        
        local current_task_id=$(get_state_value "current_task_id")
        
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
            
            update_state_value "current_task_id" "$current_task_id"
            update_state_value "current_task_step" "define"
        fi
        
        local current_task_step=$(get_state_value "current_task_step")
        
        case "$current_task_step" in
            "define")
                run_define_stage "$current_task_id"
                ;;
            "implement")
                run_implement_stage "$current_task_id"
                ;;
            "test")
                run_test_stage "$current_task_id"
                ;;
            "review")
                run_review_stage "$current_task_id"
                local review_exit_code=$?
                if [ $review_exit_code -eq 1 ]; then
                    echo "❌ Task $current_task_id failed review and could not be fixed. Stopping build."
                    break
                elif [ $review_exit_code -eq 2 ]; then
                    # Re-run the test stage after fixes
                    continue
                fi
                ;;
            *)
                echo "Unknown task step: $current_task_step for task $current_task_id. Resetting task."
                update_state_value "current_task_id" ""
                ;;
        esac
        
    done

    echo "🎉 Build process has completed or stopped."
}

main | tee -a "$LOG_FILE"