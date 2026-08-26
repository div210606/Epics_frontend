# EPICS Waste Monitoring — Backend

Express + MongoDB (Mongoose) API for the `Epics_frontend` smart waste bin project.
This replaces the frontend's mock `binService.js` / `collectionService.js`
(which currently read from static JSON files) with a real database and API.

## 1. Database design

Two collections, related by a real reference (not just a shared string):

### `bins`
| field         | type     | notes                                   |
|---------------|----------|------------------------------------------|
| `_id`         | ObjectId | Mongo's internal id                       |
| `binId`       | String   | Friendly code, e.g. `"B1"` (unique)       |
| `block`       | String   | enum: Block A / Block B / Block C         |
| `location`    | String   | e.g. "Main Entrance"                      |
| `type`        | String   | enum: wet / dry / recyclable              |
| `fillLevel`   | Number   | 0–100                                     |
| `lastEmptied` | Date     |                                            |
| `createdAt` / `updatedAt` | Date | auto timestamps                    |

### `collections` (waste pickup log)
| field          | type     | notes                                        |
|----------------|----------|-----------------------------------------------|
| `_id`          | ObjectId |                                                |
| `collectionId` | String   | Friendly code, e.g. `"C1"` (unique)            |
| `bin`          | ObjectId | **real reference** to `bins._id`              |
| `binId`        | String   | denormalized bin code for easy display         |
| `block`        | String   |                                                |
| `type`         | String   | enum: wet / dry / recyclable                  |
| `weightKg`     | Number   |                                                |
| `collectedAt`  | Date     |                                                |
| `status`       | String   | enum: completed / missed / pending            |
| `createdAt` / `updatedAt` | Date | auto timestamps                        |

**Why Mongo over a bin-array-in-memory:** `bin` is a proper foreign key
(`ObjectId` + `ref: "Bin"`), so you can `.populate("bin")` to join data,
while `binId` stays denormalized so the frontend doesn't need to change
how it reads bin codes. Indexes are added on `block+type` and
`bin+collectedAt` since those are the fields your dashboards filter/sort by.

If you'd rather use PostgreSQL/MySQL instead, this maps directly to two
tables with `collections.bin_id` as a foreign key to `bins.id` — ask me
and I'll generate the SQL DDL + a Sequelize/Prisma version instead.

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env        # then edit MONGO_URI if needed
```

You need MongoDB running locally, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster:
- **Local**: install MongoDB Community Server, it listens on `mongodb://127.0.0.1:27017` by default.
- **Atlas**: create a free cluster, get the connection string, paste it into `MONGO_URI` in `.env`.

Seed the database with your existing mock data:
```bash
npm run seed
```

Start the API:
```bash
npm run dev      # auto-restarts on changes
# or
npm start
```

Server runs at `http://localhost:5000`.

## 3. API endpoints

| Method | Path                              | Matches frontend function      |
|--------|------------------------------------|---------------------------------|
| GET    | `/api/bins`                       | `getBins()`                     |
| POST   | `/api/bins`                       | `addBin({block, location, type, fillLevel})` |
| PATCH  | `/api/bins/:binId/empty`          | `emptyBin(binId)`               |
| GET    | `/api/collections`                | `getCollections()`              |
| POST   | `/api/collections`                | `addCollection({binId, block, type, weightKg, status})` |
| POST   | `/api/collections/:binId/collect` | `markBinCollected(binId)` — empties the bin **and** logs a completed collection in one call |
| GET    | `/api/health`                     | health check                    |

## 4. Wiring up the frontend

In `frontend/src/services/binService.js` and `collectionService.js`, replace the
in-memory array logic with `axios` calls to these endpoints, e.g.:

```js
import axios from "axios";
const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function getBins() {
  const { data } = await axios.get(`${API}/bins`);
  return data;
}

export async function addBin(input) {
  const { data } = await axios.post(`${API}/bins`, input);
  return data;
}

export async function emptyBin(binId) {
  const { data } = await axios.patch(`${API}/bins/${binId}/empty`);
  return data;
}
```

Add a `.env` in `frontend/` with:
```
VITE_API_URL=http://localhost:5000/api
```

The function signatures and return shapes are already identical to your
mock services, so nothing else in the components/hooks needs to change.

## 5. Suggested next steps

1. Get this running locally against MongoDB, confirm `npm run seed` + `GET /api/bins` works (e.g. via Postman/Thunder Client or `curl`).
2. Swap the two frontend service files to call the API instead of the local JSON, as shown above.
3. Replace the frontend's `setInterval` random fill-level simulation (`useBinsData.js`) with either: (a) a real IoT/sensor endpoint that `PATCH`es `fillLevel`, or (b) a small cron/interval on the backend that updates Mongo directly, so all clients see the same live data.
4. If you need login/roles for the Monitoring vs Management dashboards, add a `users` collection (`{ name, email, passwordHash, role: "monitor" | "manager" }`) and JWT auth middleware — ask and I'll scaffold it.
5. Consider persisting alerts (currently computed on the fly in `AlertLog.jsx`) as their own `alerts` collection if you want alert history/acknowledgement tracking.
