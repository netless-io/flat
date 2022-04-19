on run argv
    set REGION to item 1 of argv
    tell application "Terminal"
        activate
        set ProjectRoot to "$(dirname $(dirname $(dirname $(dirname " & (POSIX path of (path to me)) & "))))"
        do script "pnpm --filter renderer-app start" & REGION
        do script "pnpm --filter flat start" & REGION
    end tell
end run
