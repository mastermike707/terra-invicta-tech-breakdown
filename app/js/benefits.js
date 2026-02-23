class Benefits {
    constructor() {
        this.data = {};
    }

    get(dataName) {
        return this.data[dataName] || null;
    }

    async load() {
        try {
            const response = await fetch('/js/tech_benefits.json');
            if (response.ok) {
                const json = await response.json();
                this.data = { ...this.data, ...json };
            }
        } catch (e) {
            console.log("No tech_benefits.json found");
        }
    }
}
