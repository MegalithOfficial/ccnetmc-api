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
          name: this.utils.removeStyleCharacters(siegeName) as string,
          town: this.utils.removeStyleCharacters(besiegedTown) as string,
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
    const navalSiegesData: RawNavalSiegeData = mapData.sets['nationswarfare.markerset'].areas as unknown as RawNavalSiegeData;
    const navalSiegesAreaNames = Object.keys(navalSiegesData);

    for (let i = 0; i < navalSiegesAreaNames.length; i++) {
      const navalSiegeAreaName = navalSiegesAreaNames[i];
      const navalSieges = navalSiegesData[navalSiegeAreaName];

      const rawinfo = navalSieges.desc.split("<br />");
      const info = rawinfo.map((x) => striptags(x));

      const navalSiege: Partial<NavalSiege> = {
        controlledBy: '',
        location: '',
        type: '',
        theaters: '',
        preparationDuration: '',
        captureDuration: '',
        timeWindows: [],
        dailyPayout: '',
        dailyItemPayout: undefined,
      };

      for (const line of info) {
        const parts = line.split('-').map(part => part.trim());
        const [key, value] = parts;
        console.log(key, value)

        switch (key) {
          case 'Controlled by':
            navalSiege.controlledBy = value;
            break;
          case 'Type':
            navalSiege.type = value;
            break;
          case 'Theaters':
            navalSiege.theaters = value;
            break;
          case 'Preparation Duration':
            navalSiege.preparationDuration = value;
            break;
          case 'Capture Duration':
            navalSiege.captureDuration = value;
            break;
          case 'Time Windows':
            navalSiege.timeWindows = value.split(',').map(time => time.trim());
            break;
          case 'Daily Payout':
            navalSiege.dailyPayout = value;
            break;
          case 'Daily Item Payout':
            navalSiege.dailyItemPayout = value.split(',').map(item => item.trim());
            break;
          default:
            // Other keys can be handled if needed
            break;
        }
      }

      navalSiege.location = info[1].trim();
    }

    return navalSiegesArray;
  };
};