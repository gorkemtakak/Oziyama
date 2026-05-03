Set WshShell = CreateObject("WScript.Shell")
' Run the batch file completely hidden (0 means hidden window)
WshShell.Run "cmd /c """ & CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName) & "\Oziyama-Baslat.bat""", 0, False
