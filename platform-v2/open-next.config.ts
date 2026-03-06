import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
    default: {
        runtime: "nodejs",
        minify: true,
    }
};

export default config;
