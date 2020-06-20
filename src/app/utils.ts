export default class Utils {
  static normalize(text: string) { return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }
  static normalizeAndSplit(text: string) { return Utils.normalize(text).split(" "); }
}
