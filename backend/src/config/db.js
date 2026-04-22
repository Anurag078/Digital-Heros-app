import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Wrapper to maintain the same API as the previous MySQL query builder
const db = {
  from(table) {
    return {
      select: (columns = "*") => {
        let query = supabase.from(table).select(columns);
        
        // Add compatibility methods
        const builder = {
          eq: (col, val) => { query = query.eq(col, val); return builder; },
          single: () => { query = query.single(); return builder; },
          order: (col, { ascending = true } = {}) => { query = query.order(col, { ascending }); return builder; },
          limit: (val) => { query = query.limit(val); return builder; },
          then: (resolve, reject) => query.then(resolve, reject)
        };
        return builder;
      },
      insert: async (payload) => {
        return await supabase.from(table).insert(payload).select();
      },
      update: (payload) => {
        let query = supabase.from(table).update(payload);
        const builder = {
          eq: (col, val) => { query = query.eq(col, val); return builder; },
          then: (resolve, reject) => query.then(resolve, reject)
        };
        return builder;
      },
      delete: () => {
        let query = supabase.from(table).delete();
        const builder = {
          eq: (col, val) => { query = query.eq(col, val); return builder; },
          then: (resolve, reject) => query.then(resolve, reject)
        };
        return builder;
      }
    };
  }
};

console.log("Database: Using Supabase (PostgreSQL)");

// Test connection
supabase.from('users').select('id', { count: 'exact', head: true })
  .then(({ error }) => {
    if (error) {
      console.error("❌ Supabase connection failed:", error.message);
    } else {
      console.log("✅ Supabase connected successfully!");
    }
  });

export default db;
