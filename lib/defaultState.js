// Starting data — matches the 5 teams you already drew, with their colours.
// Everything here is fully editable from /admin afterwards.

export const COLOR_SWATCHES = [
  { name: "Mint", value: "#96f2d7" },
  { name: "Orange", value: "#fd7e14" },
  { name: "Peach", value: "#ffd8a8" },
  { name: "Purple", value: "#d0bfff" },
  { name: "Blue", value: "#a5d8ff" },
  { name: "Pink", value: "#fcc2d7" },
  { name: "Yellow", value: "#ffec99" },
];

export function defaultState() {
  return {
    teams: [
      {
        id: "beano",
        name: "TEAM BEANO",
        color: "#84ec84",
        players: ["-", "-", "-", "-", "-"],
        form: [],
      },
      {
        id: "chazza",
        name: "TEAM CHAZZA",
        color: "#c4521d",
        players: ["-", "-", "-", "-", "-"],
        form: [],
      },
      {
        id: "ginge",
        name: "TEAM GINGE",
        color: "#d8a707",
        players: ["-", "-", "-", "-", "-"],
        form: [],
      },
      {
        id: "jakey",
        name: "TEAM JAKEY",
        color: "#9069fc",
        players: ["-", "-", "-", "-", "-"],
        form: [],
      },
      {
        id: "tays",
        name: "TEAM TAYS",
        color: "#69bdfd",
        players: ["-", "-", "-", "-", "-"],
        form: [],
      },
    ],
    updatedAt: Date.now(),
  };
}
