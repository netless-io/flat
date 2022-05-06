@echo off
setlocal
start cmd /c "pnpm -F renderer-app start%1"
start cmd /c "pnpm -F flat start%1"
exit
