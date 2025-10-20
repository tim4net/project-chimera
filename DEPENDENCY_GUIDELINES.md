# Dependency Guidelines

This document outlines the guidelines for managing dependencies in Nuaibria. Our goal is to use dependencies that are secure, well-maintained, and free of major issues.

## Vetting New Dependencies

Before adding a new dependency, it must be vetted against the following criteria:

1.  **Security**: The package must not have any known critical vulnerabilities. Use `npm audit` and [Snyk](https://snyk.io/) to check for vulnerabilities.
2.  **Maintenance**: The package should be actively maintained. Check the package's npm page and GitHub repository for:
    -   Recent releases and commits.
    -   Open issues and pull requests.
    -   The number of maintainers.
3.  **Popularity and Community**: A popular package with a large community is more likely to be well-maintained and have support.
4.  **Memory Leaks and Performance**: Research any known memory leaks or performance issues. For critical dependencies, consider doing a performance analysis.

## Tools for Dependency Management

We will use the following tools to manage our dependencies:

-   **`npm audit`**: To scan for known security vulnerabilities. This is run automatically on `npm install`.
-   **[Snyk](https://snyk.io/)**: For a more in-depth security analysis. We will integrate Snyk into our CI/CD pipeline.
-   **`npm outdated`**: To check for outdated packages.
-   **`npm-check-updates`**: To help upgrade dependencies to their latest versions.
-   **`depcheck`**: To identify and remove unused dependencies.
-   **Node.js Inspector & Chrome DevTools**: To profile and identify memory leaks in Node.js applications. For critical backend dependencies, a memory usage analysis should be performed.

## Updating Dependencies

-   Dependencies should be updated regularly to get the latest security patches and bug fixes.
-   When updating dependencies, use `npm-check-updates` to identify the latest versions and then run the test suite to ensure that the updates don't introduce breaking changes.
