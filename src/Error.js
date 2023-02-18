export class InvalidServerType extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, InvalidServerType);
  };
};

export class InvalidPlayer extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, InvalidPlayer);
  };
};

export class NoPlayerInput extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, NoPlayerInput);
  };
};

export class FetchError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, FetchError);
  };
};