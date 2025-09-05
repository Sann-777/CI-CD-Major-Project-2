/**
 * Shared module entry point
 * Exports all shared utilities and configurations
 */

const ServerConfig = require('./config/serverConfig');

module.exports = {
  ServerConfig,
  config: {
    ServerConfig
  }
};
