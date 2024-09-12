# FooshsaZ

### This bot was made for the Foolish Mods for the twitch channel.
# Installation

**WARNING** \
I will not go into every single step since this is very basic, if you don't know how to install it, this is not for you.

Clone this repo and run `npm install discord.js @discordjs/rest discord-api-types`

Go over to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
Once you are there you want to grab a couple of things.
Your bot *token* and *clientId*.

Now, go to Discord and enable Developer mode if you don't have it enabled.
In here you want to right-click the server in where you want to use the bot and get its ID, as well as the role ID for mentions and if needed, a channel ID for the /list command.

now create a config.json file in the root folder of this project.

```
{
  "token": "YOUR_APPLICATION_TOKEN",
  "clientId": "YOUR_APPLICATION_ID",
  "guildId": "YOUR_SERVER_ID",
  "ROLE_ID": "YOUR_MENTION_ROLE_ID",
  "LIST_CHANNEL_ID": "YOUR_LIST_CHANNEL_ID",
  "LIST_MESSAGE_ID": "(can be empty)"
}
```
Now simply run `node index.js`.
