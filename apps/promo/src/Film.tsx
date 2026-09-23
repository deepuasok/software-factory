import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Title } from "./scenes/Title";
import { PartsBin } from "./scenes/PartsBin";
import { Assemble } from "./scenes/Assemble";
import { Interact } from "./scenes/Interact";
import { ThreeApps } from "./scenes/ThreeApps";
import { EndCard } from "./scenes/EndCard";

export const FPS = 30;

/** Scene boundaries in frames. One idea per beat, nothing rushed. */
export const T = {
  title: [0, 90],
  bin: [90, 330],
  assemble: [330, 600],
  interact: [600, 900],
  three: [900, 1020],
  end: [1020, 1110],
} as const;

export const TOTAL_FRAMES = T.end[1];

export const Film = () => (
  <AbsoluteFill style={{ background: "#F9F9F9", fontFamily: "Roboto, system-ui, sans-serif" }}>
    {/* "Pamgaea" by Kevin MacLeod, CC BY 4.0 — see public/CREDITS.md. Trimmed and faded in ffmpeg. */}
    <Audio src={staticFile("music.mp3")} />
    <Sequence from={T.title[0]} durationInFrames={T.title[1] - T.title[0]}><Title /></Sequence>
    <Sequence from={T.bin[0]} durationInFrames={T.bin[1] - T.bin[0]}><PartsBin /></Sequence>
    <Sequence from={T.assemble[0]} durationInFrames={T.assemble[1] - T.assemble[0]}><Assemble /></Sequence>
    <Sequence from={T.interact[0]} durationInFrames={T.interact[1] - T.interact[0]}><Interact /></Sequence>
    <Sequence from={T.three[0]} durationInFrames={T.three[1] - T.three[0]}><ThreeApps /></Sequence>
    <Sequence from={T.end[0]} durationInFrames={T.end[1] - T.end[0]}><EndCard /></Sequence>
  </AbsoluteFill>
);
