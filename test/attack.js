const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Attack', () => {
    it('Should be able to read the private variables of the Login.sol file', async function () {
        const loginFactory = await ethers.getContractFactory('Login');
        const usernameBytes = '11';
        const passwordBytes = '10';

        const loginContract = await loginFactory.deploy(
            usernameBytes,
            passwordBytes
        );
        await loginContract.deployed();

        const slot0Bytes = await ethers.provider.getStorageAt(
            loginContract.address,
            0
        );
        console.log(slot0Bytes);
        console.log(usernameBytes);
        console.log(passwordBytes);
        expect(slot0Bytes).to.equal('1');
        // expect(ethers.utils.parseBytes32String(slot1Bytes)).to.equal('pass');
    });
});
