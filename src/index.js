import fsp from 'fs-promise';
import isEqual from 'is-equal';

const logger = console;

export default class AxioxRecorder {
  constructor(options = {}) {
    this.serverFile = options.serverFile || 'server.json';
    this.prefix = options.prefix || '';
    this.enabled = options.enabled || true;
    this.excludes = options.excludes || { excludePostBody: false };
    this.persistHandler = options.persistHandler;
    this.mocks = [];
  }

  /**
   * Records the request/response.
   *
   * @param {Object} response the response object
   *
   * @returns {Object} the response
   */
  async record(response) {
    const method = response.request.method.toLowerCase();

    const mock = {
      request: {
        path: `${this.prefix}${response.request.path}`,
        headers: this._filterHeaders(response.request._header),
        method,
      },
      response: {
        code: response.status,
        headers: response.headers,
        body: response.data
      },
    };

    if (method === 'post' || method === 'put') {
      mock.request.body = response.config.data;

      try {
        if (typeof mock.request.body === 'string' && typeof mock.response.body === 'object') {
          mock.request.body = JSON.parse(mock.request.body);
        }
      } catch (error) {
        logger.error('Unable to parse request body');
      }
    }

    this.mocks.push(mock);

    await this._writeMocks(this.mocks);

    if (typeof this.persistHandler === 'function') {
      await this.persistHandler(this.mocks);
    }

    return response;
  }

  /**
   * Registers recorder with Axios instance.
   *
   * @param {Object} axios   axios instance
   * @param {Object} options recording options
   *
   * @returns {Object} the axios instance
   */
  register(axios, options = {}) {
    if (options.prefix) {
      this.prefix = options.prefix;
    }

    if (this.enabled) {
      axios.interceptors.response.use(this.record.bind(this));
    }

    return axios;
  }

  /**
   * Extract request headers object.
   *
   * @param {String} header the request header line
   *
   * @returns {Object} the request header
   */
  _filterHeaders(header) {
    const headers = {};

    header.split('\r\n').forEach((line) => {
      if (line.trim().length > 0 && line.indexOf(':') > -1) {
        const parts = line.trim().split(':');

        headers[parts[0].trim().replace(':', '').toLowerCase()] = parts[1].trim().toLowerCase();
      }
    });

    return headers;
  }

  /**
   * Writes mocks to a file. This is the default behaviour.
   *
   * @param {Object[]} mocks list of mocks to persist
   *
   * @returns {undefined}
   */
  async _writeMocks(mocks) {
    try {
      let server;
      const path = `${process.cwd()}/${this.serverFile}`;

      if (fsp.existsSync(path)) {
        server = await fsp.readJson(path);
      } else {
        server = {
          mocks: [],
        };
      }

      mocks.forEach((mock) => {
        if (!this._mockExists(server.mocks, mock)) {
          logger.log('New Mock:', mock.request.path);
          server.mocks.push(mock);
        }
      });

      await fsp.writeJson(path, server);
    } catch (error) {
      logger.error(error);
    }
  }

  /**
   * Checks whether a mock already exists in list.
   *
   * @param {Object[]} mocks list of mocks
   * @param {Object}   mock  mock to check
   *
   * @returns {Boolean} true if it exists, otherwise false
   */
  _mockExists(mocks, mock) {
    return mocks.some(existing => isEqual(existing.request, mock.request));
  }
}
