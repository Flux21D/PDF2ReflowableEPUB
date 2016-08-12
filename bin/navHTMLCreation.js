var path = require('path'); //File System
fs=require('fs'); //FileSystem
var argv=require('optimist').argv; //Arguments
var writetofile=require('./libs/writetofile'); //file writer
var readfile=require('./libs/readfile'); //file writer
var cheerio=require('cheerio');
var underscore=require('./libs/underscore.js'); //file writer
var errorLog = 'HTML Name,Issue';
var tocPageFound = false;

var input = argv.i;
var output = argv.o;
var report = argv.r;

var count = 0;
var ncxFile = __dirname + '\\libs\\toc.ncx';

fromDir(input, '.html');

var ncxContent = readfile(ncxFile);
var $$$ = cheerio.load(ncxContent);
$$$('meta[name="dtb:totalPageCount"]').attr('content',count);
$$$('meta[name="dtb:maxPageNumber"]').attr('content',count);
fs.writeFileSync(output + '\\toc.ncx',$$$.xml());

if(tocPageFound == false){
	errorLog = errorLog + '\n' + input + ',' + 'There is no toc page Container found in the any of the html pages';
	fs.writeFileSync(output + '\\nav.html','<?xml version="1.0" encoding="utf-8"?>' + '\n' + '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">' + '\n' + '<head>' + '\n' + '<meta charset="utf-8"/>' + '\n' + '<title>' + '\n' + 'Title' + '</title>' + '\n' + '</head>' + '\n' + '<body>' + '\n' + '<nav epub:type="toc">' + '\n' + '<ol>' + '\n' + '<li><a href="html/cover.html">Cover Page</a></li>' + '\n' + '</ol>' + '</nav>' + '\n' + '</body>' + '\n' + '</html>');
}
var inputRoot = report.substr(0,report.lastIndexOf('\\'));

fs.writeFileSync(inputRoot + '\\errorLog.csv',errorLog);

//Reading a input Directory
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
			htmlRead(htmlFileName,htmlFiles[i]);
		} else {};
    };
};

function htmlRead(htmlFilePath,htmlFile){
	count++;
	var htmlName = "";
	var content = readfile(htmlFilePath);
	var $ = cheerio.load(content);
	$('body').find('div.page').children('div.toc').each(function (index,element){
		$(this).find('ol').each(function (ind,elem){
			tocPageFound = true;
			$(this).find('span[id^="block"]').each(function (inde,eleme){
				$(this).before($(this).html());
				$(this).remove();
			});
			if($(this).find('span.pg_no') == 0){
				errorLog = errorLog + '\n' + htmlFile + ',' + 'No Span pg_no class found in the toc content';
			}
			$(this).find('span.pg_no').each(function (inde2,elem2){
				if(parseInt($(this).text())<10){
					htmlName = 'html/' + 'page00' + parseInt($(this).text()) + '.html';
				}
				else if(parseInt($(this).text())>=10 && parseInt($(this).text())<100){
					htmlName = 'html/' + 'page0' + parseInt($(this).text()) + '.html';
				}
				else{
					htmlName = 'html/' + 'page' + parseInt($(this).text()) + '.html';
				}
				$(this).parent().attr('href',htmlName);
				$(this).remove();
			});
			
			fs.writeFileSync(output + '\\nav.html','<?xml version="1.0" encoding="utf-8"?>' + '\n' + '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="en" lang="en">' + '\n' + '<head>' + '\n' + '<meta charset="utf-8"/>' + '\n' + '<title>' + '\n' + 'Title' + '</title>' + '\n' + '</head>' + '\n' + '<body>' + '\n' + '<nav epub:type="toc">' + '\n' + '<ol>' + '\n' + $(this).html() + '\n' + '</ol>' + '</nav>' + '\n' + '</body>' + '\n' + '</html>');
		});
	
	});
}
