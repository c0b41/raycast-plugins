import { StandingsResponse } from "../types/standings.types";

type GetStandingsArgs = {
  league: string;
  group: string;
};

const getStandings = async ({ league, group }: GetStandingsArgs): Promise<StandingsResponse> => {
  const baseUrl = new URL(`https://site.web.api.espn.com/apis/v2/sports/basketball/${league}/standings`);

  const params = new URLSearchParams({
    region: "us",
    lang: "en",
    contentorigin: "espn",
    type: (league === "nba" ? 1 : 0).toString(),
    level: (group === "league" ? 1 : 2).toString(),
  });

  baseUrl.search = params.toString();

  const response = await fetch(baseUrl.toString());
  const body = (await response.json()) as StandingsResponse;

  if (!body || !body.children) {
    throw new Error(`Unexpected response structure for ${league.toUpperCase()} standings`);
  }

  return body;
};

export default getStandings;
