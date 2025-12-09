/**
 * Scroll Module - Scroll handling utilities
 */
(function(Framework) {
    'use strict';

    var Scroll = {
        /**
         * Scroll to element
         * Usage: $('.target').fw('scroll').to();
         */
        to: function(offset, duration) {
            var $this = this;
            var target = $this.offset().top - (offset || 0);
            duration = duration || 500;
            
            $('html, body').animate({
                scrollTop: target
            }, duration);
            
            return $this;
        },

        /**
         * Scroll to top
         * Usage: Framework.scroll.toTop();
         */
        toTop: function(duration) {
            duration = duration || 500;
            $('html, body').animate({
                scrollTop: 0
            }, duration);
        },

        /**
         * Scroll to bottom
         * Usage: Framework.scroll.toBottom();
         */
        toBottom: function(duration) {
            duration = duration || 500;
            $('html, body').animate({
                scrollTop: $(document).height() - $(window).height()
            }, duration);
        },

        /**
         * Get scroll position
         * Usage: var pos = Framework.scroll.position();
         */
        position: function() {
            return {
                top: $(window).scrollTop(),
                left: $(window).scrollLeft()
            };
        },

        /**
         * Scroll event handler
         * Usage: Framework.scroll.on(function() { ... });
         */
        on: function(handler) {
            $(window).on('scroll', handler);
        },

        /**
         * Remove scroll handler
         * Usage: Framework.scroll.off(handler);
         */
        off: function(handler) {
            $(window).off('scroll', handler);
        },

        /**
         * Check if element is in viewport
         * Usage: if ($('.element').fw('scroll').isVisible()) { ... }
         */
        isVisible: function() {
            var $this = this;
            var elementTop = $this.offset().top;
            var elementBottom = elementTop + $this.outerHeight();
            var viewportTop = $(window).scrollTop();
            var viewportBottom = viewportTop + $(window).height();
            
            return elementBottom > viewportTop && elementTop < viewportBottom;
        }
    };

    // Register module
    Framework.register('scroll', Scroll);
    Framework.scroll = Scroll;

})(window.Framework || {});

