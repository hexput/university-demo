import { HexputClient } from "hexput";
import fs from "fs";
import path from "path";

export const hexput = new HexputClient();

hexput.registerFunction("debug", (_context, ...anyObjects: any) => {
    // console.log("\n\nDebug:", ...anyObjects,"\n\n");
    fs.appendFileSync(path.resolve(process.cwd(), "./debug.log"), "[DEBUG]: " + JSON.stringify(anyObjects) + "\n");
})

hexput.connect();