$(function () {
    $(window).load(function () {
        //  alert("hello");
        PrepareNetwork();
    });
});

var JsonContract = null;
var JsonContracttoken = null;
var web3 = null;
var MyContract = null;
var MyContracttoken = null;
var Owner = null;
var TolalValueLocked = null;
var Balabce = null;
var Reward = null;
var babyFZMAddress = null;
var FZMAddress = null;

async function PrepareNetwork() {
    await loadWeb3();
    await LoadDataSmartContract();
}

async function loadWeb3() {

    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
            CurrentAccount = accounts[0];
            web3.eth.defaultAccount = CurrentAccount;
            console.log('current account: ' + CurrentAccount);
            setCurrentAccount();
        });
        //  console.log(a);
    }
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        //   console.log('2');
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }

    ethereum.on('accountsChanged', handleAccountChanged);
    ethereum.on('chainChanged', handleChainChanged);

}

function setCurrentAccount() {
    var newaddress = CurrentAccount.slice(0, 6) + "..." + CurrentAccount.slice(38, 42);
    $('#AddressFill').text(newaddress);
}

async function handleAccountChanged() {
    await ethereum.request({ method: 'eth_requestAccounts' }).then(function (accounts) {
        CurrentAccount = accounts[0];
        web3.eth.defaultAccount = CurrentAccount;
        console.log('current account: ' + CurrentAccount);
        setCurrentAccount();
    });
}

async function handleChainChanged(_chainId) {

    window.location.reload();
    console.log('Chain Changed: ', _chainId);
}

async function LoadDataSmartContract() {
    await $.getJSON('Bank.json', function (contractData) {
        // console.log('JsonContract: ',contractData);
        JsonContract = contractData;
    });

    await $.getJSON('babyFZM.json', function (contractData) {
        // console.log('JsonContract: ',contractData);
        JsonContracttoken = contractData;
    });

    web3 = await window.web3;

    const networkId = await web3.eth.net.getId();
    // console.log('networkId: ',networkId);

    const networkData = JsonContract.networks[networkId];
    const networkDataToken = JsonContracttoken.networks[networkId];

    if (networkData && networkDataToken) {
        MyContract = new web3.eth.Contract(JsonContract.abi, networkData.address);
        MyContracttoken = new web3.eth.Contract(JsonContracttoken.abi, networkDataToken.address);

        Owner = await MyContract.methods.getOwner().call();
        console.log('Owner: ', Owner);

        TolalValueLocked = await MyContract.methods.getTotalValueLocked().call();
        console.log('TolalValueLocked: ', web3.utils.fromWei(TolalValueLocked));
        $('#Locked').text(web3.utils.fromWei(TolalValueLocked));

        Balance = await MyContract.methods.getBalance().call();
        Balance = web3.utils.fromWei(Balance);
        console.log('Balabce: ', Balance);
        $('#Stake').text(Balance);

        RewardRate = await MyContract.methods.getRewardRate().call();
        Reward = Balance * RewardRate * 0.01;
        console.log('Reward: ', Reward);
        $('#Reward').text(Reward);

        babyFZMAddress = await MyContract.methods.getbabyFZMaddress().call();
        console.log('getbabyFZMAdd: ', babyFZMAddress);
        $('#babyFZMA').text(babyFZMAddress);

        FZMAddress = await MyContract.methods.getFZMaddress().call();
        console.log('getFZMAdd: ', FZMAddress);
        $('#FZMA').text(FZMAddress);

    }


    $(document).on('click', '#btn_Stake', btn_Stake);
    $(document).on('click', '#recievetoken', recievetoken);
    $(document).on('click', '#claimreward', claimreward);
    $(document).on('click', '#btn_AllReward', btn_AllReward);
    $(document).on('click', '#unstake', unstake);

}

function unstake() {
    
    MyContract.methods.unStakeToken(web3.utils.toWei(Reward.toString(), 'ether')).send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "UnStaked",
            content: "All Token UnStaked" ,
            type: "alert"
        });


    }).catch(function (error) {
        console.log("error: ", error);
    });

}



function btn_AllReward() {

    if (Owner.toLowerCase() == CurrentAccount) {
        MyContract.methods.RewardToken().send({ from: CurrentAccount }).then(function (Instance) {
    
            $.msgBox({
                title: "Reward",
                content: "All Token Rewarded From Owner" ,
                type: "alert"
            });
    
    
        }).catch(function (error) {
            console.log("error: ", error);
        });
    }else{
        $.msgBox({
            title: "Error",
            content: "You Not Owner" ,
            type: "error"
        });
    }
    
        
    }
    


function claimreward() {
    MyContract.methods.ClaimReward(web3.utils.toWei(Reward.toString(), 'ether')).send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "Reward Claimed",
            content: "Claim all Reward" ,
            type: "alert"
        });


    }).catch(function (error) {
        console.log("error: ", error);
    });
}

function recievetoken() {
    MyContract.methods.TransferToken().send({ from: CurrentAccount }).then(function (Instance) {

        $.msgBox({
            title: "Recieve Token",
            content: "You Get 50 babyFZM Token " ,
            type: "alert"
        });


    }).catch(function (error) {
        console.log("error: ", error);
    });
}

async function btn_Stake() {

    var stake = $("#valueStake").val();
    if (stake == '') {
        $.msgBox({
            title: "Error",
            content: "Please Fill Text Box ",
            type: "error"
        });
    }

    let Bankaddress = await MyContract.methods.getContractaddress().call();

    MyContracttoken.methods.approve(Bankaddress, web3.utils.toWei(stake, 'ether')).send({ from: CurrentAccount }).then(function (Instance) {

        MyContract.methods.depositToken(web3.utils.toWei(stake, 'ether')).send({ from: CurrentAccount }).then(function (Instance) {

            let Oaddress = Instance.events.StakeToken.returnValues[0];
            let val = web3.utils.fromWei(Instance.events.StakeToken.returnValues[1], 'ether');

            $.msgBox({
                title: "Staking Token",
                content: "Staker: " + Oaddress.slice(0, 6) + "..." + Oaddress.slice(38, 42) + " and Value: " + val,
                type: "alert"
            });


        }).catch(function (error) {
            console.log("error: ", error);
        });


    }).catch(function (error) {
        console.log("error: ", error);
    });
    ;

}


function Close() {
    window.location.reload();
}

