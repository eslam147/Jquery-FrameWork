/* eslint-disable */
// @ts-nocheck
/* jshint ignore:start */
/* jslint ignore:start */

/**
 * AjaxGetController - Controller for AJAX GET requests
 * app/Http/controllers/AjaxGetController.js
 * 
 * @fileoverview Laravel-like syntax is supported by the framework preprocessor
 */

class AjaxGetController extends Controller {
    /**
     * Selector for elements this controller handles
     */
    public function selector() {
        return '#ajax-get-btn';
    }

    /**
     * Initialize controller (called automatically)
     */
    public function onInit() {
    }

    /**
     * Handle click event - Uses route system
     * Note: e.preventDefault() is called automatically by Controller
     */
    public function onClick(e) {
        // response is the AJAX promise from Route system
        var data = response->data;
        var success = response->success;
        var error = response->error;
        var status = response->status;
        return view('ajax-result', '#ajax-result', compact('success','status','error','data'));
    }
}

