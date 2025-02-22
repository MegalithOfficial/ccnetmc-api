import { PlayerData, ProviderOptions, Player as PlayerType, ResidentData, MergedPlayer, Player as PlayerInterface } from "../Interfaces/export";
import { FetchError, InvalidPlayer, InvalidTypeData, NoPlayerInput } from "../utils/Errors";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";

export class Player {
  private utils = Utils;
  private provider: CCnet;
  private playerCache: Map<string, { data: any, timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 10000; // 10 seconds for player data

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
  }

  private getCachedData(key: string): any | null {
    const cached = this.playerCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.playerCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  public async getOnlinePlayers(includeResidentInfo = true): Promise<PlayerInterface[] | MergedPlayer[]> {
    if (typeof includeResidentInfo !== 'boolean') {
      throw new InvalidTypeData({ message: "includeResidentInfo must be a boolean.", code: 404 });
    }

    const cacheKey = `onlinePlayers_${includeResidentInfo}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const onlinePlayers = await this.getOnlinePlayerData();
      if (!includeResidentInfo) {
        this.setCachedData(cacheKey, onlinePlayers);
        return onlinePlayers;
      }

      const residents = await this.getResidents();
      if (!residents?.length) return [];

      const merged = onlinePlayers.map(player => {
        const resident = residents.find(r => r.name.toLowerCase() === player.name.toLowerCase());
        return {
          ...player,
          ...(resident || {
            town: "None",
            nation: "None",
            rank: "Visitor"
          })
        };
      });

      this.setCachedData(cacheKey, merged);
      return merged;
    } catch (error) {
      throw new FetchError({ 
        message: "Failed to fetch player data", 
        code: 500 
      });
    }
  }

  public async getResidents(): Promise<ResidentData[]> {
    const cached = this.getCachedData('residents');
    if (cached) return cached;

    const towns = await this.provider.towns.getAllTowns();
    if (!towns?.length) return [];

    const residents = towns.flatMap(town => 
      town.residents.map(resident => ({
        name: resident,
        town: town.name,
        nation: town.nation || "No Nation",
        rank: this.determineResidentRank(resident, town)
      }))
    );

    this.setCachedData('residents', residents);
    return residents;
  }

  private determineResidentRank(resident: string, town: any): string {
    if (town.capital && town.mayor === resident) return "Nation Leader";
    if (town.mayor === resident) return "Mayor";
    if (town.trusted?.includes(resident)) return "Trusted";
    return "Resident";
  }

  public async getPlayer(name: string): Promise<MergedPlayer> {
    if (!name) {
      throw new NoPlayerInput({ message: "No Player name provided.", code: 404 });
    }
    if (typeof name !== "string") {
      throw new InvalidPlayer({ message: "Player name must be a string.", code: 415 });
    }

    const cacheKey = `player_${name.toLowerCase()}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    const players = await this.getOnlinePlayers(true) as MergedPlayer[];
    if (!players?.length) {
      throw new FetchError({ message: "Failed to fetch data.", code: 500 });
    }

    const player = players.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (!player) {
      throw new InvalidPlayer({ message: "Player doesn't exist or is offline.", code: 404 });
    }

    this.setCachedData(cacheKey, player);
    return player;
  }

  public async getAllPlayers(): Promise<MergedPlayer[]> {
    const cached = this.getCachedData('allPlayers');
    if (cached) return cached;

    try {
      const [onlinePlayers, residents] = await Promise.all([
        this.getOnlinePlayerData(),
        this.getResidents()
      ]);

      if (!residents?.length) return [];

      const merged = residents.map(resident => ({
        name: resident.name,
        isUnderground: false,
        nickname: resident.name,
        town: resident.town,
        nation: resident.nation,
        rank: resident.rank,
        online: !!onlinePlayers.find(p => p.name.toLowerCase() === resident.name.toLowerCase()),
        ...onlinePlayers.find(p => p.name.toLowerCase() === resident.name.toLowerCase())
      }));

      this.setCachedData('allPlayers', merged);
      return merged;
    } catch (error) {
      throw new FetchError({ message: "Failed to fetch all players", code: 500 });
    }
  }

  public async getOnlinePlayerData(): Promise<PlayerType[]> {
    const cached = this.getCachedData('onlinePlayerData');
    if (cached) return cached;

    const data = await this.provider.server.getPlayerData();
    if (!data?.players) {
      throw new FetchError({ message: "Failed to fetch player data", code: 500 });
    }

    const players = this.utils.editPlayerProps(data.players) as PlayerType[];
    this.setCachedData('onlinePlayerData', players);
    return players;
  }
}