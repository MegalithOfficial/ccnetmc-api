import { PlayerData, ProviderOptions, Player as player, ResidentData } from "../Interfaces/export";
import { FetchError, InvalidPlayer, InvalidTypeData, NoPlayerInput } from "../utils/Errors";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";

export class Player {
  private utils = Utils;
  private provider: CCnet;

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
  };

  public async getOnlinePlayers(includeResidentInfo = true): Promise<(player | player[]) | PlayerData | (PlayerData | ResidentData)[]> {

    if(typeof includeResidentInfo !== 'boolean') throw new InvalidTypeData({ message: "includeResidentInfo must be a boolean.", code: 404 });

    const onlinePlayers = await this.getOnlinePlayerData();
    if (!includeResidentInfo) {
      return onlinePlayers;
    }
  
    const residents = await this.getResidents();
    if (!residents) {
      return [];
    }
  
    //@ts-ignore
    const merged: PlayerData[] = onlinePlayers.map((player) => {
      const resident = residents.find((resident) => resident.name === player.name);
      return {
        ...player,
        ...resident,
      };
    });
  
    return merged;
  };

  public async getResidents(): Promise<ResidentData[]> {
    const towns = await this.provider.towns.getAllTowns();
    if (!towns) {
      return [];
    };

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

  public async getPlayer(name: string): Promise<PlayerData> {

    if (!name) throw new NoPlayerInput({ message: "No Player name provided.", code: 404 });
    else if (typeof name !== "string") throw new InvalidPlayer({ message: "Player name must be a string.", code: 415 });
    
    const ops = await this.getOnlinePlayers(true);
    if (!ops) throw new FetchError({ message: "Failed to fetch data.", code: 500 });
    
    const lowerCaseName = name.toLowerCase();
    //@ts-ignore
    const foundPlayer = ops.find((op) => op.name.toLowerCase() === lowerCaseName);

    if (!foundPlayer) throw new InvalidPlayer({ message: "Player doesn't exist or is offline.", code: 404 });

    return foundPlayer;
  };
  
  public async getAllPlayers(): Promise<PlayerData[] | null> {
    const [onlinePlayers, residents] = await Promise.all([
      this.getOnlinePlayerData(),
      this.getResidents(),
    ]);

    if (!onlinePlayers || !residents) {
      return null;
    }

    const merged = residents.map((resident) => ({
      ...resident,
      //@ts-ignore
      ...onlinePlayers.find((player) => player.name === resident.name),
    }));

    return merged;
  };

  public async getOnlinePlayerData(): Promise<player | player[]> {
    const data = await this.provider.server.getPlayerData();
    return this.utils.editPlayerProps(data.players) ?? null;
  };
};