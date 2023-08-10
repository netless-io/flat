import "./index.less";

import { Input } from "antd";
import React from "react";
import lockSVG from "../icons/lock.svg";

export interface LoginPasswordProps {
    placeholder?: string;
}

export const LoginPassword: React.FC<LoginPasswordProps> = ({ placeholder, ...restProps }) => {
    return (
        <Input.Password
            placeholder={placeholder}
            prefix={<img alt="password" src={lockSVG} />}
            {...restProps}
        />
    );
};
