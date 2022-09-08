import { crate } from "./mod.ts";

export function compare(
  crate1: crate.Crate,
  crate2: crate.Crate,
): void {
  crate1.summarize();
  crate2.summarize();
}
