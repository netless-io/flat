import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";
import { ClassPicker, ClassPickerItemType, ClassPickerProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/ClassPicker",
    component: ClassPicker,
    parameters: {
        backgrounds: {
            default: "Homepage Background",
        },

        viewport: {
            viewports: {
                compact: {
                    name: "Compact Mode",
                    styles: { width: "556px", height: "611px" },
                },
            },
            defaultViewport: "compact",
        },
    },
};

export default storyMeta;

export const Overview: Story<ClassPickerProps> = args => <ClassPicker {...args} />;
Overview.args = {
    type: "oneToOne",
};

export const PlayableExample: Story<ClassPickerProps> = () => {
    const [classType, setClassType] = useState<ClassPickerItemType>("oneToOne");
    return <ClassPicker type={classType} onChange={setClassType} />;
};
PlayableExample.argTypes = {
    type: {
        control: false,
    },
};
