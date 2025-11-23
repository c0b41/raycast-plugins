/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Default Conference - Choose default conference for dropdown(s) in commands. */
  "conference": "eastern" | "western" | "league",
  /** Default League - Choose default league for dropdown(s) in commands. */
  "league": "nba" | "wnba",
  /** View Options - Show last value selected in dropdown(s) instead of defaulting to values selected in preferences everytime. */
  "useLastValue": boolean,
  /** Number of days of scores - Number of days of scores to show in commands. */
  "numDaysScores": string,
  /** Show Details - Show details of the games in the Raycast window. */
  "showDetails": boolean
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `upcoming-games` command */
  export type UpcomingGames = ExtensionPreferences & {}
  /** Preferences accessible in the `standings` command */
  export type Standings = ExtensionPreferences & {}
  /** Preferences accessible in the `headlines` command */
  export type Headlines = ExtensionPreferences & {}
  /** Preferences accessible in the `scores` command */
  export type Scores = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `upcoming-games` command */
  export type UpcomingGames = {}
  /** Arguments passed to the `standings` command */
  export type Standings = {}
  /** Arguments passed to the `headlines` command */
  export type Headlines = {}
  /** Arguments passed to the `scores` command */
  export type Scores = {}
}

