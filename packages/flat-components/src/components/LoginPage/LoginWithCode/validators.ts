import { RuleObject } from "antd/es/form";

// there must only be numbers
export function validatePhone(phone: string): boolean {
    return phone.length >= 5 && !/\D/.test(phone);
}

export function validateCode(code: string): boolean {
    return code.length === 6;
}

export function codeValidator(): RuleObject {
    return {
        validator: (_, value: string) => {
            if (validateCode(value)) {
                return Promise.resolve();
            } else {
                return Promise.reject();
            }
        },
    };
}
