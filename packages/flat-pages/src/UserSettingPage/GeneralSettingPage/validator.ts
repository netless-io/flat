import { t } from "i18next";
import { UpdatePasswordFormValues } from "./UpdatePasswordModel";
import { RuleObject } from "antd/es/form";

export const validateNewPassword = (password1: string, password2: string): boolean => {
    return password1 === password2;
};

export function newPassword2Validator({ newPassword1 }: UpdatePasswordFormValues) {
    return (_: RuleObject, newPassword2: string): Promise<void> => {
        if (validateNewPassword(newPassword1, newPassword2)) {
            return Promise.resolve();
        }

        return Promise.reject(t("password-not-match"));
    };
}
