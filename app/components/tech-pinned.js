const TechPinned = {
    props: {
        pinned: Array,
        tree: Object,
        effects: Object,
        modules: Object,
        orgs: Object,
        description: Boolean,
        showEffects: Boolean,
        showModules: Boolean,
    },
    emits: [
        'update:description', 
        'update:showEffects',
        'update:showModules',
        'toggle-known', 
        'unpin', 
        'jump-to-tech',
        'clear-pinned',
    ],
    computed: {
        pinnedTechnologies() {
            return this.pinned
                .map(x => this.tree.get(x))
                .sort((a, b) => this.tree.getMissingScience(a.dataName) - this.tree.getMissingScience(b.dataName));
        },
    },
};
