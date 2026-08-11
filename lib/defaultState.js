// Starting data — matches the 5 teams you already drew, with their colours.
// Everything here is fully editable from /admin afterwards.

export const COLOR_SWATCHES = [
  { name: "Green", value: "#3fdc6f" },
  { name: "Orange", value: "#fd7e14" },
  { name: "Gold", value: "#f5b800" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Blue", value: "#38bdf8" },
  { name: "Pink", value: "#f472b6" },
  { name: "Red", value: "#ef4444" },
];

export function defaultState() {
  return {
    teams: [
      {
        id: "beano",
        name: "TEAM BEANO",
        color: "#3fdc6f",
        players: ["-", "-", "-", "-", "-", ""],
        form: [],
      },
      {
        id: "chazza",
        name: "TEAM CHAZZA",
        color: "#fd7e14",
        players: ["-", "-", "-", "-", "-", ""],
        form: [],
      },
      {
        id: "ginge",
        name: "TEAM GINGE",
        color: "#f5b800",
        players: ["-", "-", "-", "-", "-", ""],
        form: [],
      },
      {
        id: "jakey",
        name: "TEAM JAKEY",
        color: "#8b5cf6",
        players: ["-", "-", "-", "-", "-", ""],
        form: [],
      },
      {
        id: "tays",
        name: "TEAM TAYS",
        color: "#38bdf8",
        players: ["-", "-", "-", "-", "-", ""],
        form: [],
      },
    ],
    updatedAt: Date.now(),
  };
}
