import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { InvalidServerType } from './Error.js';
import { Storage } from '@wumpjs/storage';
export class RequestManager {
  /**
   * Constructor of Request Manager.
   * @param {object} options 
   */
  constructor(options = {}) {
    this.nationURL = options.nationURL || "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
    this.townyURL = options.townyURL || "https://map.ccnetmc.com/townymap/standalone/dynmap_world.json";
    this.isCacheEnabled = options.cache;
    this.cacheRefreshInterval = options.cacheRefreshInterval
    if (options.cache === true) {
      this.refreshCache();
      this.cache = new Storage()
      setInterval(() => {
        this.refreshCache();
      }, this.cacheRefreshInterval || 30000)
    };
  }

  /**
   * Get's Map data.
   * @returns {object}
   */
  async getMapData(serverOptions = { server: "Nations" }) {
    if (serverOptions.server.toLowerCase() === "nations") {

      if (this.isCacheEnabled === true) {
        if (!this.cache.get("nationsCache")) {

          const data = (await fetch("https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null)
           if (this.isCacheEnabled === true) this.cache.set("nationsCache", data);
          return data;
        } else {

          return this.cache.get("nationsCache");
        }
      } else {
        const data = (await fetch("https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null)
        return data;
      }
    } else if (serverOptions.server.toLowerCase() === "towny") {

      if (this.isCacheEnabled === true) {
        if (!this.cache.get("townyCache")) {

          const data = (await fetch("https://map.ccnetmc.com/townymap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null);
           if (this.isCacheEnabled === true) this.cache.set("townyCache", data);
          return data;

        } else {
          return this.cache.get("townyCache");
        }
      } else {
        const data = (await fetch("https://map.ccnetmc.com/townymap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null);
        return data;
      }

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

  /**
   * Refresh's the Cache
   * @returns {boolean}
   */
  async refreshCache() {
    if (this.isCacheEnabled !== true) return Error("Cache is not enabled.");
    const nationsData = (await fetch("https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null);
    this.cache.set("nationsCache", nationsData);
    const townyData = (await fetch("https://map.ccnetmc.com/townymap/tiles/_markers_/marker_world.json", {}, FetchResultTypes.JSON) ?? null);
    this.cache.set("townyCache", townyData);
    return true
  };
};