import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";
import { LoginPanelContent, LoginPanelContentProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginPanelContent",
    component: LoginPanelContent,
};

export default storyMeta;

const styles: React.CSSProperties = {
    width: 100,
    height: 100,
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};
const colors = ["var(--red-6)", "var(--green-6)", "var(--blue-6)"];
const mod = (i: number, n: number): number => {
    return ((i % n) + n) % n;
};

export const Overview: Story<LoginPanelContentProps> = () => {
    const [key, setKey] = useState(0);

    return (
        <div>
            <p>
                <button onClick={() => setKey((Math.random() * 100) | 0)}>key: {key}</button>
            </p>
            <LoginPanelContent transitionKey={key}>
                <div style={{ ...styles, background: colors[mod(key, colors.length)] }}>{key}</div>
            </LoginPanelContent>
        </div>
    );
};
