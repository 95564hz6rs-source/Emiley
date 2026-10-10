/**
 * Firestore Security Rules Assertions Test File
 * Validates the 8 Pillars & Dirty Dozen security constraints
 */

export interface RulesTestCase {
  name: string;
  payload: Record<string, any>;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
}

export const dirtyDozenCases: RulesTestCase[] = [
  {
    name: 'Unauthenticated Read',
    payload: { path: '/users/user1/tasks/task1', auth: null },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Cross-User Read',
    payload: { path: '/users/userA/tasks/task1', auth: { uid: 'userB' } },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Spoofed Owner UID',
    payload: { path: '/users/victim/tasks/task1', auth: { uid: 'victim' }, data: { userId: 'attacker' } },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Oversized Title (>300 chars)',
    payload: { title: 'a'.repeat(301), completed: false, userId: 'user1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Ghost Field Injection',
    payload: { title: 'Clean', completed: false, userId: 'user1', shadowAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Invalid Non-Boolean Completion',
    payload: { title: 'Test', completed: 'yes', userId: 'user1' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Invalid Priority Value',
    payload: { title: 'Test', completed: false, userId: 'user1', priority: 'super_urgent' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Tampering with createdAt on update',
    payload: { createdAt: '1970-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Tampering with userId on update',
    payload: { userId: 'otherUser' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Forged Client Timestamp on create',
    payload: { createdAt: '2020-01-01' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'ID Traversal Malicious Path',
    payload: { taskId: '../../passwords' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: 'Cross-User Delete',
    payload: { path: '/users/userA/tasks/task1', auth: { uid: 'userB' } },
    expectedResult: 'PERMISSION_DENIED',
  },
];
