import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import cloudinary, {
  configureCloudinary,
  hasCloudinaryConfig,
} from "../config/cloudinary.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateParticipantId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw createError("Invalid participant ID", 400);
  }
};

const uploadParticipantPhoto = async (file) => {
  if (!hasCloudinaryConfig()) {
    throw createError(
      "Image uploads are not configured.",
      503
    );
  }

  configureCloudinary();

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "participants",
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);

        if (!result?.secure_url) {
          return reject(
            new Error("Cloudinary did not return an image URL.")
          );
        }

        resolve(result.secure_url);
      }
    );

    stream.end(file.buffer);
  });
};

export const listParticipants = async (req, res, next) => {
  try {
    const participants = await Participant.find().sort({
      votes: -1,
      name: 1,
    });

    return res.status(200).json({ participants });
  } catch (error) {
    return next(error);
  }
};

export const createParticipant = async (req, res, next) => {
  try {
    const name =
      typeof req.body.name === "string"
        ? req.body.name.trim()
        : "";

    const tagNumber =
      typeof req.body.tagNumber === "string"
        ? req.body.tagNumber.trim()
        : "";

    const details =
      typeof req.body.details === "string"
        ? req.body.details.trim()
        : "";

    if (!name || !tagNumber) {
      throw createError(
        "name and tagNumber are required.",
        400
      );
    }

    const existingParticipant = await Participant.findOne({
      tagNumber,
    });

    if (existingParticipant) {
      throw createError(
        "A participant with this tag number already exists.",
        409
      );
    }

    const photoUrl = req.file
      ? await uploadParticipantPhoto(req.file)
      : null;

    const participant = await Participant.create({
      name,
      tagNumber,
      details,
      photoUrl,
    });

    return res.status(200).json({ participant });
  } catch (error) {
    return next(error);
  }
};

export const editParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateParticipantId(id);

    const participant = await Participant.findById(id);

    if (!participant) {
      throw createError("Participant not found.", 404);
    }

    for (const field of ["name", "tagNumber", "details"]) {
      if (req.body[field] === undefined) continue;

      if (typeof req.body[field] !== "string") {
        throw createError(`${field} must be a string.`, 400);
      }

      const value = req.body[field].trim();

      if (field !== "details" && !value) {
        throw createError(`${field} cannot be empty.`, 400);
      }

      participant[field] = value;
    }

    const duplicateParticipant = await Participant.findOne({
      tagNumber: participant.tagNumber,
      _id: { $ne: participant._id },
    });

    if (duplicateParticipant) {
      throw createError(
        "A participant with this tag number already exists.",
        409
      );
    }

    if (req.file) {
      participant.photoUrl = await uploadParticipantPhoto(
        req.file
      );
    }

    await participant.save();

    return res.status(200).json({ participant });
  } catch (error) {
    return next(error);
  }
};

export const deleteParticipant = async (req, res, next) => {
  try {
    const { id } = req.params;

    validateParticipantId(id);

    const participant = await Participant.findByIdAndDelete(id);

    if (!participant) {
      throw createError("Participant not found.", 404);
    }

    return res.status(200).json({ message: "Deleted" });
  } catch (error) {
    return next(error);
  }
};