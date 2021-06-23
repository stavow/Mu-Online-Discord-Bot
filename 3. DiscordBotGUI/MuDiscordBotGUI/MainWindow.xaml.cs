using System;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Shapes;
using System.Diagnostics;
using System.IO;
using MU_Discord_Bot_By_OnLyWiN;
using System.Windows.Media.Imaging;
using System.Windows.Media;

namespace MuDiscordBotGUI
{
	/// <summary>
	/// Interaction logic for MainWindow.xaml
	/// </summary>
	public partial class MainWindow : Window
	{
        //Global Variables
        Process proc = new Process();
        int processID = 0;
        string path = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + @"\DF6BF0";
        string filePath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + "\\DF6BF0\\start.exe";
        string crashLogPath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + @"\DF6BF0\Crashes\";
        int botRunning = 0;
        int forceExit = 0;

        //Config Variables
        string configFile = @"\config.ini";
        string configBackupFile = @"\configbackup.ini";

        //Images Variables
        string[] dirs = { "General Images", "Items Images", "Class Images" };
        string generalImagesPath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + @"\DF6BF0\images\";
        string itemImagesPath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + @"\DF6BF0\items\";
        string classImagesPath = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData) + @"\DF6BF0\class\";

        //Constants
        const int WARNING = 1;
        const int ERROR = 2;
        const int INFORMATION = 3;

        public MainWindow()
		{
			InitializeComponent();
            readConfig(configFile);
            foreach (string dir in dirs)
            {
                directory.Items.Add(dir);
            }
        }

        #region ResizeWindows
        bool ResizeInProcess = false;
        private void Resize_Init(object sender, MouseButtonEventArgs e)
        {
            Rectangle senderRect = sender as Rectangle;
            if (senderRect != null)
            {
                ResizeInProcess = true;
                senderRect.CaptureMouse();
            }
        }

        private void Resize_End(object sender, MouseButtonEventArgs e)
        {
            Rectangle senderRect = sender as Rectangle;
            if (senderRect != null)
            {
                ResizeInProcess = false; ;
                senderRect.ReleaseMouseCapture();
            }
        }

        private void Resizeing_Form(object sender, MouseEventArgs e)
        {
            if (ResizeInProcess)
            {
                double temp = 0;
                Rectangle senderRect = sender as Rectangle;
                Window mainWindow = senderRect.Tag as Window;
                if (senderRect != null)
                {
                    double width = e.GetPosition(mainWindow).X;
                    double height = e.GetPosition(mainWindow).Y;
                    senderRect.CaptureMouse();
                    if (senderRect.Name.Contains("right", StringComparison.OrdinalIgnoreCase))
                    {
                        width += 5;
                        if (width > 0)
                            mainWindow.Width = width;
                    }
                    if (senderRect.Name.Contains("left", StringComparison.OrdinalIgnoreCase))
                    {
                        width -= 5;
                        temp = mainWindow.Width - width;
                        if ((temp > mainWindow.MinWidth) && (temp < mainWindow.MaxWidth))
                        {
                            mainWindow.Width = temp;
                            mainWindow.Left += width;
                        }
                    }
                    if (senderRect.Name.Contains("bottom", StringComparison.OrdinalIgnoreCase))
                    {
                        height += 5;
                        if (height > 0)
                            mainWindow.Height = height;
                    }
                    if (senderRect.Name.ToLower().Contains("top", StringComparison.OrdinalIgnoreCase))
                    {
                        height -= 5;
                        temp = mainWindow.Height - height;
                        if ((temp > mainWindow.MinHeight) && (temp < mainWindow.MaxHeight))
                        {
                            mainWindow.Height = temp;
                            mainWindow.Top += height;
                        }
                    }
                }
            }
        }
        #endregion

        #region TopTaskbar Functions

        private void maximizeBtn_Click(object sender, RoutedEventArgs e)
        {
            if (WindowState == WindowState.Maximized)
            {
                WindowState = WindowState.Normal;
            }
            else
            {
                WindowState = WindowState.Maximized;
            }
        }

        private void topTaskbar_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            DragMove();
        }

        private void exitBtn_Click(object sender, RoutedEventArgs e)
        {
            System.Windows.Application.Current.Shutdown();
        }

        #endregion

        #region Navigation Rail

        private void ButtonOpenMenu_Click(object sender, RoutedEventArgs e)
        {
            ButtonCloseMenu.Visibility = Visibility.Visible;
            ButtonOpenMenu.Visibility = Visibility.Collapsed;
        }

        private void ButtonCloseMenu_Click(object sender, RoutedEventArgs e)
        {
            ButtonCloseMenu.Visibility = Visibility.Collapsed;
            ButtonOpenMenu.Visibility = Visibility.Visible;
        }

        private void SettingsGridOpen_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            imageBrowser.Visibility = Visibility.Hidden;
            consoleGrid.Visibility = Visibility.Hidden;
            settingsGrid.Visibility = Visibility.Visible;
        }

        private void ConsoleGridOpen_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            settingsGrid.Visibility = Visibility.Hidden;
            imageBrowser.Visibility = Visibility.Hidden;
            consoleGrid.Visibility = Visibility.Visible;
        }

        private void ListViewItem_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            settingsGrid.Visibility = Visibility.Hidden;
            consoleGrid.Visibility = Visibility.Hidden;
            imageBrowser.Visibility = Visibility.Visible;
        }

        private void ListViewMenu_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            UserControl usc = null;
            //GridMain.Children.Clear();

            switch (((ListViewItem)((ListView)sender).SelectedItem).Name)
            {
                case "ItemHome":
                    /*usc = new UserControlHome();
                    GridMain.Children.Add(usc);*/
                    break;
                case "ItemCreate":
                    /*usc = new UserControlCreate();
                    GridMain.Children.Add(usc);*/
                    break;
                default:
                    break;
            }
        }

        #endregion

        #region Console Functions

        private void startBotProc()
        {
            if (botRunning == 0)
            {
                forceExit = 0;
                botRunning = 1;
                try
                {
                    proc.StartInfo.WorkingDirectory = path;
                    proc.StartInfo.FileName = filePath;
                    proc.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                    proc.StartInfo.CreateNoWindow = true;
                    proc.EnableRaisingEvents = true;
                    proc.StartInfo.UseShellExecute = false;
                    proc.StartInfo.RedirectStandardOutput = true;
                    proc.EnableRaisingEvents = true;
                    proc.StartInfo.RedirectStandardInput = true;
                    proc.Start();
                    proc.BeginOutputReadLine();
                    proc.OutputDataReceived += proc_OutputDataReceived;
                    proc.Exited += proc_Exited;
                }
                catch (Exception ex)
                {
                    Console.WriteLine("{0} Exception caught.", ex.Message);
                }
            }

            else
            {
                System.Windows.MessageBox.Show("The bot is already running.", "Already Running", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void startBot_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            try
            {
                startBotProc();
                createNotification(INFORMATION, "The Bot has been Started");
            }
            catch (Exception ex)
            {
                Console.WriteLine("{0} Exception caught.", ex.Message);
            }
        }

        void proc_OutputDataReceived(object sender, DataReceivedEventArgs e)
        {
            this.Dispatcher.Invoke((Action)(() =>
            {
                try
                {
                    if (e.Data != null)
                    {
                        if (e.Data != "" && e.Data != "\n" && e.Data != " " && e.Data.IndexOf("cd " + path) == -1 && e.Data[0] != ' ' && e.Data[0] != '}')
                        {
                            if (e.Data.IndexOf(path) != -1)
                            {
                                string replace = e.Data;
                                replace = replace.Replace(path, "MU Bot Working Folder");
                                console.AppendText("[" + DateTime.Now.ToString("dd.MM.yyyy hh:mm:ss") + "] » " + replace + "\n");
                                console.ScrollToEnd();
                            }
                            else
                            {
                                console.AppendText("[" + DateTime.Now.ToString("dd.MM.yyyy hh:mm:ss") + "] » " + e.Data + "\n");
                                if (e.Data.ToLower().IndexOf("error") != -1)
                                {

                                    createNotification(ERROR, e.Data.Substring(0, e.Data.IndexOf("Error")) + " Error Occured");
                                }
                                console.ScrollToEnd();
                            }

                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("{0} Exception caught.", ex.Message);
                }
            }));
        }

        void proc_Exited(object sender, System.EventArgs e)
        {
            this.Dispatcher.Invoke(() =>
            {
                proc.StandardInput.Close();
                proc.Close();
                proc = new Process();
                botRunning = 0;
                try
                {
                    if (forceExit == 0)
                    {
                        using (StreamWriter sw = File.CreateText(crashLogPath + "[" + DateTime.Now.ToString("dd-MM-yyyy_hh-mm-ss") + "] CrashLog.txt"))
                        {
                            sw.Write(console.Text + "\n");
                        }
                        console.Text = "[" + DateTime.Now.ToString("dd.MM.yyyy hh:mm:ss") + "] » " + "Bot Crashed, restarting...\n";

                        startBotProc();
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("{0} Exception caught.", ex.Message);
                }
            });
        }

        private void stopBot_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (botRunning == 1)
            {
                forceExit = 1;
                botRunning = 0;
                proc.StandardInput.Close();
                proc.Close();
                proc = new Process();
                console.Text = "[" + DateTime.Now.ToString("dd.MM.yyyy hh:mm:ss") + "] » " + "Process Terminated.\n";
                try
                {
                    foreach (var process in Process.GetProcessesByName("start"))
                    {
                        process.Kill();
                    }
                    Process.GetProcessById(processID).Kill();
                }
                catch (Exception ex)
                {
                    Console.WriteLine("{0} Exception caught.", ex.Message);
                }

                createNotification(INFORMATION, "The Bot has been Stopped");
            }
            else
            {
                System.Windows.MessageBox.Show("The bot is not running", "Error Occurred", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        #endregion

        #region Config Functions

        private void readConfig(string location)
        {
            var MyIni = new IniFile(path + location);

            sqlServer.Text = MyIni.Read("Server", "SQL");
            sqlDb.Text = MyIni.Read("Database", "SQL");
            sqlUser.Text = MyIni.Read("User", "SQL");
            sqlPwd.Text = MyIni.Read("Password", "SQL");
            sqlPort.Text = MyIni.Read("Port", "SQL");
            tablesSchema.Text = MyIni.Read("Schema", "Tables");
            tablesMembers.Text = MyIni.Read("Members", "Tables");
            tablesStats.Text = MyIni.Read("Stats", "Tables");
            tablesAccounts.Text = MyIni.Read("Accounts", "Tables");
            tablesCharacters.Text = MyIni.Read("Characters", "Tables");
            membersID.Text = MyIni.Read("MembersID", "Members");
            membersPassword.Text = MyIni.Read("MembersPassword", "Members");
            membersName.Text = MyIni.Read("MembersName", "Members");
            membersPhone.Text = MyIni.Read("MembersPhone", "Members");
            membersMail.Text = MyIni.Read("MembersMail", "Members");
            statsMembersID.Text = MyIni.Read("StatsMembersID", "Stats");
            connectionStatus.Text = MyIni.Read("ConnectionStatus", "Stats");
            serverName.Text = MyIni.Read("ServerName", "Stats");
            IP.Text = MyIni.Read("IP", "Stats");
            lastConnection.Text = MyIni.Read("LastConnection", "Stats");
            lastDisconnect.Text = MyIni.Read("LastDisconnect", "Stats");
            onlineHours.Text = MyIni.Read("OnlineHours", "Stats");
            ID.Text = MyIni.Read("Id", "Accounts");
            firstCharacter.Text = MyIni.Read("FirstCharacter", "Accounts");
            secondsCharacter.Text = MyIni.Read("SecondCharacter", "Accounts");
            thirdCharacter.Text = MyIni.Read("ThirdCharacter", "Accounts");
            forthCharacter.Text = MyIni.Read("ForthCharacter", "Accounts");
            fifthCharacter.Text = MyIni.Read("FifthCharacter", "Accounts");
            accountID.Text = MyIni.Read("AccountID", "Character");
            cName.Text = MyIni.Read("CName", "Character");
            cLevel.Text = MyIni.Read("CLevel", "Character");
            cClass.Text = MyIni.Read("Class", "Character");
            strength.Text = MyIni.Read("Strength", "Character");
            dexterity.Text = MyIni.Read("Dexterity", "Character");
            vitality.Text = MyIni.Read("Vitality", "Character");
            energy.Text = MyIni.Read("Energy", "Character");
            command.Text = MyIni.Read("Command", "Character");
            levelUpPoints.Text = MyIni.Read("LevelUpPoints", "Character");
            inventory.Text = MyIni.Read("Inventory", "Character");
            money.Text = MyIni.Read("Money", "Character");
            maxLife.Text = MyIni.Read("MaxLife", "Character");
            mapNumber.Text = MyIni.Read("MapNumber", "Character");
            mapX.Text = MyIni.Read("MapX", "Character");
            mapY.Text = MyIni.Read("MapY", "Character");
            PkCount.Text = MyIni.Read("PkCount", "Character");
            PkLevel.Text = MyIni.Read("PkLevel", "Character");
            ctlCode.Text = MyIni.Read("CtlCode", "Character");
            resets.Text = MyIni.Read("Resets", "Character");
            married.Text = MyIni.Read("Married", "Character");
            marryName.Text = MyIni.Read("MarryName", "Character");
            servName.Text = MyIni.Read("ServName", "Information");
            serverIP.Text = MyIni.Read("IP", "Information");
            serverImage.Text = MyIni.Read("ServerImage", "Information");
            siteDomain.Text = MyIni.Read("SiteDomain", "Information");
            pkClearCost.Text = MyIni.Read("PkClearCost", "Information");
            pkFirstMurderer.Text = MyIni.Read("PkFirstMurderer", "Information");
            pkFirstHero.Text = MyIni.Read("PkFirstHero", "Information");
            resetLevel.Text = MyIni.Read("ResetLevel", "Information");
            fullStat.Text = MyIni.Read("FullStat", "Information");
            prefix.Text = MyIni.Read("Prefix", "Information");
            pkTopHero.Text = MyIni.Read("PkTopHero", "Information");
            pkTopMurderer.Text = MyIni.Read("PkTopMurderer", "Information");
            currencyName.Text = MyIni.Read("CurrencyName", "Discord");
            commandsChannel.Text = MyIni.Read("CommandsChannel", "Discord");
            adminsCommandChannel.Text = MyIni.Read("AdminCommandsChannel", "Discord");
            communicationChannel.Text = MyIni.Read("CommunicationChannel", "Discord");
            levelupChannel.Text = MyIni.Read("LevelUpChannel", "Discord");
            spamChannel.Text = MyIni.Read("SpamChannel", "Discord");
            moderationRoles.Text = MyIni.Read("ModerationRoles", "Discord");
            discordHighModerationRoles.Text = MyIni.Read("DiscordHighModerationRoles", "Discord");
            autoTransferCategory.Text = MyIni.Read("AutoTransferCategory", "Discord");
            autoTransferInstructionsChannel.Text = MyIni.Read("AutoTransferInstructionsChannel", "Discord");
            eventsChannel.Text = MyIni.Read("EventsChannel", "DiscordEvents");
            autoMathEvent.Text = MyIni.Read("AutoMathEvent", "DiscordEvents");
            autoMathEventAnswers.Text = MyIni.Read("AutoMathEventAnswers", "DiscordEvents");
            autoMathEventRewards.Text = MyIni.Read("AutoMathEventRewards", "DiscordEvents");
            autoTriviaEvent.Text = MyIni.Read("AutoTriviaEvent", "DiscordEvents");
            autoTriviaEventAnswer.Text = MyIni.Read("AutoTriviaEventAnswer", "DiscordEvents");
            serverEmoji.Text = MyIni.Read("ServerEmoji", "DiscordEmojis");
            knightEmoji.Text = MyIni.Read("KnightEmoji", "DiscordEmojis");
            elfEmoji.Text = MyIni.Read("ElfEmoji", "DiscordEmojis");
            wizardEmoji.Text = MyIni.Read("WizardEmoji", "DiscordEmojis");
            lordEmoji.Text = MyIni.Read("LordEmoji", "DiscordEmojis");
            gladiatorEmoji.Text = MyIni.Read("GladiatorEmoji", "DiscordEmojis");
            rfEmoji.Text = MyIni.Read("RageFighterEmoji", "DiscordEmojis");
            summEmoji.Text = MyIni.Read("SummonerEmoji", "DiscordEmojis");
            categories.Text = MyIni.Read("Categories", "DiscordShop");

            //Disable Commands
            if (MyIni.Read("AddBalanceCommand", "DisableCommands") == "1") { addBal.IsChecked = true; }
            if (MyIni.Read("AddItemCommand", "DisableCommands") == "1") { addItem.IsChecked = true; }
            if (MyIni.Read("AdminAddCommand", "DisableCommands") == "1") { adminAdd.IsChecked = true; }
            if (MyIni.Read("BanAccCommand", "DisableCommands") == "1") { banAcc.IsChecked = true; }
            if (MyIni.Read("BanCharCommand", "DisableCommands") == "1") { banChar.IsChecked = true; }
            if (MyIni.Read("DCCommand", "DisableCommands") == "1") { dc.IsChecked = true; }
            if (MyIni.Read("DCAccCommand", "DisableCommands") == "1") { dcAcc.IsChecked = true; }
            if (MyIni.Read("EditItemCommand", "DisableCommands") == "1") { editItem.IsChecked = true; }
            if (MyIni.Read("ForceMarryCommand", "DisableCommands") == "1") { forceMarry.IsChecked = true; }
            if (MyIni.Read("NoticeCommand", "DisableCommands") == "1") { notice.IsChecked = true; }
            if (MyIni.Read("RemoveItemCommand", "DisableCommands") == "1") { removeItem.IsChecked = true; }
            if (MyIni.Read("SetBalanceCommand", "DisableCommands") == "1") { setBal.IsChecked = true; }
            if (MyIni.Read("SetClassCommand", "DisableCommands") == "1") { setClass.IsChecked = true; }
            if (MyIni.Read("SetFullCommand", "DisableCommands") == "1") { setFull.IsChecked = true; }
            if (MyIni.Read("SetLevelCommand", "DisableCommands") == "1") { setLevel.IsChecked = true; }
            if (MyIni.Read("SetMoneyCommand", "DisableCommands") == "1") { setMoney.IsChecked = true; }
            if (MyIni.Read("SetNickCommand", "DisableCommands") == "1") { setNick.IsChecked = true; }
            if (MyIni.Read("SetPKLevelCommand", "DisableCommands") == "1") { setPkLevel.IsChecked = true; }
            if (MyIni.Read("SetPointsCommand", "DisableCommands") == "1") { setPoints.IsChecked = true; }
            if (MyIni.Read("SetResetsCommand", "DisableCommands") == "1") { setResets.IsChecked = true; }
            if (MyIni.Read("SwitchCommand", "DisableCommands") == "1") { switchCMD.IsChecked = true; }
            if (MyIni.Read("UnBanAccCommand", "DisableCommands") == "1") { unBanAcc.IsChecked = true; }
            if (MyIni.Read("UnBanCharCommand", "DisableCommands") == "1") { unBanChar.IsChecked = true; }
            if (MyIni.Read("AutoTransferCommand", "DisableCommands") == "1") { autotransfer.IsChecked = true; }
            if (MyIni.Read("CancelCommand", "DisableCommands") == "1") { cancel.IsChecked = true; }
            if (MyIni.Read("ConfirmCommand", "DisableCommands") == "1") { confirm.IsChecked = true; }
            if (MyIni.Read("ForceMathEventCommand", "DisableCommands") == "1") { forceMathEvent.IsChecked = true; }
            if (MyIni.Read("AddCommand", "DisableCommands") == "1") { add.IsChecked = true; }
            if (MyIni.Read("AuthCommand", "DisableCommands") == "1") { auth.IsChecked = true; }
            if (MyIni.Read("BalanceCommand", "DisableCommands") == "1") { balance.IsChecked = true; }
            if (MyIni.Read("BuyItemCommand", "DisableCommands") == "1") { buyItem.IsChecked = true; }
            if (MyIni.Read("DeAuthCommand", "DisableCommands") == "1") { deAuth.IsChecked = true; }
            if (MyIni.Read("InfoCommand", "DisableCommands") == "1") { info.IsChecked = true; }
            if (MyIni.Read("ItemInfoCommand", "DisableCommands") == "1") { itemInfo.IsChecked = true; }
            if (MyIni.Read("MarryCommand", "DisableCommands") == "1") { marry.IsChecked = true; }
            if (MyIni.Read("PayCommand", "DisableCommands") == "1") { pay.IsChecked = true; }
            if (MyIni.Read("PKClearCommand", "DisableCommands") == "1") { pkclear.IsChecked = true; }
            if (MyIni.Read("PostCommand", "DisableCommands") == "1") { post.IsChecked = true; }
            if (MyIni.Read("ResetCommand", "DisableCommands") == "1") { reset.IsChecked = true; }
            if (MyIni.Read("SelCharCommand", "DisableCommands") == "1") { selchar.IsChecked = true; }
            if (MyIni.Read("ShopCommand", "DisableCommands") == "1") { shop.IsChecked = true; }
            if (MyIni.Read("TestCommand", "DisableCommands") == "1") { test.IsChecked = true; }
            if (MyIni.Read("TopResetCommand", "DisableCommands") == "1") { topreset.IsChecked = true; }
            if (MyIni.Read("CrewCommand", "DisableCommands") == "1") { crew.IsChecked = true; }
            if (MyIni.Read("CrewEditCommand", "DisableCommands") == "1") { crewEdit.IsChecked = true; }
        }

        private void saveConfig()
        {
            var MyIni = new IniFile(path + @"\config.ini");


            MyIni.Write("Server", " " + sqlServer.Text.Replace("\n", ""), "SQL");
            MyIni.Write("Database", " " + sqlDb.Text.Replace("\n", ""), "SQL");
            MyIni.Write("User", " " + sqlUser.Text.Replace("\n", ""), "SQL");
            MyIni.Write("Password", " " + sqlPwd.Text.Replace("\n", ""), "SQL");
            MyIni.Write("Port", " " + sqlPort.Text.Replace("\n", ""), "SQL");

            MyIni.Write("Schema", " " + tablesSchema.Text.Replace("\n", ""), "Tables");
            MyIni.Write("Members", " " + tablesMembers.Text.Replace("\n", ""), "Tables");
            MyIni.Write("Stats", " " + tablesStats.Text.Replace("\n", ""), "Tables");
            MyIni.Write("Accounts", " " + tablesAccounts.Text.Replace("\n", ""), "Tables");
            MyIni.Write("Characters", " " + tablesCharacters.Text.Replace("\n", ""), "Tables");

            MyIni.Write("MembersID", " " + membersID.Text.Replace("\n", ""), "Members");
            MyIni.Write("MembersPassword", " " + membersPassword.Text.Replace("\n", ""), "Members");
            MyIni.Write("MembersName", " " + membersName.Text.Replace("\n", ""), "Members");
            MyIni.Write("MembersPhone", " " + membersPhone.Text.Replace("\n", ""), "Members");
            MyIni.Write("MembersMail", " " + membersMail.Text.Replace("\n", ""), "Members");

            MyIni.Write("StatsMembersID", " " + statsMembersID.Text.Replace("\n", ""), "Stats");
            MyIni.Write("ConnectionStatus", " " + connectionStatus.Text.Replace("\n", ""), "Stats");
            MyIni.Write("ServerName", " " + serverName.Text.Replace("\n", ""), "Stats");
            MyIni.Write("IP", " " + IP.Text.Replace("\n", ""), "Stats");
            MyIni.Write("LastConnection", " " + lastConnection.Text.Replace("\n", ""), "Stats");
            MyIni.Write("LastDisconnect", " " + lastDisconnect.Text.Replace("\n", ""), "Stats");
            MyIni.Write("OnlineHours", " " + onlineHours.Text.Replace("\n", ""), "Stats");

            MyIni.Write("Id", " " + ID.Text.Replace("\n", ""), "Accounts");
            MyIni.Write("FirstCharacter", " " + firstCharacter.Text.Replace("\n", ""), "Accounts");
            MyIni.Write("SecondCharacter", " " + secondsCharacter.Text.Replace("\n", ""), "Accounts");
            MyIni.Write("ThirdCharacter", " " + thirdCharacter.Text.Replace("\n", ""), "Accounts");
            MyIni.Write("ForthCharacter", " " + forthCharacter.Text.Replace("\n", ""), "Accounts");
            MyIni.Write("FifthCharacter", " " + fifthCharacter.Text.Replace("\n", ""), "Accounts");

            MyIni.Write("AccountID", " " + accountID.Text.Replace("\n", ""), "Character");
            MyIni.Write("CName", " " + cName.Text.Replace("\n", ""), "Character");
            MyIni.Write("CLevel", " " + cLevel.Text.Replace("\n", ""), "Character");
            MyIni.Write("Class", " " + cClass.Text.Replace("\n", ""), "Character");
            MyIni.Write("Strength", " " + strength.Text.Replace("\n", ""), "Character");
            MyIni.Write("Dexterity", " " + dexterity.Text.Replace("\n", ""), "Character");
            MyIni.Write("Vitality", " " + vitality.Text.Replace("\n", ""), "Character");
            MyIni.Write("Energy", " " + energy.Text.Replace("\n", ""), "Character");
            MyIni.Write("Command", " " + command.Text.Replace("\n", ""), "Character");
            MyIni.Write("LevelUpPoints", " " + levelUpPoints.Text.Replace("\n", ""), "Character");
            MyIni.Write("Inventory", " " + inventory.Text.Replace("\n", ""), "Character");
            MyIni.Write("Money", " " + money.Text.Replace("\n", ""), "Character");
            MyIni.Write("MaxLife", " " + maxLife.Text.Replace("\n", ""), "Character");
            MyIni.Write("MapNumber", " " + mapNumber.Text.Replace("\n", ""), "Character");
            MyIni.Write("MapX", " " + mapX.Text.Replace("\n", ""), "Character");
            MyIni.Write("MapY", " " + mapY.Text.Replace("\n", ""), "Character");
            MyIni.Write("PkCount", " " + PkCount.Text.Replace("\n", ""), "Character");
            MyIni.Write("PkLevel", " " + PkLevel.Text.Replace("\n", ""), "Character");
            MyIni.Write("CtlCode", " " + ctlCode.Text.Replace("\n", ""), "Character");
            MyIni.Write("Resets", " " + resets.Text.Replace("\n", ""), "Character");
            MyIni.Write("Married", " " + married.Text.Replace("\n", ""), "Character");
            MyIni.Write("MarryName", " " + marryName.Text.Replace("\n", ""), "Character");

            MyIni.Write("ServName", " " + servName.Text.Replace("\n", ""), "Information");
            MyIni.Write("SiteDomain", " " + siteDomain.Text.Replace("\n", ""), "Information");
            MyIni.Write("IP", " " + serverIP.Text.Replace("\n", ""), "Information");
            MyIni.Write("ServerImage", " " + serverImage.Text.Replace("\n", ""), "Information");
            MyIni.Write("PkClearCost", " " + pkClearCost.Text.Replace("\n", ""), "Information");
            MyIni.Write("PkFirstMurderer", " " + pkFirstMurderer.Text.Replace("\n", ""), "Information");
            MyIni.Write("PkFirstHero", " " + pkFirstHero.Text.Replace("\n", ""), "Information");
            MyIni.Write("ResetLevel", " " + resetLevel.Text.Replace("\n", ""), "Information");
            MyIni.Write("FullStat", " " + fullStat.Text.Replace("\n", ""), "Information");
            MyIni.Write("Prefix", " " + prefix.Text.Replace("\n", ""), "Information");
            MyIni.Write("PkTopHero", " " + pkTopHero.Text.Replace("\n", ""), "Information");
            MyIni.Write("PkTopMurderer", " " + pkTopMurderer.Text.Replace("\n", ""), "Information");

            MyIni.Write("CurrencyName", " " + currencyName.Text.Replace("\n", ""), "Discord");
            MyIni.Write("CommandsChannel", " " + commandsChannel.Text.Replace("\n", ""), "Discord");
            MyIni.Write("AdminCommandsChannel", " " + adminsCommandChannel.Text.Replace("\n", ""), "Discord");
            MyIni.Write("CommunicationChannel", " " + communicationChannel.Text.Replace("\n", ""), "Discord");
            MyIni.Write("LevelUpChannel", " " + levelupChannel.Text.Replace("\n", ""), "Discord");
            MyIni.Write("SpamChannel", " " + spamChannel.Text.Replace("\n", ""), "Discord");
            MyIni.Write("ModerationRoles", " " + moderationRoles.Text.Replace("\n", ""), "Discord");
            MyIni.Write("DiscordHighModerationRoles", " " + discordHighModerationRoles.Text.Replace("\n", ""), "Discord");
            MyIni.Write("AutoTransferCategory", " " + autoTransferCategory.Text.Replace("\n", ""), "Discord");
            MyIni.Write("AutoTransferInstructionsChannel", " " + autoTransferInstructionsChannel.Text.Replace("\n", ""), "Discord");

            MyIni.Write("EventsChannel", " " + eventsChannel.Text.Replace("\n", ""), "DiscordEvents");
            MyIni.Write("AutoMathEvent", " " + autoMathEvent.Text.Replace("\n", ""), "DiscordEvents");
            MyIni.Write("AutoMathEventAnswers", " " + autoMathEventAnswers.Text.Replace("\n", ""), "DiscordEvents");
            MyIni.Write("AutoMathEventRewards", " " + autoMathEventRewards.Text.Replace("\n", ""), "DiscordEvents");
            MyIni.Write("AutoTriviaEvent", " " + autoTriviaEvent.Text.Replace("\n", ""), "DiscordEvents");
            MyIni.Write("AutoTriviaEventAnswer", " " + autoTriviaEventAnswer.Text.Replace("\n", ""), "DiscordEvents");

            MyIni.Write("ServerEmoji", " " + serverEmoji.Text.Replace("\n", ""), "DiscordEmojis");
            MyIni.Write("KnightEmoji", " " + knightEmoji.Text.Replace("\n", ""), "DiscordEmojis");
            MyIni.Write("ElfEmoji", " " + elfEmoji.Text.Replace("\n", ""), "DiscordEmojis");
            MyIni.Write("WizardEmoji", " " + wizardEmoji.Text.Replace("\n", ""), "DiscordEmojis");
            MyIni.Write("LordEmoji", " " + lordEmoji.Text.Replace("\n", ""), "DiscordEmojis");
            MyIni.Write("GladiatorEmoji", " " + gladiatorEmoji.Text.Replace("\n", ""), "DiscordEmojis");
            MyIni.Write("RageFighterEmoji", " " + rfEmoji.Text.Replace("\n", ""), "DiscordEmojis");
            MyIni.Write("SummonerEmoji", " " + summEmoji.Text.Replace("\n", ""), "DiscordEmojis");

            MyIni.Write("Categories", " " + categories.Text.Replace("\n", ""), "DiscordShop");

            if (addBal.IsChecked == true) { MyIni.Write("AddBalanceCommand", "1", "DisableCommands"); } else { MyIni.Write("AddBalanceCommand", "0", "DisableCommands"); }
            if (addItem.IsChecked == true) { MyIni.Write("AddItemCommand", "1", "DisableCommands"); } else { MyIni.Write("AddItemCommand", "0", "DisableCommands"); }
            if (adminAdd.IsChecked == true) { MyIni.Write("AdminAddCommand", "1", "DisableCommands"); } else { MyIni.Write("AdminAddCommand", "0", "DisableCommands"); }
            if (banAcc.IsChecked == true) { MyIni.Write("BanAccCommand", "1", "DisableCommands"); } else { MyIni.Write("BanAccCommand", "0", "DisableCommands"); }
            if (banChar.IsChecked == true) { MyIni.Write("BanCharCommand", "1", "DisableCommands"); } else { MyIni.Write("BanCharCommand", "0", "DisableCommands"); }
            if (dc.IsChecked == true) { MyIni.Write("DCCommand", "1", "DisableCommands"); } else { MyIni.Write("DCCommand", "0", "DisableCommands"); }
            if (dcAcc.IsChecked == true) { MyIni.Write("DCAccCommand", "1", "DisableCommands"); } else { MyIni.Write("DCAccCommand", "0", "DisableCommands"); }
            if (editItem.IsChecked == true) { MyIni.Write("EditItemCommand", "1", "DisableCommands"); } else { MyIni.Write("EditItemCommand", "0", "DisableCommands"); }
            if (forceMarry.IsChecked == true) { MyIni.Write("ForceMarryCommand", "1", "DisableCommands"); } else { MyIni.Write("ForceMarryCommand", "0", "DisableCommands"); }
            if (notice.IsChecked == true) { MyIni.Write("NoticeCommand", "1", "DisableCommands"); } else { MyIni.Write("NoticeCommand", "0", "DisableCommands"); }
            if (removeItem.IsChecked == true) { MyIni.Write("RemoveItemCommand", "1", "DisableCommands"); } else { MyIni.Write("RemoveItemCommand", "0", "DisableCommands"); }
            if (setBal.IsChecked == true) { MyIni.Write("SetBalanceCommand", "1", "DisableCommands"); } else { MyIni.Write("SetBalanceCommand", "0", "DisableCommands"); }
            if (setClass.IsChecked == true) { MyIni.Write("SetClassCommand", "1", "DisableCommands"); } else { MyIni.Write("SetClassCommand", "0", "DisableCommands"); }
            if (setFull.IsChecked == true) { MyIni.Write("SetFullCommand", "1", "DisableCommands"); } else { MyIni.Write("SetFullCommand", "0", "DisableCommands"); }
            if (setLevel.IsChecked == true) { MyIni.Write("SetLevelCommand", "1", "DisableCommands"); } else { MyIni.Write("SetLevelCommand", "0", "DisableCommands"); }
            if (setMoney.IsChecked == true) { MyIni.Write("SetMoneyCommand", "1", "DisableCommands"); } else { MyIni.Write("SetMoneyCommand", "0", "DisableCommands"); }
            if (setNick.IsChecked == true) { MyIni.Write("SetNickCommand", "1", "DisableCommands"); } else { MyIni.Write("SetNickCommand", "0", "DisableCommands"); }
            if (setPkLevel.IsChecked == true) { MyIni.Write("SetPKLevelCommand", "1", "DisableCommands"); } else { MyIni.Write("SetPKLevelCommand", "0", "DisableCommands"); }
            if (setPoints.IsChecked == true) { MyIni.Write("SetPointsCommand", "1", "DisableCommands"); } else { MyIni.Write("SetPointsCommand", "0", "DisableCommands"); }
            if (setResets.IsChecked == true) { MyIni.Write("SetResetsCommand", "1", "DisableCommands"); } else { MyIni.Write("SetResetsCommand", "0", "DisableCommands"); }
            if (switchCMD.IsChecked == true) { MyIni.Write("SwitchCommand", "1", "DisableCommands"); } else { MyIni.Write("SwitchCommand", "0", "DisableCommands"); }
            if (unBanAcc.IsChecked == true) { MyIni.Write("UnBanAccCommand", "1", "DisableCommands"); } else { MyIni.Write("UnBanAccCommand", "0", "DisableCommands"); }
            if (unBanChar.IsChecked == true) { MyIni.Write("UnBanCharCommand", "1", "DisableCommands"); } else { MyIni.Write("UnBanCharCommand", "0", "DisableCommands"); }
            if (autotransfer.IsChecked == true) { MyIni.Write("AutoTransferCommand", "1", "DisableCommands"); } else { MyIni.Write("AutoTransferCommand", "0", "DisableCommands"); }
            if (cancel.IsChecked == true) { MyIni.Write("CancelCommand", "1", "DisableCommands"); } else { MyIni.Write("CancelCommand", "0", "DisableCommands"); }
            if (confirm.IsChecked == true) { MyIni.Write("ConfirmCommand", "1", "DisableCommands"); } else { MyIni.Write("ConfirmCommand", "0", "DisableCommands"); }
            if (forceMathEvent.IsChecked == true) { MyIni.Write("ForceMathEventCommand", "1", "DisableCommands"); } else { MyIni.Write("ForceMathEventCommand", "0", "DisableCommands"); }
            if (add.IsChecked == true) { MyIni.Write("AddCommand", "1", "DisableCommands"); } else { MyIni.Write("AddCommand", "0", "DisableCommands"); }
            if (auth.IsChecked == true) { MyIni.Write("AuthCommand", "1", "DisableCommands"); } else { MyIni.Write("AuthCommand", "0", "DisableCommands"); }
            if (balance.IsChecked == true) { MyIni.Write("BalanceCommand", "1", "DisableCommands"); } else { MyIni.Write("BalanceCommand", "0", "DisableCommands"); }
            if (buyItem.IsChecked == true) { MyIni.Write("BuyItemCommand", "1", "DisableCommands"); } else { MyIni.Write("BuyItemCommand", "0", "DisableCommands"); }
            if (deAuth.IsChecked == true) { MyIni.Write("DeAuthCommand", "1", "DisableCommands"); } else { MyIni.Write("DeAuthCommand", "0", "DisableCommands"); }
            if (info.IsChecked == true) { MyIni.Write("InfoCommand", "1", "DisableCommands"); } else { MyIni.Write("InfoCommand", "0", "DisableCommands"); }
            if (itemInfo.IsChecked == true) { MyIni.Write("ItemInfoCommand", "1", "DisableCommands"); } else { MyIni.Write("ItemInfoCommand", "0", "DisableCommands"); }
            if (marry.IsChecked == true) { MyIni.Write("MarryCommand", "1", "DisableCommands"); } else { MyIni.Write("MarryCommand", "0", "DisableCommands"); }
            if (pay.IsChecked == true) { MyIni.Write("PayCommand", "1", "DisableCommands"); } else { MyIni.Write("PayCommand", "0", "DisableCommands"); }
            if (pkclear.IsChecked == true) { MyIni.Write("PKClearCommand", "1", "DisableCommands"); } else { MyIni.Write("PKClearCommand", "0", "DisableCommands"); }
            if (post.IsChecked == true) { MyIni.Write("PostCommand", "1", "DisableCommands"); } else { MyIni.Write("PostCommand", "0", "DisableCommands"); }
            if (reset.IsChecked == true) { MyIni.Write("ResetCommand", "1", "DisableCommands"); } else { MyIni.Write("ResetCommand", "0", "DisableCommands"); }
            if (selchar.IsChecked == true) { MyIni.Write("SelCharCommand", "1", "DisableCommands"); } else { MyIni.Write("SelCharCommand", "0", "DisableCommands"); }
            if (shop.IsChecked == true) { MyIni.Write("ShopCommand", "1", "DisableCommands"); } else { MyIni.Write("ShopCommand", "0", "DisableCommands"); }
            if (test.IsChecked == true) { MyIni.Write("TestCommand", "1", "DisableCommands"); } else { MyIni.Write("TestCommand", "0", "DisableCommands"); }
            if (topreset.IsChecked == true) { MyIni.Write("TopResetCommand", "1", "DisableCommands"); } else { MyIni.Write("TopResetCommand", "0", "DisableCommands"); }
            if (crewEdit.IsChecked == true) { MyIni.Write("CrewEditCommand", "1", "DisableCommands"); } else { MyIni.Write("CrewEditCommand", "0", "DisableCommands"); }
            if (crew.IsChecked == true) { MyIni.Write("CrewCommand", "1", "DisableCommands"); } else { MyIni.Write("CrewCommand", "0", "DisableCommands"); }

            createNotification(INFORMATION, "Config has been updated.");
        }

        private void choose_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (categ.SelectionBoxItem == null) return;
            if (categ.SelectionBoxItem.ToString() == "SQL")
            {
                sqlConfig.Visibility = Visibility.Visible;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Tables")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Visible;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Members")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Visible;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Stats")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Visible;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Accounts")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Visible;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Character")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Visible;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Information")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Visible;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Discord")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Visible;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Discord Events")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Visible;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Discord Shop")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Visible;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Disable Commands")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Visible;
                discordEmojiConfig.Visibility = Visibility.Hidden;
            }
            else if (categ.SelectionBoxItem.ToString() == "Discord Emojis")
            {
                sqlConfig.Visibility = Visibility.Hidden;
                tablesConfig.Visibility = Visibility.Hidden;
                membersConfig.Visibility = Visibility.Hidden;
                statsConfig.Visibility = Visibility.Hidden;
                accountsConfig.Visibility = Visibility.Hidden;
                characterConfig.Visibility = Visibility.Hidden;
                informationConfig.Visibility = Visibility.Hidden;
                discordConfig.Visibility = Visibility.Hidden;
                discordEventsConfig.Visibility = Visibility.Hidden;
                discordShopConfig.Visibility = Visibility.Hidden;
                disableCommands.Visibility = Visibility.Hidden;
                discordEmojiConfig.Visibility = Visibility.Visible;
            }
        }

        private void save_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {

            MessageBoxResult dr = MessageBox.Show("Are you sure you want to save the config?", "Save Config", MessageBoxButton.YesNo, MessageBoxImage.Warning);
            if (dr == MessageBoxResult.Yes)
            {
                saveConfig();
            }
        }

        private void undo_MouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            MessageBoxResult dr = MessageBox.Show("Are you sure you want to reset the config?", "Reset Config", MessageBoxButton.YesNo, MessageBoxImage.Warning);
            if (dr == MessageBoxResult.Yes)
            {
                readConfig(configBackupFile);
                MessageBox.Show("If you want to keep the default values, press the save button", "Reset Config", MessageBoxButton.YesNo, MessageBoxImage.Information);
            }
        }

        #endregion

        #region ImageBrowser Functions

        private void imageList_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (imageList.SelectedItem == null || imageList.SelectedItem.ToString() == "") return;
            if (directory.SelectedItem == null || directory.SelectedItem.ToString() == "") return;

            string imagePath;
            if (directory.SelectedItem.ToString() == "General Images")
            {
                imagePath = generalImagesPath + imageList.SelectedItem.ToString();
            }
            else if (directory.SelectedItem.ToString() == "Items Images")
            {
                imagePath = itemImagesPath + imageList.SelectedItem.ToString();
            }
            else if (directory.SelectedItem.ToString() == "Class Images")
            {
                imagePath = classImagesPath + imageList.SelectedItem.ToString();
            }
            else return;

            if (imagePreview.Source != null) imagePreview.Source = null;

            BitmapImage image = new BitmapImage();
            var stream = File.OpenRead(imagePath);
            image.BeginInit();
            image.CacheOption = BitmapCacheOption.OnLoad;
            image.StreamSource = stream;
            image.EndInit();
            imagePreview.Source = image;
            stream.Close();
            stream.Dispose();
        }

        private void getImages_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            getImagesTolv();
        }

        private void addImage_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            addImageToFolder();
            getImagesTolv();
        }

        private void removeImage_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            removeImageFromFolder();
            getImagesTolv();
        }

        private void renameImage_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            if (imageList.SelectedItem == null || imageList.SelectedItem.ToString() == "") return;
            if (directory.SelectedItem == null || directory.SelectedItem.ToString() == "") return;
            if (directory.SelectedItem.ToString() != "Items Images") return;

            string imagePath = imagePath = itemImagesPath + imageList.SelectedItem.ToString();
            /*
            RenameFile renameFileForm = new RenameFile();
            renameFileForm.Owner = this;
            renameFileForm.oldFileName.Text = System.IO.Path.GetFileNameWithoutExtension(imagePath);
            renameFileForm.oldFilePath.Text = imagePath;
            renameFileForm.Show();
            */
        }

        private void replaceImage_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            replaceImageInFolder();
        }

        private void listImages(string dir)
        {
            string[] images = Directory.GetFiles(dir);

            foreach (string image in images)
            {
                imageList.Items.Add(image.Replace(dir, ""));
            }
        }

        private void removeImageFromFolder()
        {
            if (imageList.SelectedItem == null || imageList.SelectedItem.ToString() == "") return;
            if (directory.SelectedItem == null || directory.SelectedItem.ToString() == "") return;

            string imagePath = "";
            if (directory.SelectedItem.ToString() == "Items Images")
            {
                imagePath = itemImagesPath + imageList.SelectedItem.ToString();
            }
            else return;

            MessageBoxResult dr = MessageBox.Show("Are you sure you want to delete this image?", "Image Removal", MessageBoxButton.YesNo, MessageBoxImage.Warning);
            if (dr == MessageBoxResult.No) return;

            imagePreview.Source = null;

            File.Delete(imagePath);
        }

        private void addImageToFolder()
        {
            if (directory.SelectedItem == null || directory.SelectedItem.ToString() == "")
            {
                MessageBox.Show("Choose a directory before adding an image", "No Directory", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            if (directory.SelectedItem.ToString() != "Items Images") return;

            Microsoft.Win32.OpenFileDialog dlg = new Microsoft.Win32.OpenFileDialog();
            dlg.DefaultExt = ".png";
            dlg.Filter = "JPEG Files (*.jpeg)|*.jpeg|PNG Files (*.png)|*.png|JPG Files (*.jpg)|*.jpg";

            Nullable<bool> result = dlg.ShowDialog();

            if (result == true)
            {
                string filename = dlg.FileName;
                File.Copy(filename, itemImagesPath + System.IO.Path.GetFileName(filename));
            }
        }

        private void replaceImageInFolder()
        {
            if (imageList.SelectedItem == null || imageList.SelectedItem.ToString() == "") return;
            if (directory.SelectedItem == null || directory.SelectedItem.ToString() == "")
            {
                MessageBox.Show("Choose a directory before adding an image", "No Directory", MessageBoxButton.OK, MessageBoxImage.Error);
                return;
            }

            string imagePath = "";
            if (directory.SelectedItem.ToString() == "General Images")
            {
                imagePath = generalImagesPath + imageList.SelectedItem.ToString();
            }
            else if (directory.SelectedItem.ToString() == "Items Images")
            {
                imagePath = itemImagesPath + imageList.SelectedItem.ToString();
            }
            else if (directory.SelectedItem.ToString() == "Class Images")
            {
                imagePath = classImagesPath + imageList.SelectedItem.ToString();
            }

            Microsoft.Win32.OpenFileDialog dlg = new Microsoft.Win32.OpenFileDialog();


            string ext = System.IO.Path.GetExtension(imagePath);
            if (ext == ".jpg")
            {
                dlg.DefaultExt = ".jpg";
                dlg.Filter = "JPG Files (*.jpg)|*.jpg";
            }
            else if (ext == ".png")
            {
                dlg.DefaultExt = ".png";
                dlg.Filter = "PNG Files (*.png)|*.png";
            }
            else if (ext == ".jpeg")
            {
                dlg.DefaultExt = ".jpeg";
                dlg.Filter = "JPEG Files (*.jpeg)|*.jpeg";
            }
            else return;

            Nullable<bool> result = dlg.ShowDialog();

            if (result == true)
            {
                File.Delete(imagePath);

                string filename = dlg.FileName;
                File.Copy(filename, imagePath);
                getImagesTolv();

                BitmapImage image = new BitmapImage();
                var stream = File.OpenRead(imagePath);
                image.BeginInit();
                image.CacheOption = BitmapCacheOption.OnLoad;
                image.StreamSource = stream;
                image.EndInit();
                imagePreview.Source = image;
                stream.Close();
                stream.Dispose();
            }
        }

        public void getImagesTolv()
        {
            if (directory.SelectedItem == null || directory.SelectedItem.ToString() == "") return;

            if (directory.SelectedItem.ToString() == "General Images")
            {
                addImage.IsEnabled = false;
                renameImage.IsEnabled = false;
                removeImage.IsEnabled = false;

                imageList.Items.Clear();
                listImages(generalImagesPath);
            }
            else if (directory.SelectedItem.ToString() == "Items Images")
            {
                addImage.IsEnabled = true;
                renameImage.IsEnabled = true;
                removeImage.IsEnabled = true;

                imageList.Items.Clear();
                listImages(itemImagesPath);
            }
            else if (directory.SelectedItem.ToString() == "Class Images")
            {
                addImage.IsEnabled = false;
                renameImage.IsEnabled = false;
                removeImage.IsEnabled = false;

                imageList.Items.Clear();
                listImages(classImagesPath);
            }
        }

        #endregion

        #region Notifications

        private void createNotification(int kind, string notifMessage)
		{
            notifMessage = checkString(notifMessage);

            ListViewItem newNotification = new ListViewItem();
            newNotification.Width = 350;
            newNotification.HorizontalAlignment = HorizontalAlignment.Left;

            StackPanel sp = new StackPanel();
            sp.Orientation = Orientation.Horizontal;
            sp.HorizontalAlignment = HorizontalAlignment.Left;
            sp.Width = 350;

            Button notifIcon = new Button();
            notifIcon.Style = this.FindResource("MaterialDesignFloatingActionMiniDarkButton") as Style;
            notifIcon.Background = Brushes.Transparent;
            notifIcon.BorderBrush = Brushes.Transparent;

            MaterialDesignThemes.Wpf.PackIcon icon = new MaterialDesignThemes.Wpf.PackIcon();
            switch (kind)
            {
                case 1: 
                    icon.Kind = MaterialDesignThemes.Wpf.PackIconKind.Alert;
                    break;
                case 2:
                    icon.Kind = MaterialDesignThemes.Wpf.PackIconKind.CloseOctagon;
                    break;
                default:
                    icon.Kind = MaterialDesignThemes.Wpf.PackIconKind.Information;
                    break;
            }
            icon.Width = 30;
            icon.Height = 30;

            notifIcon.Content = icon;

            TextBlock message = new TextBlock();
            TextBlock timeSince = new TextBlock();

            message.Margin = new Thickness(10,0,0,0);
            message.VerticalAlignment = VerticalAlignment.Center;
            message.Text = notifMessage;

            timeSince.Margin = new Thickness(10, 0, 0, 0);
            timeSince.Text = DateTime.Now.ToShortTimeString();
            timeSince.VerticalAlignment = VerticalAlignment.Center;
            timeSince.HorizontalAlignment = HorizontalAlignment.Right;
			timeSince.Foreground = Brushes.DarkGray;

            sp.Children.Add(notifIcon);
            sp.Children.Add(message);
            sp.Children.Add(timeSince);

            newNotification.Content = sp;

            addToBadge();

            notifications.Items.Insert(0, newNotification);
        }

        private string checkString(string msg)
		{
            int bestIndex = msg.Length;
            int half = 40;
            if (msg.Length > half)
			{
                for(int i = 0; i < msg.Length - 1; i++)
				{
                    if(msg[i] == ' ')
					{
                        if(Math.Abs(half - i) < Math.Abs(half - bestIndex))
						{
                            bestIndex = i;
						}
					}
				}
                string firstHalf, secondHalf;
                firstHalf = msg.Substring(0, bestIndex);
                secondHalf = msg.Substring(bestIndex, msg.Length - bestIndex);
                msg = firstHalf + '\n' + secondHalf;
			}
            return msg;
		}

        private void addToBadge()
		{
            string badgeNumber = notiBadge.Badge.ToString();
            if(badgeNumber != "")
			{
                int badgeNumberInt = Int32.Parse(badgeNumber);
                badgeNumberInt++;
                notiBadge.Badge = badgeNumberInt.ToString();
            }
			else
			{
                notiBadge.Badge = "1";
			}
        }

        private void PopupBox_PreviewMouseLeftButtonDown(object sender, MouseButtonEventArgs e)
        {
            notiBadge.Badge = "";
        }

        #endregion

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            try
            {
                foreach (var process in Process.GetProcessesByName("start"))
                {
                    process.Kill();
                }
                Process.GetProcessById(processID).Kill();
            }
            catch (Exception ex)
            {
                Console.WriteLine("{0} Exception caught.", ex.Message);
            }

            Environment.Exit(1);
        }


	}
}
