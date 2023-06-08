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
      console.error(error);
      return {
        serverOnline: false,
        online: 0,
        max: 0,
      };
    }
  }
  /**
   * Get's Server online player Amount.
   * @returns {object}
   */
  async getServerPlayerCount() {
    const [serverData, playerData, townyPlayerData] = await Promise.all([
      this.getServerData(),
      this.getPlayerData({ server: "Nations" }),
      this.getPlayerData({ server: "Towny" }),
    ]);

    const info = {
      online: serverData.online,
      towny: townyPlayerData?.currentcount || 0,
      nations: playerData?.currentcount || 0,
      storming: playerData?.hasStorm || false,
      thundering: playerData?.isThundering || false,
      ccnet:
        (townyPlayerData?.currentcount || 0) + (playerData?.currentcount || 0),
      hub: Math.max(
        0,
        serverData.online -
          ((townyPlayerData?.currentcount || 0) +
            (playerData?.currentcount || 0))
      ),
    };

    return info;
  }

  /**
   * Get's Player data.
   * @returns {object}
   */
  async getPlayerData(options = { server: "Nations" }) {
    const server = options.server.toLowerCase();
    if (server === "nations") {
      return await this.RequestManager.getNationsPlayerData();
    } else if (server === "towny") {
      return await this.RequestManager.getTownyPlayerData();
    } else {
      throw new InvalidServerType(
        types.errors.requestErrors.InvalidServerType,
        types.errors.requestErrors.errorCodes.InvalidServerType
      );
    }
  }
}
