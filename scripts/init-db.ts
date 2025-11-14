import { createSchema } from '../lib/db';
import { createUser } from '../lib/utils-db';
import { TEST_ACCOUNTS } from '../lib/constants';

export function initializeDatabase() {
  console.log('[v0] Initializing database...');
  
  // Create schema
  createSchema();

  // Seed test accounts
  TEST_ACCOUNTS.forEach((account) => {
    try {
      createUser({
        userId: account.userId,
        name: account.name,
        nativeLanguage: 'English',
        targetLanguage: 'Spanish',
        goal: 'Achieve conversational fluency for travel and business',
        bio: 'Professional interested in Spanish language learning',
      });
      console.log(`[v0] Created test user: ${account.userId}`);
    } catch (error) {
      console.log(`[v0] User ${account.userId} already exists`);
    }
  });

  console.log('[v0] Database initialization complete');
}

// Run on module import if in Node.js environment
if (typeof window === 'undefined') {
  initializeDatabase();
}
