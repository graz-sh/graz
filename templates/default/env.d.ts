/// <reference types="graz/env" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPORT_DOCS?: string;
  }
}
