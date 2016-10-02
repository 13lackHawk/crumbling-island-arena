var hallOfFamePlayers = {
    "FFA_FOUR": 0,
    "DUEL": 1,
    "TWO_TEAMS": 3
};

function HallOfFameChanged(data) {
    if (!data) {
        return;
    }

    var parent = $("#HallOfFamePlayers");

    for (var mode in data) {
        var players = data[mode];

        if (hallOfFamePlayers[mode] == 0) {
            continue;
        }

        for (var i = 0; i < hallOfFamePlayers[mode] && i < players.length; i++) {
            var player = players[i];

            var playerPanel = $.CreatePanel("Panel", $("#RankedTopPlayers"), "");
            playerPanel.AddClass("RankedSeasonCongratulationsPlayer");

            var avatar = $.CreatePanel("DOTAAvatarImage", playerPanel, "");
            avatar.steamid = player.steamId64.toString();
            avatar.AddClass("RankedSeasonCongratulationsPlayerAvatar");

            var modePanel = $.CreatePanel("Panel", avatar, "");
            modePanel.AddClass("RankedMode");

            var modeName = $.CreatePanel("Label", modePanel, "");
            modeName.text = $.Localize("RankMode_" + mode).toUpperCase();
            modeName.AddClass("RankedModeName");

            CreateRankPanelSmall(playerPanel, player, "HallOfFameRank");
        }
    }
}

function UpdateTime(label, seasonEndTime) {
    $.Schedule(1, function() {
        UpdateTime(label, seasonEndTime);
    });

    label.text = moment.unix(seasonEndTime).locale($.Localize("locale")).fromNow();
}

function RankedInfoChanged(info) {
    HallOfFameChanged(info.topPlayers);

    var seasonRewardToShow = info.currentSeason;

    $("#RankedRewardImage").BLoadLayoutSnippet("reward" + seasonRewardToShow);
    $("#RankedRewardText").SetDialogVariableInt("season", seasonRewardToShow + 1);
    $("#RankedSeasonEndHeader").SetDialogVariableInt("season", info.currentSeason + 1);

    var parent = $("#RankedSeasonCongratulationsPlayers");

    for (var mode in info.previousTopPlayers) {
        var players = info.previousTopPlayers[mode];

        if (hallOfFamePlayers[mode] == 0) {
            continue;
        }

        for (var i = 0; i < hallOfFamePlayers[mode] && i < players.length; i++) {
            var player = players[i];

            var playerPanel = $.CreatePanel("Panel", parent, "");
            playerPanel.AddClass("RankedSeasonCongratulationsPlayer");

            var avatar = $.CreatePanel("DOTAAvatarImage", playerPanel, "");
            avatar.steamid = player.steamId64.toString();
            avatar.AddClass("RankedSeasonCongratulationsPlayerAvatar");

            var icon = $.CreatePanel("Panel", playerPanel, "");
            icon.AddClass("TopPlayerIcon");
            icon.AddClass("RankedSeasonCongratulationsPlayerIcon");
        }
    }

    UpdateTime($("#RankedSeasonEndText"), info.seasonEndTime);
    $("#RankedInfoLoading").AddClass("Hidden");
    $("#RankedInfoContainer").RemoveClass("Hidden");
}

function PassTopChanged(top) {
    var players = $("#PassLeaderboards");

    $("#PassInfoLoading").DeleteAsync(0);

    for (var player of top) {
        var avatar = $.CreatePanel("DOTAAvatarImage", players, "");
        avatar.steamid = player.steamId64.toString();
        avatar.AddClass("PassPlayer");
        avatar.BCreateChildren("<DOTAScenePanel class='EliteEffect' map='maps/scenes/vr_theater/vr_background_particle.vmap'/>");

        var level = $.CreatePanel("Label", avatar, "");
        level.AddClass("EliteText");
        level.AddClass("RankLabel");
        level.text = Math.floor(parseInt(player.experience) / 1000) + 1;
    }
}

$.AsyncWebRequest("http://138.68.73.132:3637/ranks/info", { type: "GET", 
    success: function( data ) {
        var info = JSON.parse(data);
        RankedInfoChanged(info);
    }
});

$.AsyncWebRequest("http://138.68.73.132:3637/pass/top", { type: "GET", 
    success: function( data ) {
        var info = JSON.parse(data);
        PassTopChanged(info);
    }
});

var tips = 6;
var tip = Math.floor(Math.random() * (tips + 1));

$("#GameTipText").SetDialogVariable("tip", $.Localize("GameTip" + tip));
$("#GameTipText").text = $.Localize("GameTip", $("#GameTipText"));

var hittestBlocker = $.GetContextPanel().GetParent().FindChild("SidebarAndBattleCupLayoutContainer");

if (hittestBlocker) {
    hittestBlocker.hittest = false;
    hittestBlocker.hittestchildren = false;
}

GameEvents.Subscribe("game_rules_state_change", function(data) {
    if (Game.GameStateIsAfter(DOTA_GameState.DOTA_GAMERULES_STATE_WAIT_FOR_PLAYERS_TO_LOAD)) {
        //$("#PassInfo").SetHasClass("Hidden", true);
        //$("#RankedInfo").SetHasClass("Hidden", true);
        //$("#GameTip").SetHasClass("Hidden", true);
    }
});