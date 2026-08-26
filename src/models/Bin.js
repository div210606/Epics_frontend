import mongoose from "mongoose";
import { CAMPUS_BLOCKS, BIN_TYPES } from "../constants.js";

const binSchema = new mongoose.Schema(
  {
    // Human-friendly code the frontend already uses, e.g. "B1"
    binId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    block: {
      type: String,
      required: true,
      enum: CAMPUS_BLOCKS,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: BIN_TYPES,
    },
    fillLevel: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    lastEmptied: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

binSchema.index({ block: 1, type: 1 });

export default mongoose.model("Bin", binSchema);
