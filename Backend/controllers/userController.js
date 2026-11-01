import User from "../models/User.js";
import { getFirebaseAuth } from "../config/firebase.js";

export const getAllUsers = async (req, res) => {
    try {
        const auth = getFirebaseAuth();

        const firebaseUsers = [];
        let nextPageToken;

        do {
            const result = await auth.listUsers(
                1000,
                nextPageToken
            );

            firebaseUsers.push(...result.users);
            nextPageToken = result.pageToken;
        } while (nextPageToken);

        const dbUsers = await User.find()
            .select("uid name email")
            .lean();

        const dbUserMap = new Map(
            dbUsers.map((user) => [user.uid, user])
        );

        const users = firebaseUsers.map((fbUser) => {
            const dbUser = dbUserMap.get(fbUser.uid);
            const claims = fbUser.customClaims || {};

            const role =
                claims.role ||
                (claims.admin
                    ? "admin"
                    : claims.stallOwner
                        ? "stallOwner"
                        : "user");

            return {
                uid: fbUser.uid,
                name: fbUser.displayName || dbUser?.name || "Unknown",
                email: fbUser.email || dbUser?.email,
                role,
                emailVerified: fbUser.emailVerified,
                photoURL: fbUser.photoURL,
                createdAt: fbUser.metadata.creationTime,
                lastSignIn: fbUser.metadata.lastSignInTime,
            };
        });

        users.sort(
            (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
        );

        return res.status(200).json({
            success: true,
            count: users.length,
            users,
        });
    } catch (error) {
        console.error("Failed to fetch users:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to fetch users.",
        });
    }
};
