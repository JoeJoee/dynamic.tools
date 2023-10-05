class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class DuplicateError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class RestrictedAccessError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class ExportError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class MissingConfigurationParameter extends Error {
  constructor(paramName) {
    super(`The parameter ${paramName} is not set, please review the configuration`);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class InvalidServerParameterError extends Error {
  constructor(paramName) {
    super(`The server parameter ${paramName} is invalid`);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class NftCollectionRefreshError extends Error {
  constructor(details) {
    super(`Failed to refresh NFT collection data (${details})`);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class PriceServiceApiError extends Error {
  constructor(resourceName) {
    super(`Failed to get the current price for ${resourceName}`);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class IncorrectDurationCodeApiError extends Error {
  constructor(durationCode) {
    super(`Incorrect duration code has been passed in request: ${durationCode}`);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class MissingCollectionSlugApiError extends Error {
  constructor() {
    super('Missing collection slug parameter');
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class IncorrectCurrencyApiError extends Error {
  constructor(currency) {
    super(`Incorrect currency parameter: ${currency}`);
    this.name = this.constructor.name;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

module.exports = {
  NotFoundError,
  DuplicateError,
  RestrictedAccessError,
  ExportError,
  MissingConfigurationParameter,
  InvalidServerParameterError,
  NftCollectionRefreshError,
  PriceServiceApiError,
  IncorrectCurrencyApiError,
  IncorrectDurationCodeApiError,
  MissingCollectionSlugApiError,
};
