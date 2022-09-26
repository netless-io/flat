import "./antd.mod.stories.less";

import React from "react";
import { Story, Meta } from "@storybook/react";
import { Input, Radio, Checkbox, Button, ButtonProps, InputRef, Table } from "antd";
import { SVGChat } from "../components/FlatIcons";
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

export const Buttons: Story = () => {
    return (
        <div className="flat-theme-root center mw8 br3 overflow-hidden antd-mod-buttons">
            <ButtonRow type="primary">Primary</ButtonRow>
            <ButtonRow type="default">Default</ButtonRow>
            <ButtonRow type="dashed">Dashed</ButtonRow>
            <ButtonRow type="text">Text</ButtonRow>
            <ButtonRow type="link">Link</ButtonRow>
            <ButtonRow danger type="text">
                Danger
            </ButtonRow>
            <ButtonRow danger type="default">
                Danger
            </ButtonRow>
            <ButtonRow icon={<SVGChat />} shape="circle" type="primary"></ButtonRow>
            <ButtonRow icon={<SVGChat />} shape="circle" type="default"></ButtonRow>
            <ButtonRow icon={<SVGChat />} shape="circle" type="dashed"></ButtonRow>
            <div style={{ backgroundColor: "var(--grey-12)" }}>
                <ButtonRow type="ghost">Ghost</ButtonRow>
            </div>
        </div>
    );
};

export const Overview: Story = () => {
    const selectAllRef = useRef<InputRef | null>(null);

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

    const tableExample = (
        <Table
            columns={[
                {
                    key: "name",
                    dataIndex: "name",
                    title: "Name",
                    render: text => <a>{text}</a>,
                },
                {
                    key: "age",
                    dataIndex: "age",
                    title: "Age",
                },
            ]}
            dataSource={[
                { key: "1", name: "John Brown", age: 32 },
                { key: "2", name: "Jim Green", age: 42 },
                { key: "3", name: "Joe Black", age: 32 },
            ]}
        />
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
            <div className="columns">
                <div className="column">{tableExample}</div>
            </div>
        </div>
    );
};

function ButtonRow(props: ButtonProps): React.ReactElement {
    return (
        <div className="ph3-ns pv3">
            <div className="cf ph2-ns">
                <div className="fl w-100 w-20-ns">
                    <h4 className="antd-mod-buttons-titles">Default</h4>
                    <Button {...props}></Button>
                </div>
                <div className="fl w-100 w-20-ns">
                    <h4 className="antd-mod-buttons-titles">Focus</h4>
                    <Button {...props} className="is-focus"></Button>
                </div>
                <div className="fl w-100 w-20-ns">
                    <h4 className="antd-mod-buttons-titles">Hover</h4>
                    <Button {...props} className="is-hover"></Button>
                </div>
                <div className="fl w-100 w-20-ns">
                    <h4 className="antd-mod-buttons-titles">Active</h4>
                    <Button {...props} className="is-active"></Button>
                </div>
                <div className="fl w-100 w-20-ns">
                    <h4 className="antd-mod-buttons-titles">Disabled</h4>
                    <Button {...props} disabled></Button>
                </div>
            </div>
        </div>
    );
}
