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
      }
    | {
          hasNewVersion: false;
      };
