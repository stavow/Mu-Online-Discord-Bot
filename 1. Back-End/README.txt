Steps for adding the Back-End to the GameServer:
1. Include the files to the file GameServer.cpp
2. Call the function DiscordBot::createServer() from the function GameServerStart() Like this:

	DiscordBot discordBotServer;
	discordBotServer.createServer();