/* eslint-disable */
// @ts-nocheck
/* jshint ignore:start */
/* jslint ignore:start */

/**
 * AjaxPostController - Controller for AJAX POST requests
 * app/Http/controllers/AjaxPostController.js
 * 
 * @fileoverview Laravel-like syntax is supported by the framework preprocessor
 */

class AjaxPostController extends Controller {
    /**
     * Selector for elements this controller handles
     */
    public function selector() {
        return '#ajax-post-btn';
    }
    public function openModal() {
        return '';
    }
    /**
     * Initialize controller (called automatically)
     */
    public function onInit() {
    }
    public function onClick(e) {
        // POST request data
        var data = response->data;
        var success = response->success;
        var error = response->error;
        var status = response->status;
        return view('ajax-result', '#ajax-result', compact('success','status','error','data'));
    }
}

