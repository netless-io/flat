import React, { useRef, useState } from "react";
import type { Story, Meta } from "@storybook/react";
import "./colors.less";
import { useIsomorphicLayoutEffect } from "react-use";

const storyMeta: Meta = {
    title: "Theme/Theme",
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

const types = ["primary", "success", "warning", "danger", "text"];
const kinds = ["weaker", "weak", "", "strong", "stronger"];

export const Brand: Story = (_, config) => {
    const [colorHex, setColorHex] = useState<Record<string, string>>({});
    const rootRef = useRef<HTMLDivElement>(null);
    useIsomorphicLayoutEffect(() => {
        const updateColorCode = (): void => {
            if (rootRef.current) {
                try {
                    const styles = window.getComputedStyle(rootRef.current);
                    const colorHex = colors.reduce(
                        (hex, color) => {
                            colorNum.forEach(i => {
                                const name = `--${color}-${i}`;
                                const value = styles.getPropertyValue(name).toUpperCase().trim();
                                hex[name] = value;
                                hex[value] = name;
                            });
                            return hex;
                        },
                        {} as Record<string, string>,
                    );
                    const themeHex = types.reduce(
                        (hex, type) => {
                            kinds.forEach(kind => {
                                const name = kind ? `--${type}-${kind}` : `--${type}`;
                                hex[name] = styles.getPropertyValue(name).toUpperCase().trim();
                            });
                            return hex;
                        },
                        {} as Record<string, string>,
                    );

                    setColorHex({ ...colorHex, ...themeHex });
                } catch (e) {
                    console.error(e);
                }
            }
        };
        if (Object.keys(colorHex).length <= 0) {
            updateColorCode();
            return;
        } else {
            const timer = window.setTimeout(updateColorCode, 0);
            return () => {
                window.clearTimeout(timer);
            };
        }
    }, [config.globals.prefersColorScheme]);

    return (
        <div ref={rootRef} className="flat-theme-root center mw8">
            {types.map(type => (
                <div key={type} className="ph3-ns">
                    <div className="cf ph2-ns">
                        {kinds.map(kind => {
                            const color = kind ? `--${type}-${kind}` : `--${type}`;
                            const textColor = kind.includes("weak")
                                ? "var(--text-strong)"
                                : "var(--text-weaker)";
                            return (
                                <div key={kind} className="fl w-100 w-20-ns pa2">
                                    <div
                                        className="tc pv3"
                                        style={{
                                            color: textColor,
                                            background: `var(${color})`,
                                        }}
                                    >
                                        <div
                                            style={{
                                                userSelect: "none",
                                                color: textColor,
                                            }}
                                        >
                                            {colorHex[colorHex[color]]}
                                        </div>
                                        <div
                                            style={{
                                                userSelect: "none",
                                                color: textColor,
                                            }}
                                        >
                                            {colorHex[color]}
                                        </div>
                                        <div>{color}</div>
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
