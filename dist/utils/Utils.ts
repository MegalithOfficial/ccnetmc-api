import striptags from "striptags";
import { Player } from "../Interfaces/PlayerProvider";
import { DataNull, InvalidTypeData } from "./Errors";
import { Town } from "../Interfaces/Town";

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

  public static removeStyleCharacters(string: string): string | undefined {
    console.log(string)
    return string.length >= 0 ? string.replace(/(&amp;.|&[0-9kmnola-z])/g, "") : "";
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

  public static extractTownData(stringArray: any, ops: any) {
    const obj: Partial<Town> = {
      isOccupied: false,
      occupiedBy: null,
      isVassal: false,
      vassalOf: null,
      nation: null
    };

    const keyPatterns = {
      mayor: /Mayor:\s*(\w+)/,
      founded: /Founded:\s*(.+)/,
      residents: /Residents \((\d+)\): (.+)/,
      trusted_players: /Trusted Players:\s*([\w\s,]+)$/,
      peaceful: /Peaceful\?\s*(true|false)/i,
      bank: /Bank:\s*\$([0-9,.]+)/,
      upkeep: /Upkeep:\s*\$([0-9,.]+)/,
      board: /Board:\s*(.+)/,
      culture: /Culture:\s*(.+)/,
      vassal_of: /Vassal of\s*(.+)/,
      area: /Area:\s*([\d,.]+)/,
      nation: /(Member|Capital) of\s*(.+)/,
      occupied_by: /Occupied by\s*(.+)/,
      resources: /Resources:\s*([\w\s,]+)/
    };

    for (const line of stringArray) {
      for (const [key, pattern] of Object.entries(keyPatterns)) {
        const match = line.match(pattern);
        if (match) {
          switch (key) {
            case 'vassal_of':
              obj["vassalOf"] = match[1].trim();
              obj.isVassal = true;
              break;
            case 'occupied_by':
              obj["occupiedBy"] = match[1].trim();
              obj.isOccupied = true;
              break;
            case 'peaceful':
              obj[key] = match[1].toLowerCase() === 'true';
              break;
            case 'bank':
            case 'upkeep':
              obj[key] = parseFloat(match[1].replace(/[^0-9.]+/g, ''));
              break;
            case 'residents':
              obj[key] = match[2].split(', ').map(name => name.trim());
              break;
            case 'trusted_players':
              obj[key] = match[1].split(', ').map(name => name.trim());
              break;
            case 'resources':
              obj[key] = match[1].split(',').map(resource => resource.trim());
              break;
            case 'area':
              obj[key] = parseFloat(match[1].replace(/[^0-9.]+/g, ''));
              break;
            case 'nation':
              obj[key] = match[2].trim();
              obj.capital = match[1] === 'Capital';
              break;
            default:
              obj[key] = match[1];
              break;
          }
          break;
        }
      }
    }

    obj.name = stringArray[0].trim() || stringArray[1].trim();
    console.log(obj)

    return obj as Town;
  };
};