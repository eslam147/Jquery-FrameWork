/**
 * MakeControllerCommand - إنشاء Controller class جديد
 */

const BaseCommand = require('./BaseCommand');
const fs = require('fs');
const path = require('path');

class MakeControllerCommand extends BaseCommand {
    handle(args) {
        if (!args || args.length === 0) {
            console.error('\x1b[31mError: Controller name is required\x1b[0m');
            console.log('Example: node artisanJs make:controller ButtonController');
            console.log('Example: node artisanJs make:controller ButtonController --id');
            console.log('Example: node artisanJs make:controller ButtonController --class');
            console.log('Example: node artisanJs make:controller TestReadController --match="_"');
            console.log('Example: node artisanJs make:controller TestReadController --match="-"');
            return;
        }

        const name = args[0];
        
        // Parse options
        let selectorType = 'class'; // default
        let matchChar = '.';
        
        for (let i = 1; i < args.length; i++) {
            if (args[i] === '--id') {
                selectorType = 'id';
            } else if (args[i] === '--class') {
                selectorType = 'class';
            } else if (args[i] === '--match' && i + 1 < args.length) {
                const matchValue = args[i + 1];
                matchChar = matchValue.replace(/^["']|["']$/g, '');
                // If empty after removing quotes, use the original value
                if (!matchChar && matchValue) {
                    matchChar = matchValue;
                }
            }
        }
        
        const parsed = this.parseControllerName(name, selectorType, matchChar);

        // Check if file exists
        if (fs.existsSync(parsed.filePath)) {
            console.log('\x1b[33mWarning: File already exists: ' + parsed.filePath + '\x1b[0m');
            return;
        }

        // Read template
        const template = this.readTemplate('Controller.js.template');

        // Prepare data
        const replacements = {
            CLASS_NAME: parsed.className,
            FULL_PATH: parsed.filePath,
            SELECTOR: parsed.selector
        };

        // Replace placeholders
        const content = this.replacePlaceholders(template, replacements);

        // Write file
        this.writeFile(parsed.filePath, content);

        console.log('\x1b[32m✅ Controller created successfully: ' + parsed.filePath + '\x1b[0m');
    }

    /**
     * Parse controller name and generate selector
     */
    parseControllerName(name, selectorType, matchChar) {
        const parts = name.split('/');
        const className = parts[parts.length - 1];
        const namespace = parts.slice(0, -1).join('/');
        
        // Generate selector from class name
        let selector = '';
        if (selectorType === 'id') {
            // Convert ButtonController to #button
            selector = '#' + this.toKebabCase(className.replace(/Controller$/, ''));
        } else {
            // Convert ButtonController to .button
            selector = '.' + this.toKebabCase(className.replace(/Controller$/, ''));
        }
        
        // Apply match character if specified
        if (matchChar && matchChar !== '.') {
            selector = selector.replace(/\./g, matchChar);
        }
        
        return {
            className: className,
            namespace: namespace,
            fullPath: name,
            directory: namespace ? path.join('app/Http/controllers', namespace) : 'app/Http/controllers',
            filePath: namespace 
                ? path.join('app/Http/controllers', namespace, className + '.js')
                : path.join('app/Http/controllers', className + '.js'),
            selector: selector
        };
    }

    /**
     * Convert string to kebab-case
     */
    toKebabCase(str) {
        return str
            .replace(/([a-z])([A-Z])/g, '$1-$2')
            .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
            .toLowerCase();
    }
}

module.exports = MakeControllerCommand;

