import { Towns, Nations, Player, Server, Sieges } from "./export.js";
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
    this.player = new Player(this, options);
    this.nations = new Nations(this, options);
    this.server = new Server(this, options);
    this.siege = new Sieges(this, options);
    this.towns = new Towns(this, options);
    this.RequestManager = new RequestManager(options.RequestManager);
    this.Functions = new Functions(options.Functions);
   return void 0;
  };
};
