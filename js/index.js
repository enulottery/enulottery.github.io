let myIronman;

async function init() {

}

function initIronman() {

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

    if (!myIronman) {
        myIronman = window.ironman;
        window.ironman = null;
    }

    if (myIronman) {
        // Buy with Ironman
    } else {
        // Tell user to install Ironman or use a mobile wallet
    }
}

async function voteForMe() {

    if (!myIronman) {
        myIronman = window.ironman;
        window.ironman = null;
    }

    if (!myIronman) {
        alert("Please install ironman to vote for me");
        return;
    }

    const network = {
        blockchain: 'enu',
        host: 'rpc.enu.one',
        port: 443,
        protocol: 'https',
        chainId: 'cf057bbfb72640471fd910bcb67639c22df9f92470936cddc1ade0e2f2e7dc4f'
    };

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