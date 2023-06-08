import { Towns, Nations, Player, Server, Sieges } from "./export.js";
import types from "./types/types.js";
import { RequestManager } from "./request/RequestManager.js";
import { Functions } from "./utils/functions.js";

export declare class CCnet {
  player: Player;
  nations: Nations;
  server: Server;
  siege: Sieges;
  towns: Towns;
  RequestManager: RequestManager;
  Functions: Functions;
  types: typeof types;

  constructor(options?: {
    debug?: boolean;
    RequestManager?: object;
    Functions?: object;
  });

  private init(options: {
    debug?: boolean;
    RequestManager?: object;
    Functions?: object;
  }): void;
}