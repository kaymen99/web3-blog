import "../assets/styles.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Form } from "react-bootstrap";
import { CircularProgress } from "@mui/material";
import { ethers } from "ethers";
import axios from "axios";
import MDEditor from "@uiw/react-md-editor";
import { File } from "web3.storage";

import { ipfsSaveContent, IPFS_GATEWAY } from "./../utils/ipfsStorage";
import Blog from "../artifacts/MyBlog.sol/MyBlog.json";
import { contractAddress, networkDeployedTo } from "../utils/contracts-config";
import networksMap from "../utils/networksMap.json";

const EditPost = () => {
  const { id } = useParams();
  let navigate = useNavigate();
  const data = useSelector((state) => state.blockchain.value);

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState({
    name: "",
    file: null,
  });
  const [content, setContent] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [formInput, setFormInput] = useState({
    title: "",
    overview: "",
    coverImg: "",
    readTime: "",
  });
  const [post, setPost] = useState({
    id: 0,
    title: "",
    overview: "",
    coverImg: "",
    readTime: "",
    content: "",
    contentURI: "",
    postType: 0,
  });

  const getImage = async (e) => {
    e.preventDefault();
    const file = e.target.files[0];
    setImage({
      name: file.name,
      file: file,
    });
    setFormInput({ ...formInput, coverImg: URL.createObjectURL(file) });
  };

  async function getPostDetails() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const blog = new ethers.Contract(contractAddress, Blog.abi, provider);
      const _post = (await blog.getAllPosts())[Number(id)];

      if (_post[7] === 0) {
        const imageUrl = _post[3].replace("ipfs://", IPFS_GATEWAY);
        const contentUrl = _post[5].replace("ipfs://", IPFS_GATEWAY);
        let metaData = await axios.get(contentUrl);
        setPost({
          ...post,
          id: Number(_post[0]),
          title: _post[1],
          overview: _post[2],
          coverImg: imageUrl,
          readTime: Number(_post[4]),
          contentURI: _post[5],
          content: metaData.data.content,
          postType: _post[7],
        });
        setFormInput({
          ...formInput,
          title: _post[1],
          overview: _post[2],
          coverImg: imageUrl,
          readTime: Number(_post[4]),
        });
        setContent(metaData.data.content);
      } else if (_post[7] === 1) {
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
          overview: _post[2],
          coverImg: _post[3],
          readTime: Number(_post[4]),
          contentURI: contentUrl,
          content: _postContent,
          postType: _post[7],
        });
        setFormInput({
          ...formInput,
          title: _post[1],
          overview: _post[2],
          coverImg: _post[3],
          readTime: Number(_post[4]),
        });
        setContent(_postContent);
      }
    }
  }

  async function edit() {
    if (data.network === networksMap[networkDeployedTo]) {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const blog = new ethers.Contract(contractAddress, Blog.abi, signer);

      try {
        setLoading(true);
        let imageURI;
        if (formInput.coverImg !== post.coverImg) {
          const cid = await ipfsSaveContent(image.file);
          imageURI = `ipfs://${cid}/${image.name}`;
        } else {
          imageURI = post.coverImg;
        }

        let contentURI;
        if (content !== post.content) {
          const jsonContent = JSON.stringify({
            content: content,
          });

          const blob = new Blob([jsonContent], {
            type: "application/json",
          });

          const file = new File([blob], "postContent.json");

          const dataCid = await ipfsSaveContent(file);
          contentURI = `ipfs://${dataCid}/postContent.json`;
        } else {
          contentURI = post.contentURI;
        }

        let contentHash;
        if (post.postType == 0) {
          contentHash = contentURI;
        } else if (post.postType == 1) {
          contentHash = ethers.utils.keccak256(
            ethers.utils.toUtf8Bytes(contentURI)
          );
          axios.post("http://localhost:3001/save-post", {
            id: post.id,
            post: contentURI,
          });
        }

        const edit_tx = await blog.updatePost(
          Number(id),
          formInput.title,
          formInput.overview,
          imageURI,
          Number(formInput.readTime),
          contentHash
        );
        await edit_tx.wait();

        setImage({ name: "", file: null });
        setLoading(false);
        navigate("/post/" + id);
      } catch (err) {
        setLoading(false);
        window.alert("An error has occured");
        console.log(err);
      }
    } else {
      window.alert(
        `Please Switch to the ${networksMap[networkDeployedTo]} network`
      );
    }
  }
  async function getBlogOwner() {
    if (data.account !== "") {
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        "any"
      );
      const signer = provider.getSigner();
      const blog = new ethers.Contract(contractAddress, Blog.abi, signer);

      const owner = await blog.callStatic.owner();

      if (owner == data.account) {
        setIsOwner(true);
      } else {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }

  useEffect(() => {
    if (window.ethereum !== undefined) {
      getBlogOwner();
      getPostDetails();
    }
  }, [data.network]);

  return isOwner ? (
    <>
      <div className="mainheading">
        <h1 className="sitetitle">Edit Your post</h1>
      </div>

      <div
        className="container"
        style={{
          display: "grid",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "left",
          paddingTop: "4rem",
          paddingBottom: "4rem",
        }}
      >
        <div style={{ width: "500px" }}>
          <label>Post title : </label>
          <Form.Control
            type="text"
            maxLength={80}
            onChange={(e) =>
              setFormInput({ ...formInput, title: e.target.value })
            }
            value={formInput.title}
          />
        </div>
        <br />
        <div style={{ width: "500px" }}>
          <label>Post overview : </label>
          <Form.Control
            type="text"
            as="textarea"
            rows={4}
            maxLength={150}
            onChange={(e) =>
              setFormInput({ ...formInput, overview: e.target.value })
            }
            value={formInput.overview}
          />
        </div>
        <br />
        <div style={{ width: "500px" }}>
          <label>Post read time (in minutes) : </label>
          <Form.Control
            type="Number"
            onChange={(e) =>
              setFormInput({ ...formInput, readTime: e.target.value })
            }
            value={formInput.readTime}
          />
        </div>
        <br />
        <div style={{ width: "1000px" }} data-color-mode="light">
          <label>Post content: </label>
          <MDEditor height={400} value={content} onChange={setContent} />
        </div>
        <br />
        <div style={{ width: "500px" }}>
          <label>Change your cover image : </label>
          <Form.Control
            type="file"
            name="file"
            onChange={(e) => {
              getImage(e);
            }}
          />
        </div>
        <br />
        {formInput.coverImg && (
          <div style={{ textAlign: "center", width: "350px" }}>
            <img className="rounded mt-4" src={formInput.coverImg} />
          </div>
        )}
        <br />
        <div className="container" style={{ textAlign: "center" }}>
          <a className="login" onClick={edit} role="button">
            {loading ? (
              <CircularProgress color="inherit" size={20} />
            ) : (
              "Update"
            )}
          </a>
        </div>
      </div>
    </>
  ) : null;
};

export default EditPost;
