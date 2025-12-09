# jQuery Framework

A jQuery-based framework to simplify common web development tasks. Instead of writing 50 lines, write just one or two!

## Features

- **Organized & Modular**: Each function in a separate file
- **Easy to Use**: Simple and clear API
- **Extensible**: Easy to add new modules
- **Lightweight**: No external dependencies
- **Laravel-like Validation**: FormRequest with rules and messages
- **MVC Controllers**: Full MVC system similar to Laravel
- **View System**: Blade-like templating system
- **Console CLI**: Command system to generate files automatically (similar to Laravel Artisan)

## Structure

```
jquery-framework/
├── app/
│   ├── Http/
│   │   ├── controllers/      # Controllers (MVC)
│   │   │   ├── FormController.js # Example
│   │   │   └── ...
│   │   └── requests/         # Request Classes (Laravel Style)
│   │       ├── UserRequest.js    # Example
│   │       └── ...
├── vendor/
│   └── src/
│       ├── core/             # Core framework files (do not modify)
│       │   ├── framework.js
│       │   ├── view.js
│       │   ├── loader.js
│       │   └── requests.js
│       ├── modules/          # Framework modules (do not modify)
│       │   ├── dom.js
│       │   ├── ajax.js
│       │   ├── form.js
│       │   ├── validation.js
│       │   ├── animation.js
│       │   ├── storage.js
│       │   ├── utils.js
│       │   ├── events.js
│       │   ├── traversal.js
│       │   ├── attributes.js
│       │   ├── scroll.js
│       │   ├── cookie.js
│       │   └── url.js
│       ├── controllers/      # Base Controller (do not modify)
│       │   └── Controller.js
│       ├── requests/         # Base Request (do not modify)
│       │   └── FormRequest.js
│       └── js/               # Framework configuration files
│           ├── boot.js       # Boot loader
│           ├── config.js     # Configuration
│           ├── start.js      # Auto-initialization
│           └── build.js      # Build script
├── resources/                 # Resources
│   └── views/                # Views (Blade-like)
│       ├── index.html        # Main page
│       ├── example.html      # Usage examples
│       ├── form.html         # Example view
│       └── ...
├── lang/                      # Language files (Laravel-like)
│   ├── ar/                   # Arabic translations
│   │   └── validation.js     # Validation messages
│   └── en/                   # English translations
│       └── validation.js     # Validation messages
├── artisanJs                  # Main Console CLI
└── README.md
```

## Installation

1. Download the files
2. Add jQuery first:
```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

3. Add framework files in order:
```html
<!-- Single file that loads everything -->
<script src="app/boot.js"></script>
```

## Usage

### 1. Controllers (MVC System)

#### Create Controller using Artisan:
```bash
node artisanJs make:controller FormController
```

#### Using Controllers:
```javascript
// In HTML
<form id="demo-form">
    <input type="text" name="name">
    <input type="email" name="email">
    <button type="submit">Submit</button>
</form>

// In JavaScript - Controller initializes automatically
// Or manually:
Framework.FormController.init();
```

#### Define Controller:
```javascript
var FormController = Controller.extend({
    selector: '#demo-form',
    
    onSubmit: function(e, UserRequest) {
        // 'request' is automatically available (alias for UserRequest)
        var formData = request.all();
        var hasFiles = request.hasFiles();
        var files = hasFiles ? request.getFilesInfo() : null;

        // Use view helper (like Laravel)
        return view('form', '#form-result', compact('formData', 'hasFiles', 'files'));
    }
});
```

### 2. Views (View System)

#### Using Views:
```javascript
// In Controller
return view('form', '#form-result', {
    formData: formData,
    hasFiles: true,
    files: files
});
```

#### Building Views (Blade-like):
```html
<!-- resources/views/form.html -->
<div class="form-result">
    <h3>Form submitted successfully!</h3>
    
    @if(formData)
    <div class="data">
        @foreach(formData as key, value)
        <p>{{ key }}: {{ value }}</p>
        @endforeach
    </div>
    @endif
    
    @if(hasFiles)
    <div class="files">
        @foreach(files as fieldName, fileList)
        <h4>{{ fieldName }}</h4>
        @foreach(fileList as file)
        <p>{{ file.name }} - {{ file.size }} bytes</p>
        @endforeach
        @endforeach
    </div>
    @endif
</div>
```

### 3. Validation (Laravel Style)

#### Create Request using Artisan:
```bash
node artisanJs make:request Auth/LoginRequest
```

#### Using Request in Controller:
```javascript
onSubmit: function(e, UserRequest) {
    // Validation happens automatically before calling the function
    // If validation fails, the function won't be called
    var formData = request.all();
    return view('success', '#result', compact('formData'));
}
```

#### Define Request:
```javascript
function UserRequest() {
    Framework.FormRequest.call(this);
}

UserRequest.prototype = Object.create(Framework.FormRequest.prototype);

// Rules
UserRequest.prototype.rules = {
    name: 'required|min:3|max:50',
    email: ['required', 'email'],
    avatar: 'required|image|mimes:jpeg,png,jpg|max:2048'
};

// Custom messages
UserRequest.prototype.messages = {
    'name.required': 'Name is required',
    'email.required': 'Email is required',
    'avatar.required': 'Image field is required'
};
```

### 4. Multi-Language Support (Laravel-like)

The framework includes a translation system similar to Laravel:

```javascript
// Set locale
Framework.setLocale('ar'); // or 'en'

// Use translation
var message = trans('validation.required', {attribute: 'name'});
// Output: "حقل الاسم مطلوب." (Arabic) or "The name field is required." (English)

// Shorthand
var message = __('validation.email', {attribute: 'email'});

// In validation, translations are used automatically
// Custom messages in UserRequest override translations
```

**Language Files Structure:**
```
lang/
  ├── ar/
  │   └── validation.js
  └── en/
      └── validation.js
```

**Translation File Format (JavaScript):**
```javascript
(function() {
    'use strict';
    
    if (typeof window !== 'undefined' && window.Framework) {
        if (!window.Framework.translations) {
            window.Framework.translations = {};
        }
        if (!window.Framework.translations.ar) {
            window.Framework.translations.ar = {};
        }
        
        window.Framework.translations.ar.validation = {
            required: "حقل :attribute مطلوب.",
            email: "حقل :attribute يجب أن يكون بريد إلكتروني صالح.",
            min: "حقل :attribute يجب أن يكون على الأقل :min.",
            attributes: {
                name: "الاسم",
                email: "البريد الإلكتروني"
            }
        };
    }
})();
```

### 5. Form Handling

```javascript
// Get form data
var data = $('form').fw('form').serializeObject();

// Get files
var files = $('form').fw('form').getFiles();

// Fill form
$('form').fw('form').fillForm({
    name: 'Ahmed',
    email: 'ahmed@example.com'
});

// Submit form via AJAX
$('form').fw('form').submitAjax('/api/save', function(response) {
    console.log('Saved', response);
});
```

### 5. AJAX Requests

```javascript
// GET
Framework.ajax.get('/api/data', function(response) {
    console.log(response);
});

// POST
Framework.ajax.post('/api/save', {
    name: 'Ahmed',
    email: 'ahmed@example.com'
}, function(response) {
    console.log('Saved', response);
});
```

### 6. Local Storage

```javascript
// Save
Framework.storage.set('user', {name: 'Ahmed', age: 25});

// Read
var user = Framework.storage.get('user');

// Delete
Framework.storage.remove('user');
```

## ArtisanJs CLI

Command system similar to Laravel Artisan:

```bash
# Show help
node artisanJs --help

# Create Controller
node artisanJs make:controller FormController

# Create Request
node artisan.js make:request LoginRequest
node artisanJs make:request Auth/LoginRequest

# On Windows
.\vendor\artisanJs.cmd make:controller FormController
```

## New Features

### 1. Controllers System
- Full MVC system similar to Laravel
- Automatic validation support
- File uploads support
- Automatic event handlers

### 2. Views System
- Blade-like templating system
- Support for @if, @foreach, @endif
- Variable support {{ variable }}

### 3. Request System
- Full file support
- `request.all()` - All data and files
- `request.hasFiles()` - Check if files exist
- `request.file(fieldName)` - Get single file
- `request.files(fieldName)` - Get all files
- `request.getFilesInfo()` - File information

### 4. Helpers
- `compact()` - Like Laravel
- `view()` - Like Laravel
- `request` - Automatic alias for Request parameter

## Configuration

You can customize settings in `vendor/src/js/config.js`:

```javascript
Framework.init({
    ajax: {
        timeout: 30000,
        defaultErrorHandler: true
    },
    validation: {
        showErrors: true,
        errorClass: 'error',
        successClass: 'success'
    }
});
```

## Complete Examples

See `resources/views/example.html` for complete interactive examples.

## Requirements

- jQuery 3.x or later
- Node.js (for ArtisanJs CLI only)

## License

This project is open source and can be used freely in any project.

## Contributing

We welcome any contributions or improvements!

---

**Made with love to simplify web development**
