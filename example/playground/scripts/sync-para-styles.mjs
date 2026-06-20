import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const source = fileURLToPath(import.meta.resolve("@getpara/react-sdk-lite/styles.css"));
const target = join(dirname(fileURLToPath(import.meta.url)), "../public/para-styles.css");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);
