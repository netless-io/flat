import { RuleObject } from "antd/es/form";
import { t } from "i18next";
import { validatePhone } from "../LoginWithCode/validators";

const emailRegex = /^[^.\s@:](?:[^\s@:]*[^\s@:.])?@[^.\s@]+(?:\.[^.\s@]+)*$/;
const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;

export function validateEmail(email: string): boolean {
    return emailRegex.test(email);
}

export function validatePassword(password: string): boolean {
    return passwordRegex.test(password);
}

export function phoneValidator(): RuleObject {
    return {
        validator: (_, value): Promise<void> => {
            if (validatePhone(value)) {
                return Promise.resolve();
            }

            return Promise.reject(t("enter-phone-invalid"));
        },
    };
}

export function emailValidator(): RuleObject {
    return {
        validator: (_, value): Promise<void> => {
            if (validateEmail(value)) {
                return Promise.resolve();
            }

            return Promise.reject(t("enter-email-invalid"));
        },
    };
}

export function passwordValidator(): RuleObject {
    return {
        validator: (_, value): Promise<void> => {
            if (validatePassword(value)) {
                return Promise.resolve();
            }

            return Promise.reject(t("password-invalid"));
        },
    };
}
