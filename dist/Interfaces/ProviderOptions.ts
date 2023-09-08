import { CCnet } from "../main";

export interface ProviderOptions {
  provider: CCnet;
  options?: { debug: boolean };
};

export const defaultProviderOptions: ProviderOptions = {
  provider: new CCnet(),
  options: { debug: false }
};
