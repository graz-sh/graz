import arg from "arg";

import { generate } from "./cli/generate";

const HELP_MESSAGE = `Usage: graz [options]

Options:

  -g, --generate        Generate chain definitions and export to "graz/chains"
  -h, --help            Show this help message

https://github.com/strangelove-ventures/graz
`;

async function cli() {
  try {
    const args = arg({
      "--generate": Boolean,
      "-g": "--generate",

      "--help": Boolean,
      "-h": "--help",
    });

    if (args["--help"]) {
      console.log(HELP_MESSAGE);
      return;
    }

    if (args["--generate"]) {
      await generate();
      return;
    }

    console.log(HELP_MESSAGE);
  } catch (error: unknown) {
    console.error(String(error));
  }
}

void cli();
