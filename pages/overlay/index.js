import Head from "next/head";
import TeamCard from "../../components/TeamCard";
import { useScoreboard } from "../../lib/useScoreboard";

export default function OverlayAll() {
  const { state } = useScoreboard(1000);

  return (
    <>
      <Head>
        <title>Scoreboard Overlay</title>
      </Head>
      <div
        style={{
          background: "transparent",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: 0,
          width: 360,
        }}
      >
        {state?.teams?.filter((t) => !t.hidden).map((t) => (
          <div key={t.id}>
            <TeamCard name={t.name} color={t.color} players={t.players} form={t.form} />
          </div>
        ))}
      </div>
    </>
  );
}
