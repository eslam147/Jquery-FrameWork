/**
 * Traversal Module - DOM traversal utilities
 */
(function(Framework) {
    'use strict';

    var Traversal = {
        /**
         * Get parent element
         * Usage: $('.child').fw('traversal').parent('.parent-class');
         */
        parent: function(selector) {
            var $this = this;
            if (selector) {
                return $this.parent(selector);
            }
            return $this.parent();
        },

        /**
         * Get all parents
         * Usage: $('.child').fw('traversal').parents('.parent-class');
         */
        parents: function(selector) {
            var $this = this;
            if (selector) {
                return $this.parents(selector);
            }
            return $this.parents();
        },

        /**
         * Get closest parent
         * Usage: $('.child').fw('traversal').closest('.parent-class');
         */
        closest: function(selector) {
            return this.closest(selector);
        },

        /**
         * Get children
         * Usage: $('.parent').fw('traversal').children('.child-class');
         */
        children: function(selector) {
            var $this = this;
            if (selector) {
                return $this.children(selector);
            }
            return $this.children();
        },

        /**
         * Get siblings
         * Usage: $('.item').fw('traversal').siblings('.other-item');
         */
        siblings: function(selector) {
            var $this = this;
            if (selector) {
                return $this.siblings(selector);
            }
            return $this.siblings();
        },

        /**
         * Get next element
         * Usage: $('.item').fw('traversal').next('.next-item');
         */
        next: function(selector) {
            var $this = this;
            if (selector) {
                return $this.next(selector);
            }
            return $this.next();
        },

        /**
         * Get previous element
         * Usage: $('.item').fw('traversal').prev('.prev-item');
         */
        prev: function(selector) {
            var $this = this;
            if (selector) {
                return $this.prev(selector);
            }
            return $this.prev();
        },

        /**
         * Find elements within
         * Usage: $('.container').fw('traversal').find('.item');
         */
        find: function(selector) {
            return this.find(selector);
        },

        /**
         * Filter elements
         * Usage: $('.items').fw('traversal').filter('.active');
         */
        filter: function(selector) {
            return this.filter(selector);
        },

        /**
         * Get first element
         * Usage: $('.items').fw('traversal').first();
         */
        first: function() {
            return this.first();
        },

        /**
         * Get last element
         * Usage: $('.items').fw('traversal').last();
         */
        last: function() {
            return this.last();
        },

        /**
         * Get element at index
         * Usage: $('.items').fw('traversal').eq(2);
         */
        eq: function(index) {
            return this.eq(index);
        }
    };

    // Register module
    Framework.register('traversal', Traversal);

})(window.Framework || {});

