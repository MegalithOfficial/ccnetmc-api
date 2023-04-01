import types from "../types/types.js";
import striptags from "striptags";
import fs from "node:fs";
import { RequestManager, Functions } from "../export.js";

export class Towns {
  constructor(provider, options = { debug: false }) {
    this.provider = provider;
    this.Functions = new Functions();
    this.RequestManager = new RequestManager();
  }

  /**
   * Get All Towns in server.
   * @returns {object}
   */
  async getAllTowns(options = { server: "Nations" }) {

    if(options.server.toLocaleLowerCase() === "towny" ) {
      throw new Error("Towny Support currently not available.")
    } else {
    const mapData = await this.RequestManager.getMapData({
      server: options.server,
    });
    const ops = await this.provider.player.getOnlinePlayerData({
      server: options.server,
    });
    if (!mapData || !ops) return;
    if (!mapData.sets["towny.markerset"]) return;
    let townsArray = [],
      townsArrayNoDuplicates = [],
      townData = mapData.sets["towny.markerset"].areas,
      townAreaNames = Object.keys(townData);
    for (let i = 0; i < townAreaNames.length; i++) {
      let town = townData[townAreaNames[i]],
        rawinfo = town.desc.split("<br />");
      let info = [];

      rawinfo.forEach((x) => {
        info.push(striptags(x));
      });

      let vassal = info[1].includes("Vassal") || false;
      let vassalOf = (vassal && info[1].split(" ")[2]) || "none";
      let townName = "";
      let Occupiedby = "";
      let IsOccupied = "";

      let nationName = info[0].slice(10).trim();
      Occupiedby = info[2].split(" ")[1] || "none";
      IsOccupied = Occupiedby ? true : Occupiedby === "none" ? false : true ;

      let residents =
        info[12].slice(19).trim().split(", ") ||
        info[13].slice(19).trim().split(", ");
      let trusted = info[13].slice(20).trim() || info[14].slice(20).trim();
      let mayor = "";
      let peacefulness = "";
      let bank = 0;
      let upkeep = 0;

      if (info[8].slice(9).trim().includes("$")) bank = info[8].slice(9).trim();
      else if (info[9].slice(9).trim().includes("$"))
        bank = info[9].slice(9).trim();

      if (info[9].slice(11).trim().includes("$"))
        upkeep = info[9].slice(11).trim();
      else if (info[10].slice(11).trim().includes("$"))
        upkeep = info[10].slice(11).trim();

      if (info[3].includes("Mayor")) mayor = info[3].slice(9).replace(" ", "");
      else if (info[4].includes("Mayor"))
        mayor = info[4].slice(9).replace(" ", "");

      if (info[5].includes("Peaceful?"))
        peacefulness = info[5].slice(12).trim() == "true" ? true : false;
      else if (info[6].includes("Peaceful?"))
        peacefulness = info[6].slice(12).trim() == "true" ? true : false;

      if (info[1].includes("Vassal")) townName = info[2].split(" (")[0].trim();
      else if (!info[1].includes("Vassal") && !info[1].includes("Member"))
        townName = info[1].split(" (")[0].trim();

      let currentTown = {
        isVassal: vassal,
        vassalOf: vassalOf,
        area:
          this.Functions.calcPolygonArea(town.x, town.z, town.x.length) /
          16 /
          16,
        x: Math.round((Math.max(...town.x) + Math.min(...town.x)) / 2),
        z: Math.round((Math.max(...town.z) + Math.min(...town.z)) / 2),
        name: this.Functions.removeStyleCharacters(townName),
        nation: this.Functions.removeStyleCharacters(nationName),
        mayor: mayor,
        residents: residents,
        onlineResidents: ops.filter((op) =>
          residents.find((resident) => resident == op.name)
        ),
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
      townsArray.push(currentTown);
    }
    townsArray.forEach(function (a) {
      if (!this[a.name]) {
        let nationResidents = [];
        if (a.capital || a.nation != "No Nation") {
          for (let i = 0; i < townsArray.length; i++) {
            var currentNation = townsArray[i].nation;
            let residents = townsArray[i].residents;
            if (currentNation == a.nation) {
              for (let i = 0; i < residents.length; i++) {
                let currentResident = residents[i];
                nationResidents.push(currentResident);
              }
            }
          }
        }

        this[a.name] = {
          isVassal: a.isVassal,
          vassalof: a.vassalOf,
          name: a.name,
          nation: a.nation,
          residents: a.residents,
          area: a.area,
          mayor: a.mayor,
          capital: a.capital,
          x: a.x,
          z: a.z,
          bank: a.bank,
          upkeep: a.upkeep,
          peacefulness: a.peacefulness,
          trusted: a.trusted,
          colourCodes: a.colourCodes,
        };

        townsArrayNoDuplicates.push(this[a.name]);
      } else this[a.name].area += a.area;
    }, Object.create(null));
    return townsArrayNoDuplicates;
   }
  }

  /**
   * Get's speficic Town data in server.
   * @param {String} name
   * @returns {object}
   */
  async getTown(name, { server = "Nations" } = {}) {
    let towns = await this.getAllTowns({ server });
    return (
      towns.find((town) => town.name.toLowerCase() === name.toLowerCase()) ??
      null
    );
  }

  /**
   * Process's all of towns.
   * @private
   * @param {object} town
   * @param {boolean} includeBelonging
   * @param {object} nation
   * @returns {object}
   */
  invitable(town, nation, includeBelonging) {
    const distance = Math.hypot(
      town.x - nation.capitalX,
      town.z - nation.capitalZ
    );
    const differentNation = town.nation !== nation.name;
    const noNation = town.nation === "No Nation";
    return (
      distance <= 3000 && differentNation && (includeBelonging || noNation)
    );
  }

  /**
   * Get's all of inviteable towns.
   * @param {string} name
   * @param {boolean} includeBelonging
   * @returns {object}
   */
  async getInvitableTowns(name, includeBelonging, { server = "Nations" } = {}) {
    let nation = await this.provider.nations.getNation(name, { server });
    if (nation === "That nation does not exist!") return nation;

    let towns = await this.getAllTowns({ server });
    if (!towns) return;

    return towns.filter((town) =>
      this.invitable(town, nation, includeBelonging)
    );
  }
}
