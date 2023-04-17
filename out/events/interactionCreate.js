"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    name: discord_js_1.Events.InteractionCreate,
    async execute(interaction) {
        let client = interaction.client;
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No execute command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);
            }
        }
        else if (interaction.isAutocomplete()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No autocomplete command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.autocomplete(interaction);
            }
            catch (error) {
                console.error(`Error autocompleting ${interaction.commandName}`);
                console.error(error);
            }
        }
    },
};
