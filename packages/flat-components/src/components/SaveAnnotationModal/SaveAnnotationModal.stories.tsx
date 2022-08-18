import React from "react";
import { Meta, Story } from "@storybook/react";
import faker from "faker";
import { SaveAnnotationModal, SaveAnnotationModalProps } from ".";

const storyMeta: Meta = {
    title: "Components/SaveAnnotationModal",
    component: SaveAnnotationModal,
};

export default storyMeta;

// Random canvas generator.
const randomCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    const width = (canvas.width = faker.datatype.number({ min: 300, max: 600 }));
    const height = (canvas.height = faker.datatype.number({ min: 300, max: 600 }));

    for (let n = faker.datatype.number(10); n > 0; n--) {
        const x = faker.datatype.number({ min: -10, max: width });
        const y = faker.datatype.number({ min: -10, max: height });
        const w = faker.datatype.number({ min: 11, max: 300 });
        const h = faker.datatype.number({ min: 11, max: 200 });
        const color = faker.internet.color();
        context.fillStyle = color;
        context.fillRect(x, y, w, h);
    }

    return canvas;
};

export const Overview: Story<SaveAnnotationModalProps> = args => (
    <div className="vh-75 mw8-ns">
        <SaveAnnotationModal {...args} />
    </div>
);
Overview.args = {
    visible: true,
    images: Array.from({ length: faker.datatype.number(20) }, randomCanvas),
};
