import _ from "lodash";

import type { GrazAccountSession } from "../store";

export const mergeSessions = ({ prev, next }: { prev?: GrazAccountSession[] | null; next: GrazAccountSession[] }) => {
  if (!prev) return next;
  const prevKeys = prev.map((v) => v.chainId);
  const nextKeys = next.map((v) => v.chainId);
  const keys = _.uniq([...prevKeys, ...nextKeys]);
  const result = keys.map((key) => {
    const prevValue = prev.find((v) => v.chainId === key);
    const nextValue = next.find((v) => v.chainId === key);
    const value = nextValue || prevValue;
    return {
      ...value!,
      chainId: key,
    };
  });
  return result;
};
