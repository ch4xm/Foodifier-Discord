const BASE_URL = "https://nutrition.sa.ucsc.edu/longmenu.aspx?sName=UC+Santa+Cruz+Dining&locationNum=";
const LOCATION_URLS = {
	'Cowell/Stevenson': "05&locationName=Cowell%2fStevenson+Dining+Hall&naFlag=1",
	'Crown/Merrill': "20&locationName=Crown%2fMerrill+Dining+Hall&naFlag=1",
	'Nine/Ten': "40&locationName=College+Nine%2fJohn+R.+Lewis+Dining+Hall&naFlag=1",
	'Porter/Kresge': "25&locationName=Porter%2fKresge+Dining+Hall&naFlag=1",
	'Oakes Cafe': '23&locationName=Oakes+Cafe&naFlag=1',
    'Global Village Cafe': '46&locationName=Global+Village+Cafe&naFlag=1',
    'UCen Coffee Bar': '45&locationName=UCen+Coffee+Bar&naFlag=1',
    'Stevenson Coffee House': '26&locationName=Stevenson+Coffee+House&naFlag=1',
    'Porter Market': '50&locationName=Porter+Market&naFlag=1',
    'Perk Coffee Bars': '22&locationName=Perk+Coffee+Bars&naFlag=1',
};

const MEAL_URL = "&WeeksMenus=UCSC+-+This+Week%27s+Menus&mealName=";

const MEALS = ['Breakfast', 'Lunch', 'Dinner', 'Late Night'];
//Auto meal selects meal based on current time
const DIVIDERS = ['-- Soups --', '-- Breakfast --', '-- Grill --', '-- Entrees --', '-- Pizza --', '-- Clean Plate --', '-- DH Baked --', '-- Bakery --', '-- Open Bars --', '-- All Day --'];
// strings corresponding to the dividers, will be used to determine menu validity

// (eg if cereal is first divider found, then the dh is not open for that meal)
const EMOJIS = { 'veggie': '🥦', 'vegan': '🌱', 'halal': '🍖', 'eggs': '🥚', 'beef': '🐮', 'milk': '🥛', 'fish': '🐟', 'alcohol': '🍷', 'gluten': '🍞', 'soy': '🫘', 'treenut': '🥥', 'sesame': '', 'pork': '🐷', 'shellfish': '🦐', 'nuts': '🥜' };

const { SlashCommandBuilder, Embed, EmbedBuilder } = require('discord.js');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');
const axios = require('axios');

async function get_site_with_cookie(url, location_url) {
	let location_cookie = location_url.slice(0, 2);
    const cookies = {
        'WebInaCartLocation': location_cookie,
        'WebInaCartDates': '',
        'WebInaCartMeals': '',
        'WebInaCartQtys': '',
        'WebInaCartRecipes': ''
      };
    
      return axios.get(url, { 
        headers: {
          'Cookie': Object.entries(cookies).map(c => c.join('=')).join('; ')
        }
    }).then(response => {
        return response.data;
      }).catch(error => {
        console.error(error);
        return error;
      });

}



async function get_meal(college, meal) {
	let food_items = {};
	let date_string = "";

	const today = new Date();
	date = `&dtdate=${today.getMonth() + 1}%2F${today.getDate()}%2F${today.getFullYear().toString().substr(-2)}`;

	let location_url = LOCATION_URLS[college];
	//console.log(location_url)

	let full_url = BASE_URL + location_url + MEAL_URL + meal + date;
	let response = await get_site_with_cookie(full_url, location_url);
  	food_items = {};
	const dom = new JSDOM(response)
  	dom.window.document.querySelectorAll('tr').forEach((tr) => {
		if (tr.querySelector('div.longmenucolmenucat')) {
			// If current tr has a divider
			//console.log(tr.querySelector('div.longmenucolmenucat'));
			food_items[tr.querySelector('div.longmenucolmenucat').textContent] = null;
			return; // go to next tr
			}
			if (tr.querySelector('div.longmenucoldispname')) {
			// If current tr has a food item
			let food = tr.querySelector('div.longmenucoldispname').textContent;
			food_items[food] = []; // add food to dictionary
			for (let img of tr.querySelectorAll('img')) {
				// Iterate through dietary restrictions and get img src names
				let diets = img.getAttribute('src').split('/')[1].split('.')[0];
				food_items[food].push(diets);
			}
		}
  })
  if (Object.keys(food_items)[0] == '-- Cereal --') {
	return null;
  }  
  return food_items;
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName("menu")
		.setDescription("Get the menu of the specified day at a dining hall")
		.addStringOption(option =>
			option.setName("dining_hall")
				.setDescription("Dining hall you want to eat at")
				.addChoices(...Object.keys(LOCATION_URLS).map(name => ({name, value: name})))
				.setRequired(true))
		.addStringOption(option =>
			option.setName("meal")
				.setDescription("What meal you want to eat")
				.addChoices(
					{ name: "Breakfast", value: "Breakfast" },
					{ name: "Lunch", value: "Lunch" },
					{ name: "Dinner", value: "Dinner" },
					{ name: "Late Night", value: "Late Night" },
				)
				.setRequired(true)),

	async execute(interaction) {

		let foods = fs.readFileSync('menu_items.txt').toString().trim().split("\n"); 
		//console.log(foods);

		const hall = interaction.options.getString("dining_hall");
		const meal = interaction.options.getString("meal");

		//console.log(get_meal(hall, meal));
		let msg = '';
		let food_items = await get_meal(hall, meal);
		if (food_items == null) {
			const embed = new EmbedBuilder()
			.setColor(0xEE4B2B)
			.setDescription('**Specified meal is not available!**');
			await interaction.reply({ embeds: [embed] });
			return;
		}
		for (let food of Object.keys(food_items)) {
			if (food.includes('-- ') && !DIVIDERS.includes(food)) {
				break;
			}
			
			if (!DIVIDERS.includes(food)) {
				msg += food; 
				if (!foods.includes(food)) {
					console.log(food);
					foods.push(food);
				};	
				for (let diet_restriction of food_items[food]) {
					msg += EMOJIS[diet_restriction] + '  ';
				}
				msg += '\n';
			} else {
				msg += food.replace('-- ', '**')
				.replace(' --', '**') + '\n';
			}
		}
		const embed = new EmbedBuilder()
			.setColor(0x50C878)
			.setDescription(msg);
		await interaction.reply({ embeds: [embed] });

		const foods_str = foods.join('\n')
		fs.writeFile('menu_items.txt', foods.join('\n').trim() + '\n', function(err) {
			if (err) throw err;
			foods = [];
			//console.log(`Appended foods: \n${foods.join(', ')}\nto the text file.`);
		});
		console.log(`User ${interaction.user.tag} used command ${interaction}`);
	},

	
	
};
