import { RequestOptions } from "./RequestOptions";
import { Nation, Town, Player, ServerStatus, Siege } from "./export";

export interface MainOptions {
  debug?: boolean;
  RequestManagerOptions?: RequestOptions;
  events?: { enabled: boolean; };
};

export interface Events {
  "townCreated": [town: Town]
  "townDeleted": [town: Town]
  "townsUpdated": [towns: Town[]]
  "nationCreated": [nation: Nation]
  "nationDeleted": [nation: Nation]
  "playersJoined": [players: Player[]]
  "playersLeft": [players: Player[]]
  "serverUpdate": [server: ServerStatus]
  //"siegeCreated": [siege: Siege]
  //"siegeEnded": [siege: Siege]
  //"siegeUpdated": [siege: Siege]
};