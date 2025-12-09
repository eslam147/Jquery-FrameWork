/**
 * Logger Module - Logging system for debugging and monitoring
 * For large projects
 */

(function(Framework) {
    'use strict';

    var Logger = {
        /**
         * Log levels
         */
        levels: {
            DEBUG: 0,
            INFO: 1,
            WARN: 2,
            ERROR: 3,
            NONE: 4
        },

        /**
         * Current log level (default: WARN in production, DEBUG in development)
         */
        level: typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost' 
            ? 0 // DEBUG in development
            : 2, // WARN in production

        /**
         * Log storage (for sending to server)
         */
        logs: [],

        /**
         * Max logs to store
         */
        maxLogs: 100,

        /**
         * Log a message
         * @param {number} level - Log level
         * @param {string} message - Log message
         * @param {*} data - Additional data
         */
        log: function(level, message, data) {
            if (level < this.level) {
                return; // Don't log if below current level
            }

            var timestamp = new Date().toISOString();
            var logEntry = {
                timestamp: timestamp,
                level: level,
                message: message,
                data: data
            };

            // Store log
            this.logs.push(logEntry);
            if (this.logs.length > this.maxLogs) {
                this.logs.shift(); // Remove oldest
            }

            // Console output
            var levelName = Object.keys(this.levels).find(function(key) {
                return Logger.levels[key] === level;
            });

            if (level === this.levels.ERROR) {
                console.error('[' + levelName + ']', message, data || '');
            } else if (level === this.levels.WARN) {
                console.warn('[' + levelName + ']', message, data || '');
            } else if (level === this.levels.INFO) {
                console.info('[' + levelName + ']', message, data || '');
            } else {
                console.log('[' + levelName + ']', message, data || '');
            }
        },

        /**
         * Debug log
         * @param {string} message - Log message
         * @param {*} data - Additional data
         */
        debug: function(message, data) {
            this.log(this.levels.DEBUG, message, data);
        },

        /**
         * Info log
         * @param {string} message - Log message
         * @param {*} data - Additional data
         */
        info: function(message, data) {
            this.log(this.levels.INFO, message, data);
        },

        /**
         * Warning log
         * @param {string} message - Log message
         * @param {*} data - Additional data
         */
        warn: function(message, data) {
            this.log(this.levels.WARN, message, data);
        },

        /**
         * Error log
         * @param {string} message - Log message
         * @param {*} data - Additional data
         */
        error: function(message, data) {
            this.log(this.levels.ERROR, message, data);
        },

        /**
         * Set log level
         * @param {number} level - Log level
         */
        setLevel: function(level) {
            this.level = level;
        },

        /**
         * Get all logs
         * @returns {Array} Array of log entries
         */
        getLogs: function() {
            return this.logs.slice(); // Return copy
        },

        /**
         * Clear logs
         */
        clear: function() {
            this.logs = [];
        },

        /**
         * Send logs to server (for monitoring)
         * @param {string} url - Server endpoint
         * @returns {Promise} Promise that resolves when logs are sent
         */
        sendToServer: function(url) {
            if (this.logs.length === 0) {
                return Promise.resolve();
            }

            var logsToSend = this.logs.slice();
            this.clear();

            return new Promise(function(resolve, reject) {
                if (typeof Framework !== 'undefined' && Framework.Ajax) {
                    Framework.Ajax.post(url, null, { logs: logsToSend })
                        .then(resolve)
                        .catch(reject);
                } else {
                    // Fallback: use fetch
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ logs: logsToSend })
                    })
                    .then(resolve)
                    .catch(reject);
                }
            });
        }
    };

    // Register module
    Framework.logger = Logger;
    Framework.register('logger', Logger);

    // Make available globally
    window.Logger = Logger;

})(window.Framework || {});

