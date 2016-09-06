'use strict';
const lint = require('sass-lint');

module.exports = (grunt) => {
	grunt.verbose.writeln(`\n${lint.info}\n`);

	grunt.registerMultiTask('sasslint', 'Lint your Sass', function () {
		const options = this.options({
			configFile: ''
		});

		let results = [];

		this.filesSrc.forEach((file) => {
			results = results.concat(lint.lintFiles(file, options, options.configFile));
		});

		const resultCount = lint.resultCount(results);
		const errorCount = lint.errorCount(results);
		const resultFormat = lint.format(results, { options: options });

		if (resultCount > 0) {
			if (options.outputFile) {
				options['output-file'] = options.outputFile;
				lint.outputResults(results, { options: options });
			}
			else {
				grunt.log.writeln(resultFormat);
			}

			if (errorCount.count > 0) {
				grunt.fail.warn('');
			}
			else {
				const plural = grunt.util.pluralize(results.length, 'file/files');

				grunt.log.ok(`${resultCount} ${plural} lint free.`);
			}
		}
	});
};
