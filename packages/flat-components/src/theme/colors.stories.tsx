import React, { useRef, useState } from "react";
import { Story, Meta } from "@storybook/react";
import "./colors.less";
import { useIsomorphicLayoutEffect } from "react-use";

const storyMeta: Meta = {
    title: "Theme/Colors",
    parameters: {
        options: {
            showPanel: false,
        },
        docs: { page: null },
    },
};

export default storyMeta;

const colors = ["blue", "grey", "green", "yellow", "red"];
const colorNum = Array(13)
    .fill(0)
    .map((_, i) => i);

export const Overview: Story = () => {
    const [colorHex, setColorHex] = useState<Record<string, string>>({});
    const rootRef = useRef<HTMLDivElement>(null);
    useIsomorphicLayoutEffect(() => {
        if (rootRef.current) {
            try {
                const styles = window.getComputedStyle(rootRef.current);
                setColorHex(
                    colors.reduce(
                        (hex, color) => {
                            colorNum.forEach(i => {
                                const name = `--${color}-${i}`;
                                hex[name] = styles.getPropertyValue(name).toUpperCase();
                            });
                            return hex;
                        },
                        {} as Record<string, string>,
                    ),
                );
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    return (
        <div ref={rootRef} className="flat-theme-root center mw8">
            {colorNum.map(i => (
                <div key={i} className="ph3-ns">
                    <div className="cf ph2-ns">
                        {colors.map((color, c) => {
                            const clr = (x: number): string => `var(--${color}-${x})`;
                            const textClr = i >= colorNum.length / 2 ? 3 : colorNum.length - 3;
                            return (
                                <div key={c} className="fl w-100 w-20-ns">
                                    <div className="tc pv3" style={{ background: clr(i) }}>
                                        <div style={{ color: clr(textClr), userSelect: "none" }}>
                                            {colorHex[`--${color}-${i}`]}
                                        </div>
                                        <div style={{ color: clr(textClr - 1) }}>
                                            {`--${color}-${i}`}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};
