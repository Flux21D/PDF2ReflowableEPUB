var ensureDir=require('ensureDir');

module.exports = function (content2write, filetobewritten)
 {
	 var targetFolder=filetobewritten.substr(0,filetobewritten.lastIndexOf('\\'));
	 var exists=fs.existsSync(targetFolder);
	 if(!exists)
	 {
		
		 ensureDir(targetFolder, 0755, function (err) {
			if (err) return next(err);
			// your code here!
			fs.openSync(filetobewritten, 'a', 0777);
			fs.appendFileSync(filetobewritten ,content2write);
		});
	 }
		 //fs.writeFileSync(filetobewritten ,content2write);
	else
	 {
		fs.openSync(filetobewritten, 'a', 0777);
		fs.appendFileSync(filetobewritten ,content2write);
	 }
	 //console.log(filetobewritten);
 }