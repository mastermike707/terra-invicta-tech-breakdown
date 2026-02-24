const TechSummary = {
    props: {
        title: String,
        projects: Array,
        tree: Object,
        mode: {
            type: String,
            default: 'direct' // 'direct' or 'recursive'
        }
    },
    emits: ['clear'],
    computed: {
        totalCost() {
            if (this.mode === 'recursive') {
                return this.tree.getTotalMissingScience(this.projects.map(p => p.dataName));
            }
            return this.projects.reduce((sum, p) => sum + (p.researchCost || 0), 0);
        },
        categoryTotals() {
            const categories = {};
            
            if (this.mode === 'recursive') {
                const allUnknowns = new Set();
                this.projects.forEach(tech => {
                    if (!tech.known) {
                        allUnknowns.add(tech.dataName);
                    }
                    this.tree.getUnknownRequirements(tech.dataName).forEach(req => allUnknowns.add(req));
                });

                allUnknowns.forEach(dataName => {
                    const tech = this.tree.get(dataName);
                    const category = tech.techCategory || 'Other';
                    if (!categories[category]) {
                        categories[category] = 0;
                    }
                    categories[category] += (tech.researchCost || 0);
                });
            } else {
                this.projects.forEach(tech => {
                    const category = tech.techCategory || 'Other';
                    if (!categories[category]) {
                        categories[category] = 0;
                    }
                    categories[category] += (tech.researchCost || 0);
                });
            }

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
    }
};
