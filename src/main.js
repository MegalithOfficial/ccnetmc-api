import { Towns, Nations, Player, Server, Sieges } from "./export.js";
import types from "./types/types.js";
import { RequestManager } from "./request/RequestManager.js";
import { Functions } from "./utils/functions.js";

export class CCnet {

  /**
   * Main class of CCnet API.
   * @param {object} options 
   */
  constructor(options = { debug: false, RequestManager: {}, Functions: {} }) {
    this.init(options);
  };

  /**
   * @private
   * Provider loader of CCnet API
   * @returns {void}
   */
  init(options) {
    /**
     * @param {import("./export.js").Player} player
     */
    this.player = new Player(this, options);

    /**
     * @param {import("./export.js").Nations} nations
     */
    this.nations = new Nations(this, options);

    /**
     * @param {import("./export.js").Server} server
     */
    this.server = new Server(this, options);

    /**
     * @param {import("./export.js").Sieges} Sieges
     */
    this.siege = new Sieges(this, options);

    /**
     * @param {import("./export.js").Towns} towns
     */
    this.towns = new Towns(this, options);

    /**
     * @param {import("./export.js").RequestManager} RequestManager
     */
    this.RequestManager = new RequestManager(options.RequestManager);

    /**
     * @param {import("./export.js").Functions} Functions
     */
    this.Functions = new Functions(options.Functions);

    /**
     * @param {types} types
     */
    this.types = types;
    
    return void 0;
  };
};
