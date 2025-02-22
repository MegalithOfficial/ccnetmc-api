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

  public static extractTownData(stringArray: string[], ops: any): Town {
    if (!Array.isArray(stringArray) || stringArray.length === 0) {
      throw new DataNull({ message: "Invalid town data array", code: 204 });
    }

    const patterns = new Map([
      ['mayor', { regex: /Mayor:\s*(\w+)/ }],
      ['founded', { regex: /Founded:\s*(.+)/ }],
      ['residents', { 
        regex: /Residents \((\d+)\): (.+)/, 
        transform: (m: string[]) => m[2].split(', ')
      }],
      ['trusted_players', { 
        regex: /Trusted Players:\s*([\w\s,]+)$/,
        transform: (m: string[]) => m[1].split(', ')
      }],
      ['peaceful', { 
        regex: /Peaceful\?\s*(true|false)/i,
        transform: (m: string[]) => m[1].toLowerCase() === 'true'
      }],
      ['bank', { 
        regex: /Bank:\s*\$([0-9,.]+)/,
        transform: (m: string[]) => +m[1].replace(/[^0-9.]/g, '')
      }],
      ['upkeep', { 
        regex: /Upkeep:\s*\$([0-9,.]+)/,
        transform: (m: string[]) => +m[1].replace(/[^0-9.]/g, '')
      }],
      ['board', { regex: /Board:\s*(.+)/ }],
      ['culture', { regex: /Culture:\s*(.+)/ }],
      ['area', { 
        regex: /Area:\s*([\d,.]+)/,
        transform: (m: string[]) => +m[1].replace(/[^0-9.]/g, '')
      }],
      ['resources', { 
        regex: /Resources:\s*([\w\s,]+)/,
        transform: (m: string[]) => m[1].split(',').map(r => r.trim())
      }]
    ]);

    // Initialize town data
    const townData: Partial<Town> = {
      isOccupied: false,
      occupiedBy: null,
      isVassal: false,
      vassalOf: null,
      nation: null,
      name: stringArray[0]?.trim() || stringArray[1]?.trim() || ''
    };

    const specialPatterns = [
      {
        regex: /(Member|Capital) of\s*(.+)/,
        handler: (match: RegExpMatchArray) => {
          townData.nation = match[2].trim();
          townData.capital = match[1] === 'Capital';
        }
      },
      {
        regex: /Vassal of\s*(.+)/,
        handler: (match: RegExpMatchArray) => {
          townData.vassalOf = match[1].trim();
          townData.isVassal = true;
        }
      },
      {
        regex: /Occupied by\s*(.+)/,
        handler: (match: RegExpMatchArray) => {
          townData.occupiedBy = match[1].trim();
          townData.isOccupied = true;
        }
      }
    ];

    for (const line of stringArray) {
      let matched = false;
      for (const { regex, handler } of specialPatterns) {
        const match = line.match(regex);
        if (match) {
          handler(match);
          matched = true;
          break;
        }
      }
      if (matched) continue;

      // Check regular patterns
      for (const [key, { regex, transform }] of patterns) {
        const match = line.match(regex);
        if (match) {
          townData[key as keyof Town] = (transform ? transform(match) : match[1]) as any;
          break;
        }
      }
    }

    return townData as Town;
  };
};