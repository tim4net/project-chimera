# Project Chimera - Development TODO List

This document outlines the development tasks for Project Chimera. It is a living document and will be updated as new tasks are discovered.

## Sprint 1: Foundation

- [x] **INFRA-001**: Set up the basic project directory structure for backend and frontend.
- [x] **INFRA-002**: Initialize the backend with the chosen technology stack (Node.js/Express).
- [x] **INFRA-003**: Initialize the React frontend with build tools and core libraries.
- [x] **DB-001**: Define the Supabase database schema for user authentication.
- [x] **DB-002**: Define the schema for D&D 5e character data.
- [x] **BE-001**: Implement REST API endpoints for authentication.
- [x] **FE-001**: Create the authentication UI (Login, Signup, Profile pages).

## Sprint 2: Core Game Loop

- [x] **DB-003**: Define the schema for character inventory and equipment.
- [x] **DB-004**: Define tables to store narrative events and game history.
- [x] **BE-002**: Implement CRUD operations for characters.
- [x] **FE-002**: Create the character creation wizard.
- [x] **GM-001**: Implement the D&D 5e dice rolling system.
- [x] **GM-002**: Implement the abstracted combat system for idle phase encounters.

## Sprint 3: Idle Phase

- [x] **BE-003**: Implement endpoints for setting and resolving idle phase tasks.
- [x] **FE-003**: Create the main dashboard with an interactive map.
- [x] **FE-004**: Create the scrollable journal feed component.
- [x] **FE-005**: Create the UI for setting idle tasks.
- [x] **AI-001**: Set up the local LLM for narration.
- [x] **AI-003**: Refine prompts for consistent, quality output.
- [x] **BE-005**: Implement the procedural map generation for the campaign.

## Sprint 4: Active Phase

- [ ] **BE-004**: Implement endpoints to handle active phase encounters and choices.
- [x] **FE-006**: Create the modal overlay for active encounters.
- [ ] **GM-003**: Implement the XP and level-up system.
- [ ] **GM-004**: Implement basic loot generation.
- [ ] **AI-002**: Implement the one-time Gemini Pro call for character creation.

## Sprint 5: Polish & Testing

- [ ] **FE-007**: Create the detailed character sheet component.
- [ ] **TEST-001**: Write unit tests for core backend logic.
- [ ] **TEST-002**: Write component and integration tests for the frontend.
- [ ] **TEST-003**: Write integration tests for the backend.
- [ ] **DEPLOY-001**: Set up the local development workflow.
- [ ] **DEPLOY-002**: Prepare for production deployment.
