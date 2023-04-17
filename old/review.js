const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('review')
        .setDescription('Create, remove, or get reviews')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new food review')
                .addStringOption(option =>
                    option.setName('food')
                    .setDescription('The food item to create a new review for')
                    .setRequired(true))
                .addNumberOption(option =>
                    option.setName('rating')
                    .setDescription('Your numerical rating of the food')
                    .setRequired(true))
                .addStringOption(option =>
                    option.setName('review')
                    .setDescription('Textual review of the food')
                    .setRequired(true)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove one of your own food reviews')
                .addStringOption(option =>
                    option.setName('food')
                    .setDescription('The food item to remove your review for')
                    .setRequired(true))
                .addNumberOption(option =>
                    option.setName('rating')
                    .setDescription('Optional rating to narrow down which review to delete (in the case of multiple reviews on the same food)')
                    .setRequired(false)
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Get a list of reviews from the specified user or '))
}