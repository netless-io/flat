import { Button, Input } from "antd";
import React, { useEffect, useState } from "react";

import editSVG from "./icons/edit.svg";
import closeSVG from "./icons/close.svg";
import checkSVG from "./icons/check.svg";

const nicknameRegx = /^.{1,15}$/;

export function nicknameValidator(name: string): boolean {
    return nicknameRegx.test(name);
}

// input editable
interface EditableInputProps {
    value: string;
    icon?: string;
    desc: string;

    setValue: (event: React.ChangeEvent<HTMLInputElement>) => void;
    updateValue: () => Promise<void>;
    cancelUpdate: () => void;
}

export function EditableInput({
    value,
    icon,
    desc,

    setValue,
    updateValue,
    cancelUpdate,
}: EditableInputProps): React.ReactElement {
    const [editing, setEditing] = useState(false);
    const [hovering, setHovering] = useState(false);
    const [keyValidate, setKeyValidate] = useState(false);

    useEffect(() => {
        if (editing && !nicknameValidator(value)) {
            setKeyValidate(false);
        } else {
            setKeyValidate(true);
        }
    }, [editing, keyValidate, value]);

    return (
        <div
            className={`input-container-bg${
                hovering && !editing ? " input-container-bg-hover" : ""
            }`}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            {icon && <img alt={icon} className="general-setting-item-icon" src={icon} />}
            <span className="general-setting-item-icon-desc">{desc}</span>
            {editing ? (
                <>
                    <Input
                        id={desc}
                        spellCheck={false}
                        status={keyValidate ? void 0 : "error"}
                        value={value}
                        onChange={setValue}
                    />

                    <Button
                        className="general-setting-item-btn"
                        disabled={!keyValidate}
                        type="link"
                        onClick={async () => {
                            await updateValue();
                            setEditing(false);
                            setHovering(false);
                        }}
                    >
                        <img alt="check" src={checkSVG} />
                    </Button>
                    <Button
                        className="general-setting-item-btn"
                        type="link"
                        onClick={() => {
                            cancelUpdate();
                            setEditing(false);
                            setHovering(false);
                        }}
                    >
                        <img alt="close" src={closeSVG} />
                    </Button>
                </>
            ) : (
                <span className="general-setting-item-key">{value}</span>
            )}
            {hovering && !editing && (
                <Button
                    className="general-setting-item-btn"
                    type="link"
                    onClick={() => setEditing(true)}
                >
                    <img alt="edit" src={editSVG} />
                </Button>
            )}
        </div>
    );
}
