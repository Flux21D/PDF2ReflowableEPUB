var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./libs/writetofile'); //file writer
var readfile=require('./libs/readfile'); //file writer
var cheerio=require('cheerio');
var underscore=require('./libs/underscore.js'); //UnderScore
var ncp = require('ncp').ncp;
var copy = require('ncp');

var output = argv.o;
var templateFolder = __dirname + '\\template';

ncp(templateFolder,output, function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('done!');
});