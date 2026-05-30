import type { Abi } from "viem";

export const MOOD_BATTLE_ADDRESS =
  "0xe56f9079042F7c17B40e043E790D459C28B9c9f7" as const;

export const MOODS = [
  {
    name: "Happy",
    emoji: "😄",
    color: "#ffd84d",
    accent: "#ff7a59",
    line: "Bright energy for quick wins.",
  },
  {
    name: "Angry",
    emoji: "😡",
    color: "#ff5f57",
    accent: "#7c2d12",
    line: "Heat that pushes the front.",
  },
  {
    name: "Calm",
    emoji: "😌",
    color: "#6ee7b7",
    accent: "#0f766e",
    line: "Steady power with clean focus.",
  },
  {
    name: "Chaos",
    emoji: "🤪",
    color: "#a78bfa",
    accent: "#ec4899",
    line: "Wild signals that change the map.",
  },
  {
    name: "Hope",
    emoji: "🥹",
    color: "#60a5fa",
    accent: "#16a34a",
    line: "Forward motion for the whole side.",
  },
] as const;

export type MoodName = (typeof MOODS)[number]["name"];

export const moodBattleAbi = [
  {
    type: "function",
    name: "setMood",
    stateMutability: "nonpayable",
    inputs: [{ name: "mood", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "releaseMood",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "boostMood",
    stateMutability: "nonpayable",
    inputs: [{ name: "mood", type: "string" }],
    outputs: [],
  },
  {
    type: "function",
    name: "resetMood",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "getMoodPower",
    stateMutability: "view",
    inputs: [{ name: "mood", type: "string" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getMyMood",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "actionCount",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const satisfies Abi;
