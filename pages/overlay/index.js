import Head from "next/head";
import TeamCard from "../../components/TeamCard";
import { useScoreboard } from "../../lib/useScoreboard";

export default function OverlayAll() {
  const { state } = useScoreboard(1000);
  const isHoriz = state?.layout === "horizontal";
  const visibleTeams = state?.teams?.filter((t) => !t.hidden) ?? [];

  return (
    <>
      <Head>
        <title>Scoreboard Overlay</title>
      </Head>
      <div
        style={{
          background: "transparent",
          display: "flex",
          flexDirection: isHoriz ? "row" : "column",
          alignItems: isHoriz ? "flex-start" : "stretch",
          gap: 0,
          padding: 0,
          width: isHoriz ? visibleTeams.length * 220 : 360,
        }}
      >
        {visibleTeams.map((t) => (
          <div
            key={t.id}
            style={isHoriz ? { width: 220, flexShrink: 0 } : {}}
          >
            <TeamCard name={t.name} color={t.color} players={t.players} form={t.form} />
          </div>
        ))}
      </div>
    </>
  );
}
