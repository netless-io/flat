import Fetcher from "@netless/fetch-middleware";
import { NETLESS } from "../constants/Process";
export enum RoomType {
    transitory = "transitory",
    persistent = "persistent",
    historied = "historied",
}

const fetcher = new Fetcher(10000, "https://shunt-api.netless.link/v5");
export class RoomOperator {
    public async createRoomApi(name: string, limit: number): Promise<any> {
        const json = await fetcher.post<any>({
            path: `rooms`,
            headers: {
                token: NETLESS.SDK_TOKEN,
            },
            body: {
                name: name,
                limit: limit,
            },
        });
        return json as any;
    }

    public async joinRoomApi(uuid: string): Promise<any> {
        const json = await fetcher.post<any>({
            path: `tokens/rooms/${uuid}`,
            headers: {
                token: NETLESS.SDK_TOKEN,
            },
            body: {
                lifespan: 0,
                role: "admin",
            },
        });
        return json as any;
    }

    public async getCover(
        uuid: string,
        path: string,
        width: number,
        height: number,
        token: string,
    ): Promise<any> {
        const json = await fetcher.post<any>({
            path: `rooms/${uuid}/screenshots`,
            headers: {
                token: token,
            },
            body: {
                path: path,
                width: width,
                height: height,
            },
        });
        return json as any;
    }
}
