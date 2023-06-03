import path from "node:path";

import tiged from "tiged";

export const cloneRegistry = async (src?: string) => {
  // eslint-disable-next-line no-param-reassign
  src = src || process.env.GRAZ_REGISTRY_SRC || "github:cosmos/chain-registry";
  const emitter = tiged(src, { force: true, mode: "tar" });
  await emitter.clone(path.resolve(__dirname, "../../registry"));
};
