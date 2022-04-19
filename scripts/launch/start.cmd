@echo off
setlocal
start cmd /c "pnpm --filter renderer-app start%1"
start cmd /c "pnpm --filter flat start%1"
exit
