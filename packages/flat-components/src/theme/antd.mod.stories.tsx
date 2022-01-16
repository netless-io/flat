import React from "react";
import { Story, Meta } from "@storybook/react";
import { Input, Radio, Checkbox, Button } from "antd";
import { useRef } from "@storybook/client-api";
import faker from "faker";

const storyMeta: Meta = {
    title: "Theme/AntdMod",
    parameters: {
        options: {
            showPanel: false,
        },
        docs: { page: null },
    },
};

export default storyMeta;

export const Overview: Story = () => {
    const selectAllRef = useRef<Input | null>(null);

    const inputExample = (
        <div>
            <div className="mb3">
                <div className="mb1">Default</div>
                <Input placeholder="Please enter the room number" value="" />
            </div>
            <div className="mb3">
                <div className="mb1">Selected</div>
                <Input
                    className="ant-input-focused"
                    placeholder="Please enter the room number"
                    value=""
                />
            </div>
            <div className="mb3">
                <div className="mb1">Input</div>
                <Input placeholder="Please enter the room number" value="888 888 888 888" />
            </div>
            <div className="mb3">
                <div className="mb1">Select All</div>
                <Input
                    ref={selectAllRef}
                    className="ant-input-selected"
                    placeholder="Please enter the room number"
                    value="888 888 888 888"
                    onClick={() => selectAllRef.current?.focus({ cursor: "all" })}
                />
            </div>
            <div className="mb3">
                <div className="mb1">Disable</div>
                <Input disabled placeholder="Please enter the room number" />
            </div>
            <div className="mb3">
                <div className="mb1">Disable(has value)</div>
                <Input
                    disabled
                    placeholder="Please enter the room number"
                    value="888 888 888 888"
                />
            </div>
        </div>
    );

    const radioExample = (
        <div>
            <div className="db mv4">
                <Radio value={1}>Default</Radio>
            </div>
            <div className="db mv4">
                <Radio className="is-hover" value={2}>
                    Hover
                </Radio>
            </div>
            <div className="db mv4">
                <Radio checked value={3}>
                    Selected
                </Radio>
            </div>
            <div className="db mv4">
                <Radio disabled value={4}>
                    Disable
                </Radio>
            </div>
            <div className="db mv4">
                <Radio checked disabled className="is-hover" value={5}>
                    Disable(Selected)
                </Radio>
            </div>
        </div>
    );

    const checkboxExample = (
        <div>
            <div className="mv4">
                <Checkbox checked={false}>Default</Checkbox>
            </div>
            <div className="mv4">
                <Checkbox checked={false} className="ant-checkbox-hovered">
                    Hover
                </Checkbox>
            </div>
            <div className="mv4">
                <Checkbox checked>Selected</Checkbox>
            </div>
            <div className="mv4">
                <Checkbox disabled>Disable</Checkbox>
            </div>
            <div className="mv4">
                <Checkbox checked disabled>
                    Disable(Selected)
                </Checkbox>
            </div>
        </div>
    );

    const buttonExample = (
        <div>
            <div className="flex justify-around items-center mb3">
                <Button type="primary">Primary</Button>
                <Button>Default</Button>
                <Button type="dashed">Dashed</Button>
                <Button danger>Warning</Button>
                <span style={{ width: "5em", display: "inline-block", textAlign: "center" }}>
                    Default
                </span>
            </div>
            <div className="flex justify-around items-center mb3">
                <Button className="is-hover" type="primary">
                    Primary
                </Button>
                <Button className="is-hover">Default</Button>
                <Button className="is-hover" type="dashed">
                    Dashed
                </Button>
                <Button danger className="is-hover">
                    Warning
                </Button>
                <span style={{ width: "5em", display: "inline-block", textAlign: "center" }}>
                    Hover
                </span>
            </div>
            <div className="flex justify-around items-center mb3">
                <Button disabled type="primary">
                    Primary
                </Button>
                <Button disabled>Default</Button>
                <Button disabled type="dashed">
                    Dashed
                </Button>
                <Button danger disabled>
                    Warning
                </Button>
                <span style={{ width: "5em", display: "inline-block", textAlign: "center" }}>
                    Disabled
                </span>
            </div>
        </div>
    );

    const textAreaExample = (
        <Input.TextArea rows={5} value={Array(50).fill(faker.lorem.words(100)).join("\n\n")} />
    );

    return (
        <div className="w-80-ns center" style={{ color: "#7A7B7C" }}>
            <div className="columns is-variable is-8">
                <div className="column is-half">{inputExample}</div>
                <div className="column is-one-quarter-widescreen">
                    <div className="columns is-mobile">
                        <div className="column flex justify-center">{radioExample}</div>
                        <div className="column flex justify-center">{checkboxExample}</div>
                    </div>
                </div>
            </div>
            <div className="columns">
                <div className="column is-half-desktop is-three-quarters-tablet">
                    {buttonExample}
                </div>
                <div className="column is-half-desktop is-three-quarters-tablet">
                    {textAreaExample}
                </div>
            </div>
        </div>
    );
};
