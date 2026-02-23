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
            return this.tree.getTotalMissingScience(this.pinned);
        },
        categoryTotals() {
            const categories = {};
            this.pinnedTechnologies.forEach(tech => {
                const category = tech.techCategory || 'Other';
                if (!categories[category]) {
                    categories[category] = new Set();
                }
                categories[category].add(tech.dataName);
            });

            return Object.entries(categories).map(([name, techNames]) => {
                return {
                    name: this.formatCategoryName(name),
                    cost: this.tree.getTotalMissingScience(Array.from(techNames))
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
