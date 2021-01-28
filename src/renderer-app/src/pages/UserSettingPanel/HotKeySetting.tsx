import React, { FC } from "react";
import "./HotKeySetting.less";

const HotKeyTable: FC = ({ children }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>名称</th>
                    <th>快捷键</th>
                </tr>
            </thead>
            <tbody>{children}</tbody>
        </table>
    );
};

interface HotKeySettingPair {
    name: string;
    key: string;
}

export const HotKeySetting = (): React.ReactElement => {
    const tool: HotKeySettingPair[] = [
        { name: "选择", key: "S" },
        { name: "画笔", key: "P" },
        { name: "文字", key: "T" },
        { name: "橡皮擦", key: "E" },
        { name: "圆形", key: "C" },
        { name: "矩形", key: "R" },
        { name: "箭头", key: "A" },
        { name: "激光笔", key: "L" },
        { name: "抓手", key: "H" },
    ];

    const edit: HotKeySettingPair[] = [
        { name: "删除所选对象", key: "Backspace / Delete" },
        { name: "等比例缩放", key: "Shift / ⇧" },
        { name: "撤销", key: "Ctrl + Z / ⌘ + Z" },
        { name: "重做", key: "Ctrl + Y / ⌘ + Y" },
        { name: "复制", key: "Ctrl + C / ⌘ + C" },
        { name: "粘贴", key: "Ctrl + V / ⌘ + V" },
    ];

    return (
        <div className="content-container">
            <div className="header-container">
                <span>热键设置</span>
            </div>
            <div className="hotkey-two-columns">
                <div className="column">
                    <div className="scope">工具栏</div>
                    <HotKeyTable>
                        {tool.map(({ name, key }, i) => (
                            <tr key={i}>
                                <td>{name}</td>
                                <td>{key}</td>
                            </tr>
                        ))}
                    </HotKeyTable>
                </div>
                <div className="column">
                    <div className="scope">编辑</div>
                    <HotKeyTable>
                        {edit.map(({ name, key }, i) => (
                            <tr key={i}>
                                <td>{name}</td>
                                <td>{key}</td>
                            </tr>
                        ))}
                    </HotKeyTable>
                </div>
            </div>
        </div>
    );
};
