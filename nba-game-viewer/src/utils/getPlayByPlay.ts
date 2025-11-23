export type GetPlayByPlayArgs = {
  league: string;
  gameId: string;
};

export type RawPlayResponse = {
  shootingPlay: boolean;
  sequenceNumber: string;
  period: {
    displayValue: string;
    number: number;
  };
  homeScore: number;
  scoringPlay: boolean;
  clock: {
    displayValue: string;
  };
  wallclock: string;
  team: {
    id: string;
  };
  type: {
    id: string;
    text: string;
  };
  awayScore: number;
  id: string;
  text: string;
  scoreValue: number;
  participants?: {
    athlete: {
      id: string;
    };
  }[];
};

export type RawPlayByPlayResponse = {
  gameId: number;
  gamepackageJSON: {
    plays: RawPlayResponse[];
  };
};

const getPlayByPlay = async ({ league, gameId }: GetPlayByPlayArgs): Promise<RawPlayResponse[]> => {
  const baseUrl = new URL(`http://cdn.espn.com/core/${league}/playbyplay`);

  const params = new URLSearchParams({
    gameId,
    xhr: "1",
    render: "false",
    device: "desktop",
    userab: "18",
  });

  baseUrl.search = params.toString();

  const response = await fetch(baseUrl.toString());
  const body = (await response.json()) as RawPlayByPlayResponse;

  return body.gamepackageJSON.plays;
};

export default getPlayByPlay;
