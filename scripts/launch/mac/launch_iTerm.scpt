on run argv
    if not (count of argv) = 0
        set REGION to item 1 of argv
    else
        set REGION to ""
    end if
    tell application "iTerm"
        activate
        set W to create window with default profile
        tell W's current session
            split vertically with default profile
        end tell
        set T to W's current tab
        set ProjectRoot to "$(dirname $(dirname $(dirname $(dirname " & (POSIX path of (path to me)) & "))))"
        write T's session 1 text "pnpm -F renderer-app -C \"" & ProjectRoot & "\" start" & REGION
        write T's session 2 text "pnpm -F flat -C \"" & ProjectRoot & "\" start" & REGION
    end tell
end run
