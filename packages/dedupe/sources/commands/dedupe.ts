import child_process from 'child_process';
import { Configuration, MessageName, Project, StreamReport } from '@yarnpkg/core';
import { BaseCommand } from '@yarnpkg/cli';
import { Command, Option } from 'clipanion';
import micromatch from 'micromatch';

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
        let dedupeResultStr = '';
        try {
            dedupeResultStr = child_process.execSync(`yarn dedupe --mode=update-lockfile --json ${this.check ? '--check' : ''} ${this.patterns.join(' ')}`, { stdio: 'pipe' }).toString();
        } catch (error) {
            dedupeResultStr = error.stdout.toString();
        }
        const dedupeResult = dedupeResultStr.split('\n').map(item => item ? JSON.parse(item) : item).filter(item => !!item);

        const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
        const { project } = await Project.find(configuration, this.context.cwd);

        await project.restoreInstallState();

        const report = await StreamReport.start(
            { configuration, stdout: this.context.stdout },
            async (report) => {
                const versionMap = new Map<string, string[]>();
                const packages = Array.from(project.originalPackages.values()).filter(item => !item.reference.match(/^virtual:/));
                packages.forEach(item => {
                    const packageName = `${item.scope ? `@${item.scope}/` : ''}${item.name}`;
                    const arr = versionMap.get(packageName) || [];
                    arr.push(item.version);
                    versionMap.set(packageName, arr);
                });

                const unresolved: [string, string[]][] = [];
                versionMap.forEach((v, k) => {
                    if (v.length > 1) {
                        if (!this.patterns.length || micromatch.isMatch(k, this.patterns)) {
                            unresolved.push([k, v]);
                        }
                    }
                });

                report.startTimerSync(`${this.check ? 'Partial Resolvable' : 'Resolvable'} DedupeData:`, () => {
                    dedupeResult.forEach(item => report.reportInfo(MessageName.UNNAMED, `descriptor<${item.descriptor}>, currentResolution<${item.currentResolution}>, updatedResolution<${item.updatedResolution}>`));
                });
                report.startTimerSync('Unresolved DedupeData:', () => {
                    unresolved.forEach(item => report.reportInfo(MessageName.UNNAMED, `Package<${item[0]}>, versions: [${item[1]}]`));
                });
                if (unresolved.length || (this.check && dedupeResult.length)) {
                    report.reportError(MessageName.UNNAMED, '-------dedupe check fail--------');
                }
            },
        );

        return report.exitCode();
    }
}
