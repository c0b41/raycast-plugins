import { getPreferenceValues } from "@raycast/api";

type GetScoresArgs = {
  league: string;
};

const getScores = async ({ league }: GetScoresArgs) => {
  const baseUrl = new URL(`https://site.api.espn.com/apis/site/v2/sports/basketball/${league}/scoreboard`);
  const { numDaysScores } = getPreferenceValues<Preferences>();

  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - Number(numDaysScores));

  const formatDate = (d: Date) => d.toISOString().split("T")[0].replace(/-/g, "");

  const startDate = formatDate(start);
  const endDate = formatDate(today);

  const params = new URLSearchParams({
    region: "us",
    lang: "en",
    contentorigin: "espn",
    dates: `${startDate}-${endDate}`,
  });

  baseUrl.search = params.toString();

  const response = await fetch(baseUrl.toString());
  const body = (await response.json()) as { events: any[] };

  return body.events;
};

export default getScores;
