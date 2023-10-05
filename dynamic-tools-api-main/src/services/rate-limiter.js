const moment = require('moment');

class AxiosRateLimit {
  constructor(axios) {
    this.timeslotRequests = 0;
    this.timeslotStart = null;
    this.lastScheduledRequestTime = null;

    this.interceptors = {
      request: null,
    };

    this.handleRequest = this.handleRequest.bind(this);

    this.enable(axios);
  }

  getMaxRPS() {
    const perSeconds = this.perMilliseconds / 1000;

    return this.maxRequests / perSeconds;
  }

  setMaxRPS(rps) {
    this.setRateLimitOptions({
      maxRequests: rps,
      perMilliseconds: 1000,
    });
  }

  setRateLimitOptions(options) {
    if (options.maxRPS) {
      this.setMaxRPS(options.maxRPS);
    } else {
      this.perMilliseconds = options.perMilliseconds;
      this.maxRequests = options.maxRequests;
    }
  }

  enable(axios) {
    this.interceptors.request = axios.interceptors.request.use(this.handleRequest, (error) => Promise.reject(error));
  }

  handleRequest(request) {
    return new Promise((resolve) => {
      const now = moment();

      if (!this.timeslotStart) {
        this.timeslotStart = now;
        this.lastScheduledRequestTime = now;
        this.timeslotRequests = 1;

        resolve(request);

        return;
      }

      if (this.timeslotStart.clone().add(1, 's').isBefore(now)) {
        this.timeslotStart = now;
        this.lastScheduledRequestTime = now;
        this.timeslotRequests = 1;

        resolve(request);

        return;
      }

      const isTimeslotStartInPast = this.timeslotStart.isSameOrBefore(now);

      if (this.timeslotRequests < this.maxRequests) {
        this.timeslotRequests++;

        if (isTimeslotStartInPast) {
          this.lastScheduledRequestTime = now;
          resolve(request);
        } else {
          const msecDiff = this.timeslotStart.diff(now, 'milliseconds');
          this.lastScheduledRequestTime = this.timeslotStart;

          setTimeout(() => {
            resolve(request);
          }, msecDiff);
        }

        return;
      }

      const nextTimeslotStart = this.lastScheduledRequestTime.clone().add(1, 's');
      const msecDiff = nextTimeslotStart.diff(now, 'milliseconds');
      this.timeslotStart = nextTimeslotStart;
      this.timeslotRequests = 1;

      this.lastScheduledRequestTime = this.timeslotStart;

      setTimeout(() => {
        resolve(request);
      }, msecDiff);
    });
  }
}

/**
 * Apply rate limit to axios instance.
 *
 * @example
 *   import axios from 'axios';
 *   import rateLimit from 'axios-rate-limit';
 *
 *   // sets max 2 requests per 1 second, other will be delayed
 *   // note maxRPS is a shorthand for perMilliseconds: 1000, and it takes precedence
 *   // if specified both with maxRequests and perMilliseconds
 *   const http = rateLimit(axios.create(), { maxRequests: 2, perMilliseconds: 1000, maxRPS: 2 })
 *    http.getMaxRPS() // 2
 *   http.get('https://example.com/api/v1/users.json?page=1') // will perform immediately
 *   http.get('https://example.com/api/v1/users.json?page=2') // will perform immediately
 *   http.get('https://example.com/api/v1/users.json?page=3') // will perform after 1 second from the first one
 *   http.setMaxRPS(3)
 *   http.getMaxRPS() // 3
 *   http.setRateLimitOptions({ maxRequests: 6, perMilliseconds: 150 }) // same options as constructor
 *
 * @param {Object} axios axios instance
 * @param {Object} options options for rate limit, available for live update
 * @param {Number} options.maxRequests max requests to perform concurrently in given amount of time.
 * @param {Number} options.perMilliseconds amount of time to limit concurrent requests.
 * @returns {Object} axios instance with interceptors added
 */
function axiosRateLimit(axios, options) {
  const rateLimitInstance = new AxiosRateLimit(axios);
  rateLimitInstance.setRateLimitOptions(options);

  return axios;
}

module.exports = axiosRateLimit;
