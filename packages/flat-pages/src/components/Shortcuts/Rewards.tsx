import animationSVGA from "./assets/animation.svga?url";
import rewardMP3 from "./assets/reward.mp3?url";

import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Parser, Player } from "svga";

import { ShortcutsProps } from "./Shortcuts";

const svgaParser = new Parser();
const loadAnimation = svgaParser.load(animationSVGA);

const RewardStageStyle: Partial<CSSStyleDeclaration> = {
    position: "absolute",
    left: "30vw",
    top: "152px",
    width: "40vw",
    height: "40vw",
    pointerEvents: "none",
    zIndex: "9999",
    transition: "all 1s ease",
};

function lookForRewardTarget(userUUID: string): HTMLElement | null {
    return document.querySelector(
        `[data-user-uuid="${userUUID}"]:not(.video-avatar-holder)`,
    ) as HTMLElement | null;
}

export const Rewards = observer<ShortcutsProps>(function Rewards({ classroom }) {
    useEffect(() => {
        return classroom.rtm.events.on("reward", async ({ userUUID }) => {
            const target = lookForRewardTarget(userUUID);
            if (!target) {
                return;
            }

            const audio = new Audio(rewardMP3);
            audio.volume = 0.3;

            const svga = await loadAnimation;
            const size = svga.size;
            const rect = target.getBoundingClientRect();

            const ratio = size.height / size.width;
            const finalWidth = Math.min(rect.width, rect.height / ratio);
            const finalHeight = finalWidth * ratio;
            if (finalWidth <= 0 || finalHeight <= 0) {
                return;
            }

            const top = rect.top + (rect.height - finalHeight) / 2;
            const left = rect.left + (rect.width - finalWidth) / 2;
            const canvas = document.createElement("canvas");
            Object.assign(canvas.style, RewardStageStyle);
            document.body.appendChild(canvas);
            const style = {
                top: `${top}px`,
                left: `${left}px`,
                width: `${finalWidth}px`,
                height: `${finalHeight}px`,
            };
            setTimeout(() => {
                Object.assign(canvas.style, style);
            }, 1500);
            const player = new Player({
                container: canvas,
                loop: 1,
                fillMode: "backwards" as any,
            });
            await player.mount(svga);
            let progress = 0;
            player.onProcess = () => {
                // use "pause" to prevent it from clearing the last frame
                if (++progress === 36) {
                    player.pause();
                }
            };
            player.onEnd = () => {
                setTimeout(() => {
                    canvas.style.opacity = "0";
                }, 2000);
                setTimeout(() => {
                    player.destroy();
                    document.body.removeChild(canvas);
                }, 3000);
            };
            player.start();
            audio.play();
        });
    }, [classroom.rtm.events]);

    return null;
});
