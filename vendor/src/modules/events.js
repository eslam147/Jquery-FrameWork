/**
 * Events Module - Event handling utilities
 */
(function(Framework) {
    'use strict';

    var Events = {
        /**
         * Attach event handler
         * Usage: $('.btn').fw('events').on('click', handler);
         */
        on: function(event, selector, handler) {
            var $this = this;
            
            // If selector is function, it's the handler
            if (typeof selector === 'function') {
                handler = selector;
                selector = null;
            }
            
            if (selector) {
                // Event delegation
                return $this.on(event, selector, handler);
            } else {
                return $this.on(event, handler);
            }
        },

        /**
         * Remove event handler
         * Usage: $('.btn').fw('events').off('click');
         */
        off: function(event, selector, handler) {
            var $this = this;
            
            if (typeof selector === 'function') {
                handler = selector;
                selector = null;
            }
            
            if (selector) {
                return $this.off(event, selector, handler);
            } else {
                return $this.off(event, handler);
            }
        },

        /**
         * Trigger event
         * Usage: $('.btn').fw('events').trigger('click');
         */
        trigger: function(event, data) {
            return this.trigger(event, data);
        },

        /**
         * One-time event handler
         * Usage: $('.btn').fw('events').once('click', handler);
         */
        once: function(event, handler) {
            var $this = this;
            var wrappedHandler = function() {
                handler.apply(this, arguments);
                $this.off(event, wrappedHandler);
            };
            return $this.on(event, wrappedHandler);
        },

        /**
         * Click handler shortcut
         * Usage: $('.btn').fw('events').click(handler);
         */
        click: function(handler) {
            return this.on('click', handler);
        },

        /**
         * Submit handler shortcut
         * Usage: $('form').fw('events').submit(handler);
         */
        submit: function(handler) {
            return this.on('submit', handler);
        },

        /**
         * Change handler shortcut
         * Usage: $('select').fw('events').change(handler);
         */
        change: function(handler) {
            return this.on('change', handler);
        },

        /**
         * Ready handler
         * Usage: Framework.events.ready(function() { ... });
         */
        ready: function(handler) {
            $(document).ready(handler);
        },

        /**
         * AJAX on click - Click event with AJAX request
         * Usage: $('.btn').fw('events').ajaxClick('/api/data', {method: 'GET'}, callback);
         */
        ajaxClick: function(url, options, callback) {
            var $this = this;
            options = options || {};
            
            return $this.on('click', function(e) {
                e.preventDefault();
                
                var ajaxOptions = {
                    url: url,
                    method: options.method || 'GET',
                    data: options.data || {},
                    success: callback || options.success || function(response) {
                        console.log('Success:', response);
                    },
                    error: options.error || Framework.ajax.defaultErrorHandler
                };
                
                Framework.ajax.request(ajaxOptions);
            });
        },

        /**
         * AJAX on submit - Form submit with AJAX
         * Usage: $('form').fw('events').ajaxSubmit('/api/save', callback);
         */
        ajaxSubmit: function(url, options, callback) {
            var $this = this;
            options = options || {};
            
            return $this.on('submit', function(e) {
                e.preventDefault();
                
                var form = $(this);
                var data = Framework.modules.form.serializeObject.call(form);
                
                var ajaxOptions = {
                    url: url,
                    method: options.method || form.attr('method') || 'POST',
                    data: data,
                    success: callback || options.success || function(response) {
                        console.log('Success:', response);
                    },
                    error: options.error || Framework.ajax.defaultErrorHandler
                };
                
                Framework.ajax.request(ajaxOptions);
            });
        },

        /**
         * AJAX on change - Change event with AJAX
         * Usage: $('select').fw('events').ajaxChange('/api/update', callback);
         */
        ajaxChange: function(url, options, callback) {
            var $this = this;
            options = options || {};
            
            return $this.on('change', function() {
                var $field = $(this);
                var data = {};
                data[$field.attr('name')] = $field.val();
                
                var ajaxOptions = {
                    url: url,
                    method: options.method || 'POST',
                    data: $.extend(data, options.data || {}),
                    success: callback || options.success || function(response) {
                        console.log('Success:', response);
                    },
                    error: options.error || Framework.ajax.defaultErrorHandler
                };
                
                Framework.ajax.request(ajaxOptions);
            });
        }
    };

    // Register module
    Framework.register('events', Events);
    Framework.events = Events;

})(window.Framework || {});
