var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./libs/writetofile'); //file writer
var readfile=require('./libs/readfile'); //file writer
var cheerio=require('cheerio');
var underscore=require('./libs/underscore.js'); //file writer
rmdir = require('rimraf');
var cssParser = require('css-parse');
var errorLog = 'HTML Name,Hyphenation Word,Modified Word,Developer Status';
var indentValue = "";

var input = argv.i;
//var input = 'D:\\Dinesh\\PDF_ePub2\\output';
//var output = 'D:\\Dinesh\\PDF_ePub2\\output\\html';
var tocPage = argv.t;
var totalPage = argv.p;
//var output = argv.o;

var chapterPageNumberArray = [];
var chapterPageRangeArray = [];
var firstFile = "";
var fileFound = false;
var htmlContent = '<!DOCTYPE html>\n<html xmlns="http://www.w3.org/1999/xhtml" lang="" xml:lang="">\n<head>\n<title>Book</title>\n<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>\n<style type="text/css">\n<!--\n	p {margin: 0; padding: 0;}\n.ft190{font-size:16px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n.ft191{font-size:14px;font-family:OYQOBR+StempelGaramondLTStd-Italic;color:#231f20;}\n.ft192{font-size:14px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n.ft193{font-size:6px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n.ft194{font-size:11px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n.ft195{font-size:4px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n.ft196{font-size:10px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n.ft197{font-size:10px;font-family:OYQOBR+StempelGaramondLTStd-Italic;color:#231f20;}\n.ft198{font-size:10px;font-family:SJOVYF+Helvetica;color:#000000;}\n.ft199{font-size:14px;line-height:18px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n.ft1910{font-size:10px;line-height:12px;font-family:SQDRSS+StempelGaramondLTStd-Roman;color:#231f20;}\n-->\n</style>\n</head>\n<body>\n';

fromDir(input,'.html');
firstFileFound(input,'.html');

var firstNumber = firstFile.toString().replace('page','').replace('.html');
firstNumber = parseFloat(firstNumber);
var temp = chapterPageRangeArray[0].toString().split('-')[0];
temp = parseFloat(temp);

var difference = (firstNumber - temp);

for(var i=0; i<chapterPageRangeArray.length; i++){
	var startPage = chapterPageRangeArray[i].toString().split('-')[0];
	var endPage = chapterPageRangeArray[i].toString().split('-')[1];

	var startFileName = parseFloat(startPage) + difference;
	startFileName = 'page' + startFileName + '.html';
	var endFileName = parseFloat(endPage) + difference;
	endFileName = 'page' + endFileName + '.html';
	fromDirectory(input,'.html',startFileName,endFileName);
	htmlContent = htmlContent + '\n' + '</body>\n</html>';
	fs.writeFileSync(input + '\\html' + '\\chapter' + (i+1) + '.html',htmlContent);
}

function fromDirectory(htmlPath,htmlFilter,startFileName,endFileName){
    if (!fs.existsSync(htmlPath)) {
        console.log("no dir ", htmlPath);
        return;
    }
	
    var htmlFiles = fs.readdirSync(htmlPath);
	for (var i = 0; i < htmlFiles.length; i++) {
		htmlFileName = path.join(htmlPath, htmlFiles[i]);
        var stat = fs.lstatSync(htmlFileName);
        if (stat.isDirectory()) {
			fromDirectory(htmlFileName,htmlFilter,startFileName,endFileName)
		}
		else if (htmlFileName.indexOf(htmlFilter) >= 0) {
			if((parseFloat(htmlFiles[i].toString().replace('page','').replace('.html','')) >= parseFloat(startFileName.toString().replace('page','').replace('.html','')))){
				if((parseFloat(htmlFiles[i].toString().replace('page','').replace('.html',''))) > parseFloat(endFileName.toString().replace('page','').replace('.html',''))){}
				else{
					var content = readfile(htmlFileName);
					var $$$ = cheerio.load(content);
					htmlContent = htmlContent + '\n' + $$$('body').html();
					fs.unlink(htmlFileName);
				}
			}
		} else {};
    };
}

function firstFileFound(htmlPath,htmlFilter){
    if (!fs.existsSync(htmlPath)) {
        console.log("no dir ", htmlPath);
        return;
    }
	
    var htmlFiles = fs.readdirSync(htmlPath);
	for (var i = 0; i < htmlFiles.length; i++) {
        htmlFileName = path.join(htmlPath, htmlFiles[i]);
        var stat = fs.lstatSync(htmlFileName);
        if (stat.isDirectory()) {
            firstFileFound(htmlFileName, htmlFilter); //recurse
        } else if (htmlFileName.indexOf(htmlFilter) >= 0) {
			fileFileIdentification(htmlFileName,htmlFiles[i]);
		} else {};
    };
}

function fileFileIdentification(file,fileName){
	var content = readfile(file);
	var $ = cheerio.load(content);
	if(fileName == 'nav.html'){}
	else{
		var folio_pageNumber = $('body').find('.folio_number').html();
		if(folio_pageNumber == chapterPageRangeArray[0].toString().split('-')[0]){
			firstFile = fileName;
		}
	}
}

function fromDir(htmlPath, htmlFilter) {
    if (!fs.existsSync(htmlPath)) {
        console.log("no dir ", htmlPath);
        return;
    }
	
    var htmlFiles = fs.readdirSync(htmlPath);
	for (var i = 0; i < htmlFiles.length; i++) {
        htmlFileName = path.join(htmlPath, htmlFiles[i]);
        var stat = fs.lstatSync(htmlFileName);
        if (stat.isDirectory()) {
            fromDir(htmlFileName, htmlFilter); //recurse
        } else if (htmlFileName.indexOf(htmlFilter) >= 0) {
			var pageNumber = htmlFiles[i].toString().replace(/page/g,'').replace(/\.html/g,'');
	
			if(pageNumber == tocPage){
				htmlReading(htmlFileName,htmlFiles[i]);
			}
		} else {};
    };
};

function htmlReading(file,fileName){
	var tocContent = readfile(file);
	var $ = cheerio.load(tocContent);
	$('body').find('div#page5-div').find('p').each(function (element,index){
		if(parseFloat($(this).text())){
			chapterPageNumberArray.push($(this).text());
		}
	});
	if(chapterPageNumberArray.length > 0){
		for(var i=0; i<chapterPageNumberArray.length; i++){
			if(i == (chapterPageNumberArray.length - 1)){
				chapterPageRangeArray.push(chapterPageNumberArray[i] + '-' + totalPage);
			}
			else if(i != chapterPageNumberArray.length-1){
				chapterPageRangeArray.push(parseFloat(chapterPageNumberArray[i]) + '\-' + (parseFloat(chapterPageNumberArray[i+1]) - 1));
			}
		}
	}
}
