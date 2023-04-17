var fs = require('node:fs');
var path = require('node:path');
var _a = require('discord.js'), Client = _a.Client, GatewayIntentBits = _a.GatewayIntentBits, Collection = _a.Collection;
require('dotenv').config();
var client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent],
    allowedMentions: { parse: ['users', 'roles'], repliedUser: true }
});
client.commands = new Collection();
var eventsPath = path.join(__dirname, 'events');
var eventFiles = fs.readdirSync(eventsPath).filter(function (file) { return file.endsWith('.js'); });
var _loop_1 = function (file) {
    var filePath = path.join(eventsPath, file);
    var event_1 = require(filePath);
    if (event_1.once) {
        client.once(event_1.name, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return event_1.execute.apply(event_1, args);
        });
    }
    else {
        client.on(event_1.name, function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return event_1.execute.apply(event_1, args);
        });
    }
};
for (var _i = 0, eventFiles_1 = eventFiles; _i < eventFiles_1.length; _i++) {
    var file = eventFiles_1[_i];
    _loop_1(file);
}
var foldersPath = path.join(__dirname, 'commands');
var commandFolders = fs.readdirSync(foldersPath);
for (var _b = 0, commandFolders_1 = commandFolders; _b < commandFolders_1.length; _b++) {
    var folder = commandFolders_1[_b];
    var commandsPath = path.join(foldersPath, folder);
    var commandFiles = fs.readdirSync(commandsPath).filter(function (file) { return file.endsWith('.js'); });
    for (var _c = 0, commandFiles_1 = commandFiles; _c < commandFiles_1.length; _c++) {
        var file = commandFiles_1[_c];
        var filePath = path.join(commandsPath, file);
        var command = require(filePath);
        // Set a new item in the Collection with the key as the command name and the value as the exported module
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }
        else {
            console.log("[WARNING] The command at ".concat(filePath, " is missing a required \"data\" or \"execute\" property."));
        }
    }
}
client.login(process.env.token);
