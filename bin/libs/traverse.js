fs = require('fs');
var root,temp_root;
var readfile = require('./readfile.js');
var cssParser = require('css-parse');
var writetofile = require('./writetofile.js');
var ensureDir = require('ensureDir');
var PrettyCSS = require('pretty-data').pd;
var csslint = require('csslint');
var copy = require('ncp').ncp; //file copy
var execute = require('./execute.js');
copy.limit = 16;
var groupid = 0;
var heading_flag = 0, white_counter=0;
var remove = require('rimraf');


function countOcurrences(str, value){
   var regExp = new RegExp(value, "gi");
   return str.match(regExp) ? str.match(regExp).length : 0;  
}
var processOpfIn = function (pathofditafile) {
//console.log('path: '+pathofditafile);
var currentPath = pathofditafile.substr(0,pathofditafile.lastIndexOf('\\'));
try
{
fs.unlink(temp_root +'\\log.txt');
fs.unlink(temp_root +'\\error.txt');
}
catch(e)
{}
writetofile('".speaking" class count:'+'\n', temp_root +'\\log.txt');
    fs.readdir(pathofditafile, function (err, files) { // '/' denotes the root folder
        files.forEach(function (file) {
            fs.lstat(pathofditafile + '\\' + file, function (err, stats) {
                if (!err && !stats.isDirectory()) {
                    var cssContent = readfile(pathofditafile + '\\' + file);
                    var cssDom = cssParser(cssContent);
					//console.log('csslint csslint-rhino.js "'+pathofditafile + '\\' + file+'"');
					execute('csslint csslint-rhino.js "'+pathofditafile + '\\' + file+'"', temp_root,  function(){
					white_counter=0;
						for (i = 0; i < cssDom.stylesheet.rules.length; i++) {
							if (typeof cssDom.stylesheet.rules[i].declarations != 'undefined') {
								for (j = 0; j < cssDom.stylesheet.rules[i].declarations.length; j++) {
									var obj = cssDom.stylesheet.rules[i];
									var property = obj.declarations[j].property;
									var value = obj.declarations[j].value;
									if(value)
									{
										value = value.replace(/ +/g, "");
									}
									if (property == 'color') {
										if (value == '#ffffff' || value == '#fff' || value == 'white'|| value == 'WHITE'|| value == '#FFFFFF'|| value == 'White' ||  value == 'rgb(255,255,255)') {
											white_counter+=1;
											var selectorr = obj.selectors[0];											
											var countt = countOcurrences(selectorr,'nth-child');
											if(countt > 0 && countt < 2)
											{
											console.log(file +'-->'+ obj.selectors[0]);
											cssContent += obj.selectors[0] + '.speaking { color: yellow; background-color: transparent !important }\n'
											}
											else
											{
											console.log(file +'-->'+ obj.selectors[0]);
											cssContent += obj.selectors[0] + ' .speaking { color: yellow; background-color: transparent !important }\n'
											}
										}
									}
                            }
                        }
                    }	
					});
					
					try
					{
					writetofile(file+': '+cssContent.match(/.speaking/g).length +'\n', temp_root +'\\log.txt');
					}
					catch(e)
					{}
					cssContent = cssContent.replace(/.media-overlay-active/g, '.speaking');
					var pretty_data = PrettyCSS.css(cssContent );
					writetofile(pretty_data, temp_root + '\\css\\' + file);
                }
            });
        });
		return;
    });
	return;
}

var init_traverse = function (dir, cback) {
    fs.readdir(dir, function (err, files) { // '/' denotes the root folder
        files.forEach(function (file) {
            fs.lstat(dir + '\\' + file, function (err, stats) {
                if (!err && stats.isDirectory()) {
                    if (file == 'css') {
                        copy(dir + '\\' + file, dir + '\\old_css', function (err) {
                            if (err) {
                                return console.error(err);
                            }
                            remove(dir + '\\' + file, function (err) {
                                if (err) {
                                    return console.error(err);
                                }else {
									temp_root=dir;
                                    processOpfIn(dir + '\\old_css');
									}
                            });
                        });
                    } else {
                        init_traverse(dir + '\\' + file);
                    }
                }
            });
        });
    });
	return;
}

module.exports = function (path, cb) {
    root = path;
    init_traverse(root, function (err) {
        console.log('Process End');
    });
    if (cb) {
        cb();
    }
}