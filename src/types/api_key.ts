import { Timestamp } from "firebase-admin/firestore";

export type ApiKey = {
    key: string;
    userId: string;
    timestamp: Timestamp;
};