import React from "react";
import { Story, Meta } from "@storybook/react";
import { Input, Radio, Checkbox, Button } from "antd";
import { useRef } from "@storybook/client-api";

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
                <div className="mb1">默认</div>
                <Input placeholder="请输入房间号" value="" />
            </div>
            <div className="mb3">
                <div className="mb1">选中</div>
                <Input placeholder="请输入房间号" className="ant-input-focused" value="" />
            </div>
            <div className="mb3">
                <div className="mb1">输入</div>
                <Input placeholder="请输入房间号" value="888 888 888 888" />
            </div>
            <div className="mb3">
                <div className="mb1">全选</div>
                <Input
                    placeholder="请输入房间号"
                    className="ant-input-selected"
                    value="888 888 888 888"
                    ref={selectAllRef}
                    onClick={() => selectAllRef.current?.focus({ cursor: "all" })}
                />
            </div>
        </div>
    );

    const radioExample = (
        <Radio.Group value={3}>
            <div className="db mv4">
                <Radio value={1}>默认</Radio>
            </div>
            <div className="db mv4">
                <Radio className="is-hover" value={2}>
                    悬停
                </Radio>
            </div>
            <div className="db mv4">
                <Radio value={3}>选中</Radio>
            </div>
            <div className="db mv4">
                <Radio value={4} disabled>
                    禁用
                </Radio>
            </div>
            <div className="db mv4">
                <Radio className="is-hover" value={5} disabled>
                    禁用
                </Radio>
            </div>
        </Radio.Group>
    );

    const checkboxExample = (
        <div>
            <div className="mv4">
                <Checkbox checked={false}>默认</Checkbox>
            </div>
            <div className="mv4">
                <Checkbox checked={false} className="ant-checkbox-hovered">
                    悬停
                </Checkbox>
            </div>
            <div className="mv4">
                <Checkbox checked>选中</Checkbox>
            </div>
            <div className="mv4">
                <Checkbox disabled>禁用</Checkbox>
            </div>
            <div className="mv4">
                <Checkbox checked disabled>
                    禁用
                </Checkbox>
            </div>
        </div>
    );

    const buttonExample = (
        <div>
            <div className="flex justify-around items-center mb3">
                <Button type="primary">上传</Button>
                <Button>次按钮</Button>
                <Button type="dashed">虚线按钮</Button>
                <Button danger>警示按钮</Button>
                默认
            </div>
            <div className="flex justify-around items-center mb3">
                <Button type="primary" className="is-hover">
                    上传
                </Button>
                <Button className="is-hover">次按钮</Button>
                <Button type="dashed" className="is-hover">
                    虚线按钮
                </Button>
                <Button danger className="is-hover">
                    警示按钮
                </Button>
                悬停
            </div>
            <div className="flex justify-around items-center mb3">
                <Button disabled type="primary">
                    上传
                </Button>
                <Button disabled>次按钮</Button>
                <Button disabled type="dashed">
                    虚线按钮
                </Button>
                <Button disabled danger>
                    警示按钮
                </Button>
                禁用
            </div>
        </div>
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
                <div className="column is-half-widescreen">{buttonExample}</div>
            </div>
        </div>
    );
};
