import types from "../types/types.js";
import { Functions, NoPlayerInput, InvalidPlayer } from "../export.js"


export class Player {
  constructor(provider, options = { debug: false }) {
    this.provider = provider
    this.Functions = new Functions(options)
  }

  /**
   * Get's player data.
   * @param {string} name
   * @returns {object}
   */
  async getPlayer(name, options = { server: "Nations" }) {
    if (!name) {
      throw new NoPlayerInput("No Player name provided.");
    } else if (typeof name !== "string") {
      throw InvalidPlayer("Player name must be a string.");
    }
  
    const ops = await this.getOnlinePlayers(true, { server: options.server });
    if (!ops) {
      throw new FetchError("Failed to fetch data.");
    }
  
    const lowerCaseName = name.toLowerCase();
    const foundPlayer = ops.find(
      (op) => op.name.toLowerCase() === lowerCaseName
    );
    if (!foundPlayer) {
      throw InvalidPlayer("Player doesn't exist or is offline.");
    }
  
    return foundPlayer;
  }

  /**
   * Get's all of Online players
   * @param {Boolean} includeResidentInfo
   * @returns {object}
   */
  async getOnlinePlayers(
    includeResidentInfo = true,
    options = { server: "Nations" }
  ) {
    const onlinePlayers = await this.getOnlinePlayerData({
      server: options.server,
    });
    if (!includeResidentInfo) {
      return onlinePlayers;
    }
  
    const residents = await this.getResidents({ server: options.server });
    if (!residents) {
      return;
    }
  
    const merged = onlinePlayers.map((player) => ({
      ...player,
      ...residents.find((resident) => resident.name === player.name),
    }));
  
    return merged;
  }

  /**
   * Get all of Towns Residents.
   * @returns
   */
  async getResidents(options = { server: "Nations" }) {
    const towns = await this.provider.getTowns({ server: options.server });
    if (!towns) {
      return;
    }
  
    const residentsArray = towns.flatMap((town) =>
      town.residents.map((resident) => ({
        name: resident,
        town: town.name,
        nation: town.nation,
        rank:
          town.capital && town.mayor === resident
            ? "Nation Leader"
            : town.mayor === resident
            ? "Mayor"
            : "Resident",
      }))
    );
  
    return residentsArray;
  }

  /**
   * Get's all of players.
   * @returns {object}
   */
  async getAllPlayers(options = { server: "Nations" }) {
    const [onlinePlayers, residents] = await Promise.all([
      this.getOnlinePlayerData({ server: options.server }),
      this.getResidents({ server: options.server }),
    ]);
  
    if (!onlinePlayers || !residents) {
      return;
    }
  
    const merged = residents.map((resident) => ({
      ...resident,
      ...onlinePlayers.find((player) => player.name === resident.name),
    }));
  
    return merged;
  }

  /**
   * Get's player.
   * @param {String} name
   * @returns {object}
   */
  async getPlayer(name, options = { server: "Nations" }) {
    const allPlayers = await this.getAllPlayers({ server: options.server });
    const lowerCaseName = name.toLowerCase();
    return (
      allPlayers.find((player) => player.name.toLowerCase() === lowerCaseName) ??
      null
    );
  }

  /**
   * Get's Online Player data.
   * @returns {object}
   */
  async getOnlinePlayerData(options = { server: "Nations" }) {
    const data = await this.provider.server.getPlayerData({ server: options.server });
    return this.Functions.editPlayerProps(data.players) ?? null;
  }
}
