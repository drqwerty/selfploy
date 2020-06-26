export default class Utils {
  /**
   * Remove latin characters and apply 
   * @param text Text to normalize
   * @returns The same lowecase text but without latin characters
   */
  static normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  /**
   * Remove latin characters from a string and split it by spaces
   * @param text Text to normalize
   * @returns The same lowecase text splitted by spaces but without latin characters
   */
  static normalizeAndSplit(text: string) { return Utils.normalize(text).split(" "); }

  // https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula/27943#27943
  /**
   * Calculate distance in km between two geopoints
   */
  static getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = Utils.deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = Utils.deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(Utils.deg2rad(lat1)) * Math.cos(Utils.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
  }

  private static deg2rad(deg) {
    return deg * (Math.PI / 180)
  }
}
