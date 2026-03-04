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
        {
            name: "teachconnect-worker",
            script: "npx",
            args: "ts-node scripts/worker.ts", // Runs the BullMQ worker
            instances: 1, // 1 worker instance is usually enough to handle queues
            autorestart: true, // Restarts automatically if it crashes
            watch: false,
            max_memory_restart: "1G", // Prevents memory leaks
            env: {
                NODE_ENV: "production",
            },
        },
    ],
};
