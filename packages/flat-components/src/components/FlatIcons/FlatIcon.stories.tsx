import { Meta, Story } from "@storybook/react";
import React from "react";
import { chunk } from "lodash-es";

const storyMeta: Meta = {
    title: "Icons/FlatIcons",
    parameters: {
        backgrounds: {
            default: "Homepage Background",
        },
    },
};

export default storyMeta;

const FIconTable: React.FC<{ icons: string[]; column: number; title: string }> = props => {
    const rows = chunk(props.icons, props.column);

    return (
        <div className="box center" style={{ maxWidth: props.column * 200 }}>
            <h1 className="title tc">{props.title}</h1>
            <div
                className="mw8 center"
                style={{ fontSize: 12, color: "var(--grey-3)", wordBreak: "break-all" }}
            >
                {rows.map((row, i) => (
                    <div key={i} className="ph3-ns">
                        <div className="cf ph2-ns">
                            {row.map(name => (
                                <div className={`fl w-100 w-${Math.floor(100 / props.column)}-ns`}>
                                    <div className="tc pv3 ph1">
                                        {React.createElement(
                                            require(`./icons/SVG${name}`).default,
                                            {
                                                style: { width: 24, height: 24 },
                                            },
                                        )}
                                        <div className="tc">SVG{name}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const DirectionalIcons: Story = () => (
    <FIconTable
        column={5}
        icons={[
            "Up",
            "Down",
            "Left",
            "Right",
            "DoubleUp",
            "DoubleDown",
            "DoubleLeft",
            "DoubleRight",
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "ToUp",
            "ToDown",
            "ToLeft",
            "ToRight",
            "CircleUpOutlined",
            "CircleDownOutlined",
            "CircleLeftOutlined",
            "CircleRightOutlined",
            "CircleUpFilled",
            "CircleDownFilled",
            "CircleLeftFilled",
            "CircleRightFilled",
            "MenuFold",
            "MenuUnfold",
            "VideoFold",
            "VideoUnfold",
            "SortVertical",
            "SortHorizontal",
        ]}
        title="Directional Icons"
    />
);

export const SuggestedIcons: Story = () => (
    <FIconTable
        column={3}
        icons={[
            "Plus",
            "CirclePlusOutlined",
            "CirclePlusFilled",
            "Minus",
            "CircleMinusOutlined",
            "CircleMinusFilled",
            "Question",
            "CircleQuestionOutlined",
            "CircleQuestionFilled",
            "Check",
            "CircleCheckOutlined",
            "CircleCheckFilled",
            "Close",
            "CircleCloseOutlined",
            "CircleCloseFilled",
            "Exclamation",
            "CircleExclamationO",
            "CircleExclamationF",
            "Info",
            "CircleInfoOutlined",
            "CircleInfoFilled",
            "Load",
        ]}
        title="Suggested Icons"
    />
);

export const MediaIcons: Story = () => (
    <FIconTable
        column={4}
        icons={[
            "Camera",
            "CameraMute",
            "Microphone",
            "MicrophoneMute",
            "Sound",
            "SoundSilent",
            "SoundMute",
            "Loop",
            "Play",
            "Pause",
            "Next",
            "Last",
            "Fullscreen",
            "FullscreenExit",
            "Record",
            "RecordStop",
            "File",
            "FileVideo",
            "FileAudio",
            "FileImage",
            "FileWord",
            "FilePowerpoint",
            "FileExcel",
            "FileOneNote",
            "FileICE",
            "FileVF",
            "Folder",
            "FolderAdd",
        ]}
        title="Media Icons"
    />
);

export const InteractiveIcons: Story = () => (
    <FIconTable
        column={4}
        icons={[
            "More",
            "MoreVertical",
            "Apps",
            "AppsAdd",
            "Chat",
            "ChatBanning",
            "Whiteboard",
            "WhiteboardAdd",
            "Send",
            "Cloud",
            "Exit",
            "ScreenSharing",
            "User",
            "UserInvite",
            "UserRemove",
            "UserGroup",
            "Redo",
            "Undo",
            "Setting",
            "General",
            "System",
            "Shortcut",
            "Update",
            "Feedback",
            "Calendar",
            "Time",
            "ToolbarFullscreen",
            "Edit",
            "ModeLecture",
            "ClassStart",
            "ClassPause",
            "ClassEnd",
            "HomeOutlined",
            "CloudOutlined",
            "HomeFilled",
            "CloudFilled",
            "Test",
            "Github",
            "Copy",
            "HandUp",
            "Delete",
            "Reset",
            "Download",
            "ModeInteractive",
        ]}
        title="Interactive Icons"
    />
);
