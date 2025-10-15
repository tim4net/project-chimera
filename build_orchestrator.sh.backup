#!/bin/bash

# -----------------------------------------------------------------------------
# build_orchestrator.sh (v15 - with Dynamic Image Replacement, For Real)
#
# This script now dynamically replaces the image names in the
# docker-compose.yml file to prevent podman from prompting for input.
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
            echo "🔄 Detected unmodified docker-compose.yml, clearing supabase state to allow registry fixes..."
            sed -i '/supabase_setup_complete/d' "$STATE_FILE" 2>/dev/null || true
        fi
    fi
}

# --- AI Interaction Function (with Dynamic Image Replacement) ---
call_ai() {
    local prompt_file=$1
    local response_file=$2

    while true; do
        echo "🤖 AI: Analyzing the project state and generating the next plan for the MVP..."
        
        # In a real implementation, this would be an API call to Gemini.
        local exit_code=0

        if [ $exit_code -eq 429 ]; then
            echo "API Error: Quota exceeded. Sleeping for 60 seconds..."
            sleep 60
            continue # Retry the API call
        elif [ $exit_code -ne 0 ]; then
            echo "API Error: An unexpected error occurred with exit code $exit_code."
            break
        fi

        # If the API call was successful, generate the plan
        > "$response_file"
        if ! grep -q "supabase_setup_complete" "$STATE_FILE"; then
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
            echo "echo 'supabase_setup_complete' >> $STATE_FILE" >> "$response_file"
        elif ! grep -q "backend_server_initialized" "$STATE_FILE"; then
            echo "echo 'Initializing backend server...'" >> "$response_file"
            echo "echo 'backend_server_initialized' >> $STATE_FILE" >> "$response_file"
        else
            echo "echo 'All MVP tasks are complete. Continuing with the build...'" >> "$response_file"
        fi
        
        if [ -s "$response_file" ]; then
            echo "🤖 AI: Plan generated."
        else
            echo "🤖 AI: No new actions required at this time."
        fi

        break # Exit the loop if the API call was successful
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
        git push -u origin main
    fi

    touch "$STATE_FILE" "$FEEDBACK_FILE" "$BUG_REPORT_FILE"

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
        echo "{\"last_executed_plan\": \"$(cat $PLAN_FILE)\"}" > "$STATE_FILE"
        > "$FEEDBACK_FILE"
        > "$BUG_REPORT_FILE"

        echo "💾 Committing changes to Git..."
        git add .
        commit_message="AI commit: $(cat $PLAN_FILE)"
        git commit -m "$commit_message"
        echo "Pushing changes to GitHub..."
        git push

    done

    echo "🎉 Build process has been stopped."
}

main | tee -a "$LOG_FILE"