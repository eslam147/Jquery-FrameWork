/**
 * Web Routes - AJAX Routes Definition
 * routes/web.js
 * 
 * Define all AJAX routes here using Laravel-like syntax:
 * Route::get(url, [ControllerName::class, 'methodName']);
 * Route::post(url, [ControllerName::class, 'methodName']);
 */

Route::get('https://jsonplaceholder.typicode.com/posts/1', [AjaxGetController::class, 'onClick']);

// POST Request Route
Route::post('https://jsonplaceholder.typicode.com/posts', [AjaxPostController::class, 'onClick']);


// Log all registered routes

// You can add more routes here:
// Route::get('/api/users', [UserController::class, 'index']);
// Route::post('/api/users', [UserController::class, 'store']);
// Route::put('/api/users/:id', [UserController::class, 'update']);
// Route::delete('/api/users/:id', [UserController::class, 'destroy']);
