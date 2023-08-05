import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { InvalidServerType, FetchError } from '../utils/Error.js';
import types from '../types/types.js';
export class RequestManager {
  /**
   * Constructor of Request Manager.
   * @param {object} options 
   */
  constructor(options = {}) {
    this.nationURL = options.nationURL || "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
    this.nationMapURL = options.nationMapURL || "https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json"
  }

  /**
   * Get's Map data.
   * @returns {object}
   */
  async getMapData() {
    //if (serverOptions.server.toLowerCase() === "nations") {
      const data = await fetch(this.nationMapURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError("Server Replied with unexpected Error. Error code " + error.code, error.code); });
      return (data ?? null);

    /*} else if (serverOptions.server.toLowerCase() === "towny") {
      const data = await fetch(this.townyMapURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError("Server Replied with unexpected Error. Error code " + error.code, error.code); });
      return (data ?? null);
    } else {
      throw new InvalidServerType(types.errors.requestErrors.InvalidServerType, types.errors.requestErrors.errorCodes.InvalidServerType);
    }*/
  };

  /**
   * Get's Nations server player data.
   * @returns {object}
   */
  async getNationsPlayerData() {
    const data = await fetch(this.nationURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError("Server Replied with unexpected Error. Error code " + error.code, error.code); });
    return (data ?? null);
  }
  /*
  
   * Get's Towny server player data.
   * @returns {object}
   
  async getTownyPlayerData() {
    const data = await fetch(this.townyURL, {}, FetchResultTypes.JSON).catch(error => { throw new FetchError("Server Replied with unexpected Error. Error code " + error.code, error.code); });
    return (data ?? null);
  }*/
};