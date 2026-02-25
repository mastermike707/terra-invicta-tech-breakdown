const fsp = require('fs').promises;
const path = require('path');

let gameAssetsPath = "/mnt/d/SteamLibrary/steamapps/common/Terra Invicta/TerraInvicta_Data/StreamingAssets/";


const DST_LOCALIZATION = './app/game/localization/en';
const DST_TEMPLATES = './app/game/templates';

async function main(args) {
    if (args[2]){
        gameAssetsPath = args[2];
    }
    const gameLocalizationPath = path.join(gameAssetsPath, 'Localization/en/');
    const gameTemplatesPath = path.join(gameAssetsPath, 'Templates/');
    console.log(`Updating game assets from ${gameAssetsPath}`);
    await fsp.rm(DST_LOCALIZATION, { recursive: true, force: true });
    await fsp.mkdir(DST_LOCALIZATION, { recursive: true });
    
    await fsp.rm(DST_TEMPLATES, { recursive: true, force: true });
    await fsp.mkdir(DST_TEMPLATES, { recursive: true });
    for (const name of await fsp.readdir(gameLocalizationPath)) {
        const srcPath = path.join(gameLocalizationPath, name);
        const dstPath = path.join(DST_LOCALIZATION, name);
        await fsp.copyFile(srcPath, dstPath,);
        console.log(`File localization/${name} copied.`);
    }
    for (const name of await fsp.readdir(gameTemplatesPath)) {
        const srcPath = path.join(gameTemplatesPath, name);
        const dstPath = path.join(DST_TEMPLATES, name);
        await fsp.copyFile(srcPath, dstPath);
        console.log(`File templates/${name} copied.`);
    }
}

main(process.argv).catch(console.error);
