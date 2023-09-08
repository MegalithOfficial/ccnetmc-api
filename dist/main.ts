import { Nations, Player, Server, Sieges, Towns } from "./providers/export";
import { RequestManager as Request } from "./utils/RequestManager";
import { MainOptions } from "./Interfaces/MainOptions";
import { Utils } from "./utils/Utils";

export class CCnet {
  player: Player;
  RequestManager: Request;
  server: Server;
  towns: Towns;
  nations: Nations;
  sieges: Sieges;
  Utils: Utils;

  constructor(options: MainOptions = {}) {
    const debug = options?.debug ?? false;

    this.player = new Player({ provider: this, options: { debug } });
    this.server = new Server({ provider: this, options: { debug } });
    this.towns = new Towns({ provider: this, options: { debug } });
    this.nations = new Nations({ provider: this, options: { debug } });
    this.sieges = new Sieges({ provider: this, options: { debug } })
    this.RequestManager = new Request(options?.RequestManagerOptions);
    this.Utils = Utils;
  };
};