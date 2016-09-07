'use strict';
const lint = require('sass-lint');
const path = require('path');

function getFormatter(format) {
	let formatterPath;

	// default is stylish
	format = format || 'stylish';

	// only strings are valid formatters
	if (typeof format === 'string') {
		// replace \ with / for Windows compatibility
		format = format.replace(/\\/g, '/');

		// if there's a slash, then it's a file
		if (format.indexOf('/') > -1) {
			formatterPath = path.resolve(process.cwd(), format);
		}
		else {
			formatterPath = `eslint/lib/formatters/${format}`;
		}

		try {
			return require(formatterPath);
		}
		catch (ex) {
			ex.message = `There was a problem loading formatter: ${formatterPath}\nError: ${ex.message}`;
			throw ex;
		}
	}
	else {
		return null;
	}
}

module.exports = (grunt) => {
	grunt.verbose.writeln(`\n${lint.info}\n`);

	grunt.registerMultiTask('sasslint', 'Lint your Sass', function () {
		const options = this.options({
			configFile: '',
			format: 'stylish'
		});

		const formatter = getFormatter(options.format);

		if (!formatter) {
			grunt.fail.warn(`Could not find formatter ${options.format}`);
		}

		let results = [];
		let fileCount = 0;

		this.filesSrc.forEach((file) => {
			results = results.concat(lint.lintFiles(file, options, options.configFile));
			fileCount++;
		});

		const resultCount = lint.resultCount(results);
		const errorCount = lint.errorCount(results);
		const warningCount = lint.warningCount(results);

		let filePlural = grunt.util.pluralize(fileCount, 'file/files');
		let warningMessage = '';

		if (resultCount > 0) {
			const resultFormat = formatter(results);

			// Log linting output.
			if (options.outputFile) {
				options['output-file'] = options.outputFile;
				lint.outputResults(results, { options: options });
			}
			else {
				grunt.log.writeln(resultFormat);
			}

			// Handle exit.
			if (errorCount.count > 0) {
				const errors = errorCount.count;
				const errorFiles = errorCount.files.length;

				filePlural = grunt.util.pluralize(errorFiles, 'file/files');
				grunt.fail.warn(`Linting errors in ${errors} ${filePlural}.`);
			}
			else {
				const warnings = warningCount.count;
				const warningPlural = grunt.util.pluralize(warnings, 'warning/warnings');

				warningMessage = ` (${warnings} ${warningPlural})`;
			}
		}

		grunt.log.ok(`${fileCount} ${filePlural} lint free${warningMessage}.`);
	});
};
