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

  public async getAllTowns(): Promise<any> {//Promise<Town[] | undefined> {
    const mapData = await this.RequestManager.getMapData();
    const ops = await this.provider.player.getOnlinePlayerData();
    if (!mapData || !ops || !mapData.sets["towny.markerset"]) return;

    const townData = mapData.sets["towny.markerset"].areas;
    const townsArray = Object.values(townData).map((town: any) => {

      const rawinfo: string[] = town.desc.split("<br />");
      const info = rawinfo.map((x: string) => striptags(x));
      const extractedData = Utils.extractTownData(info, ops);

      extractedData.x = Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2);
      extractedData.z = Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2);
      extractedData.area = this.utils.calcPolygonArea(town.x, town.z, town.x.length) / 16 / 16;

      return extractedData;
    });

    const townsArrayNoDuplicates = Utils.removeDuplicates(townsArray);

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