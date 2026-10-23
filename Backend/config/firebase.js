import {
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";

import { getAuth } from "firebase-admin/auth";

export const getFirebaseAuth = () => {
  const existingApp = getApps().find(
    (app) => app.name === "[DEFAULT]"
  );

  if (existingApp) {
    return getAuth(existingApp);
  }

  const rawServiceAccount =
    process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!rawServiceAccount?.trim()) {
    const error = new Error(
      "Firebase authentication is not configured."
    );

    error.code = "EVENTRA_FIREBASE_NOT_CONFIGURED";
    throw error;
  }

  let serviceAccount;

  try {
    serviceAccount = JSON.parse(rawServiceAccount);
  } catch {
    const error = new Error(
      "FIREBASE_SERVICE_ACCOUNT must contain valid JSON."
    );

    error.code = "EVENTRA_FIREBASE_INVALID_CONFIG";
    throw error;
  }

  const { project_id, client_email, private_key } =
    serviceAccount;

  if (!project_id || !client_email || !private_key) {
    const error = new Error(
      "Firebase service-account configuration is incomplete."
    );

    error.code = "EVENTRA_FIREBASE_INVALID_CONFIG";
    throw error;
  }

  const app = initializeApp({
    credential: cert({
      projectId: project_id,
      clientEmail: client_email,
      privateKey: private_key.replace(/\\n/g, "\n"),
    }),
  });

  return getAuth(app);
};

export const verifyFirebaseIdToken = (idToken) => {
  return getFirebaseAuth().verifyIdToken(idToken);
};
