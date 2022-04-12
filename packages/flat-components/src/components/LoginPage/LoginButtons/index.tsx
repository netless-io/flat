import "./index.less";

import React from "react";
import { LoginButton, LoginButtonProviderType } from "../LoginButton";

export type { LoginButtonProviderType };

export type LoginButtonsDescription = Array<{
    provider: LoginButtonProviderType;
    text?: string | undefined;
}>;

export interface LoginButtonsProps {
    buttons: LoginButtonsDescription;
    onClick: (provider: LoginButtonProviderType) => void;
}

export const LoginButtons: React.FC<LoginButtonsProps> = ({ buttons, onClick }) => {
    return (
        <div className="login-buttons">
            {buttons.map(({ provider, text }) => (
                <LoginButton key={provider} provider={provider} text={text} onClick={onClick} />
            ))}
        </div>
    );
};
