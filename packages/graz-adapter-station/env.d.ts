type StationWindow = import("@terra-money/station-wallet").Window;
import { Station } from "@terra-money/station-connector";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
declare interface Window extends StationWindow {
  station?: Station;
}
