module.exports = {
    apps: [
        {
            name: "teachconnect-web",
            script: "npm",
            args: "start",
            instances: "max", // Scales Next.js across all available CPU cores
            exec_mode: "cluster", // Enables Zero-Downtime Reloads
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
    ],
};
