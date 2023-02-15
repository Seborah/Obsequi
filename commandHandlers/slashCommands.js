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
        .readdirSync(__dirname + '/../commands/slashCommands/', { withFileTypes: true })
        .filter((file) => file.isFile())
        .map((file) => file.name)
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        var command = require(__dirname + '/../commands/slashCommands/' + file)
        commandFunctions.set(file.split('.')[0], command)
    }
    console.log(commandFunctions)
}
/**
 * @param {discordJSTypes.CommandInteraction} interaction
 * @returns
 */
async function commands(interaction) {
    await interaction.reply({ content: 'Working on it...' })
    var { commandName } = interaction
    var subCommandGroup = null
    if (interaction.options.getSubcommandGroup(false)) {
        subCommandGroup = interaction.options.getSubcommandGroup()
    }
    var subcommand = null
    if (interaction.options.getSubcommand(false)) {
        subcommand = interaction.options.getSubcommand()
    }
    await commandFunctions.get(commandName)(interaction, subCommandGroup, subcommand)
}

module.exports = commands
