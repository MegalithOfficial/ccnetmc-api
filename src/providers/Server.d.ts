import { RequestManager, Functions } from "../export.js"

interface ServerData {
  serverOnline: boolean;
  online: number;
  max: number;
}

interface ServerPlayerCount {
  online: number;
  towny: number;
  nations: number;
  storming: boolean;
  thundering: boolean;
  ccnet: number;
  hub: number;
}

export declare class Server {
  provider: any;
  RequestManager: RequestManager;
  Functions: Functions;

  constructor(provider: any, options?: { debug?: boolean });

  getServerData(): Promise<ServerData>;

  getServerPlayerCount(): Promise<ServerPlayerCount>;

  getPlayerData(options?: { server?: string }): Promise<object>;
}
