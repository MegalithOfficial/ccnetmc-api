import { ErrorOptions } from "../Interfaces/ErrorOptions";

export class CustomError extends Error {
  public code: number | string;

  constructor(options: ErrorOptions) {
    super(options.message);
    this.name = this.constructor.name;
    this.code = options?.code || "UNKNOWN_CODE";
    Error.captureStackTrace(this, this.constructor);
  };
};

export class InvalidServerType extends CustomError {};

export class InvalidPlayer extends CustomError {};

export class NoPlayerInput extends CustomError {};

export class FetchError extends CustomError {};

export class InvalidTypeData extends CustomError {};

export class DataNull extends CustomError {};