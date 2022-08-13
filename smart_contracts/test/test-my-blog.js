const { expect } = require("chai");
const { ethers } = require("hardhat");
const { getAmountInWei, getAmountFromWei } = require('../utils/helper-scripts');

describe("MyBlog.sol", () => {
  let contract;
  let owner;
  let membershipFee = getAmountInWei(0.01);
  let discountRate = 90;
  const postType = { "PUBLIC": 0, "ONLYMEMBERS": 1 }
  const memberType = { "MONTHLY": 0, "YEARLY": 1 }

  const testPostTitle = "Full stack solidity dapp development";
  const testPostOverview = "Create full stack decentrelized apps with hardhat & React";
  const testPostCoverImageURL = "https://testipfsimageurl";
  const testPostContentURI = "https://test-ipfs-content-hash-url";
  const testReadTimeInMinutes = 10 // 10 min


  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners()

    // Deploy MyBlog contract 
    const contractFactory = await ethers.getContractFactory("MyBlog");
    contract = await contractFactory.deploy(membershipFee, discountRate);
  });

  describe("Correct Deployement", () => {
    it("should have correct owner address", async () => {
      const contractOwner = await contract.owner();
      const ownerAddress = await owner.getAddress();
      expect(contractOwner).to.equal(ownerAddress);
    });

    it("should have correct fee parametres", async () => {
      const fee = await contract.monthlyMembershipFee();
      const discount = await contract.yearlyDiscountRate();
      expect(fee).to.equal(membershipFee);
      expect(discount).to.equal(discountRate);
    });
  });

  describe("Core functions", () => {
    it("should allow user to become a member", async () => {
      // Monthly membership
      await contract.connect(user1).becomeMember(
        memberType["MONTHLY"],
        { value: membershipFee }
      )
      const user1_data = await contract.getMemberInfo(user1.address)
      expect(await contract.isMember(user1.address)).to.equal(true);
      // expect(Number(user1_data[0])).to.equal(Math.floor(Date.now() / 1000) + 30 * 24 * 3600);
      expect(user1_data[1]).to.equal(memberType["MONTHLY"]);

      // Yearly membership
      const yearlyFee = getAmountFromWei(membershipFee) * 12 * discountRate
      await contract.connect(user2).becomeMember(
        memberType["YEARLY"],
        { value: getAmountInWei(yearlyFee) }
      )
      const period = Math.floor(Date.now() / 1000) + 365 * 24 * 3600
      const user2_data = await contract.getMemberInfo(user2.address)

      expect(await contract.isMember(user2.address)).to.equal(true);
      // expect(Number(user2_data[0])).to.equal(period);
      expect(user2_data[1]).to.equal(memberType["YEARLY"]);

    });
    it("should allow owner to create post", async () => {
      await contract.connect(owner).createPost(
        testPostTitle,
        testPostOverview,
        testPostCoverImageURL,
        testReadTimeInMinutes,
        testPostContentURI,
        postType["PUBLIC"]
      )

      const postId = 0
      const post = (await contract.getAllPosts())[postId]

      expect(post[0]).to.equal(postId);
      expect(post[1]).to.equal(testPostTitle);
      expect(post[2]).to.equal(testPostOverview);
      expect(post[3]).to.equal(testPostCoverImageURL);
      expect(post[4]).to.equal(testReadTimeInMinutes);
      expect(post[5]).to.equal(testPostContentURI);
      // expect(Number(post[6])).to.equal(postedAt);
      expect(post[7]).to.equal(postType["PUBLIC"]);

    });
    it("should allow owner to edit post", async () => {
      await contract.connect(owner).createPost(
        testPostTitle,
        testPostOverview,
        testPostCoverImageURL,
        testReadTimeInMinutes,
        testPostContentURI,
        postType["PUBLIC"]
      )

      const postId = 0

      await contract.connect(owner).updatePost(
        postId,
        "New test title",
        "New test post overview",
        "ipfs://new-test-cover-image-ipfs-hash",
        20,
        "ipfs://new-test-content-ipfs-uri"
      )

      const post = (await contract.getAllPosts())[postId]

      expect(post[0]).to.equal(postId);
      expect(post[1]).to.equal("New test title");
      expect(post[2]).to.equal("New test post overview");
      expect(post[3]).to.equal("ipfs://new-test-cover-image-ipfs-hash");
      expect(post[4]).to.equal(20);
      expect(post[5]).to.equal("ipfs://new-test-content-ipfs-uri");
      // expect(Number(post[6])).to.equal(postedAt);
    });
    it("should revert with already member for active members", async () => {
      await contract.connect(user1).becomeMember(
        memberType["MONTHLY"],
        { value: membershipFee }
      )
      await expect(
        contract.connect(user1).becomeMember(
          memberType["MONTHLY"],
          { value: membershipFee }
        )
      ).to.be.revertedWithCustomError(contract, "Blog__AlreadyMember")
    });
    it("should revert with insufficient amount when not paying exact fee for becoming member", async () => {
      const wrongFee = getAmountInWei(0.0001)
      await expect(
        contract.connect(user1).becomeMember(
          memberType["MONTHLY"],
          { value: wrongFee }
        )
      ).to.be.revertedWithCustomError(contract, "Blog__InsufficientAmount")
    });
  });

  describe('Owner Functions', () => {
    it("it should allow owner to change membership fee", async () => {
      const newFee = getAmountInWei(0.005)
      await contract.connect(owner).setMonthlyMembershipFee(newFee)
      const fee = await contract.monthlyMembershipFee()

      expect(fee).to.equal(newFee)
    });

    it("it should allow owner to change yearly membership discount rate", async () => {
      const newDiscountRate = 85
      await contract.connect(owner).setYearlyDiscountRate(newDiscountRate)
      const rate = await contract.yearlyDiscountRate()

      expect(rate).to.equal(newDiscountRate)
    });

    it("it should refuse value of yearly membership discount rate greater than 90% ", async () => {
      const newDiscountRate = 95
      await expect(
        contract.connect(owner).setYearlyDiscountRate(newDiscountRate)
      ).to.be.revertedWithCustomError(contract, "Blog__InvalidDiscountRate")
    });

    it("it should transfer contract balance to owner", async () => {

      await contract.connect(user1).becomeMember(
        memberType["MONTHLY"],
        { value: membershipFee }
      )
      const previousOwnerBalance = await owner.getBalance()
      await contract.connect(owner).withdrawBalance()
      const finalOwnerBalance = await owner.getBalance()
      const expectedBalance = Number(previousOwnerBalance) / 1e18 + Number(membershipFee) / 1e18

      // use only 3 decimals because the withdraw transaction cost some gas
      // so owner previous balance is not the same
      expect(
        parseFloat(getAmountFromWei(finalOwnerBalance)).toFixed(3)
      ).to.equal(
        parseFloat(Number(expectedBalance)).toFixed(3)
      )
    });
  })
});
