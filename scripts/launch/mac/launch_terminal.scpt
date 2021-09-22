 tell application "Terminal"
    set ProjectRoot to "$(dirname $(dirname $(dirname $(dirname " & (POSIX path of (path to me)) & "))))"
    do script "yarn --cwd \"" & ProjectRoot & "/desktop/renderer-app\" start"
    do script "yarn --cwd \"" & ProjectRoot & "/desktop/main-app\" start"
end tell
