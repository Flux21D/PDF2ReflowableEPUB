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
var output = argv.o;

var tempFolder = output + '\\Temp_Files';

if (!fs.existsSync(tempFolder)){
    fs.mkdirSync(tempFolder);
}

var content = readfile(input);
var $ = cheerio.load(content);

inputRoot = input.substr(0,input.lastIndexOf('\\'));

htmlSplitting('html');
fromDir(tempFolder,'.html');

rmdir(tempFolder, function(error){});

fs.writeFileSync(inputRoot + '\\HyphenWord_Errors.csv',errorLog);

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
			xhtmlFileConversion(htmlFileName,htmlFiles[i]);
		} else {};
    };
};


function htmlSplitting(htmlTag){
	$(htmlTag).each(function(index,element){
		var pageID = $(this).find('body').children('div').eq(0).attr('id');
		pageID = pageID.toString().replace(/\-div/g,'');
		fs.writeFileSync(tempFolder + '\\' + pageID + '.html','<!DOCTYPE html>\n' + '<html xmlns="http://www.w3.org/1999/xhtml" lang="" xml:lang="">\n' + $(this).html() + '\n</html>');
	});
}

function xhtmlFileConversion(file,fileName){
	var topValueArray = [];
	var leftValueArray = [];
	var htmlContent = readfile(file);
	var $$ = cheerio.load(htmlContent);
	$$('body').removeAttr('bgcolor');
	$$('body').removeAttr('vlink');
	$$('body').removeAttr('link');
	
	$$('body').find('p').each(function (index,element){
		topValueArray.push(parseFloat($$(this).css('top')));
		leftValueArray.push(parseFloat($$(this).css('left')));
		var old_style = $$(this).attr('style');
		var new_style = old_style.toString().replace(/position:absolute;/g,'').replace(/white-space:nowrap/g,'');
		$$(this).attr('style',new_style);
	});
	$$('body').find('div#' + fileName.toString().replace(/\.html/g,'') + '-div').each(function (ind,ele){
		$$(this).attr('style','position:relative');
	});
	
	Array.prototype.max = function() {
		return Math.max.apply(null, this); // <-- passing null as the context
	};
	var maximumTopValue = topValueArray.max();
	
	Array.prototype.min = function() {
		return Math.min.apply(null, this); // <-- passing null as the context
	};
	var minimumLeftValue = leftValueArray.min();

	folio_number($$,'top',maximumTopValue);
	footerRemove($$,'left',minimumLeftValue);
	indentationUpdate($$,'left');
	inlineStyleRemoval($$,'top');
	inlineStyleRemoval($$,'left');
	
	
	var foundArray = $$.xml().toString().match(/(\w+)[\-]<br\/>(\w+)/g);
	newContent = $$.xml().toString().replace(/&#160;/g,' ').replace(/style=""/g,' ');
	if(foundArray){
		for(var i=0; i<foundArray.length; i++){
			newContent = newContent.toString().replace(foundArray[i],'<span class="HypenationWord' + i + '" style="color:green;">' + foundArray[i].toString().replace(/<br\/>/g,'') + '</span>');
			errorLog = errorLog + '\n' + fileName + ',' + '<span class="HypenationWord' + i + '" style="color:red;">' + foundArray[i].toString().replace(/<br\/>/g,'') + '</span>' + ',' + foundArray[i].toString().replace(/-<br\/>/g,'');
		}
	}
	
	fs.writeFileSync(output + '\\' + fileName,newContent.toString().replace(/<br\/>/g,' '));
	
	var finalContent = hyphenation(output + '\\' + fileName,fileName);
	
	fs.writeFileSync(output + '\\' + fileName,finalContent.toString().replace(/<br\/>/g,' '));
	
}

function inlineStyleRemoval($$,Property){
	$$('body').find('p').each(function (index,element){
		$$(this).css(Property,'');
	});
}

function hyphenation(file,fileName){
	var newContent = readfile(file);
	var $ = cheerio.load(newContent);
	var hyphenWords = $.xml().toString().match(/(\w+)[\-]<\/p>/g);
	var updatedContent = $.xml().toString().replace(/<br\/>/g,'');
	if(hyphenWords){
		for(var i=0; i<hyphenWords.length; i++){
			updatedContent = updatedContent.toString().replace(hyphenWords[i],'<span class="HypenationWord' + i + '" style="color:red;">' + hyphenWords[i].toString());
			errorLog = errorLog + '\n' + fileName + ',' + '<span class="HypenationWord' + i + '" style="color:red;">' + hyphenWords[i].toString() + '</span>' + ',' + hyphenWords[i].toString().replace(/-/g,'');
		}
	}
	return updatedContent;
}

function folio_number($$,Property,value){
	$$('body').find('p').each(function (index,element){
		if(parseFloat($$(this).css(Property)) == value){
			$$(this).addClass("folio_number");
			$$('body').find('div').append('<p style="display: none;' + $$(this).attr('style') + '" class="' + $$(this).attr('class') + '">' + $$(this).html() + '</p>');
			$$(this).remove();
		}
	});
	

}

function footerRemove($$,Property,value){
	$$('body').find('p').each(function (index,element){
		if(parseFloat($$(this).css(Property)) == value){
			$$(this).remove();
		}
	});
}

function indentationUpdate($$,Property){

	$$('body').find('p').each(function (index,element){
		if($$(this).find('br').length == 0){
			if($$(this).next().find('br').length > 0){
				if(parseFloat($$(this).css(Property)) > parseFloat($$(this).next().css(Property))){
					indentValue = parseFloat($$(this).css(Property)) - parseFloat($$(this).next().css(Property))
				}
				else if(parseFloat($$(this).next().css(Property)) > parseFloat($$(this).css(Property))){
					indentValue = parseFloat($$(this).next().css(Property)) - parseFloat($$(this).css(Property))
				}
				else{}
				$$(this).html($$(this).html() + '<br/> ' + $$(this).next().html());
				$$(this).attr('style','text-indent: ' + indentValue + 'px; ' + $$(this).attr('style'));
				$$(this).next().remove();
			}
		}
	});

}
