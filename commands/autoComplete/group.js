const discordJSTypes = require('discord.js')

var Role = require('../../schema/Role.js')
var Server = require('../../schema/Server.js')
var RoleGroup = require('../../schema/RoleGroup.js')

/**
 *
 * @param {discordJSTypes.AutocompleteInteraction} interaction
 */
async function group(interaction) {

        var focusedValue = interaction.options.getFocused()
        var mongoGroups = await RoleGroup.find({ serverID: interaction.guild.id })
        var choices = []
        mongoGroups.forEach((group) => {
            choices.push(group.groupName)
        })
        var filtered = focusedValue.length<1 ? choices : choices.filter((choice) => choice.startsWith(focusedValue))
        interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })))
    
}

module.exports = group
