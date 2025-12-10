# jQuery Framework - Laravel-like JavaScript Framework

A powerful, Laravel-like JavaScript framework built on jQuery, designed for large-scale projects. This framework brings Laravel's elegant syntax and architecture to JavaScript, making it easy for Laravel developers to work with frontend JavaScript.

## 🚀 Features

### Core Features
- **Laravel-like Syntax**: `public function`, `Class::method()`, `object->property`
- **MVC Architecture**: Controllers, Views, Routing
- **Multi-language Support**: Automatic translation system with HTML translation support
- **AJAX Routing**: Laravel-like AJAX routing system with `Route::method()` syntax
- **Request Validation**: FormRequest with validation rules
- **Dynamic Parameter Injection**: Automatic parameter extraction from `data-*` attributes
- **Response Object**: Standardized response handling with `response->data`, `response->success`
- **View System**: Blade-like syntax (`@if`, `@else`, `@foreach`, `{{ }}`, `{!! !!}`)
- **Performance Optimized**: Caching, Lazy Loading, Debounce/Throttle
- **Memory Management**: Automatic cleanup to prevent memory leaks
- **Logging System**: Built-in logger for debugging and monitoring
- **Language Switcher**: Dynamic language switching with cookie persistence
- **Modal System**: Built-in modal opening functionality with Bootstrap 5 support

### CLI Commands (ArtisanJs)
- **make:controller**: Create new controller with automatic boot.js registration
- **make:request**: Create new request class with automatic boot.js registration
- **make:view**: Create new view template
- **delete:controller**: Delete controller and automatically remove from boot.js
- **delete:request**: Delete request and automatically remove from boot.js

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

```bash
npm run dev
```

## 🏗️ Production Build

```bash
npm run build
```

## 📚 Usage

### Creating Controllers

#### Basic Controller
```bash
node artisanJs make:controller ButtonController
```
This creates a controller with a class selector (`.button`).

#### Controller with ID Selector
```bash
node artisanJs make:controller ButtonController --id
```
This creates a controller with an ID selector (`#button`).

#### Controller with Custom Match Character
```bash
node artisanJs make:controller TestReadController --match="_"
```
This creates a controller with underscore separator (`.test_read`).

```bash
node artisanJs make:controller TestReadController --match="-"
```
This creates a controller with hyphen separator (`.test-read`).

#### Controller Options Explained

**`--id`**: Creates a controller that uses an ID selector instead of a class selector.
- Without `--id`: `ButtonController` → selector: `.button`
- With `--id`: `ButtonController` → selector: `#button`

**`--match`**: Specifies the character used to separate words in the selector.
- Default: `.` (dot) - creates class selector
- `--match="_"`: Uses underscore separator
- `--match="-"`: Uses hyphen separator
- Example: `TestReadController` with `--match="_"` → `.test_read`
- Example: `TestReadController` with `--match="-"` → `.test-read`

**Note**: The `--match` option only affects the separator character. The selector type (class or ID) is determined by the `--id` flag.

#### Controller Naming Convention
- Controller names should end with `Controller` (e.g., `ButtonController`, `UserController`)
- The framework automatically converts `ButtonController` to `button` for the selector
- Supports namespaces: `Auth/LoginController` creates `app/Http/controllers/Auth/LoginController.js`

### Creating Requests

```bash
node artisanJs make:request UserRequest
node artisanJs make:request Auth/LoginRequest
```

### Creating Views

```bash
node artisanJs make:view welcome
node artisanJs make:view auth/login
```

### Deleting Controllers

```bash
node artisanJs delete:controller ButtonController
node artisanJs delete:controller Auth/LoginController
```

### Deleting Requests

```bash
node artisanJs delete:request UserRequest
node artisanJs delete:request Auth/LoginRequest
```

## 🔧 Automatic boot.js Management

### Problem Solved
Previously, when creating new controllers or requests, developers had to manually add them to `boot.js`. This was error-prone and time-consuming.

### Solution
The framework now automatically manages `boot.js`:

1. **Automatic Registration**: When you create a controller or request using `make:controller` or `make:request`, it's automatically added to `boot.js` in the correct location.

2. **Automatic Removal**: When you delete a controller or request using `delete:controller` or `delete:request`, it's automatically removed from `boot.js`.

3. **Smart Detection**: The system checks if a file already exists in `boot.js` before adding it, preventing duplicates.

4. **Proper Ordering**: Files are added in the correct order (requests before controllers, controllers before routes).

### How It Works

#### For Controllers
- When you run `make:controller`, the command:
  1. Creates the controller file
  2. Calculates the relative path from `app/` (e.g., `Http/controllers/ButtonController.js`)
  3. Finds the Controllers section in `boot.js`
  4. Inserts the new controller entry in alphabetical order
  5. Shows a success message

- When you run `delete:controller`, the command:
  1. Removes the controller entry from `boot.js`
  2. Deletes the controller file
  3. Shows a success message

#### For Requests
- When you run `make:request`, the command:
  1. Creates the request file
  2. Calculates the relative path from `app/` (e.g., `Http/requests/UserRequest.js`)
  3. Finds the Requests section in `boot.js`
  4. Inserts the new request entry in the correct location
  5. Shows a success message

- When you run `delete:request`, the command:
  1. Removes the request entry from `boot.js`
  2. Deletes the request file
  3. Shows a success message

## 📝 Example Controller

```javascript
class ButtonController extends Controller {
    public function selector() {
        return '.button'; // or '#button' if created with --id
    }
    
    public function onClick(e,request,  id, variation_id = null) {
        // Access parameters directly from data-* attributes
        console.log('ID:', id);
        console.log('Variation ID:', variation_id);
        // Or access via request object
        console.log('All data:', request->all());
        console.log('ID from request:', request->id);
        // Use view helper to render templates
        return view('welcome', '#result', compact('id', 'variation_id'));        
    }
}
```

## 🛣️ Example Route

```javascript
// Simple route without element return
Route::get('/data', [ButtonController::class, 'onClick']);

// POST route
Route::post('/posts', [PostController::class, 'onSubmit']);
```

## 🎨 Example View

```html
@if(success)
    <div class="alert alert-success">
        <h3>{{ data.title }}</h3>
        <p>{{ data.description }}</p>
    </div>
@else
    <div class="alert alert-danger">
        {{ error }}
    </div>
@endif

@foreach(items as item)
    <div>{{ item.name }}</div>
@endforeach
```

## 🔄 Modal System

The framework includes a comprehensive modal system with Bootstrap 5 support, automatic ID detection, and seamless integration with controllers and views.

### Opening Modals Using view() Helper

The recommended way to open modals is using the `view()` helper. The modal will be automatically rendered and opened:

#### With Parameters

If you need to pass parameters to the modal view:

```javascript
public function onClick(e, id) {
    // Render modal view with parameters and automatically open it
    return view('modal1', '#modal-content', compact('id'));
    
    // The modal will be:
    // 1. Rendered in the specified selector (#modal-content)
    // 2. Automatically opened using Bootstrap 5
    // 3. Dynamically load Bootstrap if not already loaded
}
```

#### Without Parameters

If you don't need to pass any parameters:

```javascript
public function onClick(e) {
    // Render modal view without parameters and automatically open it
    return view('modal2', '#modal-content');
    
    // The modal will be automatically rendered and opened
}
```

**View Modal Features:**
- **Auto-opening**: Modals are automatically opened when rendered via `view()`
- **Selector Preservation**: Modal remains in the specified selector (not moved to body)
- **Bootstrap Loading**: Bootstrap 5 is dynamically loaded if not already present
- **d-none Removal**: The `d-none` class is automatically removed from the target selector
- **Automatic Detection**: The view system automatically detects if the view name contains 'modal' and opens it

### openModal Method in Controller

The `openModal` method in the Controller class is used to define the modal selector. You only need to write the modal name:

```javascript
public function openModal() {
    return 'modal1'; // or '#modal1' or '.modal1'
}
```

This method is used internally by the framework to determine which modal to open.

### Modal View Template Example

```html
<!-- resources/views/modal1.html -->
<div class="modal fade" id="modal1_{{ id }}" tabindex="-1" aria-labelledby="modal1Label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal1Label">{{ __('messages.modal_1_title') }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>{{ __('messages.modal_1_content') }}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ __('messages.modal_1_close') }}</button>
                <button type="button" class="btn btn-primary">{{ __('messages.modal_1_save') }}</button>
            </div>
        </div>
    </div>
</div>
```
```html
<!-- resources/views/modal1.html without id -->
<div class="modal fade" id="modal1" tabindex="-1" aria-labelledby="modal1Label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal1Label">{{ __('messages.modal_1_title') }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>{{ __('messages.modal_1_content') }}</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">{{ __('messages.modal_1_close') }}</button>
                <button type="button" class="btn btn-primary">{{ __('messages.modal_1_save') }}</button>
            </div>
        </div>
    </div>
</div>
```
### How Modal System Works

1. **View Rendering**: When you call `view('modal1', '#modal-content')`, the framework:
   - Loads the modal template from `resources/views/modal1.html`
   - Renders it with any provided data
   - Inserts it into the specified selector (`#modal-content`)

2. **Automatic Detection**: The view system automatically detects if the view name contains 'modal'

3. **Auto-opening**: Once detected, the framework:
   - Finds the modal element in the rendered content
   - Checks if Bootstrap 5 is loaded
   - Dynamically loads Bootstrap if needed
   - Creates a new Bootstrap Modal instance (disposes old one if exists)
   - Opens the modal automatically

4. **Bootstrap Support**: 
   - Full Bootstrap 5 integration
   - Dynamic loading when needed
   - Proper instance management for reopening

5. **Reopening**: Each call creates a fresh instance, allowing modals to be reopened multiple times

### Problems Solved

#### ✅ Automatic boot.js Registration
- **Problem**: Controllers and requests had to be manually added to `boot.js`
- **Solution**: Automatic registration when creating files with `make:controller` or `make:request`

#### ✅ Automatic boot.js Removal
- **Problem**: Deleted controllers/requests remained in `boot.js`
- **Solution**: Automatic removal when deleting files with `delete:controller` or `delete:request`

#### ✅ Modal Reopening
- **Problem**: Modals couldn't be opened again after closing
- **Solution**: Each `openModal` call creates a new Bootstrap Modal instance, disposing old ones

#### ✅ Modal Placement
- **Problem**: Modals were moved to `body` instead of staying in the specified selector
- **Solution**: Modals now remain in the selector specified in `view()` (e.g., `#modal-content`)

#### ✅ d-none Class Removal
- **Problem**: Content with `d-none` class wasn't visible after rendering
- **Solution**: `d-none` is automatically removed from the target selector when using `view()`

#### ✅ Bootstrap Integration
- **Problem**: Bootstrap conflicts and loading issues
- **Solution**: Dynamic Bootstrap loading, proper instance management, and script loading order fixes

## 🌐 Multi-language System

### HTML Translation
Use `{{ __('messages.key') }}` or `@lang('messages.key')` in HTML:

```html
<h1>{{ __('messages.welcome') }}</h1>
<p>@lang('messages.description')</p>
```

### Language Files
Language files are located in `lang/{locale}/messages.js`:

```javascript
// lang/en/messages.js
return {
    welcome: 'Welcome',
    description: 'This is a description'
};

// lang/ar/messages.js
return {
    welcome: 'مرحباً',
    description: 'هذا وصف'
};
```

### Language Switcher
The framework includes automatic language switching with cookie persistence.

## ⚡ Performance Features

### Caching
- Preprocessed code caching
- Translation caching
- Route caching

### Lazy Loading
- Controllers loaded on demand
- Dynamic module loading

### Performance Optimizations
- Debounce for input/keyup events
- Throttle for scroll events
- Request animation frame batching

### Memory Management
- Automatic event listener cleanup
- Controller instance cleanup
- Reference cleanup on page unload

## 🐛 Troubleshooting

### Controller Not Working
- Make sure the controller is registered in `boot.js` (automatic with `make:controller`)
- Check that the selector matches your HTML element
- Verify the controller file is in `app/Http/controllers/`

### View Not Rendering
- Ensure the view file exists in `resources/views/`
- Check that the selector passed to `view()` is correct
- Verify that `d-none` class is removed (handled automatically)

### Modal Not Opening
- Make sure Bootstrap 5 is loaded (loaded dynamically when needed)
- Check that the modal HTML exists in the DOM
- Verify the modal selector matches the name passed to `openModal()`

## 🔮 Future Features (Version 2.0)

The following features are planned for the next version:

- **Route Prefix**: Support for route prefixes
- **Multiple Controller Syntax**: Support for different ways to write controllers (like Laravel)
- **Route Groups**: Group routes with shared properties
- **Asset Helper**: `asset()` function for images and files that automatically prepends the base URL

## 📄 License

MIT

## 🙏 Acknowledgments

This framework is inspired by Laravel's elegant syntax and architecture, bringing the same developer experience to JavaScript.
