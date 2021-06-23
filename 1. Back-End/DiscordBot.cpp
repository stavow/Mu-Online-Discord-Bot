#include "stdafx.h"
#include "DiscordBot.h"
#include "GMMng.h"
#include "LogToFile.h"
#include "TLog.h"
#include "GameMain.h"
#include "protocol.h"
#include "winutil.h"
#include "MoveCommand.h"
#include "GuildClass.h"
#include "TNotice.h"
#include "ObjCalCharacter.h"
#include "BattleSoccerManager.h"
#include "giocp.h"
#include "Kanturu.h"
#include "SkillAdditionInfo.h"
#include "RaklionBattleUserMng.h"
#include "BuffEffectSlot.h"
#include "AntiSwear.h"
#include "Marry.h"
#include "MapServerManager.h"
#include "DSProtocol.h"
#include "Crywolf.h"
#include "./Eventos/BloodCastle/BloodCastle.h"
#include "BagManager.h"
#include "DevilSquare.h"
#include "ChaosCastle.h"
#include "configread.h"
#include "PentagramSystem.h"
#include "GensSystem.h"
#include "ImperialGuardian.h"
#include "MasterLevelSkillTreeSystem.h"
#include "ItemSocketOptionSystem.h"
#include "SendNPCInfo.h"
#include "VipSys.h"
#include "SProtocol.h"
#include "MuunSystem.h"
#include "ItemOptionTypeMng.h"
#include "OfflineLevelling.h"
#include "ChaosCastleFinal.h"
#include "QuestExpProgMng.h"
#include "ChangeCmd.h"
#include "UpgradeCmd.h"
#include "gObjMonster.h"
#include "ResetTable.h"
#include "Item_Bags.h"
#include "CustomMaxStats.h"
#include "StatSpecialize.h"
#include "SocketItemType.h"
#include <iostream>
#include <fstream>

void DiscordBot::createServer()
{
	unsigned long ThreadID;
	try {
		threadHandle = CreateThread(NULL, 0, (LPTHREAD_START_ROUTINE)discordServer, this, 0, &ThreadID);
	}
	catch (...) {

	}
}

void DiscordBot::PostSendDiscord(char* name, char * msg)
{
	try {
		if (name == nullptr || msg == nullptr) return;
		PMSG_POST_DATA pMsg;
		PHeadSubSetB((LPBYTE)&pMsg, 0xFA, 0x10, sizeof(pMsg));

		pMsg.btColorRGB[0] = 0xC2;
		pMsg.btColorRGB[1] = 0x84;
		pMsg.btColorRGB[2] = 0xFC;

		memcpy(pMsg.szName, name, MAX_ACCOUNT_LEN);
		memcpy(pMsg.szServerName, g_ConfigRead.server.GetServerName(), 50);

		strcpy(pMsg.szTag, "[Discord]");
		strcpy(pMsg.szMessage, msg);

		GSProtocol.DataSendAll((LPBYTE)&pMsg, sizeof(pMsg));
	}
	catch (...) {}
}

void DiscordBot::DisconnectDiscord(LPOBJ lpTarget)
{
	try {
		if (!lpTarget)
		{
			return;
		}
		IOCP.CloseClient(lpTarget->m_Index);
	}
	catch (...) {}
}

void DiscordBot::DisconnectAccountDiscord(char * accName)
{
	try {
		if (accName == nullptr) return;
		for (int i = g_ConfigRead.server.GetObjectStartUserIndex(); i < g_ConfigRead.server.GetObjectMax(); i++)
		{
			if (gObj[i].Connected >= PLAYER_LOGGED)
			{
				if (gObj[i].AccountID[0] == accName[0])
				{
					if (gObj[i].AccountID[1] == accName[1])
					{
						if (!strcmp(gObj[i].AccountID, accName))
						{
							IOCP.CloseClient(gObj[i].m_Index);
							return;
						}
					}
				}
			}
		}
	}
	catch (...) {}
}

void DiscordBot::banAccountDiscord(char * pId)
{
	try {
		if (pId == nullptr) return;
		BAN_REQ_USER pBan;
		PHeadSetB((LPBYTE)&pBan, 0xFA, sizeof(pBan));

		memcpy(pBan.AccName, pId, sizeof(pBan.AccName));
		pBan.Ban = 1;
		pBan.Type = 1;

		wsDataCli.DataSend((char *)&pBan, pBan.h.size);
	}
	catch (...) {}
}

void DiscordBot::unBanAccountDiscord(char * pId)
{
	try {
		if (pId == nullptr) return;
		BAN_REQ_USER pBan;
		PHeadSetB((LPBYTE)&pBan, 0xFA, sizeof(pBan));

		memcpy(pBan.AccName, pId, sizeof(pBan.AccName));
		pBan.Ban = 0;
		pBan.Type = 1;

		wsDataCli.DataSend((char *)&pBan, pBan.h.size);
	}
	catch (...) {}
}

void DiscordBot::banCharDiscord(char * charName)
{
	try {
		if (charName == nullptr) return;
		BAN_REQ_USER pBan;

		PHeadSetB((LPBYTE)&pBan, 0xFA, sizeof(pBan));

		pBan.Type = 0;
		pBan.Ban = 1;

		memcpy(pBan.AccName, charName, sizeof(charName));
		wsDataCli.DataSend((PCHAR)&pBan, pBan.h.size);
	}
	catch (...) {}
}

void DiscordBot::unBanCharDiscord(char * charName)
{
	try {
		if (charName == nullptr) return;
		BAN_REQ_USER pBan;

		PHeadSetB((LPBYTE)&pBan, 0xFA, sizeof(pBan));

		pBan.Type = 0;
		pBan.Ban = 0;

		memcpy(pBan.AccName, charName, sizeof(charName));

		wsDataCli.DataSend((PCHAR)&pBan, pBan.h.size);
	}
	catch (...) {}
}

void DiscordBot::gObjCloseSetDiscord(int aIndex, int Flag)
{
	int online = 0;
	for (int i = g_ConfigRead.server.GetObjectStartUserIndex(); i < g_ConfigRead.server.GetObjectMax(); i++)
	{
		if (gObj[i].Connected >= PLAYER_LOGGED)
		{
			if (gObj[i].m_Index == aIndex)
			{
				online = 1;
			}
		}
	}

	if (!online) return;

	if (aIndex < 0 || aIndex > g_ConfigRead.server.GetObjectMax() - 1)
	{
		return;
	}

	LPOBJ lpObj = &gObj[aIndex];

	if (lpObj->CloseCount > 0)
	{
		return;
	}

	if (lpObj->Type != OBJ_USER)
	{
		return;
	}

	if (lpObj->Connected == PLAYER_PLAYING)
	{

		if (BC_MAP_RANGE(lpObj->MapNumber))
		{
			g_BloodCastle.SearchUserDropQuestItem(aIndex);
		}

		if (IT_MAP_RANGE(lpObj->MapNumber))
		{
			g_IT_Event.DropRelicsItem(lpObj->MapNumber, lpObj->m_Index);
			g_IT_Event.Leave_ITR(lpObj->m_Index, lpObj->MapNumber);

			if (lpObj->m_nITR_RelicsTick > 0 || lpObj->m_wITR_NpcType > 0 || lpObj->m_byITR_StoneState != 99 || lpObj->m_bITR_RegisteringRelics == true || lpObj->m_bITR_GettingRelics == true)
			{
				g_IT_Event.CancleStoneState(lpObj->m_wITR_NpcType, lpObj->m_byITR_StoneState, lpObj->MapNumber);
				lpObj->m_nITR_RelicsTick = 0;
				lpObj->m_wITR_NpcType = 0;
				lpObj->m_byITR_StoneState = 99;
				lpObj->m_bITR_RegisteringRelics = false;
				lpObj->m_bITR_GettingRelics = false;
			}
		}

		if (lpObj->MapNumber == MAP_INDEX_DEVILSQUARE_FINAL)
		{
			g_DevilSquareFinal.Leave_DSF(lpObj->m_Index);
		}

		if (DG_MAP_RANGE(lpObj->MapNumber))
		{
			g_DoppelGanger.LeaveDoppelganger(lpObj->m_Index);

			if (g_DoppelGanger.GetDoppelgangerState() == 2)
			{
				g_DoppelGanger.SendDoppelgangerResult(lpObj, 1);
			}
		}

		if ((GetTickCount() - lpObj->MySelfDefenseTime) < 60000)
		{
			GSProtocol.GCServerMsgStringSend(Lang.GetText(0, 42), lpObj->m_Index, 1);
			GSProtocol.GCCloseMsgSend(lpObj->m_Index, -1);
			return;
		}

		if ((lpObj->m_IfState.use != 0) && ((lpObj->m_IfState.type == 1) || (lpObj->m_IfState.type == 6) || (lpObj->m_IfState.type == 13) || (lpObj->m_IfState.type == 7)))
		{
			gObjSaveChaosBoxItemList(lpObj);
			switch (lpObj->m_IfState.type)
			{
			case 1:
				GSProtocol.GCServerMsgStringSend(Lang.GetText(0, 43), lpObj->m_Index, 1);
				break;

			case 6:
				GSProtocol.GCServerMsgStringSend(Lang.GetText(0, 44), lpObj->m_Index, 1);
				break;

			case 7:
				GSProtocol.GCServerMsgStringSend(Lang.GetText(0, 59), lpObj->m_Index, 1);
				break;

			case 13:
				GSProtocol.GCServerMsgStringSend(Lang.GetText(0, 145), lpObj->m_Index, 1);
				break;
			}
			return;
		}
	}

	lpObj->CloseCount = 1;
	lpObj->CloseType = Flag;
	lpObj->bEnableDelCharacter = 1;
}

void DiscordBot::itemCommandDiscord(LPOBJ lpObj, std::string args, int aIndex)
{
	try {
		int options[] = { 0,0,0,0,0,0,0,0,0,0,0,0,0};
		std::string del = " ";
		size_t pos = 0;
		std::string token;
		std::string editableArgs = args.substr(1);
		int oIndex = 0;

		//TEST
		std::ofstream test;
		test.open("D:\\MuOnlineFiles\\S12\\testItem.txt", std::ios_base::app);
		test << editableArgs << '\n';

		while ((pos = editableArgs.find(del)) != std::string::npos) {
			token = editableArgs.substr(0, pos);
			test << token << '\n';
			editableArgs.erase(0, pos + del.length());
			options[oIndex] = atoi(token.c_str());
			oIndex++;
		}

		token = editableArgs;
		options[oIndex] = atoi(token.c_str());
		test << token << '\n';
		int type, index, ItemLevel, ItemSkill, ItemLuck, ItemOpt, ItemAncient, ItemExpireTime, ItemSocketCount, MainAttribute, MuunEvoItemType, MuunEvoItemIndex;
		std::string szItemExc;

		type = options[12];
		index = options[11];
		ItemLevel = options[10];
		ItemSkill = options[9];
		ItemLuck = options[8];
		ItemOpt = options[7];

		std::string op = to_string(options[6]);

		char *szString = new char[op.length() + 1];
		strcpy(szString, op.c_str());

		if (szString == nullptr)
		{
			szItemExc = "-1;-1;-1;-1;-1;-1;-1;-1;-1";
		}

		else
		{
			szItemExc = szString;
		}


		ItemAncient = options[5];
		ItemExpireTime = options[4];
		ItemSocketCount = options[3];
		MainAttribute = options[2];
		MuunEvoItemType = options[1];
		MuunEvoItemIndex = options[0];

		std::string stuff = std::to_string(type) + " " + std::to_string(index) + " " + std::to_string(ItemLevel) + " " + std::to_string(ItemSkill) + " " + std::to_string(ItemLuck) + " " + std::to_string(ItemOpt) + " " + std::to_string(ItemAncient) + " " + std::to_string(ItemExpireTime) + " " + std::to_string(ItemSocketCount) + " " + std::to_string(MainAttribute) + " " + std::to_string(MuunEvoItemType) + " " + std::to_string(MuunEvoItemIndex);

		test << stuff;
		test.close();

		if ((type >= 0 && type <= 17))
		{
			CItem Item;
			Item.m_Type = ItemGetNumberMake(type, index);

			if (Item.m_Type == -1)
			{
				g_Log.AddC(TColor::Red, "[Game Master][Create Item][%s][%s][%s] - Wrong ItemType (%d)",
					lpObj->AccountID, lpObj->Name, lpObj->m_PlayerData->Ip_addr, Item.m_Type);

				return;
			}

			ITEM_ATTRIBUTE * p = &ItemAttribute[Item.m_Type];

			BYTE btExcOptionList[9];
			memset(btExcOptionList, -1, sizeof(btExcOptionList));

			std::deque<int> exc_opt_list;
			strtk::parse(szItemExc, ";", exc_opt_list);

			for (int i = 0; i < exc_opt_list.size(); i++)
			{
				btExcOptionList[i] = exc_opt_list.at(i);
			}

			if (btExcOptionList[0] == (BYTE)-2)
			{
				if (p->ItemKindA == ITEM_KIND_A_WING)
				{
					Item.m_NewOption = g_ItemOptionTypeMng.WingExcOptionRand(p->ItemKindA, p->ItemKindB, Item.m_SocketOption);
				}

				else
				{
					Item.m_NewOption = g_ItemOptionTypeMng.CommonExcOptionRand(p->ItemKindA, Item.m_SocketOption);
				}
			}

			else if (btExcOptionList[0] == (BYTE)-3)
			{
				if (p->ItemKindA == ITEM_KIND_A_WING)
				{
					Item.m_NewOption = g_ItemOptionTypeMng.WingExcOptionGetCount(p->ItemKindA, p->ItemKindB, Item.m_SocketOption, btExcOptionList[1]);
				}

				else
				{
					Item.m_NewOption = g_ItemOptionTypeMng.CommonExcOptionGetCount(p->ItemKindA, Item.m_SocketOption, btExcOptionList[1]);
				}
			}

			else
			{
				for (int i = 0; i < 9; i++)
				{
					if (btExcOptionList[i] == -1)
					{
						continue;
					}

					if (btExcOptionList[i] >= 6)
					{
						bool bOptionFound = false;

						for (int j = 0; j < 5; j++)
						{
							if (Item.m_SocketOption[j] == btExcOptionList[i])
							{
								bOptionFound = true;
								break;
							}
						}

						if (bOptionFound == true)
						{
							continue;
						}

						for (int j = 0; j < 5; j++)
						{
							if (Item.m_SocketOption[j] == 0xFF)
							{
								Item.m_SocketOption[j] = btExcOptionList[i];
								break;
							}
						}
					}

					else
					{
						Item.m_NewOption |= (1 << (5 - btExcOptionList[i]));
					}
				}
			}

			if (gSocketItemType.CheckSocketItemType((int)&Item) == true)
			{
				if (ItemSocketCount == 0)
				{
					g_SocketOptionSystem.MakeSocketSlot(&Item, rand() % 5 + 1);
				}

				else
				{
					g_SocketOptionSystem.MakeSocketSlot(&Item, ItemSocketCount);
				}

				MainAttribute = -1;
			}

			else if (g_PentagramSystem.IsPentagramItem(Item.m_Type) == true)
			{
				if (ItemSocketCount == 0)
				{
					g_PentagramSystem.GetMakePentagramSlotCountNKind(Item.m_SocketOption, Item.m_Type);
				}

				else
				{
					BYTE Slot[5] = { 0, 0, 0, 0, 0 };

					for (int i = 0; i < ItemSocketCount; i++)
					{
						Slot[i] = 1;
					}

					g_PentagramSystem.MakePentagramSocketSlot(&Item, Slot[0], Slot[1], Slot[2], Slot[3], Slot[4]);
				}
			}

			else if (g_CMuunSystem.IsStoneofEvolution(Item.m_Type) == TRUE)
			{
				int iMuunEvolutionItemID = ITEMGET(MuunEvoItemType, MuunEvoItemIndex);

				Item.m_SocketOption[0] = iMuunEvolutionItemID >> 8;
				Item.m_SocketOption[1] = ITEM_GET_INDEX(iMuunEvolutionItemID);
				g_Log.AddC(TColor::Yellow, "ITEM (%d) %d %d", type, Item.m_SocketOption[0], Item.m_SocketOption[1]); //[K2]
			}

			if (type == 13 && (index == 4 || index == 5))
			{
				PetItemSerialCreateSend(aIndex, gObj[aIndex].MapNumber, gObj[aIndex].X, gObj[aIndex].Y, Item.m_Type, ItemLevel, 0, ItemSkill, ItemLuck, ItemOpt, -1, Item.m_NewOption, ItemAncient);
			}
			else
			{
				ItemSerialCreateSend(aIndex, 227, gObj[aIndex].X, gObj[aIndex].Y, Item.m_Type, ItemLevel, 0, ItemSkill, ItemLuck, ItemOpt, -1, Item.m_NewOption, ItemAncient, ItemExpireTime, Item.m_SocketOption, MainAttribute);
			}

			GMLog->Output("[%s][%s][%s] Created Item using Admin Command (%s/%d/%d) Auth: %d", lpObj->AccountID, lpObj->Name, lpObj->m_PlayerData->Ip_addr, Lang.GetMap(0, lpObj->MapNumber), lpObj->X, lpObj->Y, lpObj->Authority);
		}
	}
	catch (...) {}
}
