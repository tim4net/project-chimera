#!/bin/bash

# -----------------------------------------------------------------------------
# verify_setup.sh - Verification script for Project Chimera setup
#
# This script verifies that the infrastructure is properly configured before
# proceeding with development. It's designed to be run by fresh agents or
# after major changes to ensure everything is working correctly.
# -----------------------------------------------------------------------------

set -euo pipefail

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m' # No Color

# --- Verification Functions ---

print_status() {
    local status=$1
    local message=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $message"
    elif [ "$status" = "FAIL" ]; then
        echo -e "${RED}✗${NC} $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $message"
    else
        echo "  $message"
    fi
}

verify_docker_compose_registry() {
    print_status "INFO" "Checking docker-compose.yml for proper registry configuration..."

    if [ ! -f "supabase/docker/docker-compose.yml" ]; then
        print_status "FAIL" "docker-compose.yml not found at supabase/docker/docker-compose.yml"
        return 1
    fi

    # Check if all images have docker.io prefix
    local unqualified_images=$(grep -E '^\s+image:\s+[^/]+/[^:]+:' supabase/docker/docker-compose.yml | grep -v 'docker.io' || true)

    if [ -n "$unqualified_images" ]; then
        print_status "FAIL" "Found images without docker.io registry prefix:"
        echo "$unqualified_images"
        return 1
    else
        print_status "PASS" "All container images have proper docker.io registry prefix"
    fi

    return 0
}

verify_env_file() {
    print_status "INFO" "Checking for Supabase environment configuration..."

    if [ ! -f "supabase/docker/.env" ]; then
        print_status "WARN" ".env file not found. Run: cp supabase/docker/.env.example supabase/docker/.env"
        return 1
    else
        print_status "PASS" "Supabase .env file exists"
    fi

    # Check for required environment variables
    local required_vars=("POSTGRES_PASSWORD" "JWT_SECRET" "ANON_KEY" "SERVICE_ROLE_KEY")
    local missing_vars=()

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" supabase/docker/.env; then
            missing_vars+=("$var")
        fi
    done

    if [ ${#missing_vars[@]} -gt 0 ]; then
        print_status "WARN" "Missing or uncommented required variables: ${missing_vars[*]}"
        return 1
    else
        print_status "PASS" "All required environment variables are set"
    fi

    return 0
}

verify_supabase_containers() {
    print_status "INFO" "Checking Supabase container status..."

    if ! command -v podman &> /dev/null; then
        print_status "FAIL" "Podman is not installed or not in PATH"
        return 1
    fi

    local compose_output=$(podman compose -f supabase/docker/docker-compose.yml ps 2>&1 || true)

    # Check for critical containers
    local critical_containers=("supabase-db" "supabase-kong" "supabase-auth")
    local failed_containers=()

    for container in "${critical_containers[@]}"; do
        if echo "$compose_output" | grep -q "$container.*Up"; then
            print_status "PASS" "Container $container is running"
        else
            failed_containers+=("$container")
        fi
    done

    if [ ${#failed_containers[@]} -gt 0 ]; then
        print_status "FAIL" "Critical containers not running: ${failed_containers[*]}"
        print_status "INFO" "Run: podman compose -f supabase/docker/docker-compose.yml up -d"
        return 1
    fi

    return 0
}

verify_project_structure() {
    print_status "INFO" "Verifying project structure..."

    local required_dirs=("supabase" "supabase/docker")
    local required_files=("project.md" "GEMINI.md" "CLAUDE.md" "build_orchestrator.sh")

    local missing_items=()

    for dir in "${required_dirs[@]}"; do
        if [ ! -d "$dir" ]; then
            missing_items+=("directory: $dir")
        fi
    done

    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_items+=("file: $file")
        fi
    done

    if [ ${#missing_items[@]} -gt 0 ]; then
        print_status "FAIL" "Missing required items:"
        for item in "${missing_items[@]}"; do
            echo "  - $item"
        done
        return 1
    else
        print_status "PASS" "All required project files and directories exist"
    fi

    return 0
}

verify_git_repository() {
    print_status "INFO" "Checking Git repository..."

    if [ ! -d ".git" ]; then
        print_status "WARN" "Not a Git repository. Run: git init"
        return 1
    else
        print_status "PASS" "Git repository initialized"
    fi

    # Check for uncommitted changes
    if git status --porcelain | grep -q '^'; then
        print_status "WARN" "There are uncommitted changes in the repository"
    else
        print_status "PASS" "No uncommitted changes"
    fi

    return 0
}

verify_orchestrator_script() {
    print_status "INFO" "Verifying build orchestrator script..."

    if [ ! -f "build_orchestrator.sh" ]; then
        print_status "FAIL" "build_orchestrator.sh not found"
        return 1
    fi

    if [ ! -x "build_orchestrator.sh" ]; then
        print_status "WARN" "build_orchestrator.sh is not executable. Run: chmod +x build_orchestrator.sh"
    fi

    # Verify bash syntax
    if bash -n build_orchestrator.sh 2>&1; then
        print_status "PASS" "build_orchestrator.sh syntax is valid"
    else
        print_status "FAIL" "build_orchestrator.sh has syntax errors"
        return 1
    fi

    # Check for required functions
    local required_functions=("call_ai" "create_github_repo" "check_supabase_health" "reset_state_if_needed")
    local missing_functions=()

    for func in "${required_functions[@]}"; do
        if ! grep -q "^${func}()" build_orchestrator.sh; then
            missing_functions+=("$func")
        fi
    done

    if [ ${#missing_functions[@]} -gt 0 ]; then
        print_status "FAIL" "Missing required functions in orchestrator: ${missing_functions[*]}"
        return 1
    else
        print_status "PASS" "All required orchestrator functions are defined"
    fi

    return 0
}

# --- Main Verification Flow ---

main() {
    echo "=============================================="
    echo "Project Chimera Infrastructure Verification"
    echo "=============================================="
    echo ""

    local failed_checks=0
    local warning_checks=0

    # Run all verification checks
    verify_project_structure || ((failed_checks++))
    echo ""

    verify_git_repository || ((warning_checks++))
    echo ""

    verify_docker_compose_registry || ((failed_checks++))
    echo ""

    verify_env_file || ((warning_checks++))
    echo ""

    verify_orchestrator_script || ((failed_checks++))
    echo ""

    verify_supabase_containers || ((warning_checks++))
    echo ""

    # Summary
    echo "=============================================="
    echo "Verification Summary"
    echo "=============================================="

    if [ $failed_checks -eq 0 ] && [ $warning_checks -eq 0 ]; then
        print_status "PASS" "All checks passed! Infrastructure is ready."
        return 0
    elif [ $failed_checks -eq 0 ]; then
        print_status "WARN" "All critical checks passed. $warning_checks warning(s) need attention."
        return 0
    else
        print_status "FAIL" "$failed_checks critical check(s) failed. Please fix before proceeding."
        return 1
    fi
}

# Run main function
main
exit $?
