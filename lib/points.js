// Win = 3, Draw = 1, Loss = 0 — computed from the FULL match history for a
// team (not just the last 5 shown as badges), so points keep accumulating
// across the whole season even though the badge strip only shows recent form.
export function computePoints(form) {
  if (!form || !form.length) return 0;
  return form.reduce((total, r) => {
    if (r === "W") return total + 3;
    if (r === "D") return total + 1;
    return total; // loss = 0
  }, 0);
}
