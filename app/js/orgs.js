class Orgs {
    constructor() {
        this.data = {};
        this.byTech = {};
    }

    addOrgs(data) {
        for (const source of data) {
            this.addOrg(source);
        }
    }

    addOrg(source) {
        this.data[source.dataName] = source;
        this.indexOrg(source);
    }

    indexOrg(source) {
        if (typeof source.requiredTechName !== 'string' || source.requiredTechName.length === 0) {
            return;
        }
        if (!Array.isArray(this.byTech[source.requiredTechName])) {
            this.byTech[source.requiredTechName] = [];
        }
        this.byTech[source.requiredTechName].push(source);
    }

    addTranslation(dataName, type, value) {
        if (dataName in this.data) {
            this.data[dataName][type] = value;
        }
    }

    getYields(org) {
        const yields = [];
        const stats = [
            { key: 'administration', icon: 'administration' },
            { key: 'command', icon: 'command' },
            { key: 'espionage', icon: 'espionage' },
            { key: 'investigation', icon: 'investigation' },
            { key: 'security', icon: 'security' },
            { key: 'science', icon: 'science' }
        ];
        const incomes = [
            { key: 'incomeMoney', icon: 'currency' },
            { key: 'incomeResearch', icon: 'research' },
            { key: 'incomeInfluence', icon: 'influence' },
            { key: 'incomeOps', icon: 'ops' },
            { key: 'incomeBoost', icon: 'boost' },
            { key: 'incomeMissionControl', icon: 'mission_control' },
            { key: 'projectsGranted', icon: 'projects' },
            { key: 'miningBonus', icon: 'core_res' }
        ];

        const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

        stats.forEach(stat => {
            const value = org[stat.key];
            if (value && value !== 0) {
                const randKey = 'rand' + capitalize(stat.key);
                const randValue = org[randKey];
                let displayValue = (value > 0 ? '+' : '') + value;
                if (randValue && randValue !== 0) {
                    displayValue += ` ± ${randValue}`;
                }
                yields.push({ icon: stat.icon, value: displayValue, type: 'stat' });
            }
        });

        incomes.forEach(income => {
            const value = org[income.key];
            if (value && value !== 0) {
                const isPercent = income.key.endsWith('Bonus');
                const randKey = 'rand' + capitalize(income.key);
                const randValue = org[randKey];

                const format = (v) => {
                    if (isPercent) return (v * 100).toFixed(0) + '%';
                    return v;
                };

                let displayValue = (value > 0 ? '+' : '') + format(value);
                if (randValue && randValue !== 0) {
                    displayValue += ` ± ${format(randValue)}`;
                }
                yields.push({ icon: income.icon, value: displayValue, type: 'income' });
            }
        });

        return yields;
    }

    getTechOrgs(requiredTechName) {
        return this.byTech[requiredTechName] || [];
    }

    async load() {
        const data = await Parser.loadTemplateFile('TIOrgTemplate');
        this.addOrgs(data);

        const translations = await Parser.loadLocalizationFile('TIOrgTemplate');
        translations.forEach(({ type, key, value }) => this.addTranslation(key, type, value));
    }
}
