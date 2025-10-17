# Coding Standards and Best Practices

This document outlines the coding standards and best practices to be followed in Project Chimera. Our goal is to write clean, maintainable, and robust code.

## Guiding Principles

- **Clean Code**: We follow the principles of Clean Code as described by Robert C. Martin. Code should be readable, simple, and expressive.
- **Test-Driven Development (TDD)**: We practice TDD. This means writing tests before writing the implementation code. The cycle is Red-Green-Refactor.
- **Single Responsibility Principle (SRP)**: Each module, class, or function should have one and only one reason to change.
- **Don't Repeat Yourself (DRY)**: Avoid duplicating code. Use abstraction to reuse common logic.
- **Keep It Simple, Stupid (KISS)**: Prefer simple solutions over complex ones.

## Test-Driven Development (TDD) Workflow

1.  **Write a Failing Test (Red)**: Before writing any implementation code, write a test that describes the desired functionality. This test should fail because the functionality doesn't exist yet.
2.  **Write the Simplest Code to Pass the Test (Green)**: Write the minimum amount of code required to make the test pass. Don't worry about optimization or clean code at this stage.
3.  **Refactor**: Now that the test is passing, refactor the code to improve its design, readability, and performance. Ensure that the tests still pass after refactoring.

## Code Style

- **Formatting**: We use Prettier for automatic code formatting. This ensures a consistent code style across the project.
- **Naming**: Use descriptive and meaningful names for variables, functions, and classes. Avoid abbreviations and single-letter names (except for loop counters).
- **Comments**: Write comments to explain *why* something is done, not *what* is being done. Good code should be self-documenting.

## Backend (Node.js/TypeScript)

- **Framework**: We use Express.js for building our REST API.
- **Language**: We use TypeScript to benefit from static typing.
- **Testing**: We use Jest for unit and integration testing, and Supertest for API endpoint testing.
- **Error Handling**: Use a centralized error handling middleware to handle errors consistently.

## Frontend (React/TypeScript)

- **Framework**: We use React with TypeScript.
- **Component Structure**: Follow a clear and consistent component structure. Prefer functional components with Hooks.
- **State Management**: Use React Context or Zustand for state management.
- **Styling**: We use Tailwind CSS for styling.

## Git Workflow

- **Branching**: Create a new branch for each new feature or bug fix.
- **Commits**: Write clear and concise commit messages. Follow the Conventional Commits specification.
- **Pull Requests**: All code must be reviewed and approved via a pull request before being merged into the main branch.
