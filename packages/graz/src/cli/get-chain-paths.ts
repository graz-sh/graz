import path from "node:path";

import type { Options as GlobbyOptions } from "globby";
import { globby } from "globby";

export const getChainPaths = async ({
  mainnetFilter: mf,
  testnetFilter: tf,
}: {
  mainnetFilter?: string[];
  testnetFilter?: string[];
} = {}) => {
  const globOpts: GlobbyOptions = {
    cwd: path.resolve(__dirname, "../../registry"),
    onlyDirectories: true,
  };

  const [mainnetPaths, testnetPaths] = await Promise.all([
    globby([...(mf && mf.length > 0 ? mf : ["*"]), "!_*", "!testnets"], globOpts),
    globby([...(tf && tf.length > 0 ? tf.map((f) => `testnets/${f}`) : ["testnets/*"]), "!testnets/_*"], globOpts),
  ]);

  return { mainnetPaths, testnetPaths };
};
