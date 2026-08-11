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
        color: "#96f2d7",
        players: ["BROBBEY", "BALLARD", "XHAKA", "SADIKI", "TALBI"],
        form: [],
      },
      {
        id: "chazza",
        name: "TEAM CHAZZA",
        color: "#fd7e14",
        players: ["BROBBEY", "BALLARD", "XHAKA", "SADIKI", "TALBI"],
        form: [],
      },
      {
        id: "ginge",
        name: "TEAM GINGE",
        color: "#ffd8a8",
        players: ["BROBBEY", "BALLARD", "XHAKA", "SADIKI", "TALBI"],
        form: [],
      },
      {
        id: "jakey",
        name: "TEAM JAKEY",
        color: "#d0bfff",
        players: ["BROBBEY", "BALLARD", "XHAKA", "SADIKI", "TALBI"],
        form: [],
      },
      {
        id: "tays",
        name: "TEAM TAYS",
        color: "#a5d8ff",
        players: ["BROBBEY", "BALLARD", "XHAKA", "SADIKI", "TALBI"],
        form: [],
      },
    ],
    updatedAt: Date.now(),
  };
}
