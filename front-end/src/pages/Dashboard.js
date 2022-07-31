import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import { ethers } from "ethers";
import { Form } from "react-bootstrap";
import { CircularProgress } from "@mui/material";

import Blog from "../artifacts/MyBlog.sol/MyBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const AuthorDashboard = () => {
    let navigate = useNavigate();
    const data = useSelector((state) => state.blockchain.value)

    const [isOwner, setIsOwner] = useState(false)
    const [balance, setBalance] = useState(0)
    const [membershipFee, setMembershipFee] = useState(0)
    const [discountRate, setDiscountRate] = useState(0)

    const [loading, setLoading] = useState(false)

    async function getBlogInfo() {
        if (data.network === networksMap[networkDeployedTo] & data.account !== "") {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const blog = new ethers.Contract(contractAddress, Blog.abi, provider);

            const owner = await blog.callStatic.owner()

            if (owner == data.account) {
                setIsOwner(true)
            } else {
                navigate("/")
            }
            const balance = await provider.getBalance(contractAddress);
            const _fee = await blog.callStatic.monthlyMembershipFee()
            const _discountRate = await blog.callStatic.yearlyDiscountRate()

            setBalance(ethers.utils.formatUnits(balance, "ether"))
            setMembershipFee(ethers.utils.formatUnits(_fee, "ether"))
            setDiscountRate(_discountRate)
        } else {
            navigate("/")
        }
    }

    async function changeFee() {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const blog = new ethers.Contract(contractAddress, Blog.abi, signer);
                const change_tx = await blog.setMonthlyMembershipFee(
                    ethers.utils.parseEther(membershipFee, "ether")
                )
                await change_tx.wait();
                setLoading(false)
                window.location.reload()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured")
                console.log(error)
            }
        }
    }

    async function changeDiscountRate() {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const blog = new ethers.Contract(contractAddress, Blog.abi, signer);
                const change_tx = await blog.setYearlyDiscountRate(
                    discountRate
                )
                await change_tx.wait();
                setLoading(false)
                window.location.reload()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured")
                console.log(error)
            }
        }
    }

    async function withdraw() {
        if (data.network === networksMap[networkDeployedTo]) {
            try {
                setLoading(true)
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const blog = new ethers.Contract(contractAddress, Blog.abi, signer);
                const withdraw_tx = await blog.withdrawBalance()
                await withdraw_tx.wait();
                setLoading(false)
                window.location.reload()
            } catch (error) {
                setLoading(false)
                window.alert("An error has occured")
                console.log(error)
            }
        }
    }


    useEffect(() => {
        if (window.ethereum !== undefined) {
            getBlogInfo()
        }
    }, [data.account])


    return (
        isOwner ? (
            <>
                <div className="mainheading">
                    <h1 className="sitetitle">Owner Dashboard</h1>
                </div>

                <div className="container"
                    style={{ textAlign: "left", display: "grid", justifyContent: "center", alignItems: "center", paddingTop: "4rem", paddingBottom: "4rem", paddingLeft: "20%" }}>
                    <div style={{ width: "700px", display: "flex" }}>
                        <div style={{ width: "400px" }}>
                            <label>Current contract balance : {balance} ETH</label>
                        </div>
                        <div style={{ paddingLeft: "10px" }}>
                            <a className="login" onClick={withdraw} role="button">
                                {loading ? <CircularProgress color="inherit" size={20} /> : "Withdraw"}
                            </a>
                        </div>
                    </div>
                    <br />
                    <div style={{ width: "700px", display: "flex" }}>

                        <div style={{ width: "400px" }}>
                            <label>Blog membership monthly fee (ETH) : </label>
                            <Form.Control type="Number"
                                value={membershipFee}
                                onChange={(e) => setMembershipFee(e.target.value)}
                            />
                        </div>
                        <div style={{ paddingLeft: "10px", paddingTop: "30px" }} >
                            <a className="login" onClick={changeFee} role="button">
                                {loading ? <CircularProgress color="inherit" size={20} /> : "Change"}
                            </a>
                        </div>
                    </div>
                    <br />
                    <div style={{ width: "700px", display: "flex" }}>
                        <div style={{ width: "400px" }}>
                            <label>Blog yearly membership discount rate (%) : </label>
                            <Form.Control type="Number"
                                value={discountRate}
                                onChange={(e) => setDiscountRate(e.target.value)}
                            />
                        </div>
                        <div style={{ paddingLeft: "10px", paddingTop: "30px" }}>
                            <a className="login" onClick={changeDiscountRate} role="button">
                                {loading ? <CircularProgress color="inherit" size={20} /> : "Change"}
                            </a>
                        </div>
                    </div>
                    <br />

                    <div className="container" style={{ width: "600px", textAlign: "center", display: "flex", paddingTop: "20px" }}>
                        <label>Create a new post</label>
                        <div style={{ paddingLeft: "10px" }}>
                            <a className='login'
                                href={"/create-post"}
                                role="button">
                                Add New Post
                            </a>
                        </div>

                    </div>
                </div>
            </>
        ) : null
    );
};

export default AuthorDashboard;
