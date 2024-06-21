import { getUserFromApiKey } from "./database";

export async function verifyApiKey(apiKey: string): Promise<{
  verified: boolean;
  userId?: string;
}> {
  try {
    const userId = await getUserFromApiKey(apiKey);
    if (!userId) {
      return {
        verified: false,
      };
    }

    return {
      verified: true,
      userId,
    };
  } catch (e) {
    console.error(e);
    return {
      verified: false,
    };
  }
}