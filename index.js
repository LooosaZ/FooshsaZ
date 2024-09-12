const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { token, clientId, guildId, ROLE_ID } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const commandClaims = {};

const allowedCommands = ['!call', '!team', '!record', '!lobby', '!map'];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`FooshsaZ is ready to be used!`)
});

const commands = [
    {
        name: 'loosaz',
        description: 'gives info about me :3'
    },
    {
        name: 'claim',
        description: 'Claim something',
        options: [
            {
                name: 'command',
                description: 'the name of the command you want to claim.',
                type: 3, // STRING type
                required: true
            }
        ]
    },
    {
        name: 'remove',
        description: 'Remove a claimed command',
        options: [
            {
                name: 'command',
                description: 'The name of the command to remove.',
                type: 3, // STRING type
                required: true
            }
        ]
    },
    {
        name: 'list',
        description: 'Show all claimed commands'
    }

];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'loosaz') {
        await interaction.reply(`why are u using this command, anyways, enjoy the bot and support me if you can!
         \n check me out here: [loosaz.com](https://loosaz.com/en/)`);

    } else if (commandName === 'claim') {
        const item = interaction.options.getString('command');
        const roleMention = `<@&${ROLE_ID}>`;

        if (!allowedCommands.includes(item)) {
            return await interaction.reply({
                content: `The command **${item}** is not on the allowed commands list and cannot be claimed.`,
                ephemeral: true
            });
        }

        if (commandClaims[item]) {
            return await interaction.reply({
                content: `The **${item}** command has already been claimed by ${commandClaims[item].user}.`,
                ephemeral: true
            });
        }

        commandClaims[item] = {
            user: interaction.user.tag,
            userId: interaction.user.id
        };

        await interaction.reply({
            content: `${roleMention} | ${interaction.user} claimed the **${item}** command!`,
            allowedMentions: { roles: [ROLE_ID], users: [interaction.user.id] }
        });

    } else if (commandName === 'remove') {
        const item = interaction.options.getString('command');
        const roleMention = `<@&${ROLE_ID}>`;

        // Check if the command has been claimed
        if (!commandClaims[item]) {
            return await interaction.reply({
                content: `The **${item}** command has not been claimed yet.`,
                ephemeral: true
            });
        }

        if (commandClaims[item].userId !== interaction.user.id) {
            return await interaction.reply({
                content: `You cannot remove the claim for **${item}** because it was claimed by someone else.`,
                ephemeral: true
            });
        }

        delete commandClaims[item];

        await interaction.reply({
            content: `${roleMention} | ${interaction.user} removed the claim on **${item}**.`,
        });
    } else if (commandName === 'list') {
        // List all allowed commands with their claim status
        const claimList = allowedCommands.map(command => {
            if (commandClaims[command]) {
                return `**${command}** - claimed by ${commandClaims[command].user}`;
            } else {
                return `**${command}** - unclaimed`;
            }
        }).join('\n');

        await interaction.reply(`Here are the allowed commands and their claim status:\n\n${claimList}`);
    }
});

client.login(token);
