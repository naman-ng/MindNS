import React, { useEffect, useState, useRef } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import Web3Modal from 'web3modal';
import { providers, Contract, ethers } from 'ethers';
import {
    CONTRACT_ADDRESS,
    abi,
    tld,
    TWITTER_HANDLE,
    TWITTER_LINK,
} from './constants';
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';

const App = () => {
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();
    const [domain, setDomain] = useState('');
    const [record, setRecord] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');
    const [network, setNetwork] = useState('');

    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        const signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        console.log('Address is : ' + address);
        setCurrentAccount(address);

        // If user is not connected to the Goerli network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 80001) {
            setNetwork('Ethereum');
            window.alert('Change the network to Mumbai');
            throw new Error('Change network to Mumbai');
        } else {
            setNetwork('Polygon Mumbai Testnet');
        }
        if (needSigner) {
            const signer = web3Provider.getSigner();
            const address = await signer.getAddress();
            console.log(address);
            return signer;
        }
        return web3Provider;
    };

    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (err) {
            console.error(err);
        }
    };

    const renderButton = () => {
        // If wallet is not connected, return a button which allows them to connect their wllet
        if (walletConnected) {
            if (loading) {
                return (
                    <button className="cta-button connect-wallet-button">
                        Loading...
                    </button>
                );
            } else {
                return (
                    <button className="cta-button connect-wallet-button">
                        Wallet is Connected
                    </button>
                );
            }
        } else if (!walletConnected) {
            return (
                <button
                    onClick={connectWallet}
                    className="cta-button connect-wallet-button"
                >
                    Connect your wallet
                </button>
            );
        }
    };

    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        if (!walletConnected) {
            // Assign the Web3Modal class to the reference object by setting it's `current` value
            // The `current` value is persisted throughout as long as this page is open
            web3ModalRef.current = new Web3Modal({
                network: 'mumbai',
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();
        }
    }, [walletConnected]);

    const renderNotConnectedContainer = () => (
        <div className="connect-wallet-container">
            <img
                src="https://media.giphy.com/media/3oEduNyqHoMFP9oVXy/giphy.gif"
                alt="Mind gif"
            />
            {/* Call the connectWallet function we just wrote when the button is clicked */}
            {renderButton()}
        </div>
    );
    const mintDomain = async () => {
        // Don't run if the domain is empty
        if (!domain) {
            return;
        }
        // Alert the user if the domain is too short
        if (domain.length < 3) {
            alert('Domain must be at least 3 characters long');
            return;
        }
        const price =
            domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
        console.log('Minting domain', domain, 'with price', price);

        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            const domainContract = new Contract(CONTRACT_ADDRESS, abi, signer);

            console.log('Going to mint...' + domain);
            console.log(domainContract.address);

            const tx = await domainContract.register(domain, {
                value: ethers.utils.parseEther(price),
            });
            setLoading(true);
            // wait for the transaction to get mined
            await tx.wait();

            console.log(
                'Domain minted! https://mumbai.polygonscan.com/tx/' + tx.hash
            );

            // Set the record for the domain
            tx = await domainContract.setData(domain, record);
            await tx.wait();
            console.log(
                'Data set! https://mumbai.polygonscan.com/tx/' + tx.hash
            );

            setRecord('');
            setDomain('');
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };
    const renderInputForm = () => {
        return (
            <div className="form-container">
                <div className="first-row">
                    <input
                        type="text"
                        value={domain}
                        placeholder="domain"
                        onChange={(e) => setDomain(e.target.value)}
                    />
                    <p className="tld"> {tld} </p>
                </div>

                <input
                    type="text"
                    value={record}
                    placeholder="Do you have an ether mind?"
                    onChange={(e) => setRecord(e.target.value)}
                />

                <div className="button-container">
                    <button
                        className="cta-button mint-button"
                        disabled={null}
                        onClick={mintDomain}
                    >
                        Mint
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="App">
            <div className="container">
                <div className="header-container">
                    <header>
                        <div className="left zz">
                            <p className="title">🧠 Mind Name Service</p>
                            <p className="subtitle">
                                Your another identity on the blockchain!
                            </p>
                        </div>
                        <div className="right zz">
                            <img
                                alt="Network logo"
                                className="logo"
                                src={
                                    network.includes('Polygon')
                                        ? polygonLogo
                                        : ethLogo
                                }
                            />
                            {currentAccount ? (
                                <p>
                                    {' '}
                                    Wallet: {currentAccount.slice(0, 6)}...
                                    {currentAccount.slice(-4)}{' '}
                                </p>
                            ) : (
                                <p> Not connected </p>
                            )}
                        </div>
                    </header>
                </div>
                {/*
                 */}
                {!currentAccount && renderNotConnectedContainer()}
                {/* Render the input form if an account is connected */}
                {currentAccount && renderInputForm()}
                {/*
                 */}
                <div className="footer-container">
                    <img
                        alt="Twitter Logo"
                        className="twitter-logo"
                        src={twitterLogo}
                    />
                    <a
                        className="footer-text"
                        href={TWITTER_LINK}
                        target="_blank"
                        rel="noreferrer"
                    >{`Build with ❤ and ⚡ by @${TWITTER_HANDLE}`}</a>
                </div>
            </div>
        </div>
    );
};

export default App;
