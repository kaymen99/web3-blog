import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import { AiOutlineTwitter, AiOutlineGithub } from "react-icons/ai";
import { RiDiscordFill } from "react-icons/ri";
import { ethers } from "ethers";
import axios from "axios";

import { IPFS_GATEWAY } from "./../utils/ipfsStorage";
import Blog from "../artifacts/MyBlog.sol/MyBlog.json";
import {
  contractAddress,
  networkDeployedTo,
  ownerAddress,
} from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const data = useSelector((state) => state.blockchain.value);

  const [post, setPost] = useState({
    id: Number(id),
    title: "",
    content: "",
    coverImg: "",
    readTime: 0,
    createdAt: "",
    type: 1,
  });
  async function getPostDetails() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const blog = new ethers.Contract(contractAddress, Blog.abi, provider);

      const owner = await blog.callStatic.owner();

      let _isMember;
      if (owner === data.account) {
        _isMember = true;
      } else {
        _isMember = await blog.isMember(data.account);
      }
      const _post = (await blog.getAllPosts())[Number(id)];
      if (_isMember && _post[7] !== 0) {
        const imageUrl = _post[3].replace("ipfs://", IPFS_GATEWAY);
        const _posts = (await axios.get("http://localhost:3001/")).data;
        const contentUrl = _posts[String(Number(_post[0]))].replace(
          "ipfs://",
          IPFS_GATEWAY
        );
        const _postContent = (await axios.get(contentUrl)).data.content;
        setPost({
          ...post,
          id: Number(_post[0]),
          title: _post[1],
          coverImg: imageUrl,
          readTime: Number(_post[4]),
          content: _postContent,
          createdAt: new Date(Number(_post[6]) * 1000),
          type: _post[7],
        });
      } else if (_post[7] === 0) {
        const imageUrl = _post[3].replace("ipfs://", IPFS_GATEWAY);
        const contentUrl = _post[5].replace("ipfs://", IPFS_GATEWAY);
        let metaData = await axios.get(contentUrl);
        setPost({
          ...post,
          id: Number(_post[0]),
          title: _post[1],
          coverImg: imageUrl,
          readTime: Number(_post[4]),
          content: metaData.data.content,
          createdAt: new Date(Number(_post[6]) * 1000),
          type: _post[7],
        });
      } else {
        navigate("/subscribe");
      }
    }
  }

  useEffect(() => {
    if (window.ethereum !== undefined) {
      getPostDetails();
    }
  }, [data.network]);

  return (
    <div>
      <section className="post-header">
        <div className="header-content post-container">
          {data.account === ownerAddress ? (
            <a href={"/edit-post/" + String(post.id)} className="back-home">
              {" "}
              Edit Post
            </a>
          ) : (
            <a href="/" className="back-home">
              {" "}
              Back Home
            </a>
          )}

          <h1 className="header-title">{post.title}</h1>
          <img src={post.coverImg} className="header-img" />
        </div>
      </section>
      <section className="post-content post-container" data-color-mode="light">
        <MDEditor.Markdown
          source={post.content}
          style={{ whiteSpace: "pre-wrap" }}
        />
      </section>
      <div className="share post-container">
        <span className="share-title">Share this article</span>
        <div className="social">
          <a href="https://github.com/Aymen1001" className="bx">
            <AiOutlineGithub size={25} />
          </a>
          <a href="https://github.com/Aymen1001" className="bx">
            <AiOutlineTwitter size={25} />
          </a>
          <a href="https://github.com/Aymen1001" className="bx">
            <RiDiscordFill size={25} />
          </a>
        </div>
      </div>
      <div className="footer container">
        <p>&#169; All Right Reserved</p>
        <div className="social">
          <a href="https://github.com/Aymen1001" className="bx">
            <AiOutlineGithub size={25} />
          </a>
          <a href="https://github.com/Aymen1001" className="bx">
            <AiOutlineTwitter size={25} />
          </a>
          <a href="https://github.com/Aymen1001" className="bx">
            <RiDiscordFill size={25} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default PostPage;
