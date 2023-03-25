import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { InvalidServerType } from '../utils/Error.js';
import types from '../types/types.js';
export class RequestManager {
  /**
   * Constructor of Request Manager.
   * @param {object} options 
   */
  constructor(options = {}) {
    this.nationURL = options.nationURL || "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
    this.townyURL = options.townyURL || "https://map.ccnetmc.com/townymap/standalone/dynmap_world.json";
    this.nationMapURL = options.nationMapURL || "https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json"
    this.townyMapURL = options.townyMapURL || "https://map.ccnetmc.com/townymap/tiles/_markers_/marker_world.json"
  }

  /**
   * Get's Map data.
   * @returns {object}
   */
  async getMapData(serverOptions = { server: "Nations" }) {
    if (serverOptions.server.toLowerCase() === "nations") {
      const data = (await fetch(this.nationMapURL, {}, FetchResultTypes.JSON) ?? null)
      return data;
    } else if (serverOptions.server.toLowerCase() === "towny") {
      const data = (await fetch(this.townyMapURL, {}, FetchResultTypes.JSON) ?? null);
      return data;
    } else {
      throw new InvalidServerType(types.errors.requestErrors.InvalidServerType, types.errors.requestErrors.errorCodes.InvalidServerType);
    }
  };

  /**
   * Get's Nations server player data.
   * @returns {object}
   */
  async getNationsPlayerData() {
    return (await fetch(this.nationURL, {}, FetchResultTypes.JSON) ?? null);
  }

  /**
   * Get's Towny server player data.
   * @returns {object}
   */
  async getTownyPlayerData() {
    return (await fetch(this.townyURL, {}, FetchResultTypes.JSON) ?? null);
  }
};