export type NationURL = "https://map.ccnetmc.com/nationsmap/standalone/dynmap_world.json";
export type NationMapURL = "https://map.ccnetmc.com/nationsmap/tiles/_markers_/marker_world.json";
export type ServerIp = "play.ccnetmc.com";

export interface RequestOptions {
  debug?: boolean;
  nationURL: NationURL;
  nationMapURL: NationMapURL;
  serverIp: ServerIp;
};

export interface MotdJson {
  extra: {
    extra: {
      bold: boolean;
      extra: {
        color: string;
        text: string;
      }[];
      text: string;
    }[];
    text: string;
  }[];
  text: string;
};

export interface ServerStatus {
  status: string;
  online: boolean;
  motd: string;
  motd_json: MotdJson;
  favicon: string;
  error: string;
  last_online: string;
  last_updated: string;
  duration: string;
  players: {
    max: number;
    now: number;
  };
  server: {
    name: string;
    protocol: number;
  };
};

export interface MapData {
  sets: {
    'chunky.markerset': MarkerSet;
    'towny.markerset': MarkerSet;
    quickshop: MarkerSet;
    'worldguard.markerset': MarkerSet;
    'siegewar.markerset': MarkerSet;
    markers: MarkerSet;
  };
  timestamp: number;
};

export interface MarkerSet {
  hide: boolean;
  circles: Record<string, unknown>;
  areas: [];
  label: string;
  markers: Record<string, unknown>;
  lines: Record<string, unknown>;
  layerprio: number;
};