const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const domainContractFactory = await hre.ethers.getContractFactory(
        'Domains'
    );
    const domainContract = await domainContractFactory.deploy('mind');
    await domainContract.deployed();
    console.log('Contract deployed to: ', domainContract.address);
    console.log('Owner is: ', owner.address);

    const txn = await domainContract.register('nether', {
        value: hre.ethers.utils.parseEther('0.1'),
    });
    await txn.wait();

    const someAdrress = await domainContract.getAddress('nether');
    console.log('Owner of domain is: ', someAdrress);

    const balance = await hre.ethers.provider.getBalance(
        domainContract.address
    );

    console.log('Contract balance: ', hre.ethers.utils.formatEther(balance));
    // txn = await domainContract
    //     .connect(randomPerson)
    //     .setData('doom', 'Haha my domain now!');
    // await txn.wait();
};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();
