export async function getAgoraToken(
  channel: string,
  uid?: number
): Promise<string> {
  try {
    const response = await fetch("/api/agora/generate-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel, uid: uid || 0 }),
    });

    if (!response.ok) {
      throw new Error("Failed to get Agora token");
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error("[v0] Error getting Agora token:", error);
    throw error;
  }
}
