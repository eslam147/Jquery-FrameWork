/**
 * Web Routes - AJAX Routes Definition
 * routes/web.js
 * 
 * Define all AJAX routes here using Laravel-like syntax:
 * Route::get(url, [ControllerName::class, 'methodName'], elementReturn);
 * Route::post(url, [ControllerName::class, 'methodName'], elementReturn);
 * 
 * Or use directly with Ajax:
 * Ajax::get(url, [ControllerName::class, 'methodName'], elementReturn);
 * Ajax::post(url, [ControllerName::class, 'methodName'], elementReturn, data);
 */

Route::get('https://jsonplaceholder.typicode.com/posts/1', [AjaxGetController::class, 'onClick'], '#ajax-result');

// POST Request Route
Route::post('https://jsonplaceholder.typicode.com/posts', [AjaxPostController::class, 'onClick'], '#ajax-result');


// Log all registered routes

// You can add more routes here:
// Route::get('/api/users', [UserController::class, 'index'], '#users-list');
// Route::post('/api/users', [UserController::class, 'store'], '#form-result');
// Route::put('/api/users/:id', [UserController::class, 'update'], '#form-result');
// Route::delete('/api/users/:id', [UserController::class, 'destroy'], '#form-result');
