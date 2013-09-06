var wrench    = require('wrench')
	,path      = require('path')
	,orbiter   = require('./orbiter');

module.exports = {
	generate: function(cli_args){
		GLOBAL.verbose = cli_args.verbose || false;
		GLOBAL.template_path = cli_args.templatePath || path.normalize(__dirname + '/templates/default/');
		if (verbose) console.time('script generation');

		if (verbose) console.log('template path: %s', template_path);

		var markdownSrc = orbiter.readFilesSync( cli_args.inputDir );
		var htmlSrc = orbiter.parseMarkdown( markdownSrc );
		htmlSrc = orbiter.buildTOC( htmlSrc );
		htmlSrc = orbiter.wrap( htmlSrc );
		orbiter.writeFilesSync( cli_args.outputDir, htmlSrc );

		var staticContent = path.normalize(template_path + 'static');
		var staticNew = path.normalize(cli_args.outputDir + '/static');
		wrench.copyDirSyncRecursive(staticContent, staticNew, {
			forceDelete: true, // Whether to overwrite existing directory or not
			excludeHiddenUnix: true, // Whether to copy hidden Unix files or not (preceding .)
			preserveFiles: false, // If we're overwriting something and the file already exists, keep the existing
			inflateSymlinks: false // Whether to follow symlinks or not when copying files
		});

		if (verbose) console.timeEnd('script generation');
	}
};