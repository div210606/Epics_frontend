import mongoose from "mongoose";
import { BIN_TYPES, COLLECTION_STATUSES } from "../constants.js";

const collectionSchema = new mongoose.Schema(
  {
    // Human-friendly code, e.g. "C1"
    collectionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Real relational link to the Bin document
    bin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bin",
      required: true,
    },
    // Denormalized bin code so the frontend can display it without a join
    binId: {
      type: String,
      required: true,
    },
    block: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: BIN_TYPES,
    },
    weightKg: {
      type: Number,
      required: true,
      min: 0,
    },
    collectedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: COLLECTION_STATUSES,
      default: "completed",
    },
  },
  { timestamps: true },
);

collectionSchema.index({ bin: 1, collectedAt: -1 });
collectionSchema.index({ status: 1 });

export default mongoose.model("Collection", collectionSchema);
