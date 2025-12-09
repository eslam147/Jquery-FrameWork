/**
 * MakeRequestCommand - إنشاء Request class جديد
 */

const BaseCommand = require('./BaseCommand');
const fs = require('fs');
const path = require('path');

class MakeRequestCommand extends BaseCommand {
    handle(args) {
        if (!args || args.length === 0) {
            console.error('\x1b[31mError: Request name is required\x1b[0m');
            console.log('Example: node artisanJs make:request Auth/LoginRequest');
            return;
        }

        const name = args[0];
        const parsed = this.parseName(name);

        // Check if file exists
        if (fs.existsSync(parsed.filePath)) {
            console.log('\x1b[33mWarning: File already exists: ' + parsed.filePath + '\x1b[0m');
            return;
        }

        // Read template
        const template = this.readTemplate('Request.js.template');

        // Prepare data
        const replacements = {
            CLASS_NAME: parsed.className,
            FULL_PATH: parsed.filePath
        };

        // Replace placeholders
        const content = this.replacePlaceholders(template, replacements);

        // Write file
        this.writeFile(parsed.filePath, content);

        console.log('\x1b[32m✅ Request created successfully: ' + parsed.filePath + '\x1b[0m');
    }
}

module.exports = MakeRequestCommand;

