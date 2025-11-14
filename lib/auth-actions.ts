'use server';

import { initializeDatabase } from './db';
import { getUserByUserId } from './utils-db';

export async function loginUser(userId: string, authCode: string) {
  try {
    // Initialize DB on first call
    initializeDatabase();

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, authCode }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.log('[v0] Login failed:', error);
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    console.log('[v0] Login successful for user:', userId);
    return data;
  } catch (error) {
    console.error('[v0] Login error:', error);
    throw error;
  }
}

export async function saveOnboarding(
  userId: string,
  updates: {
    nativeLanguage: string;
    targetLanguage: string;
    goal: string;
    bio: string;
  }
) {
  try {
    initializeDatabase();
    
    const user = getUserByUserId(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user in database
    const { updateUser } = await import('./utils-db');
    const updated = updateUser(userId, {
      ...user,
      ...updates,
    });

    if (!updated) {
      throw new Error('Failed to update user');
    }

    console.log('[v0] Onboarding saved for user:', userId);
    return updated;
  } catch (error) {
    console.error('[v0] Onboarding error:', error);
    throw error;
  }
}

export async function getUserInfo(userId: string) {
  try {
    initializeDatabase();
    
    const user = getUserByUserId(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('[v0] Get user error:', error);
    throw error;
  }
}
