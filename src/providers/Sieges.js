import striptags from "striptags";
import { RequestManager, Functions } from "../export.js"


export class Sieges {

  constructor(provider, options = { debug: false }) {
    this.provider = provider
    this.Functions = new Functions()
    this.RequestManager = new RequestManager()
  }

  /**
   * Get's All sieges in Nations server.
   * @returns {Object}
   */
  async getAllSieges() {
    let mapData = await this.RequestManager.getMapData({ server: "Nations" });
    let siegesArray = [];
    let siegeData = mapData.sets["siegewar.markerset"].markers;
    let siegeAreaNames = Object.keys(siegeData);

    for (let i = 0; i < siegeAreaNames.length; i++) {
      

      let siege = siegeData[siegeAreaNames[i]];
      let rawinfo = siege.desc.split("<br />");
      let info = rawinfo.map(x => striptags(x));
      let [siegeName, besiegedTown] = info[0].slice(7).split(`Town: `);
      let siegeType = info[1].slice(6);
      let siegeBal = info[2].slice(15);
      let timeLeft = info[3].slice(11);
      let warChest = info[4].slice(11);

      siegesArray.push({
        name: this.Functions.removeStyleCharacters(siegeName),
        town: this.Functions.removeStyleCharacters(besiegedTown),
        type: siegeType,
        points: siegeBal,
        time: timeLeft,
        warchest: warChest,
        x: siege.x,
        y: siege.y,
        z: siege.z,
      });
    }

    return [...new Set(siegesArray)];
  }

  /**
   * Get's All Naval sieges in Nations server.
   * @returns {Promise<{ name: any; controller: any; }[]>}
   */
async getNavalAllSieges() {

    let mapData = await this.RequestManager.getMapData();
    let navalSiegesArray = [];
    let navalSiegesData = mapData.sets["worldguard.markerset"].areas;
    let navalSiegesAreaNames = Object.keys(navalSiegesData);

    for (let i = 0; i < navalSiegesAreaNames.length; i++) {
      
        let navalSiege = navalSiegesData[navalSiegesAreaNames[i]];
        let rawinfo = navalSiege.desc.split("<br />");
        let info = rawinfo.map(x => striptags(x));
        let navalSiegeName = info[1];
        let navalSiegeController = info[3].split(" - ")[1].replace("*", "");

        navalSiegesArray.push({
            name: navalSiegeName,
            controller: navalSiegeController,
            type: info[0].includes("Movecraft") ? "movecraft" : "other" 
        });
    }

    return [...new Set(navalSiegesArray)];
}

}

/**
 * (method) Sieges.getNavalAllSieges(): Promise<{
    name: any;
    controller: any;
}[]>
Get's All Naval sieges 
 */