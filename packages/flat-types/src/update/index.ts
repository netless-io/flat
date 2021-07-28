export type PrereleaseTag = "beta" | "stable";

export type UpdateCheckInfo =
    | {
          hasNewVersion: true;
          version: string;
          releaseNotes:
              | {
                    zhNote: string;
                    enNote: string;
                }
              | undefined;
          prereleaseTag: PrereleaseTag;
      }
    | {
          hasNewVersion: false;
      };
