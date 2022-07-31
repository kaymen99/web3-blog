import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Form } from "react-bootstrap";
import { CircularProgress } from "@mui/material";
import { ethers } from "ethers";

import Blog from "../artifacts/MyBlog.sol/MyBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

function Subscribe() {
    const navigate = useNavigate()
    const data = useSelector((state) => state.blockchain.value)

    const [monthlyFee, setMonthlyFee] = useState(0)
    const [yearlyFee, setYearlyFee] = useState(0)

    const [memberType, setMemberType] = useState(0)
    const [loading, setLoading] = useState(false)

    async function getFees() {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const blog = new ethers.Contract(contractAddress, Blog.abi, provider);

            const _fee = await blog.callStatic.monthlyMembershipFee()
            const _discountRate = await blog.callStatic.yearlyDiscountRate()

            const _yearlyFee = Number(ethers.utils.formatUnits(_fee, "ether")) * 12 * Number(_discountRate) / 100
            setMonthlyFee(ethers.utils.formatUnits(_fee, "ether"))
            setYearlyFee(_yearlyFee.toString())
        }
    }

    async function becomeMember() {
        if (data.network === networksMap[networkDeployedTo]) {
            setLoading(true)
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
                const signer = provider.getSigner()
                const blog = new ethers.Contract(contractAddress, Blog.abi, signer);
                let _fee;
                if (memberType === 0) {
                    _fee = ethers.utils.parseEther(monthlyFee, "ether")
                } else if (memberType === 1) {
                    _fee = ethers.utils.parseEther(yearlyFee, "ether")
                }
                const become_member_tx = await blog.becomeMember(
                    memberType,
                    { value: _fee }
                )
                await become_member_tx.wait();

                navigate("/")
                setLoading(false)
            } catch (error) {
                window.alert("An error has occured")
                console.log(error)
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        if (window.ethereum !== undefined) {
            getFees()
        }
    }, [data.network])

    return (

        <div style={{ marginTop: "10vh", paddingBottom: "40px" }}>
            <div className="mainheading" style={{ marginBottom: "20px" }} >
                <h1 className="sitetitle">Become A Member</h1>
            </div>
            <div className='container' style={{ display: "grid", justifyContent: "center", alignItems: "center" }}>
                <div>
                    <label>Become a member to read this article : </label>
                </div>
                <br />
                <div style={{ paddingBottom: "40px" }}>
                    <Form.Check
                        label={String(monthlyFee) + " ETH/month"}
                        name="group1"
                        type="radio"
                        value={0}
                        onClick={e => setMemberType(Number(e.target.value))}
                        required
                    />
                    <Form.Check
                        label={String(yearlyFee) + " ETH/year"}
                        name="group1"
                        type="radio"
                        value={1}
                        onClick={e => setMemberType(Number(e.target.value))}
                        required
                    />
                </div>
                <div className="container" style={{ textAlign: "center" }}>
                    <a className="login" onClick={becomeMember} role="button">
                        {loading ? <CircularProgress size={20} color="inherit" /> : "Submit"}
                    </a>
                </div>
            </div>
        </div>
    )
}

export default Subscribe
