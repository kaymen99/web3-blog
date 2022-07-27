import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import { ethers } from "ethers";

import Blog from "../artifacts/MyBlog.sol/MyBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const Home = () => {

    const data = useSelector((state) => state.blockchain.value)

    const [postsList, SetPostsList] = useState([])
    const [msg, setMsg] = useState("No post published yet")

    async function getPostsList() {
        if (data.network === networksMap[networkDeployedTo]) {
            const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
            const blog = new ethers.Contract(contractAddress, Blog.abi, provider);
            const posts = await blog.getAllPosts()

            if (posts.length !== 0) {
                const items = await Promise.all(posts.map(async (p) => {
                    const item = {
                        id: Number(p[0]),
                        title: p[1],
                        overview: p[2],
                        coverImage: p[3],
                        readTime: Number(p[4]),
                        createdAt: new Date(Number(p[6]) * 1000),
                        type: p[7]
                    }
                    return item
                }))
                console.log(items)
                SetPostsList(items.reverse())
            }
        } else {
            setMsg(`Please switch to the ${networksMap[networkDeployedTo]} network`)
        }
    }

    useEffect(() => {
        if (window.ethereum !== undefined) {
            getPostsList()
        }
    }, [data.network])


    return (
        <>
            <section className='home'>
                <div className='home-text container'>
                    <h2 className='home-title'>The Krypto Blog</h2>
                    <span className='home-subtitle'>Your source of great content</span>
                </div>
            </section>
            <section>
                {postsList.length !== 0 ? (
                    <>
                        <h2 className='post-head'>Latest Posts</h2>
                        <div className='post container'>
                            {postsList.map((post, index) => {
                                return (
                                    <div className='post-box' key={index}>
                                        <img src={post.coverImage} className="post-img" />
                                        <a href={"/post/" + String(post.id)} className='post-title'>
                                            {post.title}
                                        </a>
                                        <span className='post-date'>
                                            {`  ${post.createdAt.toLocaleString("default", {
                                                day: "2-digit",
                                            })} ${post.createdAt.toLocaleString("default", {
                                                month: "long",
                                            })} ${post.createdAt.toLocaleString("default", {
                                                year: "numeric",
                                            })}  `}

                                            | {post.readTime} min
                                        </span>
                                        <p className='post-description'>{post.overview} </p>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div className="container" style={{ textAlign: "center", paddingTop: "20px" }}>
                        {msg}
                        <br />
                        <br />
                    </div>
                )}

            </section>
            <Footer />
        </>
    );
};

export default Home;