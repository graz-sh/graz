import { setupAuthExtension, setupBankExtension, setupIbcExtension, setupStakingExtension } from "@cosmjs/stargate";
import { useQueryClient as useGrazQueryClient } from "graz";

export const useQueryClient = () =>
  useGrazQueryClient(setupAuthExtension, setupBankExtension, setupStakingExtension, setupIbcExtension);
