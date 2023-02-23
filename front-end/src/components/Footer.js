import React from 'react'
import { AiOutlineTwitter, AiOutlineGithub } from "react-icons/ai";
import { RiDiscordFill } from "react-icons/ri";

function Footer() {
    return (
        <div className='footer container'>
            <p>&#169; All Right Reserved</p>
            <div className='social'>
                <a href='https://github.com/kaymen99' className='bx'>
                    <AiOutlineGithub size={25} />
                </a>
                <a href='https://github.com/kaymen99' className='bx'>
                    <AiOutlineTwitter size={25} />
                </a>
                <a href='https://github.com/kaymen99' className='bx'>
                    <RiDiscordFill size={25} />
                </a>
            </div>
        </div>
    )
}

export default Footer
