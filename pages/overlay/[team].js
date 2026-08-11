import Head from "next/head";
import { useRouter } from "next/router";
import TeamCard from "../../components/TeamCard";
import { useScoreboard } from "../../lib/useScoreboard";

export default function OverlayTeam() {
  const router = useRouter();
  const { team } = router.query;
  const { state } = useScoreboard(1000);

  const t = state?.teams?.find((x) => x.id === team);

  return (
    <>
      <Head>
        <title>{team ? `${team} overlay` : "Team overlay"}</title>
      </Head>
      <div
        style={{
          background: "transparent",
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {t ? (
          <div style={{ width: "90vw", maxWidth: 500 }}>
            <TeamCard name={t.name} color={t.color} players={t.players} form={t.form} />
          </div>
        ) : (
          state && (
            <p style={{ fontFamily: "sans-serif", color: "#888" }}>
              No team with id "{team}". Valid ids: {state.teams.map((x) => x.id).join(", ")}
            </p>
          )
        )}
      </div>
    </>
  );
}
