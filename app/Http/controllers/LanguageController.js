/**
 * Language Controller - Handle language switching
 */

class LanguageController extends Controller {
    public function selector() {
        return '.language-switcher';
    }
    
    public function onInit() {
        // Set initial active language button
        var currentLocale = Framework.translation ? Framework.translation.getLocale() : 'en';
        var activeButton = document.querySelector('.language-switcher[data-locale="' + currentLocale + '"]');
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }
    
    public function onClick(e,request) {
        var $target = $(e.currentTarget);
        // Get locale from data-locale attribute directly
        var locale = request->locale;
        if (!locale) {
            locale = 'en';
        }
        // Save locale to cookie (for persistence after refresh)
        if (Framework.cookie) {
            Framework.cookie.set('locale', locale, 365); // 1 year
        }
        // Set locale in Framework translation module
        if (Framework.setLocale) {
            Framework.setLocale(locale);
        }        
        // Reload the page to apply language change
        window.location.reload(true);
        
    }
}

