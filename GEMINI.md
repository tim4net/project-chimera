# Project Chimera

## Project Overview

Project Chimera is a semi-idle RPG powered by an AI Dungeon Master. It features a hybrid AI architecture, combining a powerful cloud-based LLM (Gemini Pro) for creative tasks with a smaller, local LLM for routine actions. The game is designed to be played through a web-based frontend and a Discord bot, offering a dual interface for different types of interactions.

The project is built on a flexible architecture that supports both solo and multiplayer gameplay within a persistent, procedurally generated world. The database is powered by **Supabase**, a self-hosted, open-source Firebase alternative that provides a PostgreSQL database with restful APIs. Key features include a lore-driven portal system, a dual-model D&D 5e mechanics system, tiered NPC management, multi-vector character progression, and a layered quest generation system. The world is designed to evolve over time through an "Epoch System" that reflects the long-term impact of player actions.

## Development

This section provides links to important development-related documents.

- [TODO List](./TODO.md): The main TODO list for developers.
- [Coding Standards](./CODING_STANDARDS.md): Our coding standards and best practices.
- [Dependency Guidelines](./DEPENDENCY_GUIDELINES.md): Guidelines for managing dependencies.
- [Architecture Tasks](./ARCHITECTURE_TASKS.md): A detailed breakdown of all architecture and development tasks.
- [Task Workflow](./TASK_WORKFLOW.md): The AI-driven task workflow for completing tasks.


## Building and Running

The project is in its early stages, and there are no explicit build or run commands defined in the `package.json` file.

## Building and Running

The project is composed of a frontend and a backend.

### Frontend

To run the frontend in development mode:

```bash
cd frontend
npm install # Or pnpm install, yarn install
npm run dev
```

To build the frontend for production:

```bash
cd frontend
npm install # Or pnpm install, yarn install
npm run build
```

### Backend

To run the backend in development mode:

```bash
cd backend
npm install # Or pnpm install, yarn install (using the root package.json dependencies)
npm run dev
```

To start the backend in production mode:

```bash
cd backend
npm install # Or pnpm install, yarn install (using the root package.json dependencies)
npm run start
```

To run backend tests:

```bash
cd backend
npm install # Or pnpm install, yarn install (using the root package.json dependencies)
npm run test
```

**Note:** The backend currently relies on dependencies defined in the root `package.json`. Ensure you run `npm install` (or equivalent) in the `backend` directory to link these dependencies.

```
# TODO: Add build and run commands once they are defined.
```

## Development Conventions

The project's development is guided by a series of Architectural Decision Records (ADRs) that outline the design and implementation of key features. These ADRs serve as a set of development conventions and provide a clear blueprint for the project's architecture.

The core development principles are:

*   **Hybrid AI Model:** To ensure a cost-effective and responsive narrative experience.
*   **Dual Interface:** To provide a seamless flow between active and idle play.
*   **Flexible Campaign and Party Structure:** To support both solo and multiplayer experiences.
*   **Text-First, Map-Centric Design:** To prioritize the AI-generated narrative and provide a clear, intuitive user interface.
*   **World Evolution:** To create a dynamic and evolving world that reflects the long-term impact of player actions.
*   **Self-Hosted Supabase:** To maintain data ownership and control by running Supabase as a container within the project's infrastructure.