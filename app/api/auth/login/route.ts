import { NextRequest, NextResponse } from 'next/server';
import { TEST_ACCOUNTS } from '@/lib/constants';
import { getUserByUserId, getPlanByUserId } from "@/lib/utils-db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { userId, authCode } = await request.json();

    if (!userId || !authCode) {
      return NextResponse.json(
        { error: "Missing userId or authCode" },
        { status: 400 }
      );
    }

    // Verify credentials
    const account = TEST_ACCOUNTS.find(
      (acc) => acc.userId === userId && acc.authCode === authCode
    );

    if (!account) {
      console.log("[v0] Invalid credentials for user:", userId);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Get or create user
    let user = getUserByUserId(userId);

    if (!user) {
      console.log(
        "[v0] User not found in database, but credentials valid. Creating..."
      );
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const hasLearningPlan = !!getPlanByUserId(userId);

    // Create session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    console.log(
      "[v0] Successful login for user:",
      userId,
      "hasLearningPlan:",
      hasLearningPlan
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        userId: user.userId,
        name: user.name,
        nativeLanguage: user.nativeLanguage,
        targetLanguage: user.targetLanguage,
        hasLearningPlan,
      },
      token,
      expiresAt,
    });
  } catch (error) {
    console.error("[v0] Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
