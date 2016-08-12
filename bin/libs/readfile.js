/**
Module to open an exe or run a executables like jar
Usage:
var html_content = readfile(file);	
*/
module.exports= function(filename)
 {
  	if(filename == '')
	{
		return "";
	}
	else
	{
		var xmlcont=fs.readFileSync(filename,'utf8');
		return xmlcont;
	}
	console.log(filename);
 }