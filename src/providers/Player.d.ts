import { Functions } from "../export.js";

interface PlayerData {
  name: string;
  town: string;
  nation: string;
  rank: string;
}

export declare class Player {
  provider: any;
  Functions: Functions;

  constructor(provider: any, options?: { debug?: boolean });

  getPlayer(name: string, options?: { server?: string }): Promise<PlayerData>;

  getOnlinePlayers(
    includeResidentInfo?: boolean,
    options?: { server?: string }
  ): Promise<PlayerData[]>;

  getResidents(options?: { server?: string }): Promise<PlayerData[]>;

  getAllPlayers(options?: { server?: string }): Promise<PlayerData[]>;

  getOnlinePlayerData(options?: { server?: string }): Promise<object>;
}
