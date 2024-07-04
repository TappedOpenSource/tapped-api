import { Timestamp } from "firebase-admin/firestore";
import { generateApiKey } from "generate-api-key";
import { ApiKey } from "../types/api_key";
import { Booking } from "../types/booking";
import { Review } from "../types/review";
import { UserModel } from "../types/user_model";
import { db } from "../utils/firebase";

const apiKeysRef = db.collection("apiKeys");
const usersRef = db.collection("users");
const bookingsRef = db.collection("bookings");
const reviewsRef = db.collection("reviews");

export async function createApiKey(
  userId: string,
  options?: {
    save: boolean;
  },
): Promise<ApiKey> {
  const key = generateApiKey({ method: "base62", prefix: "tapped" });

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

export async function getUserFromApiKey(
  apiKey: string,
): Promise<string | null> {
  const apiKeySnap = await apiKeysRef.doc(apiKey).get();
  if (!apiKeySnap.exists) {
    return null;
  }

  const apiKeyDoc = apiKeySnap.data() as ApiKey;
  return apiKeyDoc.userId;
}

export async function getUserApiKeys(userId: string): Promise<ApiKey[]> {
  const apiKeyQuery = await apiKeysRef.where("userId", "==", userId).get();
  if (apiKeyQuery.empty) {
    return [];
  }

  return apiKeyQuery.docs.map((doc) => doc.data() as ApiKey);
}

export async function saveUserApiKey(apiKey: ApiKey) {
  await apiKeysRef.doc(apiKey.key).set(apiKey);
}

export async function getUserById(userId: string): Promise<UserModel | null> {
  const userDoc = await usersRef.doc(userId).get();
  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data() as UserModel;
}

export async function getUserByUsername(
  username: string,
): Promise<UserModel | null> {
  const userQuery = await usersRef.where("username", "==", username).get();
  if (userQuery.empty) {
    return null;
  }

  const userDoc = userQuery.docs[0];
  return userDoc.data() as UserModel;
}

export async function getBookingsByRequesteeId(
  requesteeId: string,
): Promise<Booking[]> {
  const bookingQuery = await bookingsRef
    .where("requesteeId", "==", requesteeId)
    .where("status", "==", "confirmed")
    .get();

  if (bookingQuery.empty) {
    return [];
  }

  return bookingQuery.docs.map((doc) => doc.data() as Booking);
}

export async function getBookingsByRequesterId(
  requesterId: string,
): Promise<Booking[]> {
  const bookingQuery = await bookingsRef
    .where("requesterId", "==", requesterId)
    .where("status", "==", "confirmed")
    .get();

  if (bookingQuery.empty) {
    return [];
  }

  return bookingQuery.docs.map((doc) => doc.data() as Booking);
}

export async function getPerformerReviewsByUserId(
  userId: string,
): Promise<Review[]> {
  const reviewQuery = await reviewsRef
    .where("performerId", "==", userId)
    .where("type", "==", "performer")
    .get();

  if (reviewQuery.empty) {
    return [];
  }

  return reviewQuery.docs.map((doc) => doc.data() as Review);
}

export async function getBookerReviewsByUserId(
  userId: string,
): Promise<Review[]> {
  const reviewQuery = await reviewsRef
    .where("bookerId", "==", userId)
    .where("type", "==", "booker")
    .get();

  if (reviewQuery.empty) {
    return [];
  }

  return reviewQuery.docs.map((doc) => doc.data() as Review);
}
