'use strict';
const lint = require('sass-lint');

module.exports = (grunt) => {
	grunt.verbose.writeln(`\n${lint.info}\n`);

	grunt.registerMultiTask('sasslint', 'Lint your Sass', function () {
		const options = this.options({
			configFile: ''
		});

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
			const resultFormat = lint.format(results, { options: options });

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
