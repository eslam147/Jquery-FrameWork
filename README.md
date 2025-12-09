# jQuery Framework - Laravel-like JavaScript Framework

A powerful, Laravel-like JavaScript framework built on jQuery, designed for large-scale projects.

## Features

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

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Performance Features

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

## Latest Updates

### Multi-language System
- **HTML Translation**: Direct translation in HTML files using `{{ __('messages.key') }}` or `@lang('messages.key')`
- **Language Switcher**: Dynamic language switching with cookie persistence
- **Automatic Locale Detection**: Detects locale from cookie, HTML `lang` attribute, or defaults to English
- **No Flickering**: Prevents flash of untranslated content on page load

### AJAX Routing System
- **Route Definition**: Define routes in `routes/web.js` using `Route::method(url, [Controller::class, 'method'], elementReturn)`
- **Response Object**: Access AJAX responses via `response->data`, `response->success`, `response->error`
- **View Rendering**: Use `view('viewName', '#selector', data)` to render HTML templates
- **Automatic Data Sending**: `request->all()` data is automatically sent with AJAX requests

### Dynamic Parameter Injection
- **Data Attributes**: Extract parameters from `data-*` attributes automatically
- **Nested Data**: Collect data from parent elements with `name` attributes
- **Flexible Parameters**: Support for optional parameters with default values
- **Request Object**: Access all data via `request->property` or `request->all()`

### Event Handlers
- **Supported Events**: `onClick`, `onSubmit`, `onChange`, `onFocus`, `onBlur`, `onInput`, `onScroll`, `onKeyUp`, `onKeyDown`, `onMouseEnter`, `onMouseLeave`
- **Route Integration**: All event handlers support AJAX routing
- **Parameter Injection**: All event handlers support dynamic parameter injection

## Usage

See `resources/views/example.html` for examples.

### Example Controller

```javascript
class MyController extends Controller {
    public function selector() {
        return '.my-button';
    }
    
    public function onClick(e, id, variation_id = null) {
        // Access parameters directly
        console.log('ID:', id);
        console.log('Variation ID:', variation_id);
        
        // Or access via request object
        console.log('All data:', request->all());
        console.log('ID from request:', request->id);
    }
}
```

### Example Route

```javascript
Route::get('https://api.example.com/data', [MyController::class, 'onClick'], '#result');
```

### Example View

```html
@if(success)
    <div>{{ data.title }}</div>
@else
    <div>{{ error }}</div>
@endif
```

## License

MIT
