var fs          = require('fs')
	,path        = require('path')
	,_           = require('underscore')
	,cheerio     = require('cheerio')
	,handlebars  = require('handlebars')
	,marked      = require('marked')
	,wrench      = require('wrench');

var compiled_templates = {};

module.exports = {

	readFilesSync: function( inputDir ){
		var files = wrench.readdirSyncRecursive( inputDir );
		if (verbose) console.log('input files:', files);
		var results = {};

		for (var i in files){
			var f = files[i];
			var version = f.split('.').reverse();
			version.shift();
			version = version.reverse().join('.');
			if (verbose) console.log('filename: %s - version: %s', f, version);
			results[version] = fs.readFileSync( path.normalize(inputDir + '/' + f), 'utf-8');
		}

		if (verbose) _.each(results, function(val,key,list){
			console.log('%s => %s bytes of Markdown', key, val.length);
		});

		return results;
	}

	,writeFilesSync: function( outputDir, data ){
		for (var f in data){
			var dirPath = path.normalize(outputDir + '/' + f + '/');
			var htmlFile = path.normalize(outputDir + '/' + f + '/index.html');
			if (verbose) console.log('writing %s', htmlFile);
			wrench.mkdirSyncRecursive(dirPath, 0777);
			fs.writeFileSync(htmlFile, data[f], 'utf-8');
		}
	}

	,parseMarkdown: function( documents ){
		var html = {};

		_.each(documents, function(val,key,list){
			html[key] = marked(val);
			if (verbose) console.log('%s => %s bytes of HTML', key, html[key].length);
		});

		return html;
	}

	,buildTOC: function( documents ){
		function cleaner(str){
			return str.replace(/[^a-z0-9]/gi,'-').replace(/\-{2,}/,'-').replace(/^\-/,'').replace(/\-$/,'');
		}

		var $, newDocs = {};
		for (doc in documents){
			$ = cheerio.load(documents[doc]);
			//new container
			newDocs[doc] = { toc:{ sections:[] } };

			//apply ID attributes for all header tags
			$('h1,h2,h3,h4,h5,h6,h7,h8,h9,h10').each(function(){
				$(this).attr('id', cleaner($(this).text()) );
			});
			newDocs[doc].body = $.html();

			//get document title
			var title = $('h1:first-child');
			if (title.length){
				newDocs[doc].toc.title = title.text();
			}

			function hTagToInt(tagname){
				return parseInt( tagname.replace(/h/gi, ''), 10 );
			}

			//start listing sections
			$('h2,h3,h4').each(function(){
				var $this = $(this)
					,indent = hTagToInt( $this[0].name )
					,text = $this.text()
					,id = $this.attr('id');

				newDocs[doc].toc.sections.push({ id: id, level: indent, text: text });
			});

		}

		return newDocs;
	}

	,wrap: function( documents, templates ){
		var tocTemplate = this.getTemplate('toc');
		var layoutTemplate = this.getTemplate('layout');
		for (var d in documents){
			var doc = documents[d];
			doc.toc.version = d;
			var toc = tocTemplate(doc.toc);
			var composed = layoutTemplate({ toc: toc, body: doc.body, title: doc.toc.title + ' ' + doc.toc.version + ' Documentation' });
			documents[d] = composed;
		}
		return documents;
	}

	,getTemplate: function(name){
		if (!compiled_templates[name]){
			compiled_templates[name] = this.compileTemplate( name );
		}
		return compiled_templates[name];
	}

	,compileTemplate: function(name){
	    var tmp = path.normalize(template_path + '/' + name + '.handlebars');
	    return handlebars.compile( fs.readFileSync(tmp, 'utf-8') );
	}

};