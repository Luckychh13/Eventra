import { getFirebaseAuth } from "../config/firebase.js";

export const makeAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                error: "Email is required.",
            });
        }

        const auth = getFirebaseAuth();

        let user;

        try {
            user = await auth.getUserByEmail(email.trim());
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                return res.status(404).json({
                    error: "User not found.",
                });
            }

            throw error;
        }

        const existingClaims = user.customClaims || {};

        const previousRole =
            existingClaims.role && existingClaims.role !== "admin"
                ? existingClaims.role
                : existingClaims.eventraPreviousRole ||
                (existingClaims.stallOwner ? "stallOwner" : "user");

        await auth.setCustomUserClaims(user.uid, {
            ...existingClaims,
            eventraPreviousRole: previousRole,
            role: "admin",
        });

        return res.status(200).json({
            success: true,
            message: `Admin role successfully granted to ${email}.`,
        });
    } catch (error) {
        console.error("Failed to make user admin:", error);

        return res.status(500).json({
            error: "Failed to make user admin.",
        });
    }
};

export const getAdmins = async (req, res) => {
    try {
        const auth = getFirebaseAuth();

        const admins = [];
        let nextPageToken;

        do {
            const result = await auth.listUsers(
                1000,
                nextPageToken
            );

            result.users.forEach((user) => {
                const claims = user.customClaims || {};

                if (
                    claims.role === "admin" ||
                    claims.admin === true
                ) {
                    admins.push({
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || "",
                    });
                }
            });

            nextPageToken = result.pageToken;
        } while (nextPageToken);

        return res.status(200).json({
            admins,
        });
    } catch (error) {
        console.error("Failed to fetch admins:", error);

        return res.status(500).json({
            error: "Failed to fetch administrators.",
        });
    }
};

export const removeAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        if (typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                error: "Email is required.",
            });
        }

        const auth = getFirebaseAuth();

        let user;

        try {
            user = await auth.getUserByEmail(email.trim());
        } catch (error) {
            if (error.code === "auth/user-not-found") {
                return res.status(404).json({
                    error: "User not found.",
                });
            }

            throw error;
        }

        const existingClaims = user.customClaims || {};

        const updatedClaims = {
            ...existingClaims,
            role:
                existingClaims.eventraPreviousRole ||
                (existingClaims.stallOwner ? "stallOwner" : "user"),
        };

        delete updatedClaims.eventraPreviousRole;
        delete updatedClaims.admin;

        await auth.setCustomUserClaims(
            user.uid,
            updatedClaims
        );

        return res.status(200).json({
            success: true,
            message: `Admin access removed from ${email}.`,
        });
    } catch (error) {
        console.error("Failed to remove admin:", error);

        return res.status(500).json({
            error: "Failed to remove admin access.",
        });
    }
};