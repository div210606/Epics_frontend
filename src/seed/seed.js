// Seeds MongoDB with the same data your frontend was using from
// frontend/src/data/bins.json and collections.json, so the switch
// from mock services to a real API is seamless.
//
// Usage: npm run seed

import "dotenv/config";
import { connectDB } from "../config/db.js";
import Bin from "../models/Bin.js";
import Collection from "../models/Collection.js";
import mongoose from "mongoose";

const bins = [
  { id: "B1", block: "Block A", location: "Main Entrance", fillLevel: 92, type: "wet", lastEmptied: "2026-08-18" },
  { id: "B2", block: "Block A", location: "Canteen", fillLevel: 67, type: "dry", lastEmptied: "2026-08-20" },
  { id: "B3", block: "Block A", location: "Library Corridor", fillLevel: 34, type: "recyclable", lastEmptied: "2026-08-21" },
  { id: "B4", block: "Block B", location: "Lab Wing", fillLevel: 88, type: "wet", lastEmptied: "2026-08-17" },
  { id: "B5", block: "Block B", location: "Parking Area", fillLevel: 55, type: "dry", lastEmptied: "2026-08-19" },
  { id: "B6", block: "Block B", location: "Sports Complex", fillLevel: 22, type: "recyclable", lastEmptied: "2026-08-21" },
  { id: "B7", block: "Block C", location: "Admin Building", fillLevel: 95, type: "wet", lastEmptied: "2026-08-16" },
  { id: "B8", block: "Block C", location: "Hostel Block", fillLevel: 48, type: "dry", lastEmptied: "2026-08-20" },
  { id: "B9", block: "Block C", location: "Auditorium", fillLevel: 73, type: "recyclable", lastEmptied: "2026-08-19" },
];

const collections = [
  { id: "C1", binId: "B1", block: "Block A", collectedAt: "2026-08-21T09:30:00", weightKg: 12.5, type: "wet", status: "completed" },
  { id: "C2", binId: "B2", block: "Block A", collectedAt: "2026-08-21T10:15:00", weightKg: 8.2, type: "dry", status: "completed" },
  { id: "C3", binId: "B3", block: "Block A", collectedAt: "2026-08-21T11:00:00", weightKg: 5.4, type: "recyclable", status: "completed" },
  { id: "C4", binId: "B4", block: "Block B", collectedAt: "2026-08-21T09:45:00", weightKg: 14.1, type: "wet", status: "missed" },
  { id: "C5", binId: "B5", block: "Block B", collectedAt: "2026-08-21T10:30:00", weightKg: 9.8, type: "dry", status: "completed" },
  { id: "C6", binId: "B6", block: "Block B", collectedAt: "2026-08-22T09:20:00", weightKg: 6.7, type: "recyclable", status: "pending" },
  { id: "C7", binId: "B7", block: "Block C", collectedAt: "2026-08-22T10:00:00", weightKg: 11.3, type: "wet", status: "completed" },
  { id: "C8", binId: "B8", block: "Block C", collectedAt: "2026-08-22T10:45:00", weightKg: 7.9, type: "dry", status: "completed" },
  { id: "C9", binId: "B9", block: "Block C", collectedAt: "2026-08-22T11:30:00", weightKg: 4.2, type: "recyclable", status: "missed" },
  { id: "C10", binId: "B1", block: "Block A", collectedAt: "2026-08-22T14:00:00", weightKg: 13.6, type: "wet", status: "completed" },
  { id: "C11", binId: "B4", block: "Block B", collectedAt: "2026-08-23T09:15:00", weightKg: 10.5, type: "wet", status: "pending" },
  { id: "C12", binId: "B7", block: "Block C", collectedAt: "2026-08-23T10:00:00", weightKg: 8.8, type: "dry", status: "completed" },
];

async function seed() {
  await connectDB();

  await Bin.deleteMany({});
  await Collection.deleteMany({});

  const binDocs = await Bin.insertMany(
    bins.map((b) => ({
      binId: b.id,
      block: b.block,
      location: b.location,
      type: b.type,
      fillLevel: b.fillLevel,
      lastEmptied: new Date(b.lastEmptied),
    })),
  );

  const binIdMap = new Map(binDocs.map((b) => [b.binId, b._id]));

  await Collection.insertMany(
    collections.map((c) => ({
      collectionId: c.id,
      bin: binIdMap.get(c.binId),
      binId: c.binId,
      block: c.block,
      type: c.type,
      weightKg: c.weightKg,
      collectedAt: new Date(c.collectedAt),
      status: c.status,
    })),
  );

  console.log(`Seeded ${binDocs.length} bins and ${collections.length} collections.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
