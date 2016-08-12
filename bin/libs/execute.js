var writetofile = require('./writetofile.js');
/**
Module to open an exe or run a executables like jar
Usage:
	exec('C:/Users/raj.a/AppData/Local/Chromium/Application/chrome.exe -allow-file-access-from-files');
	or 
	exec('java -jar xalan/xalan.jar');
*/

module.exports= function(openthis, path, callback)
{/* 
	var exec = require('child_process').exec, child;
		child = exec(openthis, function (error, stdout, stderr){
		  if(error !== null){
			//console.log('exec error: ' + error);
		}
		else
		{
			if(callback)
			{
				callback();
				
				//merge_files(path);
			}
		}
	
	});
	 */
	var exec = require('child_process').exec,
    child;

	child = exec(openthis,
	  function (error, stdout, stderr) {
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (stderr !== null) {
		  //console.log('exec error: ' + error);
		  writetofile(stdout+'\n'+stderr, path +'\\error.txt');
		}
		if(callback)
			{
				callback();
				//merge_files(path);
			}
	});
	
	
}