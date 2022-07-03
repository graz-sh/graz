export function getKeplr() {
  if (typeof window.keplr !== "undefined") return window.keplr;
  throw new Error("Keplr is not defined");
}
