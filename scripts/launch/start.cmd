@echo off
setlocal
start cmd /c "yarn --cwd desktop/renderer-app start"
start cmd /c "yarn --cwd desktop/main-app start"
exit
