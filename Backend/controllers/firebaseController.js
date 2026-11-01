import { getFirebaseAuth } from "../config/firebase.js";

export const getFirebaseUsers = async (req, res) => {
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

        const dailyCountMap = new Map();

        firebaseUsers.forEach((user) => {
            const creationTime = user.metadata.creationTime;

            if (!creationTime) {
                return;
            }

            const date = new Date(creationTime)
                .toISOString()
                .split("T")[0];

            dailyCountMap.set(
                date,
                (dailyCountMap.get(date) || 0) + 1
            );
        });

        const dailyData = Array.from(
            dailyCountMap,
            ([date, users]) => ({
                date,
                users,
            })
        )
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-10);

        return res.status(200).json({
            success: true,
            totalUsers: firebaseUsers.length,
            dailyData,
        });
    } catch (error) {
        console.error("Firebase user statistics error:", error);

        return res.status(500).json({
            success: false,
            error: "Failed to fetch Firebase user statistics.",
        });
    }
};