<div id="top"></div>

<!-- ABOUT THE PROJECT -->

# Web3-Blog

A web3.0 personal blog supporting public articles available for everyone and only members posts accessible only for the blog members (who paid a monthly/yearly membership), its built completly on top of the Ethereum blockchain. 

<p align="center">
  <img alt="Dark" src="https://user-images.githubusercontent.com/83681204/182006492-1d78e267-c3a4-4f74-89ff-c31562131647.png" width="100%">
</p>


### Built With

* [Solidity](https://docs.soliditylang.org/)
* [Hardhat](https://hardhat.org/getting-started/)
* [React.js](https://reactjs.org/)
* [ethers.js](https://docs.ethers.io/v5/)
* [web3modal](https://github.com/Web3Modal/web3modal)
* [material ui](https://mui.com/getting-started/installation/)


<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#how-it-works">How it works</a>
     <ul>
       <li><a href="#smart-contracts">Smart Contracts</a></li>
       <li><a href="#backend">Backend</a></li>
       <li><a href="#user-interface">User interface</a></li>
      </ul>
    </li>
    <li>
      <a href="#how-to-run">How to Run</a>
      <ul>
       <li><a href="#prerequisites">Prerequisites</a></li>
       <li><a href="#contracts">Contracts</a></li>
       <li><a href="#back-end">Backend</a></li>
       <li><a href="#front-end">Front-end</a></li>
      </ul>
    </li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>


<!-- PROJECT STRUCTURE -->

## How it works

### Smart contracts

The dapp is built around the MyBlog.sol contract it give the blog owner the opportunity to post public articles available for everyone and private one's only accessible for the blog members, a user can become a blog member by subscribing through monthly/yearly plan. The contract have the following functionnalities :

<ul>
  <li><b>createPost :</b> for adding new posts to the blog (both public and only members ones)</li>
  <li><b>updatePost :</b> to update post title, content, overview... </li>
  <li><b>becomeMember :</b> it allows user to subscribe to the blog either with monthly or yearly membership plan </li>
  <li><b>setMonthlyMembershipFee :</b> it allows the blog owner to change the value of the monthly membership fee </li>
  <li><b>setYearlyDiscountRate :</b> it allows the blog owner to change the value of the yearly membership discount rate (by default it's set to 90%)  </li>
  <li><b>withdrawBalance :</b> the blog owner can collect all the fees paid by the blog members </li>
</ul>

All the article are written from the user interface in a page only available for the blog owner and their content is stored into IPFS. As it is impossible to keep data private on the blockchain, the real IPFS URL for the only members articles are stored into a private database and a hashed version of the URL (hashed with keccak256) is stored on chain. 

So when a random user calls the contract he can not see the post content, but once the user subscribe through the app he can access the true post URL from the database and thus he can see the post content and he can easily verify that it's the correct content by hashing the URL using keccak256 and comparing the result with the post hash stored on-chain. 

### Backend

As mentionned previously the app needs a private database for saving the only members articles IPFS URLs, so i built a backend server with [express js](https://expressjs.com), it support two calls: 

<ul>
  <li><b>get :</b> for getting all the only members articles IPFS URLs</li>
  <li><b>save :</b> allow the blog owner to add or update the URL of a given article </li>
</ul>

For the moment the server doesn't use an advanced database (like MongoDB, SQL) but it uses a simple local JSON database, when a user tries to read an only member article the front-end verify first if he is a member or not, if yes it sends a request to the backend to get the correct post URL.

### User interface

The app fron-end is built with React JS, it uses ethersjs and web3modal libraries to connect to the blockchain, as it's a personal blog their are to parts one for all the users and a part for creating & updating posts and managing the blog (through a dashboard) reserved to the blog owner. In total it contains 4 pages :

* The Home page is the lanfing page of the blog it contains a list of all published articles with their titles and overviews, it allows the users to access to each after connecting their wallet with Metamask using the "connect wallet" button at the top.

![Capture d’écran 2022-07-31 à 03 07 46](https://user-images.githubusercontent.com/83681204/182006600-ddd136e5-fb70-49d7-a889-6073b2865eb8.png)

* In the article page users can see the article content, when the user try to access this page the app will first check the article type if it is a PUBLIC one (meaning that it's available for everyone) it immediataly shows the content, but if it's a member only post the app will verify if the user is a blog member or not, if yes it will redirect him to the post page :

![Capture d’écran 2022-07-31 à 03 01 59](https://user-images.githubusercontent.com/83681204/182006609-75c00d07-4a10-49f7-ad21-2d33c1995805.png)

* If a non blog member try to access a PRIVATE article (only members), he will be immediataly redirected to the subscription page where he can choose a membership plan and pay directly in ETH through Metamask wallet :

![Capture d’écran 2022-07-31 à 02 56 41](https://user-images.githubusercontent.com/83681204/182006637-b6526f09-9f85-4c56-b528-56a659448c9d.png)

* The app offer a simple dashboard which can be accessed only by the blog owner from the window that appears when clicking on the account button after connecting to Metamask, there the owner can change the current membership fee or discount rate, and he can also see/withdraw the blog balance :

![Capture d’écran 2022-07-31 à 02 23 19](https://user-images.githubusercontent.com/83681204/182006662-2d3e213a-3353-4568-af9e-e8b32ac2c180.png)

* By clicking on the "Add New Post" button available in the dashboard the owner will be rediracted to the Create Post page where he can enter the article title, overview, read time, cover image and the article type (public or only members). The page also contains a text editor built with the [@uiw/react-md-editor](https://uiwjs.github.io/react-markdown-editor/) library which allow the owner to write and design the article in any prefered way :

![Capture d’écran 2022-07-31 à 02 42 43](https://user-images.githubusercontent.com/83681204/182006664-2ffb2322-bb01-4cb0-8c79-166775a08914.png)

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- USAGE GUIDE -->
## How to Run

### Prerequisites

Please install or have installed the following:
* [nodejs](https://nodejs.org/en/download/) and [yarn](https://classic.yarnpkg.com/en/)
* [MetaMask](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn) Chrome extension installed in your browser
* [Ganache](https://trufflesuite.com/ganache/) for local smart contracts deployement and testing

### Contracts

The MyBlog.sol contract was developed with the Hardhat framework, before deploying it you must first install the required dependancies by running :
   ```sh
   cd smart_contracts
   yarn
   ```
   
Next you need to setup the environement variables in the .env file, this are used when deploying the contracts :

   ```sh
    RINKEBY_ETHERSCAN_API_KEY="your etherscan api key"
    RINKEBY_RPC_URL="Your rinkeby RPC url from alchemy or infura"
    POLYGON_RPC_URL="Your polygon RPC url from alchemy or infura"
    MUMBAI_RPC_URL="Your mumbai RPC url from alchemy or infura"
    PRIVATE_KEY="your private key"
   ```
* <b>NOTE :</b> Only the private key is needed when deploying to the ganache network, the others variables are for deploying to the testnets or real networks and etherscan api key is for verifying your contracts on rinkeby etherscan.

After going through all the configuration step, you'll need to deploy the smart contract to the ganache network by running: 
   ```sh
   yarn deploy --network ganache
   ```
This will deploy the contract to the Ganache network and create a config.js file and an artifacts folder and transfer them to the src folder to enable the interaction between the contract and the UI.

* <b>IMPORTANT :</b> I used the ganache network for development purposes only, you can choose another testnet or real network if you want, for that you need to add it to the hardhat.config file for example for the rinkeby testnet  

   ```sh
   rinkeby: {
      url: RINKEBY_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 4,
    }
   ```

If you want to test the functionnalities of the Blog contract you can do it by running:
   ```sh
   yarn test
   ```
   
### Back-end

To run the Dapp completly you must also start the backend server responsable for the only members articles URLs handling, first as previously install the required dependancies by running :
   ```sh
   cd backend
   yarn
   ```
Then start the server with the command :

   ```sh
   yarn start
   ```
* <b>IMPORTANT :</b> To run the app correctely the server must stay active all the time you are testing the app, so i recommend opening 2 terminal one for the server and the other for the front-end.

### Front end

To start the user interface just run the following commands :
   ```sh
   cd front-end
   yarn
   yarn start
   ```

As infura recently removed its free IPFS storage gateway i used `web3.storage` api for storing data into IPFS, this api is as simple as infura it requires the creation of a free account and a new api token which you can do [here](https://web3.storage), when you finish add your api token into the `front-end/src/utils/ipfsStorage.js` file:
   ```js
    const web3storage_key = "YOUR-WEB3.STORAGE-API-TOKEN";
   ```
   
If you did everything right, you can now connect to Metamask and access your Dashboard, there you can start blogging.

<p align="right">(<a href="#top">back to top</a>)</p>

<!-- Contact -->
## Contact

If you have any question or problem running this project just contact me: aymenMir1001@gmail.com

<p align="right">(<a href="#top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#top">back to top</a>)</p>
