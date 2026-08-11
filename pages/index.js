import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Scoreboard</title>
      </Head>
      <div className="landing">
        <h1>Scoreboard</h1>
        <p className="muted">One panel to edit it, one page to show it.</p>
        <a href="/admin">Open Admin</a>
        <a href="/overlay">Open Overlay (all teams)</a>
      </div>
    </>
  );
}
