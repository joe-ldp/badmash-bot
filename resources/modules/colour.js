const fs = require('node:fs');

module.exports = {
    genreColour: (genre = 'random') => {
        const colours = require.main.require('./resources/objects/colours.json');
        if (genre.toLowerCase() == 'random') {
            let colourVals = Object.keys(colours);
            return colours[colourVals[Math.floor(Math.random() * colourVals.length)]];
        } else {
            return colours[genre.toLowerCase()] ?? 'b9b9b9'; // or call module.exports.genreColour() for a random genre colour
        }
    },

    updateColours: async (client) => {
        let foundGenres = [],
            colours = {};

		await client.sheet.loadCells();

        for (let i = 3; i < client.sheet.rowCount; i++) {
            let cell = client.sheet.getCellByA1(`F${i}`);
            if (cell.value) {
                let genre = client.sheet.getCellByA1(`E${i}`).value.toLowerCase();
                if (!foundGenres.includes(genre)) {
                    foundGenres.push(genre);
                    // effectiveFormat is used because the MCatalog's colours are based on conditional formatting
                    let colour = processColour(cell.effectiveFormat.backgroundColor);
                    colours[genre] = colour;
                }
            }
        }

        // Update currently loaded colours object (without this, bot would need rebooting again)
        client.colours = colours;

        // Save as json too
        const coloursJson = './resources/objects/colours.json';
        let data = JSON.stringify(colours);
        fs.writeFile(coloursJson, data, (err) => {
            if (err) throw err;
            console.log(`Colours updated and saved to ${coloursJson}`);
        });
    }
}

/*
* Processes a colour object with optional attributes {red, green, blue} 0-1
* @param {Object} colourObj
* @returns {String} Hex code for the colour (no prepended #)
*/
processColour = (colourObj) => {
    let r = Math.round(255 * (colourObj.red ?? 0)),
        g = Math.round(255 * (colourObj.green ?? 0)),
        b = Math.round(255 * (colourObj.blue ?? 0));
    return `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}