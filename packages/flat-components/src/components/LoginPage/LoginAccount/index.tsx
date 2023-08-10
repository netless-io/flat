import "./index.less";

import { Input, Select } from "antd";
import React, { useEffect, useState } from "react";

import { COUNTRY_CODES } from "../LoginWithCode/data";
import emailSVG from "../icons/email.svg";

// to distinguish phone and email
const phoneRegex = /^\d+$/;

export function validateIsPhone(phone: string): boolean {
    return phoneRegex.test(phone);
}

export enum PasswordLoginType {
    Phone = "phone",
    Email = "email",
}

export const isPhone = (type: PasswordLoginType): boolean => type === PasswordLoginType.Phone;

export const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || "";
export const defaultAccountType = PasswordLoginType.Phone;

export interface LoginAccountProps {
    placeholder?: string;
    countryCode?: string;
    accountType?: PasswordLoginType;
    value?: string;
    handleCountryCode?: (code: string) => void;
    handleType?: (type: PasswordLoginType) => void;

    // history props
    password?: string;
    accountHistory?: Array<{ key: string; password: string }> | [];
    onHistoryChange?: (options: any) => void;
}

export const LoginAccount: React.FC<LoginAccountProps> = ({
    countryCode = defaultCountryCode,
    accountType = defaultAccountType,
    placeholder,
    password,
    value,
    accountHistory,
    handleType,
    handleCountryCode,
    onHistoryChange,
    ...restProps
}) => {
    const onlyPhone = !handleType;
    const defaultEmail = accountType === PasswordLoginType.Email;
    const [type, setType] = useState<PasswordLoginType>(accountType);

    console.log(type);

    const inputType = isPhone(type) ? "text" : "email";
    const inputSize = isPhone(type) ? "small" : "middle";

    useEffect(() => {
        if (value && validateIsPhone(value)) {
            setType(PasswordLoginType.Phone);
        } else {
            setType(PasswordLoginType.Email);
        }
    }, [value, type, defaultEmail, password]);

    useEffect(() => {
        if (type && handleType) {
            handleType(type);
        }
    }, [type, handleType]);

    return (
        <Input
            addonAfter={
                accountHistory?.length ? (
                    <Select
                        labelInValue
                        bordered={false}
                        placement="bottomRight"
                        value={{ key: password, value }}
                        onChange={onHistoryChange}
                    >
                        {accountHistory.map(account => {
                            return (
                                <Select.Option key={account.password} value={account.key}>
                                    {account.key}
                                </Select.Option>
                            );
                        })}
                    </Select>
                ) : null
            }
            autoComplete="off"
            className="login-account"
            placeholder={placeholder}
            prefix={
                onlyPhone || isPhone(type) ? (
                    <Select
                        bordered={false}
                        defaultValue={countryCode}
                        onChange={handleCountryCode}
                    >
                        {COUNTRY_CODES.map(code => (
                            <Select.Option
                                key={code}
                                value={`+${code}`}
                            >{`+${code}`}</Select.Option>
                        ))}
                    </Select>
                ) : (
                    <img alt="email" src={emailSVG} />
                )
            }
            size={inputSize}
            type={inputType}
            value={value}
            {...restProps}
        />
    );
};
