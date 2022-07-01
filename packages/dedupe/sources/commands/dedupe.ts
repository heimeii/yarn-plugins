import { Cache, Configuration, InstallMode, Project, StreamReport } from '@yarnpkg/core';
import { BaseCommand } from '@yarnpkg/cli';
import { Command, Option } from 'clipanion';
import { dedupe, Strategy } from '../utils';

export default class DedupeCommand extends BaseCommand {
    static paths = [
        ['strict-dedupe'],
        ['sd'],
    ];

    static usage = Command.Usage({
        description: `deduplicate dependencies with overlapping ranges`,
        details: ``,
        examples: [[
            `Dedupe all packages`,
            `$0 sd`,
        ], [
            `Dedupe only "react" and "react-dom" packages`,
            `$0 sd react react-dom`,
        ], [
            `Dedupe all packages with the \`@babel/*\` scope`,
            `$0 sd '@babel/*'`,
        ], [
            `Check for duplicates (can be used as a CI step)`,
            `$0 sd --check`,
        ]],
    });

    check = Option.Boolean(`-c,--check`, false, {
        description: `Exit with exit code 1 when duplicates are found, without persisting the dependency tree`,
    });

    patterns = Option.Rest();

    async execute() {
        const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
        const { project } = await Project.find(configuration, this.context.cwd);
        const cache = await Cache.find(configuration);

        await project.restoreInstallState({
            restoreResolutions: false,
        });

        let resolvedDedupedCount: number = 0;
        let unresolvedDedupedCount: number = 0;
        const dedupeReport = await StreamReport.start({
            configuration,
            includeFooter: false,
            stdout: this.context.stdout,
        }, async report => {
            const result = await dedupe(project, { strategy: Strategy.HIGHEST, patterns: this.patterns, cache, report });
            resolvedDedupedCount = result.resolved;
            unresolvedDedupedCount = result.unresolved;
        });

        if (dedupeReport.hasErrors())
            return dedupeReport.exitCode();

        if (!this.check && resolvedDedupedCount > 0) {
            const installReport = await StreamReport.start({
                configuration,
                stdout: this.context.stdout,
            }, async report => {
                await project.install({ cache, report, mode: InstallMode.UpdateLockfile });
            });

            if (installReport.hasErrors()) {
                return installReport.exitCode();
            }
            resolvedDedupedCount = 0;
        }

        return resolvedDedupedCount + unresolvedDedupedCount ? 1 : 0;
    }
}
