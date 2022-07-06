import { useGrazStore } from "../store";

export function useCheckKeplr() {
  return useGrazStore((x) => x._supported);
}
