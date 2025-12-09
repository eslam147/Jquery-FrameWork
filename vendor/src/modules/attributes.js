/**
 * Attributes Module - Attribute and property utilities
 */
(function(Framework) {
    'use strict';

    var Attributes = {
        /**
         * Get attribute value
         * Usage: $('.element').fw('attributes').attr('data-id');
         */
        attr: function(name, value) {
            var $this = this;
            if (value !== undefined) {
                return $this.attr(name, value);
            }
            return $this.attr(name);
        },

        /**
         * Get property value
         * Usage: $('input').fw('attributes').prop('checked');
         */
        prop: function(name, value) {
            var $this = this;
            if (value !== undefined) {
                return $this.prop(name, value);
            }
            return $this.prop(name);
        },

        /**
         * Get/set value
         * Usage: $('input').fw('attributes').val('new value');
         */
        val: function(value) {
            var $this = this;
            if (value !== undefined) {
                return $this.val(value);
            }
            return $this.val();
        },

        /**
         * Get/set text content
         * Usage: $('.element').fw('attributes').text('new text');
         */
        text: function(text) {
            var $this = this;
            if (text !== undefined) {
                return $this.text(text);
            }
            return $this.text();
        },

        /**
         * Get/set HTML content
         * Usage: $('.element').fw('attributes').html('<p>content</p>');
         */
        html: function(html) {
            var $this = this;
            if (html !== undefined) {
                return $this.html(html);
            }
            return $this.html();
        },

        /**
         * Add class
         * Usage: $('.element').fw('attributes').addClass('active');
         */
        addClass: function(className) {
            return this.addClass(className);
        },

        /**
         * Remove class
         * Usage: $('.element').fw('attributes').removeClass('active');
         */
        removeClass: function(className) {
            return this.removeClass(className);
        },

        /**
         * Toggle class
         * Usage: $('.element').fw('attributes').toggleClass('active');
         */
        toggleClass: function(className) {
            return this.toggleClass(className);
        },

        /**
         * Check if has class
         * Usage: if ($('.element').fw('attributes').hasClass('active')) { ... }
         */
        hasClass: function(className) {
            return this.hasClass(className);
        },

        /**
         * Get/set CSS property
         * Usage: $('.element').fw('attributes').css('color', 'red');
         */
        css: function(property, value) {
            var $this = this;
            if (typeof property === 'object') {
                return $this.css(property);
            }
            if (value !== undefined) {
                return $this.css(property, value);
            }
            return $this.css(property);
        },

        /**
         * Get width
         * Usage: var width = $('.element').fw('attributes').width();
         */
        width: function(value) {
            var $this = this;
            if (value !== undefined) {
                return $this.width(value);
            }
            return $this.width();
        },

        /**
         * Get height
         * Usage: var height = $('.element').fw('attributes').height();
         */
        height: function(value) {
            var $this = this;
            if (value !== undefined) {
                return $this.height(value);
            }
            return $this.height();
        }
    };

    // Register module
    Framework.register('attributes', Attributes);

})(window.Framework || {});

