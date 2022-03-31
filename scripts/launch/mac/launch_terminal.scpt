tell application "Terminal"
    activate
    set ProjectRoot to "$(dirname $(dirname $(dirname $(dirname " & (POSIX path of (path to me)) & "))))"
    do script "pnpm --filter renderer-app start"
    do script "pnpm --filter flat start"
end tell
