module.exports = {
    apps: [
        {
            name: 'golinksd',
            script: './server.js',
            env_prod: {
                NODE_ENV: 'production',
            },
            env_dev: {
                NODE_ENV: 'development',
            },
        },
    ],
};
