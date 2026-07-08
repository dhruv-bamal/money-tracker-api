import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool, types } = pg;

// Postgres NUMERIC (OID 1700) comes back as a string by default, to avoid
// precision loss on arbitrary-precision decimals. We know our amounts are
// small enough that a float is safe for display/summing, so we convert
// once, here, rather than remembering parseFloat() in every route.
types.setTypeParser(1700, (val) => parseFloat(val));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default pool;
