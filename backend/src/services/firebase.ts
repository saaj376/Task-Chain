import { initializeApp, cert, getApp, getApps } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

let db: any = null

try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    const app = getApps().length === 0 ? initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    }) : getApp();

    db = getFirestore(app)
    console.log("✅ Firebase Admin initialized")
  } else {
    console.warn("⚠️ Firebase credentials missing in .env. Meet features will be disabled.")
  }
} catch (error: any) {
  console.error("❌ Failed to initialize Firebase Admin:", error.message)
}

export async function publishCallState(
  teamId: string,
  payload: {
    status: "requested" | "active" | "ended"
    requestedBy: string
    meetLink: string
    createdAt: number
    expiresAt: number
  }
) {
  if (!db) {
    console.warn("Skipping publishCallState (Firebase not init)")
    return
  }

  await db
    .collection("teams")
    .doc(teamId)
    .collection("meta")
    .doc("call")
    .set(payload)
}
