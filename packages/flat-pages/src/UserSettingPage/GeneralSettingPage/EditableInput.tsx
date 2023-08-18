import { Button, Input } from "antd";
import React, { useState } from "react";

import editSVG from "./icons/edit.svg";
import closeSVG from "./icons/close.svg";
import checkSVG from "./icons/check.svg";

// input editable
interface EditableInputProps {
    value: string;
    icon: string;
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

    return (
        <div
            className={`input-container-bg ${hovering ? "input-container-bg-hover" : ""}`}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => !editing && setHovering(false)}
        >
            <img alt={icon} className="general-setting-item-icon" src={icon} />
            <span className="general-setting-item-icon-desc">{desc}</span>
            {editing ? (
                <>
                    <Input id={desc} spellCheck={false} value={value} onChange={setValue} />

                    <Button
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
                <span>{value}</span>
            )}
            {hovering && !editing && (
                <Button type="link" onClick={() => setEditing(true)}>
                    <img alt="edit" src={editSVG} />
                </Button>
            )}
        </div>
    );
}
