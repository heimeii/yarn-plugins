import { Plugin } from '@yarnpkg/core';
import child_process from 'child_process';

const plugin: Plugin = {
    hooks: {
        afterAllInstalled() {
            child_process.execSync('npm run prepare --if-present', { stdio: 'inherit' });
        },
    },
};

export default plugin;
