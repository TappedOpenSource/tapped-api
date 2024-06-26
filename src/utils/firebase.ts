/* eslint @typescript-eslint/no-var-requires: 0 */
import { configDotenv } from "dotenv";
import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getStorage } from "firebase-admin/storage";
import { tlogger } from "./logger";
configDotenv({
  path: ".env",
});

const production = process.env.NODE_ENV === "production";

const credentialPath =
  process.env["GOOGLE_CREDENTIALS_PATH"] ?? "../crednetials.json";
const credential = production
  ? applicationDefault()
  : cert(require(credentialPath));

const app = initializeApp({
  projectId: "in-the-loop-306520",
  credential,
});
const auth = getAuth(app);
const db = getFirestore(app);
const fcm = getMessaging(app);
const storage = getStorage(app);

export const projectId = app.options.projectId;
export const bucket = storage.bucket(`${projectId}.appspot.com`);

export const openaiApiKey = process.env["OPENAI_API_KEY"] ?? "";
export const slackWebhookUrl = process.env["SLACK_WEBHOOK_URL"] ?? "";
export const googlePlacesApiKey = process.env["GOOGLE_PLACES_API_KEY"] ?? "";
export const ALGOLIA_APPLICATION_ID =
  process.env["ALGOLIA_APPLICATION_ID"] ?? "";
export const ALGOLIA_API_KEY = process.env["ALGOLIA_API_KEY"] ?? "";
export const ALGOLIA_USER_INDEX = process.env["ALGOLIA_USER_INDEX"] ?? "";

if (
  ALGOLIA_APPLICATION_ID === "" ||
  ALGOLIA_API_KEY === "" ||
  ALGOLIA_USER_INDEX === ""
) {
  tlogger.error(
    "ALGOLIA_APPLICATION_ID, ALGOLIA_API_KEY, ALGOLIA_USER_INDEX must be set",
  );
  process.exit(1);
}

export { auth, db, fcm, storage };
