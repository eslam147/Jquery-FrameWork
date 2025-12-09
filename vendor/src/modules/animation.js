/**
 * وحدة Animation - الحركات والتأثيرات
 */
(function(Framework) {
    'use strict';

    var Animation = {
        /**
         * حركة fade in
         * الاستخدام: $('.element').fw('animation').fadeIn();
         */
        fadeIn: function(duration, callback) {
            return this.fadeIn(duration || Framework.config.animation.duration, callback);
        },

        /**
         * حركة fade out
         */
        fadeOut: function(duration, callback) {
            return this.fadeOut(duration || Framework.config.animation.duration, callback);
        },

        /**
         * حركة slide down
         */
        slideDown: function(duration, callback) {
            return this.slideDown(duration || Framework.config.animation.duration, callback);
        },

        /**
         * حركة slide up
         */
        slideUp: function(duration, callback) {
            return this.slideUp(duration || Framework.config.animation.duration, callback);
        },

        /**
         * حركة slide toggle
         */
        slideToggle: function(duration, callback) {
            return this.slideToggle(duration || Framework.config.animation.duration, callback);
        },

        /**
         * حركة shake (اهتزاز)
         */
        shake: function(times, distance, duration) {
            times = times || 3;
            distance = distance || 10;
            duration = duration || 300;
            
            return this.each(function() {
                var $this = $(this);
                var originalPosition = $this.css('position');
                if (originalPosition === 'static') {
                    $this.css('position', 'relative');
                }
                
                for (var i = 0; i < times; i++) {
                    $this.animate({left: -distance}, duration / (times * 2))
                          .animate({left: distance}, duration / (times * 2))
                          .animate({left: 0}, duration / (times * 2));
                }
            });
        },

        /**
         * حركة pulse (نبض)
         */
        pulse: function(times, scale, duration) {
            times = times || 2;
            scale = scale || 1.1;
            duration = duration || 200;
            
            return this.each(function() {
                var $this = $(this);
                var originalScale = $this.css('transform');
                
                for (var i = 0; i < times; i++) {
                    $this.animate({transform: 'scale(' + scale + ')'}, duration)
                          .animate({transform: 'scale(1)'}, duration);
                }
            });
        },

        /**
         * حركة bounce (نط)
         */
        bounce: function(times, distance, duration) {
            times = times || 3;
            distance = distance || 20;
            duration = duration || 200;
            
            return this.each(function() {
                var $this = $(this);
                var originalPosition = $this.css('position');
                if (originalPosition === 'static') {
                    $this.css('position', 'relative');
                }
                
                for (var i = 0; i < times; i++) {
                    $this.animate({top: -distance}, duration)
                          .animate({top: 0}, duration);
                }
            });
        }
    };

    // تسجيل الوحدة - نسجل الكائن مباشرة
    Framework.register('animation', Animation);

})(window.Framework || {});

