type ScheduleItem = {
  id: string;
  date: string;
  name: string;
  shortName: string;
  season: { year: number };
  competitions: any[];
};

type ScheduleResponse = {
  content: {
    schedule: ScheduleItem[];
  };
};

type GetScheduleArgs = {
  league: string;
  year: number;
  month: number;
  day: number;
};

const getSchedule = async ({ league, year, month, day }: GetScheduleArgs): Promise<ScheduleItem[]> => {
  const formattedMonth = month.toString().padStart(2, "0");
  const formattedDay = day.toString().padStart(2, "0");

  const baseUrl = new URL(`https://cdn.espn.com/core/${league}/schedule?dates=${year}${formattedMonth}${formattedDay}`);

  const params = new URLSearchParams({
    xhr: "1",
    render: "false",
    device: "desktop",
    userab: "18",
  });

  baseUrl.search = params.toString();

  const response = await fetch(baseUrl.toString());
  const body = (await response.json()) as ScheduleResponse;

  return body.content.schedule;
};

export default getSchedule;
