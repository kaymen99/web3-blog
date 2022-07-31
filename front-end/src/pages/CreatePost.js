import "../assets/styles.css";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"
import { Form } from "react-bootstrap"
import { CircularProgress } from "@mui/material";
import Axios from "axios";
import { ethers } from "ethers";
import { Buffer } from "buffer";
import { create } from "ipfs-http-client";
import MDEditor from '@uiw/react-md-editor';


import Blog from "../artifacts/MyBlog.sol/MyBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";


const ipfsClient = create("https://ipfs.infura.io:5001/api/v0")
const ipfsBaseUrl = "https://ipfs.infura.io/ipfs/"

const CreatePost = () => {
    let navigate = useNavigate();
    const data = useSelector((state) => state.blockchain.value)

    const [loading, setLoading] = useState(false)
    const [image, setImage] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isOwner, setIsOwner] = useState(false)
    const [post, setPost] = useState({
        title: "",
        overview: "",
        readTime: "",
        postType: 0
    })
    const [content, setContent] = useState("")

    const getImage = async (e) => {

        e.preventDefault()
        const reader = new window.FileReader();
        const file = e.target.files[0];

        if (file !== undefined) {
            reader.readAsArrayBuffer(file)

            reader.onloadend = () => {
                const buf = Buffer(reader.result, "base64")
                setImage(buf)
                setImagePreview(file)
            }
        }
    }

    async function create() {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const signer = provider.getSigner()
            const blog = new ethers.Contract(contractAddress, Blog.abi, signer);
            const _postsCount = (await blog.getAllPosts()).length

            if (image !== undefined) {
                try {
                    setLoading(true)

                    const addedFile = await ipfsClient.add(image)
                    const imageURI = ipfsBaseUrl + addedFile.path

                    const addedContent = await ipfsClient.add(content)
                    const contentURI = ipfsBaseUrl + addedContent.path

                    let contentHash;
                    if (post.postType == 0) {
                        contentHash = contentURI;
                    } else if (post.postType == 1) {
                        contentHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(contentURI))
                        Axios.post("http://localhost:3001/save-post", {
                            id: _postsCount,
                            post: contentURI
                        })
                    }
                    const create_tx = await blog.createPost(
                        post.title,
                        post.overview,
                        imageURI,
                        Number(post.readTime),
                        contentHash,
                        Number(post.postType)
                    )
                    await create_tx.wait();

                    setImage(null)
                    setLoading(false)
                    navigate("/")
                }
                catch (err) {
                    window.alert("An error has occured")
                    setLoading(false)
                    console.log(err)
                }
            }
        } else {
            window.alert(`Please Switch to the ${networksMap[networkDeployedTo]} network`)
        }
    }

    async function getBlogOwner() {
        if (data.account !== "") {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const signer = provider.getSigner()
            const blog = new ethers.Contract(contractAddress, Blog.abi, signer);

            const owner = await blog.callStatic.owner()

            if (owner == data.account) {
                setIsOwner(true)
            } else {
                navigate("/")
            }
        } else {
            navigate("/")
        }
    }

    useEffect(() => {
        if (window.ethereum !== undefined) {
            getBlogOwner()
        }
    }, [])


    return (

        isOwner ? (
            <>
                <div className="mainheading">
                    <h1 className="sitetitle">Create a new post</h1>
                </div>

                <div className="container" style={{ display: "grid", justifyContent: "center", alignItems: "center", textAlign: "left", paddingTop: "4rem", paddingBottom: "4rem" }}>

                    <div style={{ width: "500px" }}>
                        <label>Post title : </label>
                        <Form.Control
                            type="text"
                            maxLength={80}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            placeholder='Give it a title ...' />
                    </div>
                    <br />
                    <div style={{ width: "500px" }}>
                        <label>Post overview : </label>
                        <Form.Control type="text" as="textarea"
                            rows={4}
                            maxLength={150}
                            onChange={(e) => setPost({ ...post, overview: e.target.value })}
                            placeholder='Post short overview (less than 150 caracteres)' />
                    </div>
                    <br />
                    <div style={{ width: "500px" }}>
                        <label>Post read time (in minutes) : </label>
                        <Form.Control type="Number"
                            onChange={(e) => setPost({ ...post, readTime: e.target.value })}
                            placeholder='Enter post read time' />
                    </div>
                    <br />
                    <div style={{ width: "1000px" }} data-color-mode="light">
                        <label>Post content: </label>
                        <MDEditor
                            height={400}
                            value={content}
                            onChange={setContent}
                        />
                    </div>
                    <br />
                    <div>
                        <label>Post Type: </label>
                        <div key={`inline-radio`} className="mb-3">
                            <Form.Check
                                inline
                                label="Public"
                                name="group1"
                                type="radio"
                                value={0}
                                id={`inline-radio-1`}
                                onClick={e => setPost({ ...post, postType: Number(e.target.value) })}
                                required
                            />
                            <Form.Check
                                inline
                                label="Only Members"
                                name="group1"
                                type="radio"
                                value={1}
                                id={`inline-radio-2`}
                                onClick={e => setPost({ ...post, postType: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                    <div style={{ width: "500px" }}>
                        <label>Pick a cover image : </label>
                        <Form.Control type="file" name="file" onChange={(e) => { getImage(e) }} />
                    </div>
                    <br />
                    {
                        imagePreview && (
                            <div style={{ textAlign: "center", width: "350px" }}>
                                <img className="rounded mt-4" src={URL.createObjectURL(imagePreview)} />
                            </div>
                        )
                    }
                    <br />
                    <div className="container" style={{ textAlign: "center" }}>
                        <a className="login" onClick={create} role="button">
                            {loading ? <CircularProgress size={20} color="inherit" /> : "Create"}
                        </a>
                    </div>
                </div>
            </>
        ) : null
    );
};

export default CreatePost;
