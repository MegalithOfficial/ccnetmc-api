import { ProviderOptions, Town, RawTownData, Nation } from "../Interfaces/export";
import { RequestManager as Request } from "../utils/RequestManager";
import { DataNull, InvalidTypeData } from "../utils/Errors";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";
import striptags from "striptags";

export class Towns {
  private utils = Utils;
  private provider: CCnet;
  private RequestManager: Request;

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
    this.RequestManager = new Request();
  };

  public async getAllTowns(): Promise<Town[] | undefined> {
    const mapData = await this.RequestManager.getMapData();
    const ops = await this.provider.player.getOnlinePlayerData();
    if (!mapData || !ops || !mapData.sets["towny.markerset"]) return;

    const townData = mapData.sets["towny.markerset"].areas;
    const townsArray = Object.values(townData).map((town: RawTownData) => {

      const rawinfo: string[] = town.desc.split("<br />");
      const info = rawinfo.map((x: string) => striptags(x));

      const townName = info[1].includes("Vassal")
        ? info[2].split(" (")[0].trim()
        : (!info[1].includes("Vassal") && !info[1].includes("Member"))
          ? info[1].split(" (")[0].trim()
          : "";

      const nationName = info[0].slice(10).trim();
      const vassal = info[1].includes("Vassal");
      const vassalOf = vassal ? info[1].split(" ")[2] : "none";

      const Occupiedby = info[2].trim().split("-")[1] || "";
      const IsOccupied = Boolean(Occupiedby);

      const residents = info[12].slice(19).trim().split(", ");
      const trusted = info[13].slice(20).trim().split(", ");

      const culture = info[6].includes("Culture")
        ? info[6].split("-")[1].trim()
        : info[7].includes("Culture") ? info[7].split("-")[1].trim() : "none";

      const board = info[6].includes("Board")
        ? info[6].split("-")[1].trim()
        : info[7].includes("Board") ? info[7].split("-")[1].trim() : "none";

      const mayor = info[3].includes("Mayor")
        ? info[3].split("Mayor")[1].trim().replace(" ", "").replaceAll('-', '')
        : "";

      const peacefulness = info[5].includes("Peaceful?")
        ? info[5].split("Peaceful?")[1].trim() === "true"
        : false;

      const bank = info[8].slice(9).trim().includes("$")
        ? info[8].slice(9).trim()
        : 0;

      const upkeep = info[9].slice(11).trim().includes("$")
        ? info[9].slice(11).trim()
        : 0;

      const currentTown: Town = {
        isOccupied: IsOccupied,
        occupiedBy: Occupiedby,
        board: board,
        culture: culture,
        isVassal: vassal,
        vassalOf: vassalOf,
        area: this.utils.calcPolygonArea(town.x, town.z, town.x.length) / 16 / 16,
        x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
        z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
        name: this.utils.removeStyleCharacters(townName),
        nation: this.utils.removeStyleCharacters(nationName),
        mayor: mayor,
        residents: residents,
        // @ts-ignore
        onlineResidents: ops.filter((op: object) => residents.includes(op.name)),
        capital: info[0].includes("Capital"),
        bank: bank,
        upkeep: upkeep,
        peacefulness: peacefulness,
        trusted: trusted,
        colourCodes: {
          fill: town.fillcolor,
          outline: town.color,
        },
      };
      return currentTown;
    });

    const townsArrayNoDuplicates = this.utils.removeDuplicates(townsArray);

    return townsArrayNoDuplicates;
  };

  public async getTown(name: string): Promise<Town | null> {
    if (typeof name !== 'string') throw new InvalidTypeData({ message: "Name must be a string.", code: 404 });
    if (name.length === 0) throw new InvalidTypeData({ message: "Name cannot be empty.", code: 204 });

    let towns = await this.getAllTowns();
    return (
      towns?.find((town) => town.name.toLowerCase() === name.toLowerCase()) ??
      null
    );
  };

  private invitable(town: Town, nation: Nation, includeBelonging: boolean): boolean {
    const distance = Math.hypot(
      town.x - nation.capitalX,
      town.z - nation.capitalZ
    );
    const differentNation = town.nation !== nation.name;
    const noNation = town.nation === "No Nation";
    return (
      distance <= 3000 && differentNation && (includeBelonging || noNation)
    );
  };

  async getInvitableTowns(name: string, includeBelonging: boolean): Promise<Town[] | null> {
    if (typeof name !== 'string') throw new InvalidTypeData({ message: "Name must be a string.", code: 404 });
    if (name.length === 0) throw new InvalidTypeData({ message: "Name cannot be empty.", code: 204 });

    if (typeof includeBelonging !== 'boolean') throw new InvalidTypeData({ message: "includeBelonging must be a boolean.", code: 404 });

    let nation = await this.provider.nations.getNation(name);
    if (nation !== null) {
      let towns = await this.getAllTowns();
      if (!towns) return null;

      return towns.filter((town) =>
        this.invitable(town, nation as Nation, includeBelonging)
      );
    } else throw new DataNull({ message: `Nation ${nation} does not exist!`, code: 404 });
  };
};