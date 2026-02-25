const TechKnown = {
    props: {
        tree: Object,
        effects: Object,
        modules: Object,
        orgs: Object,
        description: Boolean,
        showEffects: Boolean,
        showModules: Boolean,
        pinned: Array
    },
    emits: ['toggle-known', 'pin', 'unpin', 'jump-to-tech', 'clear-known'],
    computed: {
        knownTechnologies() {
            return Object.values(this.tree.data)
                .filter(tech => tech.known)
                .sort((a, b) => (a.displayName || a.friendlyName).localeCompare(b.displayName || b.friendlyName));
        },
    },
};
