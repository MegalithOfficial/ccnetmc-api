import {
  InvalidServerType,
} from "../utils/Error.js";
import types from "../types/types.js";
import Minecraft from "minecraft-lib";
import { RequestManager, Functions, } from "../export.js"

export class Server {
  constructor(provider, options = { debug: false }) {
    this.provider = provider
    this.RequestManager = new RequestManager(options);
    this.Functions = new Functions(options);
  }

  /**
   * Get's Minecraft server data.
   * @return {object}
   */
  async getServerData() {
    try {
      const { players } = await Minecraft.servers.get("play.ccnetmc.com");
      return {
        serverOnline: true,
        online: players.online,
        max: players.max,
      };
    } catch (error) {
      throw error;
      return {
        serverOnline: false,
        online: 0,
        max: 0,
      };
    }
  }
/**
 * Get's Server online player Amount. Towny is not included.
 * @returns {object}
 */
async getServerPlayerCount() {
  const [serverData, playerData] = await Promise.all([
    this.getServerData(),
    this.getPlayerData({ server: "Nations" }),
  ]);

  const info = {
    online: serverData.online,
    nations: playerData?.currentcount || 0,
    storming: playerData?.hasStorm || false,
    thundering: playerData?.isThundering || false,
    ccnet: playerData?.currentcount || 0,
    hub: Math.max(0, serverData.online - (playerData?.currentcount || 0)),
  };

  return info;
}


  /**
   * Get's Player data.
   * @returns {object}
   */
  async getPlayerData() {
      return await this.RequestManager.getNationsPlayerData();
    }
}
