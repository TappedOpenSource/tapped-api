import { Timestamp } from "firebase-admin/firestore";
import { ApiKey } from "../types/api_key";
import { db } from "../utils/firebase";
import { generateApiKey } from "generate-api-key";
import { UserModel } from "../types/user_model";

const apiKeysRef = db.collection("apiKeys");
const usersRef = db.collection("users");

export async function createApiKey(userId: string, options?: {
    save: boolean;
}): Promise<ApiKey> {
  const key = generateApiKey({ method: "base62", prefix: "test_app" });

  if (typeof key !== "string") {
    throw new Error("failed to generate API key");
  }

  const obj = {
    userId,
    key,
    timestamp: Timestamp.now(),
  };

  if (options?.save) {
    await saveUserApiKey(obj);
  } 

  return obj;
}

export async function getUserFromApiKey(apiKey: string): Promise<string | null> {
  const apiKeyQuery = await apiKeysRef.where("key", "==", apiKey).get();
  if (apiKeyQuery.empty) {
    return null;
  }

  const apiKeyDoc = apiKeyQuery.docs[0];
  return apiKeyDoc.get("userId") ?? null;
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {

  const apiKeyQuery = await apiKeysRef.where("userId", "==", userId).get();
  if (apiKeyQuery.empty) {
    return [];
  }

  return apiKeyQuery.docs.map((doc) => doc.data() as ApiKey);
}

export async function saveUserApiKey(apiKey: ApiKey) {
  await apiKeysRef
    .add(apiKey);
}

export async function getUserById(userId: string): Promise<UserModel | null> {
  const userDoc = await usersRef.doc(userId).get();
  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data() as UserModel;
}