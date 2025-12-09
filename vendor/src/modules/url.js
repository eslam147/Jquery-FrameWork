/**
 * URL Module - URL manipulation utilities
 */
(function(Framework) {
    'use strict';

    var Url = {
        /**
         * Get URL parameter
         * Usage: var id = Framework.url.getParam('id');
         */
        getParam: function(name) {
            var urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        },

        /**
         * Get all URL parameters
         * Usage: var params = Framework.url.getParams();
         */
        getParams: function() {
            var params = {};
            var urlParams = new URLSearchParams(window.location.search);
            urlParams.forEach(function(value, key) {
                params[key] = value;
            });
            return params;
        },

        /**
         * Set URL parameter
         * Usage: Framework.url.setParam('id', '123');
         */
        setParam: function(name, value) {
            var url = new URL(window.location);
            url.searchParams.set(name, value);
            window.history.pushState({}, '', url);
            return true;
        },

        /**
         * Remove URL parameter
         * Usage: Framework.url.removeParam('id');
         */
        removeParam: function(name) {
            var url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.pushState({}, '', url);
            return true;
        },

        /**
         * Get current URL
         * Usage: var url = Framework.url.current();
         */
        current: function() {
            return window.location.href;
        },

        /**
         * Get base URL
         * Usage: var base = Framework.url.base();
         */
        base: function() {
            return window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
        },

        /**
         * Navigate to URL
         * Usage: Framework.url.go('/page');
         */
        go: function(url) {
            window.location.href = url;
        },

        /**
         * Reload page
         * Usage: Framework.url.reload();
         */
        reload: function() {
            window.location.reload();
        },

        /**
         * Get hash from URL
         * Usage: var hash = Framework.url.getHash();
         */
        getHash: function() {
            return window.location.hash.substring(1);
        },

        /**
         * Set hash in URL
         * Usage: Framework.url.setHash('section1');
         */
        setHash: function(hash) {
            window.location.hash = hash;
            return true;
        }
    };

    // Register module
    Framework.register('url', Url);
    Framework.url = Url;

})(window.Framework || {});

