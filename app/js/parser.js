class Parser {
    static translations = {};
    static templates = {};
    static gamePath = "/game-data";

    static async loadLocalizationFile(filename) {
        // Check cache first
        if (filename in Parser.translations) {
            return Parser.translations[filename];
        }

        // Fetch data
        const response = await fetch(`${Parser.gamePath}/Localization/en/${filename}.en`);
        const data = await response.text();

        // Parse data line by line
        Parser.translations[filename] = data.split('\n')
            .map((line) => line.match(/^[^.=]+\.([^.=]+)\.([^.=]+)=([^\/]+)(\/\/.+)*$/ims))
            .filter((match) => match != null)
            .map(([_, type, key, value]) => ({ type, key, value: value.trim() }));

        return Parser.translations[filename]
    }

    static async loadTemplateFile(filename) {
        if (filename in Parser.templates) {
            return Parser.templates[filename];
        }

        const response = await fetch(`${Parser.gamePath}/Templates/${filename}.json`);
        try {
            Parser.templates[filename] = await response.json();
        } catch (err) {
            throw Error(`failed to parse template file ${filename}.json: ${err}`)
        }
        return Parser.templates[filename];
    }
}
