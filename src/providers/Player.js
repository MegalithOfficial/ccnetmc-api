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
  async getPlayer(name) {
    if (!name) {
      throw new NoPlayerInput("No Player name provided.");
    } else if (typeof name !== "string") {
      throw InvalidPlayer("Player name must be a string.");
    }
  
    const ops = await this.getOnlinePlayers(true);
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
  ) {
    const onlinePlayers = await this.getOnlinePlayerData();
    if (!includeResidentInfo) {
      return onlinePlayers;
    }
  
    const residents = await this.getResidents();
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
   * @returns {Array}
   */
  async getResidents() {
    const towns = await this.provider.towns.getAllTowns();
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
  async getAllPlayers() {
    const [onlinePlayers, residents] = await Promise.all([
      this.getOnlinePlayerData(),
      this.getResidents(),
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
  async getPlayer(name, ) {
    const allPlayers = await this.getAllPlayers();
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
  async getOnlinePlayerData() {
    const data = await this.provider.server.getPlayerData();
    return this.Functions.editPlayerProps(data.players) ?? null;
  }
}
