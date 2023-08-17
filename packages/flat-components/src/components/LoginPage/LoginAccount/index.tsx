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

export const defaultCountryCode = process.env.DEFAULT_COUNTRY_CODE || "+86";
export const defaultAccountType = PasswordLoginType.Phone;

export interface LoginAccountProps {
    placeholder?: string;
    countryCode?: string;
    accountType?: PasswordLoginType;
    value?: string;
    handleCountryCode?: (code: string) => void;

    // to specify the input method
    onlyPhone?: boolean;
    onlyEmail?: boolean;

    // If you pass `handleType` from parent component, it says you want to get 'both' account input.
    // The 'both' account input means that it has the functions of phone input and email input at the same time.
    handleType?: (type: PasswordLoginType) => void;

    // history props
    password?: string;
    accountHistory?: Array<{ key: string; password: string; countryCode?: string | null }> | [];
    onHistoryChange?: (options: any) => void;
}

export const LoginAccount: React.FC<LoginAccountProps> = ({
    countryCode = defaultCountryCode,
    accountType = defaultAccountType,
    placeholder,
    password,
    value,
    onlyPhone,
    onlyEmail,
    accountHistory,
    handleType,
    handleCountryCode,
    onHistoryChange,
    ...restProps
}) => {
    const defaultEmail = accountType === PasswordLoginType.Email;
    const defaultPhone = accountType === PasswordLoginType.Phone;

    const [type, setType] = useState<PasswordLoginType>(accountType);

    useEffect(() => {
        if (onlyPhone) {
            setType(PasswordLoginType.Phone);
            return;
        }

        if (onlyEmail) {
            setType(PasswordLoginType.Email);
            return;
        }

        if (defaultEmail) {
            if (!value || !validateIsPhone(value)) {
                setType(PasswordLoginType.Email);
            } else {
                setType(PasswordLoginType.Phone);
            }
        }

        if (defaultPhone) {
            if (!value || validateIsPhone(value)) {
                setType(PasswordLoginType.Phone);
            } else {
                setType(PasswordLoginType.Email);
            }
        }

        // report to parent component if there is changing
        if (type && handleType) {
            handleType(type);
        }
    }, [value, type, defaultEmail, defaultPhone, onlyPhone, handleType, onlyEmail]);

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
                                <Select.Option
                                    key={account.password}
                                    title={account.countryCode}
                                    value={account.key}
                                >
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
                        value={countryCode}
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
            value={value}
            {...restProps}
        />
    );
};
