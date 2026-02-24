async function selectFile() {
    return new Promise((resolve, reject) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = () => resolve(input.files[0]);
        input.click();
    });
}

function unzip(input) {
    const compressed = new Uint8Array(input);
    const rawData = pako.inflate(compressed);
    return new TextDecoder().decode(rawData);
}

function loadComponent(name, logic) {
    return Vue.defineAsyncComponent(async () => {
        const response = await fetch(`components/${name}.html`);
        const template = await response.text();
        return { ...logic, template };
    });
}

const app = Vue.createApp({
    data() {
        return {
            // Data
            effects: new Effects(),
            modules: new Modules(),
            orgs: new Orgs(),
            tree: new Tree(),
            // Filters
            loading: true,
            opened: [],
            search: '',
            pinned: [],
            description: false,
            show_effects: true,
            unknown_requirements: true,
            show_cp: false,
        };
    },

    async created() {
        try {
            await Promise.all([
                this.effects.load(),
                this.modules.load(),
                this.orgs.load(),
                this.tree.load(),
            ]);
            this.loading = false;
            this.loadPinned();
        } catch (err) {
            console.error(err);
        }
    },

    computed: {
        technologies() {
            if (this.search.length < 3) {
                return Object.values(this.tree.data);
            }
            return Object.values(this.tree.data).filter(x => typeof x.displayName === 'string' && x.displayName.toLowerCase().includes(this.search.toLowerCase()));
        },
        cpTechnologies() {
            return this.technologies
                .map(tech => ({ tech, cpStats: this.getCPStats(tech) }))
                .filter(x => x.cpStats !== null)
                .sort((a, b) => (a.cpStats.totalCost / a.cpStats.cp) - (b.cpStats.totalCost / b.cpStats.cp));
        },
    },

    methods: {
        capitalize(value) {
            if (typeof value !== 'string' || value.length < 1) {
                return value;
            }
            return value.charAt(0).toUpperCase() + value.slice(1);
        },
        loadPinned() {
            const data = localStorage.getItem('pinned');
            if (data) {
                this.pinned = JSON.parse(data);
            }
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
                    return {
                        cp,
                        totalCost,
                        standaloneCost
                    };
                }
            }
            return null;
        },
        async loadSave() {
            try {
                // Read file
                const file = await selectFile();
                const contents = await file.arrayBuffer();
                const string = unzip(contents);

                // Parse data
                // NB: the save may contains the symbol "Infinity" which is not a valid JSON value.
                // Since we don't care about the data where this happens, we monkey-replace the value by a valid integer.
                const data = JSON.parse(string.replaceAll('Infinity', 1));
                const playerFactionId = data.gamestates['PavonisInteractive.TerraInvicta.TIPlayerState'].find((state) => !state.Value.isAI).Key.value;
                const knownTechnologgies = data.gamestates['PavonisInteractive.TerraInvicta.TIGlobalResearchState'][0].Value.finishedTechsNames;
                const knownProjects = data.gamestates['PavonisInteractive.TerraInvicta.TIFactionState']
                    .find((state) => state.Value.player.value === playerFactionId).Value.finishedProjectNames;

                // Update tech tree
                // NB: We only add completed techs/projects here, we don't reset those which were known before
                for (const dataName of [...knownTechnologgies, ...knownProjects]) {
                    this.tree.get(dataName).known = true;
                }
            } catch (err) {
                console.error(err);
            }
        },
        jumpToTech(dataName) {
            const tech = this.tree.get(dataName);
            const role = tech.role;
            if (role) {
                if (!this.opened.includes(role)) {
                    this.opened.push(role);
                }
                this.search = ''; // Clear search to ensure it's visible
                Vue.nextTick(() => {
                    const el = document.getElementById(`tech-${dataName}`);
                    if (el) {
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        el.classList.add('highlight');
                        setTimeout(() => el.classList.remove('highlight'), 2000);
                    }
                });
            }
        },
        open(url) {
            window.open(url, '_blank').focus();
        },
        pin(dataName) {
            this.pinned.push(dataName);
            this.savePinned();
        },
        savePinned() {
            const data = JSON.stringify(this.pinned);
            localStorage.setItem('pinned', data);
        },
        toggle(role) {
            if (this.opened.includes(role)) {
                const idx = this.opened.indexOf(role);
                this.opened.splice(idx, 1);
            } else {
                this.opened.push(role);
            }
        },
        toggleKnown(dataName) {
            const tech = this.tree.get(dataName);
            tech.known = !tech.known;
            if (tech.known) {
                this.tree.getAllRequirements(dataName).forEach(reqName => {
                    this.tree.get(reqName).known = true;
                });
            }
        },
        clearKnown() {
            Object.values(this.tree.data).forEach(tech => {
                tech.known = false;
            });
        },
        clearPinned() {
            this.pinned = [];
            this.savePinned();
        },
        unpin(dataName) {
            this.pinned = this.pinned.filter((x) => x !== dataName);
            this.savePinned();
        },
    }
});

app.component('tech-card', loadComponent('tech-card', TechCard));
app.component('tech-roles', loadComponent('tech-roles', TechRoles));
app.component('tech-pinned', loadComponent('tech-pinned', TechPinned));
app.component('tech-summary', loadComponent('tech-summary', TechSummary));
app.component('tech-known', loadComponent('tech-known', TechKnown));

app.mount('#app');
