import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";
import { LoginAgreement, LoginAgreementProps } from ".";

const storyMeta: Meta = {
    title: "LoginPage/LoginAgreement",
    component: LoginAgreement,
};

export default storyMeta;

export const Overview: Story<LoginAgreementProps> = () => {
    const [checked, setChecked] = useState(false);

    return <LoginAgreement checked={checked} onChange={setChecked} />;
};
