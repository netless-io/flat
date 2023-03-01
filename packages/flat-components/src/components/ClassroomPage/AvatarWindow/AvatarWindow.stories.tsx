import React, { useState } from "react";
import { Meta, Story } from "@storybook/react";
import { AvatarWindow, AvatarWindowProps, fixRect } from ".";
import { VideoAvatar } from "../VideoAvatar";

const storyMeta: Meta = {
    title: "ClassroomPage/AvatarWindow",
    component: AvatarWindow,
    argTypes: {},
};

export default storyMeta;

export const Overview: Story<Pick<AvatarWindowProps, "readonly" | "onDoubleClick">> = props => {
    const [camera, setCamera] = useState(false);
    const [mic, setMic] = useState(true);
    const [rect, setRect] = useState({ x: 10, y: 20, width: 100, height: 75 });

    return (
        <div
            style={{
                width: "500px",
                height: "400px",
                overflow: "hidden",
                border: "1px solid green",
                position: "relative",
            }}
        >
            <AvatarWindow
                mode="normal"
                readonly={props.readonly}
                rect={rect}
                onDoubleClick={props.onDoubleClick}
                onResize={(rect, handle) => setRect(fixRect(rect, handle, 3 / 4, 100, 500, 400))}
            >
                <VideoAvatar
                    isCreator
                    avatarUser={{
                        name: "Hello",
                        userUUID: "",
                        mic,
                        camera,
                        avatar: "http://placekitten.com/64/64",
                    }}
                    updateDeviceState={(_, camera_, mic_) => {
                        if (camera !== camera_) {
                            setCamera(camera_);
                        }
                        if (mic !== mic_) {
                            setMic(mic_);
                        }
                    }}
                    userUUID=""
                />
            </AvatarWindow>
        </div>
    );
};
