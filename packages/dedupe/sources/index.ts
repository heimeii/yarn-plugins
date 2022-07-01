import { Plugin } from '@yarnpkg/core';
import DedupeCommand from './commands/dedupe';

const plugin: Plugin = {
    commands: [
        DedupeCommand,
    ],
};

export default plugin;
