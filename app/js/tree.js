// List of available translation files without ".en" suffix
const TRANSLATION_FILES = [
    'TIBatteryTemplate',
    'TIPlasmaWeaponTemplate',
    'TIDriveTemplate',
    'TIPowerPlantTemplate',
    'TIEffectTemplate',
    'TIProjectTemplate',
    'TIGunTemplate',
    'TIRadiatorTemplate',
    'TIHabModuleTemplate',
    'TIShipArmorTemplate',
    'TIHeatSinkTemplate',
    'TIShipCommandTemplate',
    'TILaserWeaponTemplate',
    'TIShipHullTemplate',
    'TIMagneticGunTemplate',
    'TITechTemplate',
    'TIMissileTemplate',
    'TIUtilityModuleTemplate',
    'TIParticleWeaponTemplate',
    'TIOrgTemplate',
];

class Tree {
    constructor() {
        this.data = {};
    }

    addTechnology(source, type) {
        this.data[source.dataName] = source;
        this.data[source.dataName].type = type;
        this.data[source.dataName].known = false;
        this.data[source.dataName].role = (type === 'project') ? source.AI_projectRole : source.AI_techRole;

        // Clean up empty values in arrays
        this.data[source.dataName].effects = source.effects ? source.effects.filter(x => typeof x === 'string' && x.length > 0) : [];
        this.data[source.dataName].prereqs = source.prereqs ? source.prereqs.filter(x => typeof x === 'string' && x.length > 0) : [];
        this.data[source.dataName].resourcesGranted = source.resourcesGranted
            ? source.resourcesGranted.filter(x => typeof x.resource === 'string' && x.resource.length > 0)
            : [];
    }

    addTranslation(type, key, value) {
        if (key in this.data) {
            this.data[key][type] = value;
        }
        if (`Project_${key}` in this.data) {
            this.data[`Project_${key}`][type] = value;
        }
    }

    get(dataName) {
        if (this.data[dataName] == null) {
            throw new Error(`Unknown technology '${dataName}'.`);
        }
        return this.data[dataName];
    }

    /**
     * Return the list of requirements (dataNames) to unlock given technology (roughly ordered).
     */
    getAllRequirements(dataName) {
        const tech = this.get(dataName);
        // List all requirements
        const requirements = tech.prereqs.reduce((list, prereqName) => {
            list.push(prereqName);
            return list.concat(this.getAllRequirements(prereqName));
        }, []);
        // Deduplicate and sort
        return Array.from(new Set(requirements)).sort((a, b) => this.getLevel(a) - this.getLevel(b));
    }

    /**
     * Return the list of requirements (dataNames) to unlock given technology which are already known.
     */
    getKnownRequirements(dataName) {
        return this.getAllRequirements(dataName)
            .filter((prereqName) => this.getStatus(prereqName) === "known");
    }

    /**
     * Return the list of requirements (dataNames) to unlock given technology which are already known.
     */
    getUnknownRequirements(dataName) {
        return this.getAllRequirements(dataName)
            .filter((prereqName) => this.getStatus(prereqName) !== "known");
    }

    /**
     * Return true if any requirement of the given technhology is already known.
     */
    hasKnownRequirements(dataName) {
        return this.get(dataName).prereqs.some((prereqName) => {
            if (this.getStatus(prereqName) === "known") {
                return true;
            }
            return this.hasKnownRequirements(prereqName);
        });
    }

    /**
     * Return true if any requirement of the given technhology is NOT known.
     */
    hasUnknownRequirements(dataName) {
        return this.get(dataName).prereqs.some((prereqName) => {
            if (this.getStatus(prereqName) !== "known") {
                return true;
            }
            return this.hasUnknownRequirements(prereqName);
        });
    }

    /**
     * Return the status of the given technology:
     * - "known" (already researched),
     * - "available" (can be researched now),
     * - "locked" (you need to research all requirements first).
     */
    getStatus(dataName) {
        const tech = this.get(dataName);
        if (tech.known) {
            return 'known';
        }
        const prereqsKnown = tech.prereqs.every((name) => this.get(name).known);
        return prereqsKnown ? 'available' : 'locked';
    }

    /**
     * Return the tech. level of the given technology, starting at 1 and increasing by one for each requirement deps.
     */
    getLevel(dataName) {
        const tech = this.get(dataName);
        return 1 + tech.prereqs.reduce((max, prereqName) => Math.max(max, this.getLevel(prereqName)), 0);
    }

    /**
     * Return the science points required to unlock given tech and all unknown prerequisites.
     */
    getMissingScience(dataName) {
        const tech = this.get(dataName);
        if (tech.known) {
            return 0;
        }

        const prereqsCost = tech.prereqs.reduce((total, prereqName) => total + this.getMissingScience(prereqName), 0);
        return prereqsCost + tech.researchCost ;
    }

    /**
     * Return the science points required to unlock given tech and all prerequisites (including those already known/unlocked).
     */
    getTotalScience(dataName) {
        const tech = this.get(dataName);
        const prereqsCost = tech.prereqs.reduce((total, prereqName) => total + this.getTotalScience(prereqName), 0);
        return prereqsCost + tech.researchCost ;
    }
    /**
     * Return the science points required to unlock given list of techs and all their unknown prerequisites (deduplicated).
     */
    getTotalMissingScience(dataNames) {
        const allUnknowns = new Set();
        dataNames.forEach(dataName => {
            if (!this.get(dataName).known) {
                allUnknowns.add(dataName);
            }
            this.getUnknownRequirements(dataName).forEach(req => allUnknowns.add(req));
        });
        
        let total = 0;
        allUnknowns.forEach(dataName => {
            total += this.get(dataName).researchCost || 0;
        });
        return total;
    }

    async load() {
        // Load templates
        await Promise.all([
            (await Parser.loadTemplateFile('TIProjectTemplate')).forEach((value) => this.addTechnology(value, 'project')),
            (await Parser.loadTemplateFile('TITechTemplate')).forEach((value) => this.addTechnology(value, 'technology')),
        ]);

        // Load translations
        const transaltions = await Promise.all(
            TRANSLATION_FILES.map(Parser.loadLocalizationFile)
        );
        transaltions.flat().forEach(({ type, key, value }) => this.addTranslation(type, key, value));
    }
}
