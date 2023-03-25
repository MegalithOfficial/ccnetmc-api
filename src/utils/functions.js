import striptags from "striptags";
import { InvalidTypeData, DataNull } from "../export.js"
import types from '../types/types.js';


export class Functions {

  /**
   * Calculates Polygon area.
   * @param {Number} X 
   * @param {Number} Z 
   * @param {Number} numPoints 
   * @returns 
   */
    calcPolygonArea(X, Z, numPoints) {
      let area = 0;
      let j = numPoints - 1;
  
      for (let i = 0; i < numPoints; i++) {
        area = area + (X[j] + X[i]) * (Z[j] - Z[i]);
        j = i;
      };
  
      return Math.abs(area / 2);
    };

  /**
   * Format's the number.
   * @param {number} number
   * @returns {string} use parseInt() function to convert into number.
   */
  formatNumber(number) {
    return number
      .toString()
      .replaceAll(",", "")
      .replaceAll("$", "")
      .split(".")[0];
  }

  /**
   * Removes duplicated Arrays.
   * @param {Array} array
   * @returns
   */
  removeDuplicates(array) {
    return array.filter((a, b) => array.indexOf(a) === b);
  }

  /**
   * Removes Stylings from text.
   * @param {String} string
   * @returns
   */
  removeStyleCharacters(string) {
    return string.replace(/(&amp;.|&[0-9kmnola-z])/g, "");
  }

  /**
   * Process's raw player data.
   * @param {Object} playerObjOrArray
   * @returns playerdata
   */
  editPlayerProps(playerObjOrArray = {}) {
    if (!playerObjOrArray) throw new DataNull(types.errors.functionErrors.DataNull, types.errors.functionErrors.errorCodes.DataNull)

    const editPlayer = (player) => {
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
      editPlayer(playerObjOrArray);
    } else {
      throw new InvalidTypeData(types.errors.functionErrors.InvalidTypeData + " Array, Object", types.errors.functionErrors.errorCodes.InvalidTypeData)
    }

    return playerObjOrArray;
  }
}
