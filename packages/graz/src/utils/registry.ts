import { valid } from "semver";

export const cleanVer = (ver: string) => {
  if (!valid(ver)) {
    const spaces = ver.split(".").length;
    switch (spaces) {
      case 1:
        return `${ver}.0.0`;
      case 2:
        return `${ver}.0`;
      case 3:
      default:
        throw new Error("invalid semver");
    }
  }
  return ver;
};
