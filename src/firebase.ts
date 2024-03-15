import * as admin from "firebase-admin";

const serviceAccount = require("../serviceAccountKey.json");

// Initialize the Firebase Admin SDK
const adminApp = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log("[database]: connected to firestore");

// Get a reference to the Firestore service
export const db = adminApp.firestore();

export default adminApp;
