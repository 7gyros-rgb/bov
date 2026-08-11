import { defaultState } from "./defaultState";

const STATE_KEY = "scoreboard:state";

// Works with either the Vercel Marketplace "Upstash Redis" naming or the
// legacy Vercel KV naming — whichever the integration injected.
const REDIS_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const kvConfigured = !!(REDIS_URL && REDIS_TOKEN);

// In-memory fallback so `next dev` works instantly with zero setup.
// NOTE: this does NOT persist across serverless invocations in production —
// once deployed, connect a Redis store (see README) or edits made on one
// request may not be visible on the next.
let memoryState = null;
let redisClient = null;

async function getKv() {
  if (!redisClient) {
    const { Redis } = await import("@upstash/redis");
    redisClient = new Redis({ url: REDIS_URL, token: REDIS_TOKEN });
  }
  return redisClient;
}

export async function readState() {
  if (kvConfigured) {
    const kv = await getKv();
    const state = await kv.get(STATE_KEY);
    if (state) return state;
    const initial = defaultState();
    await kv.set(STATE_KEY, initial);
    return initial;
  }
  if (!memoryState) memoryState = defaultState();
  return memoryState;
}

export async function writeState(state) {
  const next = { ...state, updatedAt: Date.now() };
  if (kvConfigured) {
    const kv = await getKv();
    await kv.set(STATE_KEY, next);
    return next;
  }
  memoryState = next;
  return next;
}

export function isKvConfigured() {
  return kvConfigured;
}
