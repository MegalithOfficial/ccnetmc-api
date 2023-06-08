export declare class CustomError extends Error {
  code: string;

  constructor(message: string, code?: string);
}

export declare class InvalidServerType extends CustomError {}

export declare class InvalidPlayer extends CustomError {}

export declare class NoPlayerInput extends CustomError {}

export declare class FetchError extends CustomError {}

export declare class InvalidTypeData extends CustomError {}

export declare class DataNull extends CustomError {}
