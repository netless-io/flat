@echo off
setlocal
start cmd /c "pnpm --filter renderer-app start"
start cmd /c "pnpm --filter flat start"
exit
