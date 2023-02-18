const auth = require('./auth.json')
const discord = require('discord.js')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
mongoose.connect(auth.mongoURI, { useNewUrlParser: true })


var slashCommands = require('./commandHandlers/slashCommands.js')
var buttonInteractions = require('./commandHandlers/buttonInteractions.js')
var autoComplete = require('./commandHandlers/autoComplete.js')

var client = new discord.Client({ intents: [discord.Intents.FLAGS.GUILDS] })
client.login(auth.token)
client.once('ready', () => {
    console.log('Ready!')
})


client.on('interactionCreate', async (interaction) => {
    if (!interaction.inGuild()) return
    console.log(interaction.type)
    switch (interaction.type) { 
        case 'APPLICATION_COMMAND':
            await slashCommands(interaction)
            break
        case 'MESSAGE_COMPONENT':
            switch (interaction.componentType) { 
                case 'BUTTON':
                    await buttonInteractions(interaction)
                    break
            }
            
            break
        case 'APPLICATION_COMMAND_AUTOCOMPLETE':
            await autoComplete(interaction)
            break
    }

})
