const discordJSTypes = require('discord.js')
var fs = require('fs')
//const discordTypes = require("discord-api-types/v10")
//read files and then import them for functions
/**
 * @type {Map<String, Function>}
 */
var commandFunctions = new Map()

onStart()
function onStart() {
    var files = fs
        .readdirSync(__dirname + '/../commands/autoComplete/', { withFileTypes: true })
        .filter((file) => file.isFile())
        .map((file) => file.name)
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        var command = require(__dirname + '/../commands/autoComplete/' + file)
        commandFunctions.set(file.split('.')[0], command)
    }
    console.log(commandFunctions)
}

/**
 *
 * @param {discordJSTypes.AutocompleteInteraction} interaction
 * @returns
 */
async function commands(interaction) {
    const commandName = interaction.options.getFocused(true).name
    await commandFunctions.get(commandName)(interaction)
}

module.exports = commands
