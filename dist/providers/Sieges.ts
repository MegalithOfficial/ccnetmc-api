import { NavalSiege, ProviderOptions, RawSiegeData, Siege, RawNavalSiegeData } from "../Interfaces/export";
import { RequestManager as Request } from "../utils/RequestManager";
import { Utils } from "../utils/Utils";
import { CCnet } from "../main";
import striptags from "striptags";

export class Sieges {
  private utils = Utils;
  private provider: CCnet;
  private RequestManager: Request;

  constructor(options: ProviderOptions) {
    this.provider = options.provider;
    this.RequestManager = new Request()
  };

  public async getAllSieges(): Promise<Siege[]> {
    const mapData = await this.RequestManager.getMapData();
    const siegesArray: Siege[] = [];
    const siegeData: RawSiegeData = mapData.sets['siegewar.markerset'].markers as RawSiegeData;

    for (const siegeAreaName in siegeData) {
      if (Object.hasOwnProperty.call(siegeData, siegeAreaName)) {
        const siege = siegeData[siegeAreaName];

        const rawinfo = siege.desc.split('<br />');
        const info = rawinfo.map((x) => striptags(x));
        const [siegeName, besiegedTown] = info[0].slice(7).split('Town: ');

        siegesArray.push({
          name: this.utils.removeStyleCharacters(siegeName),
          town: this.utils.removeStyleCharacters(besiegedTown),
          type: info[1].slice(6),
          points: info[2].slice(15),
          time: info[3].slice(11),
          warchest: info[4].slice(11),
          x: siege.x,
          y: siege.y,
          z: siege.z,
        });
      }
    }

    return [...new Set(siegesArray)];
  };



  public async getAllNavalSieges(): Promise<NavalSiege[]> {
    const mapData = await this.RequestManager.getMapData();
    const navalSiegesArray: NavalSiege[] = [];
    const navalSiegesData: RawNavalSiegeData = mapData.sets['worldguard.markerset'].areas as unknown as RawNavalSiegeData;
    const navalSiegesAreaNames = Object.keys(navalSiegesData);

    for (let i = 0; i < navalSiegesAreaNames.length; i++) {
      const navalSiegeAreaName = navalSiegesAreaNames[i];
      const navalSiege = navalSiegesData[navalSiegeAreaName];

      const rawinfo = navalSiege.desc.split("<br />");
      const info = rawinfo.map((x) => striptags(x));
      const navalSiegeName = info[1].trim();
      const navalSiegeController = info[3].split(" - ")[1].replace("*", "").trim();

      navalSiegesArray.push({
        name: navalSiegeName,
        controller: navalSiegeController,
        type: info[0].includes("Movecraft") ? "movecraft" : "other",
      });
    }

    return navalSiegesArray;
  };
};