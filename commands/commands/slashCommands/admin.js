const discordJSTypes = require('discord.js')

var Role = require('../../schema/Role.js')
var Server = require('../../schema/Server.js')
var RoleGroup = require('../../schema/RoleGroup.js')

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
        .readdirSync(__dirname + '/adminBits/', { withFileTypes: true })
        .filter((file) => file.isFile())
        .map((file) => file.name)
    for (var i = 0; i < files.length; i++) {
        var file = files[i]
        var command = require(__dirname + '/adminBits/' + file)
        commandFunctions.set(file.split('.')[0], command)
    }
    console.log(commandFunctions)
}

/**
 *
 * @param {discordJSTypes.CommandInteraction} interaction
 * @param {String} subCommandGroup
 * @param {String} subCommand
 */
async function admin(interaction, subCommandGroup, subCommand) {
    await interaction.reply({ content: 'Working on it...' })
    
    await commandFunctions.get(subCommandGroup ? subCommandGroup : subCommand)(interaction, subCommand)
}

module.exports = admin
