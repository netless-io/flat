import Fetcher from "@netless/fetch-middleware";
import {netlessToken} from "../appToken";
export enum RoomType {
    transitory = "transitory",
    persistent = "persistent",
    historied = "historied",
}

const fetcher = new Fetcher(5000, "https://cloudcapiv4.herewhite.com");

export class RoomOperator {

    public async createRoomApi(name: string, limit: number, mode: RoomType): Promise<any> {
        const json = await fetcher.post<any>({
            path: `room`,
            query: {
                token: netlessToken.sdkToken,
            },
            body: {
                name: name,
                limit: limit,
                mode: mode,
            },
        });
        return json as any;
    }

    public async joinRoomApi(uuid: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: `room/join`,
            query: {
                uuid: uuid,
                token: netlessToken.sdkToken,
            },
        });
        return json as any;
    }
}
