import striptags from "striptags";

export class Functions {

  constructor() { };

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
    return number.toString().replaceAll(",", "").replaceAll("$", "").split(".")[0];
  }

  /**
   * Removes duplicated Arrays.
   * @param {Array} array 
   * @returns 
   */
  removeDuplicates(array) {
    return array.filter((a, b) => array.indexOf(a) === b);
  };

  /**
   * Removes Stylings from text.
   * @param {String} string 
   * @returns 
   */
  removeStyleCharacters(string) {
    return string.replace(/(&amp;.|&[0-9kmnola-z])/g, "");
  };

  /**
   * Process's raw player data.
   * @param {Object} playerObjOrArray 
   * @returns playerdata
   */
  editPlayerProps(playerObjOrArray = {}) {
    if (!playerObjOrArray) throw Error("Data is null.");

    if (playerObjOrArray instanceof Array) {
      if (playerObjOrArray.length === 0) return playerObjOrArray;

      playerObjOrArray.forEach(player => {
        if (player.world == "-some-other-bogus-world-") {
          player["isUnderground"] = true;
        } else player["isUnderground"] = false;

        player['nickname'] = striptags(player['name']);
        delete player.name;

        player['name'] = player['account'];
        delete player.account;

        delete player.world;
        delete player.sort;
        delete player.armor;
        delete player.health;
        delete player.type;
      })

      return playerObjOrArray;
    }
    else if (playerObjOrArray instanceof Object) {
      if (Object.keys(playerObjOrArray).length === 0) return playerObjOrArray;

      if (playerObjOrArray.world == "-some-other-bogus-world-") {
        playerObjOrArray["isUnderground"] = true;
      } else playerObjOrArray["isUnderground"] = false;

      playerObjOrArray['nickname'] = striptags(playerObjOrArray['name']);
      delete playerObjOrArray.name;

      playerObjOrArray['name'] = playerObjOrArray['account'];
      delete playerObjOrArray.account;

      delete playerObjOrArray.world;
      delete playerObjOrArray.sort;
      delete playerObjOrArray.armor;
      delete playerObjOrArray.health;
      delete playerObjOrArray.type;

      return playerObjOrArray;
    }
    else {
      throw Error("Data is not an Object or Array.");
    };
  };
};