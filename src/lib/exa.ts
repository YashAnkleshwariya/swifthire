import Exa from "exa-js";

export function getExaClient() {
  return new Exa(process.env.EXA_API_KEY!);
}
