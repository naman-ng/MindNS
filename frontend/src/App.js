import React, { useEffect, useState, useRef } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import Web3Modal from 'web3modal';
import { providers, Contract } from 'ethers';
import { WHITELIST_CONTRACT_ADDRESS, abi, tld } from './constants';

// Constants
const TWITTER_HANDLE = 'namn_grg';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
    const [loading, setLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const web3ModalRef = useRef();
    const [domain, setDomain] = useState('');
    const [record, setRecord] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');

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
            window.alert('Change the network to Mumbai');
            throw new Error('Change network to Mumbai');
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
                src="https://media.giphy.com/media/3ohhwytHcusSCXXOUg/giphy.gif"
                alt="Ninja donut gif"
            />
            {/* Call the connectWallet function we just wrote when the button is clicked */}
            {renderButton()}
            {/* <button
                onClick={connectWallet}
                className="cta-button connect-wallet-button"
            >
                Connect Wallet
            </button> */}
        </div>
    );

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
                        onClick={null}
                    >
                        Mint
                    </button>
                    <button
                        className="cta-button mint-button"
                        disabled={null}
                        onClick={null}
                    >
                        Set data
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
                        <div className="left">
                            <p className="title">🧠 Mind Name Service</p>
                            <p className="subtitle">
                                Your immortal API on the blockchain!
                            </p>
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
