# Hooks Directory

## useTravelStatus.ts (375 lines)

**Size Justification**: Slightly exceeds the 300-line guideline but under the 400-line threshold for refactoring.

**Cohesion Rationale**:
- Single responsibility: Manage travel session state and WebSocket communication
- Breaking into smaller modules would create unnecessary complexity:
  - WebSocket logic is tightly coupled with state management
  - API functions reference the same state and connection
  - Message handlers share state mutation logic

**Potential Refactoring** (if future growth occurs):
- Extract WebSocket connection management into separate hook
- Move API functions to separate service module
- Create custom hook composition pattern

**Current Status**: ✅ Acceptable - Cohesive, clear responsibility, under 400 lines
