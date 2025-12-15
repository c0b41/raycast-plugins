import { useCachedPromise } from "@raycast/utils";
import getSchedule from "../utils/getSchedule";
import { format, parseISO, addDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import type { Day, Game, Competitor } from "../types/schedule.types";
import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  timezone: string;
}

const preferences = getPreferenceValues<Preferences>();
const timezone = preferences.timezone;

const fetchSchedule = async (league: string) => {
  const currentDate = new Date();

  const scheduleData = await getSchedule({
    league: league,
    year: currentDate.getUTCFullYear(),
    month: currentDate.getUTCMonth() + 1,
    day: currentDate.getUTCDate(),
  });

  // Clean up scheduleData by removing keys without games
  Object.keys(scheduleData).forEach((key) => {
    if (!scheduleData[key].games) {
      delete scheduleData[key];
    }
  });

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const scheduledGames: Array<Day> = Object.keys(scheduleData).map((key) => {
    const gameDateUTC = parseISO(key);
    let gameDateInTimeZone = toZonedTime(gameDateUTC, timezone);
    const dayOfWeek = weekdays[gameDateInTimeZone.getDay()];
    const formattedDate = format(gameDateInTimeZone, "dd.MM.yyyy");

    if (gameDateInTimeZone.getHours() < 5) {
      gameDateInTimeZone = addDays(gameDateInTimeZone, 1);
    }

    const adjustedDayOfWeek = weekdays[gameDateInTimeZone.getDay()];
    const adjustedFormattedDate = format(gameDateInTimeZone, "dd.MM.yyyy");

    return {
      date: `${adjustedDayOfWeek} — ${adjustedFormattedDate}`,
      games: scheduleData[key].games.map((game: any): Game => {
        const gameDateUTC = parseISO(game.date);
        let gameDateInTimeZone = toZonedTime(gameDateUTC, timezone);
        const formattedGameDate = format(gameDateInTimeZone, "hh:mm a");

        return {
          id: game.id,
          name: game.name,
          shortName: game.shortName,
          date: formattedGameDate,
          venue: game.competitions[0].venue,
          tickets: game.competitions[0].tickets,
          competitors: game.competitions[0].competitors
            .map(
              (competitor: any): Competitor => ({
                id: competitor.id,
                displayName: competitor.team.displayName,
                abbreviation: competitor.team.abbreviation,
                shortName: competitor.team.shortDisplayName,
                logo: competitor.team.logo,
                color: competitor.team.color,
                alternateColor: competitor.team.alternateColor,
                home: competitor.homeAway,
                score: Number(competitor.score),
                linescores: competitor.linescores,
                records: competitor.records ?? [],
              }),
            )
            .sort((a: Competitor) => (a.home === "home" ? -1 : 1)),
          status: {
            period: game.competitions[0].status.period,
            clock: game.competitions[0].status.clock,
            completed: game.competitions[0].status.type.completed,
            inProgress: game.competitions[0].status.type.description === "In Progress",
          },
          stream: game.links[0].href,
        };
      }),
    };
  });

  return scheduledGames;
};

const useSchedule = (league: string) =>
  useCachedPromise(fetchSchedule, [league], { failureToastOptions: { title: "Could not fetch schedule" } });

export default useSchedule;
