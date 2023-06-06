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
    
    var files = fs.readdirSync(__dirname + '/../commands/buttonInteractions/', { withFileTypes: true }).filter((file) => file.isFile()).map((file) => file.name)
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        var command = require(__dirname + '/../commands/buttonInteractions/' + file)
        commandFunctions.set(file.split('.')[0], command)
    }
    console.log(commandFunctions)
}
/**
 * @param {discordJSTypes.ButtonInteraction} interaction
 * @returns
 */
async function commands(interaction) {
    await interaction.reply({ ephemeral: true, content: 'working on it..' }) 
    var commandName = interaction.customId.split('_')[0]
    await commandFunctions.get(commandName)(interaction)
}

module.exports = commands
