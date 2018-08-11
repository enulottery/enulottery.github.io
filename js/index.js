let myIronman;
let utcRoundEnd;

const price = 100000;
const GAME_CONTRACT = "enulotteries";
const NODE_URL = "https://rpc.enu.one";
const HISTORY_URL = "https://api.enumivo.com";

var network = {
    blockchain: 'enu',
    host: 'rpc.enu.one',
    port: 443,
    protocol: 'https',
    chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
};

async function init() {

    const randomSlot = Math.round(Math.random() * 9999 + 1);

    document.getElementById("slot").value = randomSlot;
    document.getElementById("size").value = 1;

    var enu = Enu({
        httpEndpoint: NODE_URL,
        chainId: network.chainId,
        keyProvider: null
    });

    const gameInfo = (await enu.getTableRows(true, GAME_CONTRACT, GAME_CONTRACT, "info")).rows[0];
    let lastInfo = (await enu.getTableRows(true, GAME_CONTRACT, GAME_CONTRACT, "lastinfo")).rows[0];

    let currentPot = gameInfo.pot;
    currentPot /= 10000;
    currentPot = currentPot.toFixed(2);

    document.getElementById("currentId").innerHTML = "#" + gameInfo.round_id;
    document.getElementById("pot").innerHTML = currentPot;
    document.getElementById("currentRandom").innerHTML = gameInfo.random_block;

    let roundEnd = new Date(gameInfo.round_end + "Z");
    utcRoundEnd = Math.round(roundEnd.getTime() / 1000);

    const utcNow = Math.round(new Date().getTime() / 1000);

    if (utcRoundEnd < utcNow) {

        // Round ended
        if (gameInfo.has_result) {
            document.getElementById("timeLeft").innerHTML = "Round ended. The lucky number is: " + gameInfo.round_result;
        } else {
            document.getElementById("timeLeft").innerHTML = "Round ended. Waiting for the result";
        }
    } else {
        // Game round live
        setTimeout(refreshTimer, 0);
    }

    if (lastInfo.round_id > 0) {
        document.getElementById("lastId").innerHTML = "#" + lastInfo.round_id;
        document.getElementById("lastEndTime").innerHTML = lastInfo.round_end;
        document.getElementById("lastRandom").innerHTML = lastInfo.random_block;
        document.getElementById("lastResult").innerHTML = lastInfo.round_result;
    }

    loadRecents();

    initIronman();
}

async function loadRecents() {

    var enu = Enu({
        httpEndpoint: HISTORY_URL,
        chainId: network.chainId,
        keyProvider: null
    });

    const recentActions = (await enu.getActions(GAME_CONTRACT, -1, -40)).actions;

    let recentPurchases = new Array();

    for (let i = recentActions.length - 1; i >= 0; i--) {
        const currentAction = recentActions[i];
        if (currentAction.action_trace.act.name == "newround")
            break;

        if (currentAction.action_trace.act.name != "transfer")
            continue;

        if (currentAction.action_trace.act.data.to != GAME_CONTRACT)
            continue;

        if (currentAction.action_trace.receipt.receiver != GAME_CONTRACT)
            continue;

        // Real record
        const currentBuyer = currentAction.action_trace.act.data.from;
        const currentSlot = Number(currentAction.action_trace.act.data.memo);

        let currentSize = currentAction.action_trace.act.data.quantity;
        currentSize = currentSize.substr(0, currentSize.indexOf(" "));
        currentSize = Number(currentSize) * 10000 / price;
        currentSize = Math.round(currentSize);

        recentPurchases.push({ buyer: currentBuyer, slot: currentSlot, size: currentSize });
    }

    // Render recent purchases to table

    document.getElementById("recentIntro").innerHTML = "The last 10 purchases in this round:";

    for (let i = 0; i < recentPurchases.length; i++) {

        let currentRow = document.createElement("tr");

        let colBuyer = document.createElement("th");
        let colSlot = document.createElement("td");
        let colSize = document.createElement("td");

        colBuyer.innerHTML = recentPurchases[i].buyer;
        colSlot.innerHTML = recentPurchases[i].slot;
        colSize.innerHTML = recentPurchases[i].size;

        currentRow.appendChild(colBuyer);
        currentRow.appendChild(colSlot);
        currentRow.appendChild(colSize);

        document.getElementById("recentTbody").appendChild(currentRow);
    }
}

function initIronman() {
    if (!myIronman) {
        myIronman = window.ironman;
        window.ironman = null;
    }
}

async function purchaseTickets() {

    let slot = document.getElementById("slot").value;
    let size = document.getElementById("size").value;

    if (isNaN(slot)) {
        showTip("Incorrect Slot", "Please input a correct slot");
        return;
    }

    if (isNaN(size)) {
        showTip("Incorrect Size", "Please input a correct size");
        return;
    }

    slot = Number(slot);
    size = Number(size);

    if (slot < 1 || slot > 10000) {
        showTip("Incorrect Slot", "Slot must be in the range 1 - 10000");
        return;
    }

    if (size <= 0) {
        showTip("Incorrect Size", "Size must be positive");
        return;
    }

    await doPurchase(slot, size);
}

async function doPurchase(slot, size) {

    const amountTransfer = (size * price / 10000).toFixed(4) + " ENU";

    initIronman();

    if (myIronman) {
        // Buy with Ironman

        let userName;
        let authority;

        try {

            const identity = await myIronman.getIdentity({
                accounts: [network]
            });

            userName = identity.accounts[0].name;
            authority = identity.accounts[0].authority;

        } catch (ex) {
            return;
        }

        const ironEnu = myIronman.enu(network, Enu, {});
        const tokenContract = await ironEnu.contract("enu.token");
        try {

            await tokenContract.transfer(userName, GAME_CONTRACT, amountTransfer, slot.toString(), {
                authorization: userName + "@" + authority
            });

            showTip("Success", "Ticket successfully purchased");

        } catch (ex) {

            showTip("Error", "Failed to buy ticket");
        }

    } else {
        // Tell user to install Ironman or use a mobile wallet

        if (isMobile()) {
            // On a phone. Tell the user to use a PC with Ironman or use TP for transfers

            document.getElementById("mobileAmount").innerHTML = amountTransfer;
            document.getElementById("mobileMemo").innerHTML = slot.toString();

            $("#mobileGuideModal").modal()
        } else {
            // On a PC. Tell the user to install Ironman or use TP

            document.getElementById("pcAmount").innerHTML = amountTransfer;
            document.getElementById("pcMemo").innerHTML = slot.toString();

            $("#pcGuideModal").modal()
        }
    }
}

async function voteForMe() {

    initIronman();

    if (!myIronman) {
        showTip("Ironman Not Found", "Please install ironman to vote for me");
        return;
    }

    var enu = Enu({
        httpEndpoint: NODE_URL,
        chainId: network.chainId,
        keyProvider: null
    });

    let userName;
    let authority;

    try {

        const identity = await myIronman.getIdentity({
            accounts: [network]
        });

        userName = identity.accounts[0].name;
        authority = identity.accounts[0].authority;
    } catch (ex) {
        return;
    }

    const acct = await enu.getAccount(userName);
    let producersVoted = acct.voter_info.producers;

    const voteFor = "xjonathanlei";

    if (producersVoted.includes(voteFor)) {

        showTip("Thank You", "You've already voted for me. Thank you!");
        return;
    } else if (producersVoted.length == 30) {

        showTip("No More Votes", "You've already voted for 30 producers!");
        return;
    }

    producersVoted.push(voteFor);
    producersVoted.sort();

    const ironEnu = myIronman.enu(network, Enu, {});

    const sysContract = await ironEnu.contract('enumivo');

    await sysContract.voteproducer(userName, "", producersVoted, { authorization: userName + "@" + authority });
}

function refreshTimer() {

    const utcNow = Math.round(new Date().getTime() / 1000);

    let totalSeconds = utcRoundEnd - utcNow;
    const seconds = totalSeconds - Math.floor(totalSeconds / 60) * 60;
    totalSeconds -= seconds;
    const minutes = (totalSeconds - Math.floor(totalSeconds / 3600) * 3600) / 60;
    totalSeconds -= minutes * 60;
    const hours = totalSeconds / 3600;

    const timeStr = ("00" + hours.toString()).slice(-2) + ":" +
        ("00" + minutes.toString()).slice(-2) + ":" +
        ("00" + seconds.toString()).slice(-2);

    document.getElementById("timeLeft").innerHTML = "Round ends in " + timeStr;

    setTimeout(refreshTimer, 1000);
}

function isMobile() {
    var check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

function showTip(title, content) {

    document.getElementById("tipTitle").innerHTML = title;
    document.getElementById("tipContent").innerHTML = content;

    $("#tipModal").modal()
}