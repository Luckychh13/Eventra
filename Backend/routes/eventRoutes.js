import express from "express";
import {
    addEvent,
    getEvents,
    getEventById,
    editEvent,
    deleteEvent,
} from "../controllers/eventController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), addEvent);
router.get("/", getEvents);
router.get("/:id", getEventById);
router.put("/:id", upload.single("image"), editEvent);
router.delete("/:id", deleteEvent);

export default router;