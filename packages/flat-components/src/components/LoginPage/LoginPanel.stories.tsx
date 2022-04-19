import React from "react";
import { Meta, Story } from "@storybook/react";
import { LoginPanel } from ".";
import { Overview as StoryLoginWithPhone } from "./LoginWithPhone/LoginWithPhone.stories";
import { Overview as StoryLoginWithEmail } from "./LoginWithEmail/LoginWithEmail.stories";

import { LoginWithPhone } from "./LoginWithPhone";
import { LoginWithEmail } from "./LoginWithEmail";

const storyMeta: Meta = {
    title: "LoginPage/LoginPanel",
    component: LoginPanel,
    parameters: {
        layout: "fullscreen",
        viewport: {
            viewports: {
                desktop: {
                    name: "Desktop",
                    styles: { width: "960px", height: "640px" },
                },
                web: {
                    name: "Web",
                    styles: { width: "1440px", height: "674px" },
                },
            },
            defaultViewport: "desktop",
        },
        options: {
            showPanel: false,
        },
    },
};

export default storyMeta;

export const PlayableExample: Story<{ region: "CN" | "US" }> = ({ region }) => {
    return (
        <LoginPanel>
            {region === "CN" && <LoginWithPhone {...(StoryLoginWithPhone.args as any)} />}
            {region === "US" && <LoginWithEmail {...(StoryLoginWithEmail.args as any)} />}
        </LoginPanel>
    );
};

PlayableExample.args = {
    region: "CN",
};
PlayableExample.argTypes = {
    region: {
        control: {
            type: "radio",
            options: ["CN", "US"],
        },
    },
};
