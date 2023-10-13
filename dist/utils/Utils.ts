import striptags from "striptags";
import { Player } from "../Interfaces/PlayerProvider";
import { DataNull, InvalidTypeData } from "./Errors";
import { RawTownData, Town } from "../Interfaces/Town";

export class Utils {

  public static calcPolygonArea(X: number[], Z: number[], numPoints: number): number {
    let area = 0;
    let j = numPoints - 1;

    for (let i = 0; i < numPoints; i++) {
      area = area + (X[j] + X[i]) * (Z[j] - Z[i]);
      j = i;
    }

    return Math.abs(area / 2);
  };

  public static formatNumber(number: number | string): string {
    return number
      .toString()
      .replace(/,/g, "")
      .replace(/\$/g, "")
      .split(".")[0];
  };

  public static removeDuplicates<T>(array: T[]): T[] {
    return array.filter((a, b) => array.indexOf(a) === b);
  };

  public static removeStyleCharacters(string: string): string {
    return string.replace(/(&amp;.|&[0-9kmnola-z])/g, "");
  };
  
  public static editPlayerProps(playerObjOrArray: Player | Player[]): Player | Player[] {
    if (!playerObjOrArray) throw new DataNull({ message: "Data is null.", code: 204 });

    const editPlayer = (player: any) => {
      player.isUnderground = player.world === "-some-other-bogus-world-";
      player.nickname = striptags(player.name);
      player.name = player.account;

      ["account", "world", "sort", "armor", "health", "type"].forEach(
        (prop) => delete player[prop]
      );
    };

    if (Array.isArray(playerObjOrArray)) {
      if (playerObjOrArray.length === 0) return playerObjOrArray;

      playerObjOrArray.forEach(editPlayer);
    } else if (
      typeof playerObjOrArray === "object" &&
      Object.keys(playerObjOrArray).length > 0
    ) {
      editPlayer(playerObjOrArray as Player);
    } else {
      throw new InvalidTypeData({ message: "Data type is Invalid. Expected data type: Player or Player[]", code: 404 });
    }

    return playerObjOrArray;
  };

  public static extractTownData(TownRownData: any, ops: any) {

    const data: Town = {
      isOccupied: false,
      occupiedBy: "",
      board: "",
      culture: "",
      isVassal: false,
      vassalOf: "",
      area: 0,
      x: 0,
      z: 0,
      name: "",
      nation: "",
      mayor: "",
      residents: [],
      resources: [],
      onlineResidents: [],
      capital: false,
      bank: "",
      upkeep: "",
      peacefulness: true,
      trusted: [],
      colourCodes: {
        fill: "",
        outline: "",
      },
    };  

    for (const line of TownRownData) {
      
      if (line.includes('Occupying Nation')) {
        data.isOccupied = line.trim() !== 'Occupying Nation -';
        data.occupiedBy = data.isOccupied ? line.replace('Occupying Nation -', '').trim() : null;
      } else if (line.includes('Board - ')) {
        data.board = line.replace('Board - ', '').replace(/•/g, '').trim();
      } else if (line.includes('Culture - ')) {
        data.culture = line.replace('Culture - ', '').replace(/•/g, '').trim(); 
      } else if (line.includes('Vassal of ')) {
        data.isVassal = true;
        data.vassalOf = line.replace('Vassal of ', '').trim();
      } else if (line.includes('Area - ')) {
        data.area = line.replace('Area - ', '').trim();
      } else if (line.includes('Mayor - ')) {
        data.mayor = line.replace('Mayor - ', '').trim();
      } else if (line.includes('Residents (')) {
        const residentsStr = line.match(/-\s(.*?)\s*$/)[1];
        data.residents = residentsStr.split(', ');
      } else if (line.includes('Trusted Players - ')) {
        const trustedPlayersStr = line.replace('Trusted Players - ', '').replace(/•/g, '').trim();
        data.trusted = trustedPlayersStr.split(',').map((player: string) => player.trim());
      } else if (line.includes('Member of')) {
        data.nation = line.replace('Member of ', '').trim();
      } else if (line.includes('Capital of')) {
        data.nation = line.replace('Capital of ', '').trim();
        data.capital = true;
      } else if(line.includes("Bank -")) {
        const parsedBank = parseFloat(Utils.formatNumber(line.split("Bank -")[1]))
        data.bank = parsedBank
      } else if(line.includes("Upkeep -")) { 
        const parsedBank = parseFloat(Utils.formatNumber(line.split("Upkeep -")[1]))
        data.upkeep = parsedBank
      } else if(line.includes("Resources -")) {
        const resourcesstr = line.match(/-\s(.*?)\s*$/)[1];
        data.resources = resourcesstr.split(", ").map(item => item.trim());
      } else if(line.includes("Peaceful?")) {
        const match = line.match(/\btrue\b|\bfalse\b/)[0];
        data.peacefulness = match === "true";
      } else data.name = TownRownData[1].trim() || TownRownData[2].trim(); 
    }
  
    data.onlineResidents = ops.filter((op: any) => data.residents.includes(op.name));  
    if(data.vassalOf.length === 0) data.vassalOf = "none";
  
    return data;
  };
};