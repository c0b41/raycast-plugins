type GetRosterArgs = {
  league: string;
  id: number;
};

type RosterResponse = {
  team: {
    athletes: any[];
  };
};

const getRoster = async ({ league, id }: GetRosterArgs): Promise<any[]> => {
  if (!league || typeof league !== "string") {
    throw new Error("Invalid league specified.");
  }

  const baseUrl = new URL(`http://site.api.espn.com/apis/site/v2/sports/basketball/${league}/teams/${id}`);

  const params = new URLSearchParams({
    enable: "roster",
  });

  baseUrl.search = params.toString();

  const response = await fetch(baseUrl.toString());
  const body = (await response.json()) as RosterResponse;

  return body.team.athletes;
};

export default getRoster;
