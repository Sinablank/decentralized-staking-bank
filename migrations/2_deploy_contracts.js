const Blank = artifacts.require("Blank");
const BabyBlank = artifacts.require("BabyBlank");
const Bank = artifacts.require("Bank");


module.exports = async function (deployer) {

    await deployer.deploy(Blank);
    const blank = await Blank.deployed();

    await deployer.deploy(BabyBlank);
    const babyBlank = await BabyBlank.deployed();

    await deployer.deploy(Bank, Blank.address, BabyBlank.address);
    const bank = await Bank.deployed();

    await babyBlank.transfer(bank.address, "100000000000000")
    await blank.transfer(bank.address, "100000000")

};
