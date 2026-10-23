import "dotenv/config";
import { getFirebaseAuth } from "../config/firebase.js";

const email = process.argv[2]?.trim();

if (!email) {
  console.error(
    'Usage: node scripts/grantAdmin.js "user@example.com"'
  );
  process.exitCode = 1;
} else {
  try {
    const auth = getFirebaseAuth();

    const user = await auth.getUserByEmail(email);

    const existingClaims = user.customClaims ?? {};

    await auth.setCustomUserClaims(user.uid, {
      ...existingClaims,
      role: "admin",
    });

    console.log(`Admin role granted to ${email}.`);
  } catch (error) {
    console.error(
      `Failed to grant admin role: ${error.message}`
    );
    process.exitCode = 1;
  }
}
