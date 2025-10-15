#!/bin/bash

# -----------------------------------------------------------------------------
# build_orchestrator.sh (v16 - Fixed infinite loop and state tracking)
#
# Fixes:
# - Proper JSON state tracking with jq
# - Exit condition when all tasks complete
# - Graceful git push failure handling
# - No duplicate state entries
# -----------------------------------------------------------------------------

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
    # If docker-compose.yml exists but hasn't been modified for registry, clear supabase state
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
    jq -r ".$key // false" "$STATE_FILE" 2>/dev/null || echo "false"
}

# --- AI Interaction Function ---
call_ai() {
    local prompt_file=$1
    local response_file=$2

    while true; do
        echo "🤖 AI: Analyzing the project state and generating the next plan for the MVP..."

        # Build context for Gemini including project architecture
        local context_file=$(mktemp)
        cat > "$context_file" <<-EOF
You are an AI build orchestrator for Project Chimera. Generate shell commands to build the next component.

TASK ARCHITECTURE:
$(cat ARCHITECTURE_TASKS.md)

CURRENT STATE:
$(cat "$STATE_FILE")

CURRENT PROMPT:
$(cat "$prompt_file")

INSTRUCTIONS:
1. Review completed tasks in state file
2. Identify the next pending task with no incomplete dependencies
3. Generate shell commands to implement that task
4. Commands must be idempotent (safe to run multiple times)
5. End with: jq '.tasks_completed += ["TASK-ID"]' $STATE_FILE > tmp.json && mv tmp.json $STATE_FILE
6. If all MVP tasks complete, output: echo '✅ MVP Complete!' && exit 0

OUTPUT FORMAT:
Generate ONLY executable shell commands, one per line.
NO explanations, NO markdown, NO comments.
EOF

        # Call Gemini API
        if command -v gemini &> /dev/null; then
            if gemini chat "$(cat $context_file)" > "$response_file" 2>&1; then
                local exit_code=$?
            else
                local exit_code=$?
            fi
        else
            echo "⚠️  Gemini CLI not found. Falling back to hardcoded logic..."
            local exit_code=1
        fi

        rm -f "$context_file"

        # Handle API errors
        if [ $exit_code -eq 429 ]; then
            echo "API Error: Quota exceeded. Sleeping for 60 seconds..."
            sleep 60
            continue
        elif [ $exit_code -ne 0 ]; then
            echo "⚠️  Gemini API call failed. Using fallback logic..."
            # Fallback to hardcoded logic
            > "$response_file"
            local has_supabase=$(get_state_value "supabase_setup_complete")
            local has_backend=$(get_state_value "backend_server_initialized")

        if [ "$has_supabase" != "true" ]; then
            if [ ! -d "supabase" ]; then
                echo "git clone --depth 1 https://github.com/supabase/supabase" >> "$response_file"
            fi
            # Check if docker-compose.yml needs registry prefix fixes
            if [ -f "supabase/docker/docker-compose.yml" ]; then
                if ! grep -q "docker.io" supabase/docker/docker-compose.yml; then
                    # Fix image references to use explicit docker.io registry
                    echo "sed -i.bak 's|image: supabase/studio:|image: docker.io/supabase/studio:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: kong:|image: docker.io/kong:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/gotrue:|image: docker.io/supabase/gotrue:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: postgrest/postgrest:|image: docker.io/postgrest/postgrest:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/realtime:|image: docker.io/supabase/realtime:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/storage-api:|image: docker.io/supabase/storage-api:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: darthsim/imgproxy:|image: docker.io/darthsim/imgproxy:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/postgres-meta:|image: docker.io/supabase/postgres-meta:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/edge-runtime:|image: docker.io/supabase/edge-runtime:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/logflare:|image: docker.io/supabase/logflare:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/postgres:|image: docker.io/supabase/postgres:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: timberio/vector:|image: docker.io/timberio/vector:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                    echo "sed -i.bak 's|image: supabase/supavisor:|image: docker.io/supabase/supavisor:|g' supabase/docker/docker-compose.yml" >> "$response_file"
                fi
            fi
            if [ ! -f "supabase/docker/.env" ] && [ -f "supabase/docker/.env.example" ]; then
                echo "cp supabase/docker/.env.example supabase/docker/.env" >> "$response_file"
            fi
            # Fix Docker socket location for rootless Podman
            if [ -f "supabase/docker/.env" ]; then
                if grep -q "DOCKER_SOCKET_LOCATION=/var/run/docker.sock" supabase/docker/.env; then
                    if [ -n "$XDG_RUNTIME_DIR" ] && [ -S "$XDG_RUNTIME_DIR/podman/podman.sock" ]; then
                        echo "sed -i 's|DOCKER_SOCKET_LOCATION=/var/run/docker.sock|DOCKER_SOCKET_LOCATION=$XDG_RUNTIME_DIR/podman/podman.sock|g' supabase/docker/.env" >> "$response_file"
                    fi
                fi
            fi
            if ! $CONTAINER_COMPOSE_COMMAND -f supabase/docker/docker-compose.yml ps 2>&1 | grep -q "supabase-db"; then
                echo "$CONTAINER_COMPOSE_COMMAND -f supabase/docker/docker-compose.yml pull" >> "$response_file"
                echo "$CONTAINER_COMPOSE_COMMAND -f supabase/docker/docker-compose.yml up -d" >> "$response_file"
            fi
            echo "jq '.supabase_setup_complete = true' $STATE_FILE > ${STATE_FILE}.tmp && mv ${STATE_FILE}.tmp $STATE_FILE" >> "$response_file"
        elif [ "$has_backend" != "true" ]; then
            echo "echo 'Initializing backend server...'" >> "$response_file"
            echo "jq '.backend_server_initialized = true' $STATE_FILE > ${STATE_FILE}.tmp && mv ${STATE_FILE}.tmp $STATE_FILE" >> "$response_file"
        else
            echo "echo '✅ All MVP infrastructure tasks are complete!'" >> "$response_file"
            echo "exit 0" >> "$response_file"
        fi
        fi  # Close the "elif [ $exit_code -ne 0 ]" block

        if [ -s "$response_file" ]; then
            echo "🤖 AI: Plan generated."
        else
            echo "🤖 AI: No new actions required at this time."
        fi

        break
    done
}

# --- GitHub Repo Creation Function (Idempotent) ---
create_github_repo() {
    if ! gh repo view "$GIT_USERNAME/$GIT_REPO_NAME" > /dev/null 2>&1; then
        echo "Creating GitHub repository..."
        gh repo create "$GIT_USERNAME/$GIT_REPO_NAME" --public --source=. --remote=origin
        if [ $? -eq 0 ]; then
            echo "✅ GitHub repository created successfully."
        else
            echo "❌ Failed to create GitHub repository."
        fi
    else
        echo "✅ GitHub repository already exists."
    fi
}

# --- Main Orchestration Logic ---
main() {
    echo "🚀 Starting the AI-driven build orchestrator for the $PROJECT_NAME MVP..."

    # Run verification before starting
    if [ -x "./verify_setup.sh" ]; then
        echo "🔍 Running pre-flight verification checks..."
        if ! ./verify_setup.sh; then
            echo "⚠️  Verification checks found issues. The orchestrator will attempt to fix them."
        fi
        echo ""
    fi

    if [ ! -d ".git" ]; then
        echo "Initializing Git repository..."
        git init
        create_github_repo
        git add .
        git commit -m "Initial commit: Starting the AI-driven build of Project Chimera"
        git push -u origin main 2>/dev/null || echo "Initial push skipped"
    fi

    # Initialize state file if it doesn't exist or is invalid
    if [ ! -f "$STATE_FILE" ] || ! jq empty "$STATE_FILE" 2>/dev/null; then
        jq -n '{
          supabase_setup_complete: false,
          backend_server_initialized: false,
          tasks_completed: [],
          tasks_in_progress: [],
          current_sprint: 1
        }' > "$STATE_FILE"
    fi

    # Migrate old state format if needed
    if ! jq -e '.tasks_completed' "$STATE_FILE" &>/dev/null; then
        echo "🔄 Migrating state file to new format..."
        jq '. + {tasks_completed: [], tasks_in_progress: [], current_sprint: 1}' "$STATE_FILE" > "${STATE_FILE}.tmp"
        mv "${STATE_FILE}.tmp" "$STATE_FILE"
    fi

    touch "$FEEDBACK_FILE" "$BUG_REPORT_FILE"

    # Self-healing check
    reset_state_if_needed

    while true; do
        echo "---"

        echo "📋 Phase 1: Planning"
        cat > "$AI_PROMPT_FILE" <<- EOM
	Project: $PROJECT_NAME
	Primary Goal: $MVP_GOAL
	Current State: $(cat "$STATE_FILE")
	User Feedback: $(cat "$FEEDBACK_FILE")
	Bug Reports: $(cat "$BUG_REPORT_FILE")
	Based on the primary goal and the current state, please generate the next sequence of shell commands to continue building the project.
EOM
        call_ai "$AI_PROMPT_FILE" "$AI_RESPONSE_FILE"
        mv "$AI_RESPONSE_FILE" "$PLAN_FILE"

        echo "🛠️ Phase 2: Execution"
        if [ ! -s "$PLAN_FILE" ]; then
            echo "No plan to execute. The project may be complete or the AI needs more information."
            break
        fi

        local command_failed=false
        while read -r command; do
            # Skip empty lines
            [[ -z "$command" ]] && continue

            # Check for exit command
            if [[ "$command" == "exit 0" ]]; then
                echo "✅ Build orchestrator completed successfully!"
                exit 0
            fi

            echo "Executing: $command"

            # Retry logic for network-related commands
            local max_retries=3
            local retry_count=0
            local success=false

            while [ $retry_count -lt $max_retries ]; do
                output=$(eval "$command" 2>&1)
                exit_code=$?

                if [ $exit_code -eq 0 ]; then
                    success=true
                    break
                elif echo "$output" | grep -iq "connection\|network\|timeout\|temporary failure"; then
                    retry_count=$((retry_count + 1))
                    if [ $retry_count -lt $max_retries ]; then
                        echo "⚠️  Network error detected. Retrying ($retry_count/$max_retries)..."
                        sleep 5
                    fi
                else
                    # Non-network error, don't retry
                    break
                fi
            done

            echo "🔍 Phase 3: Verification"
            if [ "$success" = true ] || [ $exit_code -eq 0 ]; then
                echo "✅ Command executed successfully."
            else
                echo "❌ Command failed with exit code $exit_code after $retry_count retries."
                echo "Output:"
                echo "$output"
                echo "---" >> "$BUG_REPORT_FILE"
                echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')" >> "$BUG_REPORT_FILE"
                echo "Command failed: $command" >> "$BUG_REPORT_FILE"
                echo "Exit code: $exit_code" >> "$BUG_REPORT_FILE"
                echo "Output: $output" >> "$BUG_REPORT_FILE"
                echo "---" >> "$BUG_REPORT_FILE"
                command_failed=true
                break
            fi
        done < "$PLAN_FILE"

        # If a command failed, clear the state to retry on next run
        if [ "$command_failed" = true ]; then
            echo "⚠️  Build failed. Will retry on next orchestrator run."
            echo "Check $BUG_REPORT_FILE for details."
            break
        fi

        echo "🔄 Phase 4: Adaptation"
        > "$FEEDBACK_FILE"
        > "$BUG_REPORT_FILE"

        echo "💾 Committing changes to Git..."
        git add .
        commit_message="$(head -1 $PLAN_FILE | cut -c1-72)"
        if git commit -m "AI: $commit_message" 2>/dev/null; then
            # Set upstream and push (with graceful failure handling)
            echo "Pushing changes to GitHub..."
            if git rev-parse --abbrev-ref @{upstream} &>/dev/null; then
                git push 2>&1 | grep -q "secret\|GH013" && echo "⚠️  Push blocked by secret scanning (commits saved locally)" || true
            else
                git push --set-upstream origin $(git branch --show-current) 2>&1 | grep -q "secret\|GH013" && echo "⚠️  Push blocked by secret scanning (commits saved locally)" || true
            fi
        else
            echo "No changes to commit"
        fi

    done

    echo "🎉 Build process has completed or stopped."
}

main | tee -a "$LOG_FILE"
