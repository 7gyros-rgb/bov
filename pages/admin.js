import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import TeamCard from "../components/TeamCard";
import { computePoints } from "../lib/points";

const MAX_PLAYERS = 6;

export default function Admin() {
  const [pwInput, setPwInput] = useState("");
  const [pw, setPw] = useState(null);
  const [pwError, setPwError] = useState("");

  const [teams, setTeams] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [kvConfigured, setKvConfigured] = useState(true);
  const saveTimer = useRef(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" && localStorage.getItem("admin-key");
    if (stored) setPw(stored);
  }, []);

  useEffect(() => {
    if (!pw) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pw]);

  async function load() {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      const data = await res.json();
      setTeams(data.teams);
      setKvConfigured(data.kvConfigured);
      setLoadError("");
    } catch (e) {
      setLoadError("Couldn't load current state.");
    }
  }

  function tryLogin(e) {
    e?.preventDefault();
    localStorage.setItem("admin-key", pwInput);
    setPw(pwInput);
    setPwError("");
  }

  function scheduleSave(nextTeams) {
    setTeams(nextTeams);
    setSaveStatus("Saving…");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => save(nextTeams), 500);
  }

  async function save(nextTeams) {
    try {
      const res = await fetch("/api/state", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": pw },
        body: JSON.stringify({ teams: nextTeams }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setPwError("Save failed — wrong password.");
          localStorage.removeItem("admin-key");
          setPw(null);
        } else {
          setSaveStatus(data.error || "Save failed.");
        }
        return;
      }
      setKvConfigured(data.kvConfigured);
      setSaveStatus("Saved ✓");
      setTimeout(() => setSaveStatus(""), 1500);
    } catch (e) {
      setSaveStatus("Save failed — check your connection.");
    }
  }

  function updateTeam(id, patch) {
    scheduleSave(teams.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  function updatePlayer(teamId, index, value) {
    const t = teams.find((x) => x.id === teamId);
    const players = [...t.players];
    players[index] = value;
    updateTeam(teamId, { players });
  }

  function addPlayer(teamId) {
    const t = teams.find((x) => x.id === teamId);
    if (t.players.length >= MAX_PLAYERS) return;
    updateTeam(teamId, { players: [...t.players, ""] });
  }

  function removePlayer(teamId, index) {
    const t = teams.find((x) => x.id === teamId);
    if (t.players.length <= 1) return;
    updateTeam(teamId, { players: t.players.filter((_, i) => i !== index) });
  }

  function addResult(teamId, result) {
    const t = teams.find((x) => x.id === teamId);
    // Keep the FULL history (not capped) so points add up across the whole
    // season — TeamCard only displays the last 5 as badges.
    updateTeam(teamId, { form: [...(t.form || []), result] });
  }

  function undoResult(teamId) {
    const t = teams.find((x) => x.id === teamId);
    updateTeam(teamId, { form: (t.form || []).slice(0, -1) });
  }

  if (!pw) {
    return (
      <div className="login-box">
        <Head>
          <title>Admin Login</title>
        </Head>
        <h2 style={{ fontFamily: "Lilita One, sans-serif" }}>Admin Login</h2>
        <form onSubmit={tryLogin}>
          <input
            type="password"
            placeholder="Admin password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            autoFocus
          />
          <button type="submit">Enter</button>
        </form>
        {pwError && <p style={{ color: "#e03131" }}>{pwError}</p>}
      </div>
    );
  }

  return (
    <div className="admin-wrap">
      <Head>
        <title>Scoreboard Admin</title>
      </Head>

      <div className="top-bar">
        <div>
          <h1>Scoreboard Admin</h1>
          <p className="muted">Changes save automatically and show up on the overlay in ~1 second.</p>
        </div>
        <div className="links">
          <a href="/overlay" target="_blank" rel="noreferrer">
            Open overlay →
          </a>
        </div>
      </div>

      {!kvConfigured && (
        <div className="banner">
          <strong>Heads up:</strong> no database is connected yet, so edits only persist for this
          server instance. Connect Vercel storage — see the README — then redeploy.
        </div>
      )}
      {loadError && <div className="banner">{loadError}</div>}

      <div className="save-status">{saveStatus}</div>

      {teams === null ? (
        <p>Loading…</p>
      ) : (
        teams.map((t) => (
          <div className="team-block" key={t.id}>
            <div>
              <div className="card-preview">
                <TeamCard name={t.name} color={t.color} players={t.players} form={t.form} />
              </div>
            </div>

            <div>
              <h2 style={{ fontFamily: "Lilita One, sans-serif", margin: "0 0 8px" }}>
                {t.name} — {computePoints(t.form)} pts
              </h2>

              <p className="muted" style={{ marginBottom: 4 }}>
                Players ({t.players.length}/{MAX_PLAYERS})
              </p>
              {t.players.map((p, i) => (
                <div className="field-row" key={i}>
                  <input
                    type="text"
                    value={p}
                    placeholder={`Player ${i + 1}`}
                    onChange={(e) => updatePlayer(t.id, i, e.target.value.toUpperCase())}
                  />
                  <button className="icon-btn" onClick={() => removePlayer(t.id, i)}>
                    ✕
                  </button>
                </div>
              ))}
              {t.players.length < MAX_PLAYERS && (
                <button className="icon-btn" onClick={() => addPlayer(t.id)}>
                  + Add player
                </button>
              )}

              <p className="muted" style={{ marginTop: 16, marginBottom: 4 }}>
                Results (W = +3, D = +1, L = 0)
              </p>
              <div style={{ marginBottom: 8 }}>
                {(t.form || []).slice(-5).map((r, i) => (
                  <span
                    key={i}
                    className="form-chip"
                    style={{
                      background: r === "W" ? "#69db7c" : r === "D" ? "#ced4da" : "#ff8787",
                    }}
                  >
                    {r}
                  </span>
                ))}
                {(!t.form || t.form.length === 0) && <span className="muted">No results yet</span>}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="result-btn W" onClick={() => addResult(t.id, "W")}>
                  + Win
                </button>
                <button className="result-btn D" onClick={() => addResult(t.id, "D")}>
                  + Draw
                </button>
                <button className="result-btn L" onClick={() => addResult(t.id, "L")}>
                  + Loss
                </button>
                <button className="icon-btn" onClick={() => undoResult(t.id)}>
                  Undo last
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
