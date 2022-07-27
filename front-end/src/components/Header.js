import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"
import { updateAccountData, disconnect } from "../features/blockchain"
import { ethers, utils } from "ethers"
import { Modal } from "react-bootstrap"
import Web3Modal from "web3modal"
import "../assets/styles.css"
import 'bootstrap/dist/css/bootstrap.css';

import networks from "../utils/networksMap.json"
import { ownerAddress } from "../utils/contracts-config"


const eth = window.ethereum
let web3Modal = new Web3Modal()

function Header() {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const data = useSelector((state) => state.blockchain.value)

    const [injectedProvider, setInjectedProvider] = useState();
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const [color, setColor] = useState(false)
    const changeColor = () => {
        if (window.scrollY >= 100) {
            setColor(true)
        } else {
            setColor(false)
        }
    }
    window.addEventListener("scroll", changeColor)

    async function fetchAccountData() {
        if (typeof window.ethereum !== 'undefined') {
            const connection = await web3Modal.connect()
            const provider = new ethers.providers.Web3Provider(connection)

            setInjectedProvider(provider);

            const signer = provider.getSigner()
            const chainId = await provider.getNetwork()
            const account = await signer.getAddress()
            const balance = await signer.getBalance()

            dispatch(updateAccountData(
                {
                    account: account,
                    balance: utils.formatUnits(balance),
                    network: networks[String(chainId.chainId)]
                }
            ))
        }
        else {
            console.log("Please install metamask")
            window.alert("Please Install Metamask")
        }
    }

    async function Disconnect() {
        web3Modal.clearCachedProvider();
        if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
            await injectedProvider.provider.disconnect();
            setInjectedProvider(null)
        }
        dispatch(disconnect())
        setShow(false)
        navigate("/")
    }

    useEffect(() => {
        if (eth) {
            eth.on('chainChanged', (chainId) => {
                fetchAccountData()
            })
            eth.on('accountsChanged', (accounts) => {
                fetchAccountData()
            })
        }
    }, [])

    const isConnected = data.account !== ""

    return (
        <>
            {(window.location.pathname === "/" || window.location.pathname.includes("/post/")) ? (
                <div className={color ? "header header-bg" : 'header'}>
                    <div className='nav container'>
                        <a href='/' className={color ? "logo logo-bg" : 'logo'} >Kr<span>ypto</span></a>
                        {isConnected ? (
                            <>
                                <a className='login'
                                    onClick={handleShow}
                                    role="button">
                                    {data.account &&
                                        `${data.account.slice(0, 6)}...${data.account.slice(
                                            data.account.length - 4,
                                            data.account.length
                                        )}`}
                                </a>
                            </>
                        ) : (
                            <a className='login'
                                onClick={fetchAccountData}
                                role="button">
                                Connect Wallet
                            </a>
                        )}
                    </div>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>CHAIN INFO</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Account: {data.account}</p>
                            <p>Balance: {data.balance && parseFloat(data.balance).toFixed(4)} ETH</p>
                            <p>Network: {data.network}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            {data.account === ownerAddress ? (
                                <a className='login'
                                    href={"/dashboard"}
                                    role="button">
                                    Dashboard
                                </a>
                            ) : null}
                            <a className='login'
                                onClick={Disconnect}
                                role="button">
                                Disconnect
                            </a>
                        </Modal.Footer>
                    </Modal>
                </div>
            ) : (
                <div className="header header-bg">
                    <div className='nav container'>
                        <a href='/' className="logo logo-bg">Kr<span>ypto</span></a>
                        {isConnected ? (
                            <>
                                <a className='login'
                                    onClick={handleShow}
                                    role="button">
                                    {data.account &&
                                        `${data.account.slice(0, 6)}...${data.account.slice(
                                            data.account.length - 4,
                                            data.account.length
                                        )}`}
                                </a>
                            </>
                        ) : (
                            <a className='login'
                                onClick={fetchAccountData}
                                role="button">
                                Connect Wallet
                            </a>
                        )}
                    </div>
                    <Modal show={show} onHide={handleClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>CHAIN INFO</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Account: {data.account}</p>
                            <p>Balance: {data.balance && parseFloat(data.balance).toFixed(4)} ETH</p>
                            <p>Network: {data.network}</p>
                        </Modal.Body>
                        <Modal.Footer>
                            {data.account === ownerAddress ? (
                                <a className='login'
                                    href={"/dashboard"}
                                    role="button">
                                    Dashboard
                                </a>
                            ) : null}

                            <a className='login'
                                onClick={Disconnect}
                                role="button">
                                Disconnect
                            </a>
                        </Modal.Footer>
                    </Modal>
                </div>
            )}
        </>

    )
}

export default Header





