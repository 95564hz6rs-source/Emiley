# Security Specification for Task Database

## 1. Data Invariants
1. Each task belongs strictly to the authenticated user under `/users/{userId}/tasks/{taskId}`.
2. A user can only read, create, update, and delete tasks in their own path (`request.auth.uid == userId`).
3. The `userId` in the document payload must match `request.auth.uid`.
4. Document fields must strictly adhere to allowed keys: `title`, `completed`, `userId`, `createdAt`, `updatedAt`, and optional `category`, `priority`.
5. `title` must be a non-empty string with maximum length of 300 characters.
6. `completed` must be a boolean.
7. `createdAt` must match `request.time` on create and remain immutable on update.
8. `updatedAt` must match `request.time` on update.
9. `priority` if provided must be one of `['low', 'medium', 'high']`.
10. `category` if provided must be a string <= 50 characters.

## 2. Dirty Dozen Test Payloads
1. **Unauthenticated Read**: Attempting to read tasks without auth.
2. **Cross-User Read**: User B reading tasks at `/users/userA/tasks/task1`.
3. **Spoofed Owner UID**: Creating a task with `userId: "attacker"` under `/users/victim/tasks/task1`.
4. **Oversized Title Attack**: Title containing a 100,000 character buffer.
5. **Ghost Field Injection**: Adding `{ maliciousAdminField: true }` in task creation.
6. **Negative / Non-Boolean Completion**: `{ completed: "finished" }`.
7. **Invalid Priority Value**: `{ priority: "urgent_critical_override" }`.
8. **Tampering with `createdAt`**: Updating a task while changing `createdAt` to arbitrary timestamp.
9. **Tampering with `userId`**: Updating a task and shifting `userId` to another user.
10. **Forged Client Timestamp**: Sending arbitrary client time for `createdAt` instead of `request.time`.
11. **ID Traversal Poisoning**: Malformed or oversized taskId path variables.
12. **Cross-User Delete**: User B attempting to delete `/users/userA/tasks/task1`.

## 3. Test Runner
Included in `firestore.rules.test.ts`.
