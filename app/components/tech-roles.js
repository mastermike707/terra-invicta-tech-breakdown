const TechRoles = {
    props: {
        technologies: Array,
        tree: Object,
        effects: Object,
        modules: Object,
        orgs: Object,
        opened: Array,
        description: Boolean,
        showEffects: Boolean,
        pinned: Array
    },
    emits: ['toggle-role', 'toggle-known', 'pin', 'unpin', 'jump-to-tech'],
    computed: {
        rolesList() {
            const roles = this.technologies
                .filter(tech => typeof tech.role === 'string' && tech.role.length > 0)
                .reduce((roles, tech) => roles.add(tech.role), new Set());
            return Array.from(roles).sort();
        }
    },
    methods: {
        techByRole(role) {
            return this.technologies
                .filter(x => x.role === role)
                .sort((a, b) => this.tree.getMissingScience(a.dataName) - this.tree.getMissingScience(b.dataName));
        }
    },
};
