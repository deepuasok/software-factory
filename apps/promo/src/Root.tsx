import { Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/Roboto";
import "./style.css";
import { Film, FPS, TOTAL_FRAMES } from "./Film";

loadFont("normal", { weights: ["400", "500", "700"], subsets: ["latin"] });

export const Root = () => (
  <Composition
    id="SoftwareFactory"
    component={Film}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
