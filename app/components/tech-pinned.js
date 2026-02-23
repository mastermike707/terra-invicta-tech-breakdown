const TechPinned = {
    props: {
        pinned: Array,
        tree: Object,
        effects: Object,
        modules: Object,
        orgs: Object,
        description: Boolean,
        showEffects: Boolean,
    },
    emits: [
        'update:description', 
        'update:showEffects', 
        'toggle-known', 
        'unpin', 
        'jump-to-tech',
    ],
    computed: {
        pinnedTechnologies() {
            return this.pinned
                .map(x => this.tree.get(x))
                .sort((a, b) => this.tree.getMissingScience(a.dataName) - this.tree.getMissingScience(b.dataName));
        },
        totalPinnedCost() {
            return this.tree.getTotalMissingScience(this.pinnedTechnologies.map(t => t.dataName));
        },
        categoryTotals() {
            const allUnknowns = new Set();
            this.pinnedTechnologies.forEach(tech => {
                if (!tech.known) {
                    allUnknowns.add(tech.dataName);
                }
                this.tree.getUnknownRequirements(tech.dataName).forEach(req => allUnknowns.add(req));
            });

            const categories = {};
            allUnknowns.forEach(dataName => {
                const tech = this.tree.get(dataName);
                const category = tech.techCategory || 'Other';
                if (!categories[category]) {
                    categories[category] = 0;
                }
                categories[category] += (tech.researchCost || 0);
            });

            return Object.entries(categories).map(([name, cost]) => {
                return {
                    name: this.formatCategoryName(name),
                    cost: cost
                };
            }).sort((a, b) => b.cost - a.cost);
        }
    },
    methods: {
        formatCategoryName(name) {
            return name
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase())
                .trim();
        },
        format(num) {
            return Intl.NumberFormat().format(num);
        }
    },
};
