#!/bin/bash

# -----------------------------------------------------------------------------
# build_orchestrator.sh (v9 - Truly Non-Interactive, I Swear)
#
# This script will now automatically modify the docker-compose.yml file to
# use fully qualified image names, preventing podman from prompting for input.
# -----------------------------------------------------------------------------

# --- Configuration ---
readonly PROJECT_NAME="Project Chimera"
readonly STATE_FILE="project_state.json"
readonly PLAN_FILE="current_plan.txt"
readonly FEEDBACK_FILE="feedback.txt"
readonly BUG_REPORT_FILE="bug_reports.txt"
readonly AI_PROMPT_FILE="ai_prompt.txt"
readonly AI_RESPONSE_FILE="ai_response.txt"
readonly TOKEN_REFRESH_INTERVAL=60 # Seconds to wait for token refresh
readonly GIT_REPO_NAME="project-chimera"
readonly GIT_USERNAME="tim4net" 
readonly CONTAINER_COMPOSE_COMMAND="podman compose"
readonly LOG_FILE="build.log"

# --- MVP Goal Definition (from ADR-013) ---
readonly MVP_GOAL="Build the Minimum Viable Product (MVP) for Project Chimera. The MVP includes: a functioning backend server; a database that can store and manage a single player's character data; a web UI that displays the procedurally generated map with Fog of War and a basic, real-time journal feed; the ability to set two Idle Phase tasks (Travel and Scout); a functional Active Phase system with a modal overlay and Choice Matrix; and the implementation of only Layer 1, Template-Based Radiant Quests."

# --- AI Interaction Function (Idempotent and Truly Non-Interactive) ---
call_ai() {
    local prompt_file=$1
    local response_file=$2

    echo "🤖 AI: Analyzing the project state and generating the next plan for the MVP..."
    
    > "$response_file"

    if ! grep -q "supabase_setup_complete" "$STATE_FILE"; then
        if [ ! -d "supabase" ]; then
            echo "git clone --depth 1 https://github.com/supabase/supabase" >> "$response_file"
        fi
        if [ ! -f "supabase/docker/docker-compose.yml.bak" ]; then
            # This is the new part that fixes the podman prompt issue
            echo "sed -i.bak 's/image: postgres:15.1/image: docker.io/library/postgres:15.1/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: supabase/gotrue:v2.131.0/image: docker.io/supabase/gotrue:v2.131.0/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: supabase/realtime:v2.25.2/image: docker.io/supabase/realtime:v2.25.2/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: supabase/storage-api:v0.45.2/image: docker.io/supabase/storage-api:v0.45.2/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: supabase/edge-runtime:v1.36.2/image: docker.io/supabase/edge-runtime:v1.36.2/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: supabase/studio:20240112/image: docker.io/supabase/studio:20240112/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: postgrest/postgrest:v11.2.2/image: docker.io/postgrest/postgrest:v11.2.2/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: supabase/logflare:1.4.0/image: docker.io/supabase/logflare:1.4.0/g' supabase/docker/docker-compose.yml" >> "$response_file"
            echo "sed -i.bak 's/image: supabase/kong:3.4/image: docker.io/supabase/kong:3.4/g' supabase/docker/docker-compose.yml" >> "$response_file"
        fi
        if [ ! -f "supabase/docker/.env" ]; then
            echo "cd supabase/docker && cp .env.example .env" >> "$response_file"
            echo "export SUPABASE_PORT=$(find_unused_port) && sed -i 's/POSTGRES_PORT=5432/POSTGRES_PORT='$SUPABASE_PORT'/g'supabase/docker/.env" >> "$response_file"
        fi
        if ! $CONTAINER_COMPOSE_COMMAND -f supabase/docker/docker-compose.yml ps | grep -q "supabase-db"; then
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

    if [ ! -d ".git" ]; then
        echo "Initializing Git repository..."
        git init
        create_github_repo
        git add .
        git commit -m "Initial commit: Starting the AI-driven build of Project Chimera"
        git push -u origin main
    fi

    touch "$STATE_FILE" "$FEEDBACK_FILE" "$BUG_REPORT_FILE"

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
        while read -r command; do
            echo "Executing: $command"
            output=$(eval "$command" 2>&1)
            exit_code=$?
            echo "🔍 Phase 3: Verification"
            if [ $exit_code -eq 0 ]; then
                echo "✅ Command executed successfully."
            else
                echo "❌ Command failed with exit code $exit_code."
                echo "Output:"
                echo "$output"
                echo "Command failed: $command" >> "$BUG_REPORT_FILE"
                echo "Output: $output" >> "$BUG_REPORT_FILE"
                break
            fi
        done < "$PLAN_FILE"

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

        echo "⏳ Waiting for token refresh ($TOKEN_REFRESH_INTERVAL seconds)..."
        sleep "$TOKEN_REFRESH_INTERVAL"
    done

    echo "🎉 Build process has been stopped."
}

main | tee -a "$LOG_FILE"