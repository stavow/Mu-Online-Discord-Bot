#pragma once
#undef UNICODE

#define WIN32_LEAN_AND_MEAN
#define SWITCH 1
#define SERVER_LIST 2

#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdlib.h>
#include <stdio.h>
#include <iostream>
#include "TNotice.h"
#include <thread>
#include "GMMng.h"
#include "RaklionUtil.h"
#include "utf8.h"
#include <iostream>
#include <fstream>
#include "ComboAttack.h"
#include "MagicInf.h"
#include "giocp.h"
#include "zzzitem.h"
#include "classdef.h"
#include "GuildClass.h"
#include "TDurMagicKeyChecker.h"
#include "TMonsterAIAgro.h"
#include "TMonsterSkillElementInfo.h"
#include "JewelOfHarmonySystem.h"
#include "ItemSystemFor380.h"
#include "QuestExpUserInfo.h"
#include "itemsocketoptiondefine.h"
#include "MuLua.h"
#include "MuunInfo.h"
#include "MuRummyInfo.h"
#include "SkillDelay.h"
#include "Shop.h"
#include "GremoryCase.h"
#include "UnityBattleField.h"
#include "EvolutionMonsterInfo.h"
#include "DoppelGanger.h"
#include "IllusionTempleEvent_Renewal.h"

// Need to link with Ws2_32.lib
#pragma comment (lib, "Ws2_32.lib")
// #pragma comment (lib, "Mswsock.lib")

#define DEFAULT_BUFLEN 512
#define DEFAULT_PORT "59000"

typedef std::basic_string<utf8::uint16_t> utf16string;
typedef std::basic_string<utf8::uint8_t> utf8string;

class DiscordBot {
public:
	void createServer();
private:
	static void PostSendDiscord(char* name, char* msg);
	static void DisconnectDiscord(LPOBJ lpTarget);
	static void DisconnectAccountDiscord(char* accName);
	static void banAccountDiscord(char * pId);
	static void unBanAccountDiscord(char* pId);
	static void banCharDiscord(char* charName);
	static void unBanCharDiscord(char* charName);
	static void gObjCloseSetDiscord(int aIndex, int Flag);
	static void itemCommandDiscord(LPOBJ lpObj, std::string args, int aIndex);

	static void connection(SOCKET ClientSocket) {
		struct addrinfo *result = NULL;
		struct addrinfo hints;

		int iSendResult;
		char recvbuf[DEFAULT_BUFLEN];
		int recvbuflen = DEFAULT_BUFLEN;
		int iResult;

		do {

			iResult = recv(ClientSocket, recvbuf, recvbuflen, 0);
			if (iResult > 0) {
				printf("Bytes received: %d\n", iResult);

				//Parsing
				std::ofstream file;
				std::string parsedMsg(recvbuf);
				std::string name = parsedMsg.substr(0, parsedMsg.find(';'));
				parsedMsg = parsedMsg.substr(parsedMsg.find(';') + 1, parsedMsg.size());
				std::string commandWord = parsedMsg.substr(1, parsedMsg.find_first_of(" \t") - 1);
				std::string msgNoCommandWord = parsedMsg.substr(parsedMsg.find_first_of(" \t") + 1, parsedMsg.size());

				msgNoCommandWord = parsedMsg.substr(parsedMsg.find(commandWord) + commandWord.size(), parsedMsg.size());

				//Initialization as char*
				char *nameArray = new char[name.length() + 1];
				strcpy(nameArray, name.c_str());

				char *msgNoCommandWordArray = new char[msgNoCommandWord.length() + 1];
				strcpy(msgNoCommandWordArray, msgNoCommandWord.c_str());

				LPOBJ player;
				int playerIndex;

				//Checking and Executing
				if (commandWord == "post") {
					PostSendDiscord(nameArray, msgNoCommandWordArray);
				}
				else if (commandWord == "notice") {
					g_RaklionUtil.SendMsgAllUser(msgNoCommandWordArray);
				}
				else if (commandWord == "item") {
					player = gObjFind(nameArray);
					if (player != NULL) {
						playerIndex = player->m_Index;
						itemCommandDiscord(player, msgNoCommandWord, playerIndex);
					}
				}
				else if (commandWord == "disconnect") {
					player = gObjFind(nameArray);
					if (player != NULL) {
						DisconnectDiscord(player);
					}
				}
				else if (commandWord == "disconnectacc") {
					DisconnectAccountDiscord(nameArray);
				}
				else if (commandWord == "switch") {
					player = gObjFind(nameArray);
					if (player != NULL) {
						playerIndex = player->m_Index;
						player->m_bOff = 0;
						gObjCloseSetDiscord(playerIndex, SWITCH);
					}
				}
				else if (commandWord == "serverlist") {
					player = gObjFind(nameArray);
					if (player != NULL) {
						playerIndex = player->m_Index;
						player->m_bOff = 0;
						gObjCloseSetDiscord(playerIndex, SERVER_LIST);
					}
				}
				else if (commandWord == "banacc") {
					banAccountDiscord(nameArray);
				}
				else if (commandWord == "unbanacc") {
					unBanAccountDiscord(nameArray);
				}
				else if (commandWord == "banchar") {
					banCharDiscord(nameArray);
				}
				else if (commandWord == "unbanchar") {
					unBanCharDiscord(nameArray);
				}

				//End of parse

				if (iSendResult == SOCKET_ERROR) {
					printf("send failed with error: %d\n", WSAGetLastError());
					closesocket(ClientSocket);
				}
				printf("Bytes sent: %d\n", iSendResult);
			}
			else {
				printf("recv failed with error: %d\n", WSAGetLastError());
				closesocket(ClientSocket);
			}

		} while (iResult > 0);
	}

	static void DiscordBot::discordServer()
	{
		WSADATA wsaData;
		int iResult;

		SOCKET ListenSocket = INVALID_SOCKET;
		SOCKET ClientSocket = INVALID_SOCKET;
		SOCKADDR_IN addr;
		int addrlen = sizeof(addr);

		struct addrinfo *result = NULL;
		struct addrinfo hints;

		int iSendResult;
		char recvbuf[DEFAULT_BUFLEN];
		int recvbuflen = DEFAULT_BUFLEN;

		// Initialize Winsock
		iResult = WSAStartup(MAKEWORD(2, 2), &wsaData);
		if (iResult != 0) {
			printf("WSAStartup failed with error: %d\n", iResult);
		}

		ZeroMemory(&hints, sizeof(hints));
		hints.ai_family = AF_INET;
		hints.ai_socktype = SOCK_STREAM;
		hints.ai_protocol = IPPROTO_TCP;
		hints.ai_flags = AI_PASSIVE;

		// Resolve the server address and port
		iResult = getaddrinfo(NULL, DEFAULT_PORT, &hints, &result);
		if (iResult != 0) {
			printf("getaddrinfo failed with error: %d\n", iResult);
			WSACleanup();
		}

		// Create a SOCKET for connecting to server
		ListenSocket = socket(result->ai_family, result->ai_socktype, result->ai_protocol);
		if (ListenSocket == INVALID_SOCKET) {
			printf("socket failed with error: %ld\n", WSAGetLastError());
			freeaddrinfo(result);
			WSACleanup();
		}

		// Setup the TCP listening socket
		bind(ListenSocket, result->ai_addr, (int)result->ai_addrlen);

		freeaddrinfo(result);

		iResult = listen(ListenSocket, SOMAXCONN);
		if (iResult == SOCKET_ERROR) {
			printf("listen failed with error: %d\n", WSAGetLastError());
			closesocket(ListenSocket);
			WSACleanup();
		}

		// Accept a client socket

		while (true) {
			try {
				ClientSocket = accept(ListenSocket, (SOCKADDR*)&addr, &addrlen);
				char *ip = inet_ntoa(addr.sin_addr);
				if (strcmp(ip, "127.0.0.1") != 0) {
					closesocket(ListenSocket);
					WSACleanup();
				}
				else if(ClientSocket == INVALID_SOCKET) 
				{
					printf("accept failed with error: %d\n", WSAGetLastError());
					closesocket(ListenSocket);
					WSACleanup();
				}
				else {
					try {
						std::thread t(connection, ClientSocket);
						t.detach();
					}
					catch(...){}
				}
			}
			catch (...) {}
		}

		// No longer need server socket
		closesocket(ListenSocket);

		// shutdown the connection since we're done
		iResult = shutdown(ClientSocket, SD_SEND);
		if (iResult == SOCKET_ERROR) {
			printf("shutdown failed with error: %d\n", WSAGetLastError());
			closesocket(ClientSocket);
			WSACleanup();
		}

		// cleanup
		closesocket(ClientSocket);
		WSACleanup();
	}

	HANDLE threadHandle;
};