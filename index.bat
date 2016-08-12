%~dp0exe\node.exe %~dp0bin\copy.js -o %2
%~dp0exe\node.exe %~dp0bin\index.js -i %1 -o %2\OEBPS\html
%~dp0exe\node.exe %~dp0bin\htmlMerging.js -i %2\OEBPS -t %3 -p %4
%~dp0exe\node.exe %~dp0bin\navHTMLCreation.js -i %2 -o %2\OEBPS -r %1
%~dp0exe\node.exe %~dp0bin\opf.js -i %2 -x %1