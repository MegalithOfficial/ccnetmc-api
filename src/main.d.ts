import types from "./types/types.js";

export declare class CCnet {
  player: import("./providers/Player.js").Player;
  nations: import("./providers/Nations.js").Nations;
  server: import("./providers/Server.js").Server;
  siege: import("./providers/Sieges.js").Sieges;
  towns: import("./providers/Towns.js").Towns;
  RequestManager: import("./request/RequestManager.js").RequestManager;
  Functions: import("./utils/functions.js").Functions;
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