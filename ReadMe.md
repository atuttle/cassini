# Cassini

**Single-page documentation generator for multi-versioned apps**

<img src="https://raw.github.com/atuttle/cassini/master/Cassini.jpg" title="Image of Saturn's Rings from Cassini Spacecraft" width="300" />

## Why another doc generator?

* [Inline documentation sucks](http://blog.millermedeiros.com/inline-docs/)
* Mature apps/platforms need to maintain documentation for multiple versions, not just the bleeding edge release
* Underscore.js documentation formatting rocks! Forced brevity begets simplicity.
* Markdown is GitHub friendly, IDE friendly, and just plain awesome.
* Documentation should be collaborative like a wiki, but GitHub wiki's [suck at controlled collaboration](http://fusiongrokker.com/post/how-you-can-contribute-to-taffy-documentation), so by extracting the documentation out to its own repo and using Continuous Deployment, we can have the best of both worlds.

## Examples

Here are some projects using Cassini to generate their documentation:

* [Taffy](http://taffydocs.herokuapp.com)

## Using Cassini

Cassini is functional both as a **CLI utility** and a Node.js **module**:

### CLI

```bash
$ npm install -g cassini
[...]
$ cassini -h

  Usage: cassini [options]

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -i, --input <dir>               Input directory.
    -o, --output <dir>              Output directory.
    -v, --verbose                   Print verbose output
    -t, --templates [templatePath]  Location of the template files.

$ ls -al src/
total 24
drwxr-xr-x   3 adam  staff   102 Aug 30 03:33 .
drwxr-xr-x  11 adam  staff   374 Aug 30 15:05 ..
-rw-r--r--   1 adam  staff  9808 Aug 30 12:00 2.0.0.md

$ cassini -i ./src -o ./bin -v
template path: /Users/adam/DEV/cassini/src/templates/default/
input files: [ '2.0.0.md' ]
filename: 2.0.0.md - version: 2.0.0
2.0.0 => 9808 bytes of Markdown
2.0.0 => 11863 bytes of HTML
writing bin/2.0.0/index.html
```

### Node Module

Below is a script that I'm using to host cassini-generated documentation on Heroku. It uses cassini as a module to regenerate the HTML from the current markdown contents at startup; enabling continuous deployment of the documentation: Just commit/pull request/merge and push and let the deploy webhooks take care of the rest. (video coming soon?)

```js
var express  = require('express')
	,pkg      = require('./package.json')
	,cassini  = require('cassini')
	,path     = require('path')
	,app      = express()
	;

var port = process.env.PORT || 5000;

app.use(express.compress())
	.use(express.static('bin'))
	.get('/', function(req,res){
		res.redirect(301, pkg.version+'/');
	})
	.listen(port);

console.log('listening on port %s', port);

cassini.generate({
	inputDir: path.normalize(__dirname + '/src/')
	,outputDir: path.normalize(__dirname + '/bin/')
	,verbose: true
});
```

I'm hosting documentation with exactly the above code, for free, on Heroku. Take a look at the [package.json](https://github.com/atuttle/TaffyDocs/blob/master/package.json) and [Procfile](https://github.com/atuttle/TaffyDocs/blob/master/Procfile) that bring it all together. All that remains is a CI/CD service. (I'm using [drone.io](http://drone.io))

#### cassini.generate options

* **inputDir:** path to markdown files (not sure what it'll do with sub-directories...)
* **outputDir:** path in which cassini should place HTML
* **verbose:** print console messages
* **templatePath:** custom handlebars templates (copy the [default templates](https://github.com/atuttle/cassini/tree/master/src/templates/default) and customize)

#### Photo Credit

[NASA/JPL-Caltech/Space Science Institute](http://photojournal.jpl.nasa.gov/catalog/PIA14669)
