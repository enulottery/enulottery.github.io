let myIronman;
let utcRoundEnd;

var network = {
    blockchain: 'enu',
    host: 'rpc.enu.one',
    port: 443,
    protocol: 'https',
    chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
};

async function init() {

    var enu = Enu({
        httpEndpoint: "https://api.enumivo.com",
        chainId: network.chainId,
        keyProvider: null
    });

    const gameInfo = (await enu.getTableRows(true, "enulotteries", "enulotteries", "info")).rows[0];
    let lastInfo = (await enu.getTableRows(true, "enulotteries", "enulotteries", "lastinfo")).rows[0];

    let currentPot = gameInfo.pot;
    currentPot /= 1000;
    currentPot = currentPot.toFixed(2);

    document.getElementById("currentId").innerHTML = "#" + gameInfo.round_id;
    document.getElementById("pot").innerHTML = currentPot;
    document.getElementById("currentRandom").innerHTML = gameInfo.random_block;

    let roundEnd = new Date(gameInfo.round_end);
    utcRoundEnd = Math.round((roundEnd.getTime() - roundEnd.getTimezoneOffset() * 60 * 1000) / 1000);

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

    initIronman();
}

function initIronman() {
    if (!myIronman) {
        myIronman = window.ironman;
        window.ironman = null;
    }
}

function purchaseTickets() {

    let slot = document.getElementById("slot").value;
    let size = document.getElementById("size").value;

    if (isNaN(slot)) {
        alert("Please input a correct slot");
        return;
    }

    if (isNaN(size)) {
        alert("Please input a correct size");
        return;
    }

    slot = Number(slot);
    size = Number(size);

    if (slot < 1 || slot > 10000) {
        alert("Slot must be in the range 1 - 10000");
        return;
    }

    if (size <= 0) {
        alert("Size must be positive");
        return;
    }

    alert("Slot: " + slot);
    alert("Size: " + size);

    doPurchase(slot, size);
}

function doPurchase(slot, size) {

    if (myIronman) {
        // Buy with Ironman
    } else {
        // Tell user to install Ironman or use a mobile wallet
    }
}

async function voteForMe() {

    if (!myIronman) {
        alert("Please install ironman to vote for me");
        return;
    }

    var enu = Enu({
        httpEndpoint: "https://api.enumivo.com",
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
        alert("You've already voted for me. Thank you!");
        return;
    } else if (producersVoted.length == 30) {
        alert("You've already voted for 30 producers!");
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