import striptags from "striptags";
import { Player } from "../Interfaces/PlayerProvider";
import { DataNull, InvalidTypeData } from "./Errors";

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

    const editPlayer = (player: Player) => {
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
};