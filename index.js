const { Client, GatewayIntentBits, REST, Routes, EmbedBuilder } = require('discord.js');
const { token, clientId, guildId, ROLE_ID } = require('./config.json');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const fs = require('fs');

// In-memory storage for command claims and BRB states
const commandClaims = {};
const brbUsers = new Set();
let listMessage = null;

const allowedCommands = ['!call', '!team', '!record', '!lobby', '!map'];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`FooshsaZ is ready to be used!`);
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
    },
    {
        name: 'brb',
        description: 'Set yourself as "BRB" for your claimed command.'
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

        updateListEmbed(interaction);

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
        brbUsers.delete(interaction.user.id);

        await interaction.reply({
            content: `${roleMention} | ${interaction.user} removed the claim on **${item}**.`,
        });

        updateListEmbed(interaction);

    } else if (commandName === 'list') {
        const embed = createListEmbed();

        if (!LIST_MESSAGE_ID) {
            const message = await interaction.reply({ embeds: [embed], fetchReply: true });
            listMessage = message.id;

            function updateConfig(newMessageId) {
                const configPath = './config.json';
                const config = require(configPath);

                config.LIST_MESSAGE_ID = newMessageId;

                fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
            }
        } else {
            updateListEmbed();
        }
    }

    else if (commandName === 'brb') {
        const userId = interaction.user.id;
        const userClaim = Object.values(commandClaims).find(claim => claim.userId === userId);

        if (!userClaim) {
            return await interaction.reply({
                content: `You don't have any claimed commands to set as BRB.`,
                ephemeral: true
            });
        }

        if (brbUsers.has(userId)) {
            brbUsers.delete(userId);
            await interaction.reply({
                content: `You are no longer in BRB mode for your claimed command.`,
                ephemeral: true
            });
        } else {
            brbUsers.add(userId);
            await interaction.reply({
                content: `You are now in BRB mode for your claimed command.`,
                ephemeral: true
            });
        }
        updateListEmbed(interaction);
    }
});

function createListEmbed() {
    const embed = new EmbedBuilder()
        .setTitle('Command Claim Status')
        .setDescription('Here are the allowed commands and their claim status:')
        .setColor(0xFF7945);

    allowedCommands.forEach(command => {
        if (commandClaims[command]) {
            const claimedBy = commandClaims[command].user;
            const brbStatus = brbUsers.has(commandClaims[command].userId) ? '(BRB)' : '';
            embed.addFields({ name: command, value: `Claimed by ${claimedBy} ${brbStatus}`, inline: false });
        } else {
            embed.addFields({ name: command, value: 'Unclaimed', inline: false });
        }
    });

    return embed;
}

const { LIST_CHANNEL_ID, LIST_MESSAGE_ID } = require('./config.json');

async function updateListEmbed() {
    try {
        const channel = await client.channels.fetch(LIST_CHANNEL_ID);
        if (!channel) {
            console.error('Failed to find the channel with ID:', LIST_CHANNEL_ID);
            return;
        }

        const message = await channel.messages.fetch(LIST_MESSAGE_ID);
        if (message) {
            const updatedEmbed = createListEmbed();
            await message.edit({ embeds: [updatedEmbed] });
        }
    } catch (error) {
        console.error('Failed to fetch or update the list message:', error);
    }
}

client.login(token);
