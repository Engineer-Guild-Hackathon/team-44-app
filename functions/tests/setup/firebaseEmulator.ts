import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';

// Firebase Test Environment
let testEnv: RulesTestEnvironment;

export const setupFirebaseTestEnvironment = async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'test-project',
    firestore: {
      rules: `
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /{document=**} {
              allow read, write: if true;
            }
          }
        }
      `,
    },
    auth: {
      uid: 'test-user',
      email: 'test@example.com',
    },
  });

  return testEnv;
};

export const cleanupFirebaseTestEnvironment = async () => {
  if (testEnv) {
    await testEnv.cleanup();
  }
};

export const getTestFirestore = () => {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  return testEnv.unauthenticatedContext().firestore();
};

export const getAuthenticatedFirestore = (uid: string = 'test-user') => {
  if (!testEnv) {
    throw new Error('Test environment not initialized');
  }
  return testEnv.authenticatedContext(uid).firestore();
};