import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { InvalidServerType } from './Error.js';

export class RequestManager {
  /**
   * Constructor of Request Manager.
   * @param {object} options 
   */
  constructor(options = {}) {
    this.nationURL = options.nationURL || "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
    this.townyURL = options.townyURL || "https://map.ccnetmc.com/townymap/standalone/dynmap_world.json"
  };

  /**
   * Get's Map data.
   * @returns {object}
   */
  async getMapData(serverOptions = { server: "Nations" }) {
    if (serverOptions.server.toLowerCase() === "nations") {
      return (await fetch("https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null);
    } else if (serverOptions.server.toLowerCase() === "towny") {
      return (await fetch("https://map.ccnetmc.com/townymap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null);
    } else {
      throw new InvalidServerType("Invalid server type. Please choose either 'Nations' or 'Towny'.");
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