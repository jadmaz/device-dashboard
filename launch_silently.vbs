Set WShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WShell.Run Chr(34) & strPath & "\start.bat" & Chr(34), 0, False

