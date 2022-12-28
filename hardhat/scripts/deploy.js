const { ethers } = require('hardhat');

async function main() {
    const domainContractFactory = await hre.ethers.getContractFactory(
        'Domains'
    );
    const domainContract = await domainContractFactory.deploy('mind');
    await domainContract.deployed();

    console.log('Deployed to: ', domainContract.address);

    let txn = await domainContract.register('Final', {
        value: hre.ethers.utils.parseEther('0.1'),
    });

    await txn.wait();
    console.log('Minted domain Final.mind');

    txn = await domainContract.setData('Final', 'Breaking bad vibes');
    await txn.wait();
    console.log('Data setted');

    const address = await domainContract.getAddress('Final');
    console.log('Owner is: ', address);

    const balance = await hre.ethers.provider.getBalance(
        domainContract.address
    );
    console.log('I am a billionaire: ', hre.ethers.utils.formatEther(balance));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
