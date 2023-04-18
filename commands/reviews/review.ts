import { ChatInputCommandInteraction, SlashCommandBuilder, EmbedBuilder, User} from 'discord.js';

import { CookieDB } from 'cookie-driver';

import dotenv from 'dotenv';

dotenv.config()

let token: string = process.env.cookiedb_token!;

const cookieDB = new CookieDB(
  "https://cookiedb.com/api/db",
  token
)

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
                    .setMinValue(0)
                    .setMaxValue(10)
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
                    .setDescription('Optional rating to narrow down which review to delete')
                    .setRequired(false)
                ))
        .addSubcommandGroup( group => 
                            group.setName("filter")
                            .setDescription("N/A")
                            .addSubcommand(subcommand =>
                                subcommand
                                    .setName('username')
                                    .setDescription('Get a list of reviews from the specified username')
                                    .addUserOption(option => 
                                        option.setName('user')
                                        .setDescription('The user whose reviews you would like to see')
                                        .setRequired(true)
                                    ))
                            .addSubcommand(subcommand =>
                                subcommand
                                    .setName('food')
                                    .setDescription('Get a list of reviews about the specified food')
                                    .addStringOption((option)=> 
                                        option.setName('food')
                                        .setDescription('Food you would like to see reviews about')
                                        .setRequired(true)
                           )
                )),

        async execute(interaction : ChatInputCommandInteraction){
          if(interaction.options.getSubcommand() === 'create'){
              await cookieDB.insert("reviews",{
                username: interaction.user.username,
                id : interaction.user.id,
                food_item : interaction.options.getString('food'),
                rating : interaction.options.getNumber('rating'),
                review : interaction.options.getString('review'),
                upvotes : 0,
                downvotes : 0,
            })

            const embed = new EmbedBuilder()
			    .setColor(0x50C878)
			    .setDescription('**Review has been added**');
            await interaction.reply({ embeds: [embed] });
            console.log(`User ${interaction.user.tag} used command ${interaction}`);
          }
        else if(interaction.options.getSubcommandGroup() === 'filter'){
          if(interaction.options.getSubcommand() === 'username'){
            let user : User = interaction.options.getUser('user')!;
            let id : string = user.id;

            let reviews : Record<string,string>[] = await cookieDB.select("reviews", `eq($id,'${id.toString()}')`);
            
            let embeds = [];

            for (let i=reviews.length-1;i>=0;i--){
              embeds.push(new EmbedBuilder()
                          .setColor(0x50C878)
                          .setAuthor({name : reviews[i].username})
                          .setTitle(reviews[i].food_item)
                          .setDescription(`**Rating: ${reviews[i].rating}/10\nReview: ${reviews[i].review}**`)
                          );
            }
            await interaction.reply({ embeds : embeds});
          }
          else{ 

            let food_item : string = interaction.options.getString('food')!;
            let reviews : Record<string,string>[] = await cookieDB.select("reviews", `eq($food_item, '${food_item}')`) 

            console.log(food_item);
            console.log(reviews);

            let embeds = [];
            for (let i=reviews.length-1;i>=0;i--){
              console.log(reviews[i])
              embeds.push(new EmbedBuilder()
                          .setColor(0x50C878)
                          .setAuthor({name : reviews[i].username})
                          .setTitle(reviews[i].food_item)
                          .setDescription(`**Rating: ${reviews[i].rating}/10\nReview: ${reviews[i].review}**`)
                          )
            }
            await interaction.reply({ embeds : embeds});

          }

          }
        } 
}
