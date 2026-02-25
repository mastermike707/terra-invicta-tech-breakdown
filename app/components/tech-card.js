const TechCard = {
    props: {
        project: Object,
        tree: Object,
        effects: Object,
        modules: Object,
        orgs: Object,
        description: Boolean,
        showEffects: Boolean,
        showModules: Boolean,
        isPinned: Boolean,
        isKnown: Boolean,
        cpEfficiencyMode: Boolean,
        showPoints: { type: Boolean, default: true }
    },
    emits: ['toggle-show', 'toggle-known', 'pin', 'unpin', 'jump-to-tech'],
    methods: {
        capitalize(value) {
            if (typeof value !== 'string' || value.length < 1) return value;
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
        format(num) {
            return Intl.NumberFormat().format(num);
        },
        getCPStats(project) {
            const pattern = /control point management capacity by ([0-9.]+)/i;
            for (const effectName of project.effects) {
                const desc = this.effects.getDescription(effectName);
                if (!desc) continue;
                const match = desc.match(pattern);
                if (match) {
                    const cp = parseFloat(match[1]);
                    const totalCost = this.tree.getTotalScience(project.dataName);
                    const standaloneCost = project.researchCost;
                    return { cp, totalCost, standaloneCost };
                }
            }
            return null;
        }
    },
    computed: {
        cpStats() {
            return this.getCPStats(this.project);
        }
    },
};
