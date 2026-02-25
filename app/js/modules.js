class Modules {
    constructor() {
        this.data = {};
        this.byProject = {};
    }

    addModules(data, wikiLink) {
        for (const source of data) {
            this.addModule(source, wikiLink);
        }
    }
    addModule(source, wikiLink) {
        this.data[source.dataName] = source;
        this.data[source.dataName].wiki = wikiLink;
        this.indexModule(source);
    }
    indexModule(source) {
        if (typeof source.requiredProjectName !== 'string' || source.requiredProjectName.length === 0) {
            return; // no requirement, so no index
        }
        if (!Array.isArray(this.byProject[source.requiredProjectName])) {
            this.byProject[source.requiredProjectName] = [];
        }
        this.byProject[source.requiredProjectName].push(source);
    }

    addTranslation(dataName, type, value) {
        if (dataName in this.data) {
            this.data[dataName][type] = value;
        }
    }

    get(dataName) {
        if (this.data[dataName] == null) {
            throw new Error(`Unknown module '${dataName}'.`);
        }
        return this.data[dataName];
    }

    getStats(module) {
        const ignoreKeys = new Set([
            'dataName', 'friendlyName', 'grouping', 'weightedBuildMaterials', 
            'iconResource', 'requiredProjectName', 'disable', 'wiki', 
            'displayName', 'description', 'summary', 'effectName', 
            'modelName', 'materialsDescription', 'soundCue', 'particleEffect',
            'particles', 'resourcesGranted', 'unlocks', 'prereqs', 'crew'
        ]);

        const stats = [];
        for (const [key, value] of Object.entries(module)) {
            if (ignoreKeys.has(key)) continue;
            if (typeof value === 'object' && value !== null) continue;
            
            let label = key
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/_/g, ' ')
                .trim();
            label = label.charAt(0).toUpperCase() + label.slice(1);

            stats.push({ label, value });
        }
        return stats;
    }

    getProjectModules(requiredProjectName) {
        const modules = this.byProject[requiredProjectName] || [];
        
        const seen = new Set();
        return modules.filter(module => {
            const name = module.displayName || module.friendlyName;
            if (!name) return true;
            
            const baseName = name.replace(/ x\d+$/i, '').trim();
            if (seen.has(baseName)) {
                return false;
            }
            seen.add(baseName);
            return true;
        }).map(module => {
            const name = module.displayName || module.friendlyName;
            if (name && / x\d+$/i.test(name)) {
                return {
                    ...module,
                    displayName: module.displayName ? module.displayName.replace(/ x\d+$/i, '').trim() : undefined,
                    friendlyName: module.friendlyName ? module.friendlyName.replace(/ x\d+$/i, '').trim() : undefined
                };
            }
            return module;
        });
    }

    async load() {
        // Load templates
        await Promise.all([
            Parser.loadTemplateFile('TIBatteryTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Battery')),
            Parser.loadTemplateFile('TIDriveTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Drive')),
            Parser.loadTemplateFile('TIGunTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Guns')),
            Parser.loadTemplateFile('TIHabModuleTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Habs')),
            Parser.loadTemplateFile('TIHeatSinkTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Heat_Sink')),
            Parser.loadTemplateFile('TILaserWeaponTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Lasers')),
            Parser.loadTemplateFile('TIMagneticGunTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Magnetic_Weapons')),
            Parser.loadTemplateFile('TIMissileTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Missiles')),
            Parser.loadTemplateFile('TIParticleWeaponTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Particle_Weapons')),
            Parser.loadTemplateFile('TIPlasmaWeaponTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Plasma_Weapons')),
            Parser.loadTemplateFile('TIPowerPlantTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Power_Plant')),
            Parser.loadTemplateFile('TIRadiatorTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Radiator')),
            Parser.loadTemplateFile('TIShipArmorTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Armor')),
            Parser.loadTemplateFile('TIShipHullTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Hull')),
            Parser.loadTemplateFile('TIUtilityModuleTemplate').then((data) => this.addModules(data, 'https://hoodedhorse.com/wiki/Terra_Invicta/Spaceships#Utility_Modules')),
        ]);

        // Load translations
        await Promise.all([
            Parser.loadLocalizationFile('TIBatteryTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIDriveTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIGunTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIHabModuleTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIHeatSinkTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TILaserWeaponTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIMagneticGunTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIMissileTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIParticleWeaponTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIPlasmaWeaponTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIPowerPlantTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIRadiatorTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIShipArmorTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIShipHullTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
            Parser.loadLocalizationFile('TIUtilityModuleTemplate').then(({ type, key, value }) => this.addTranslation(key, type, value)),
        ]);
    }
}
