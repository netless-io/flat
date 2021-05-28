import { Meta, Story } from "@storybook/react";
import React, { useState } from "react";
import { ClassPicker, ClassPickerItemType, ClassPickerProps } from ".";

const storyMeta: Meta = {
    title: "HomePage/ClassPicker",
    component: ClassPicker,
    parameters: {
        layout: "fullscreen",
        backgrounds: {
            default: "Homepage Background",
        },
        viewport: {
            viewports: {
                compact: {
                    name: "Compact Mode",
                    styles: { width: "368px", height: "206px" },
                },
                large: {
                    name: "Large Mode",
                    styles: { width: "560px", height: "96px" },
                },
            },
            defaultViewport: "compact",
        },
    },
};

export default storyMeta;

export const Overview: Story<ClassPickerProps> = args => <ClassPicker {...args} />;
Overview.args = {
    value: "BigClass",
};

export const PlayableExample: Story<ClassPickerProps> = () => {
    const [classType, setClassType] = useState<ClassPickerItemType>("BigClass");
    return <ClassPicker value={classType} onChange={setClassType} />;
};
PlayableExample.argTypes = {
    type: {
        control: false,
    },
};

export const LargeMode: Story<ClassPickerProps> = args => {
    const [classType, setClassType] = useState<ClassPickerItemType>("BigClass");
    return <ClassPicker {...args} value={classType} onChange={setClassType} />;
};
LargeMode.argTypes = {
    type: {
        control: false,
    },
};
LargeMode.args = {
    large: true,
};
LargeMode.parameters = {
    viewport: {
        defaultViewport: "large",
    },
};

export const DisabledLargeMode: Story<ClassPickerProps> = args => {
    const [classType, setClassType] = useState<ClassPickerItemType>("BigClass");
    return <ClassPicker {...args} value={classType} onChange={setClassType} />;
};
DisabledLargeMode.argTypes = {
    type: {
        control: false,
    },
};
DisabledLargeMode.args = {
    large: true,
    disabled: true,
};
DisabledLargeMode.parameters = {
    viewport: {
        defaultViewport: "large",
    },
};
