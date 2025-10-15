#!/bin/bash

# -----------------------------------------------------------------------------
# build_orchestrator.sh (Final Version)
#
# This script orchestrates the AI-driven development of the MVP for Project
# Chimera, with Git integration, Podman for containerization, and
# comprehensive logging.
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

# --- Port Scanning Function ---
find_unused_port() {
    local port_start=8000
    local port_end=9000
    for port in $(seq $port_start $port_end); do
        if ! ss -lnt | grep -q ":$port "; then
            echo $port
            return
        fi
    done
}

# --- AI Interaction Function (Placeholder) ---
call_ai() {
    local prompt_file=$1
    local response_file=$2

    echo "🤖 AI: Analyzing the project state and generating the next plan for the MVP..."
    
    # In a real scenario, this would be an API call to Gemini:
    # gemini-cli --prompt-file "$prompt_file" --output-file "$response_file"

    # For this conceptual script, we'll simulate the AI's response.
    
    # On the first run, the plan is to set up the Supabase container
    if [ ! -f "supabase/docker/docker-compose.yml" ]; then
        echo "git clone --depth 1 https://github.com/supabase/supabase" > "$response_file"
        echo "cd supabase/docker && cp .env.example .env" >> "$response_file"
        echo "export SUPABASE_PORT=$(find_unused_port) && sed -i 's/8000/$SUPABASE_PORT/g' .env" >> "$response_file"
        echo "podman compose pull" >> "$response_file"
        echo "podman compose up -d" >> "$response_file"
    else
        # Subsequent plans would be generated here
        echo "echo 'This is a placeholder for a subsequent AI-generated command.'" > "$response_file"
    fi
    
    echo "🤖 AI: Plan generated."
}

# --- MVP Check Function (Placeholder) ---
check_mvp_status() {
    echo "🤖 AI: Checking if the MVP is complete..."
    read -p "Is the MVP complete and ready for review? (y/n) " -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0 # Success (MVP is complete)
    else
        return 1 # Failure (MVP is not complete)
    fi
}

# --- GitHub Repo Creation Function ---
create_github_repo() {
    echo "Creating GitHub repository..."
    gh repo create "$GIT_USERNAME/$GIT_REPO_NAME" --public --source=. --remote=origin
    if [ $? -eq 0 ]; then
        echo "✅ GitHub repository created successfully."
    else
        echo "❌ Failed to create GitHub repository. Please make sure you have the 'gh' CLI tool installed and configured."
    fi
}

# --- Main Orchestration Logic ---
main() {
    echo "🚀 Starting the AI-driven build orchestrator for the $PROJECT_NAME MVP..."

    # --- Git Initialization ---
    if [ ! -d ".git" ]; then
        echo "Initializing Git repository..."
        git init
        create_github_repo
        git add .
        git commit -m "Initial commit: Starting the AI-driven build of Project Chimera"
        git push -u origin main
    fi

    # Initialize state and feedback files if they don't exist
    touch "$STATE_FILE" "$FEEDBACK_FILE" "$BUG_REPORT_FILE"

    while true; do
        # -------------------------------------------------------------------------
        # 1. PLAN
        # -------------------------------------------------------------------------
        echo "📋 Phase 1: Planning"
        
        # Assemble the prompt for the AI
        cat > "$AI_PROMPT_FILE" <<- EOM
        Project: $PROJECT_NAME

        Primary Goal:
        $MVP_GOAL

        Current State:
        $(cat "$STATE_FILE")

        User Feedback:
        $(cat "$FEEDBACK_FILE")

        Bug Reports:
        $(cat "$BUG_REPORT_FILE")

        Based on the primary goal and the current state, please generate the next sequence of shell commands to continue building the project.
EOM

        # Call the AI to generate a plan
        call_ai "$AI_PROMPT_FILE" "$AI_RESPONSE_FILE"
        mv "$AI_RESPONSE_FILE" "$PLAN_FILE"

        # -------------------------------------------------------------------------
        # 2. DO
        # -------------------------------------------------------------------------
        echo "🛠️ Phase 2: Execution"
        
        if [ ! -s "$PLAN_FILE" ]; then
            echo "No plan to execute. The project may be complete or the AI needs more information."
            break
        fi

        # Execute each command in the plan
        while read -r command; do
            echo "Executing: $command"
            output=$(eval "$command" 2>&1)
            exit_code=$?

            # ---------------------------------------------------------------------
            # 3. CHECK
            # ---------------------------------------------------------------------
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

        # -------------------------------------------------------------------------
        # 4. ACT
        # -------------------------------------------------------------------------
        echo "🔄 Phase 4: Adaptation"
        
        echo "{"last_executed_plan": "$(cat $PLAN_FILE)"}" > "$STATE_FILE"
        > "$FEEDBACK_FILE"
        > "$BUG_REPORT_FILE"

        # -------------------------------------------------------------------------
        # Git Commit and Push
        # -------------------------------------------------------------------------
        echo "💾 Committing changes to Git..."
        
        # Stage all changes
        git add .
        
        # Generate a commit message from the AI's plan
        commit_message="AI commit: $(cat $PLAN_FILE)"
        
        # Commit the changes
        git commit -m "$commit_message"
        
        # Push the changes to GitHub
        echo "Pushing changes to GitHub..."
        git push

        # -------------------------------------------------------------------------
        # MVP Review
        # -------------------------------------------------------------------------
        if check_mvp_status; then
            echo "🎉 MVP build complete! Pausing for your review."
            echo "Please review the project and provide your feedback in the '$FEEDBACK_FILE' file."
            echo "Once you have provided your feedback, press Enter to continue the build process."
            read -r
        fi

        # -------------------------------------------------------------------------
        # Token Refresh Simulation
        # -------------------------------------------------------------------------
        echo "⏳ Waiting for token refresh ($TOKEN_REFRESH_INTERVAL seconds)..."
        sleep "$TOKEN_REFRESH_INTERVAL"

    done

    echo "🎉 Build process has been paused for MVP review."
}

# --- Main execution block with logging ---
# This will pipe all the output of the main function to both the console and the log file.
main | tee -a "$LOG_FILE"
