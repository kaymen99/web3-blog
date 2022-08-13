// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

contract MyBlog {
    //--------------------------------------------------------------------
    // VARIABLES

    address public owner;
    uint256 public monthlyMembershipFee;
    uint256 public yearlyDiscountRate;

    enum PostType {
        PUBLIC,
        ONLYMEMBERS
    }
    enum SubscriptionType {
        MONTHLY,
        YEARLY
    }

    struct Member {
        uint256 subscribedUntil;
        SubscriptionType memberType;
    }

    struct Post {
        uint256 id;
        string title;
        string postOverview;
        string coverImageURI;
        uint256 readTime;
        string contentURI;
        uint256 lastUpdatedAt;
        PostType postType;
    }

    mapping(address => Member) blogMembers;
    Post[] public posts;

    //--------------------------------------------------------------------
    // CUSTOM ERRORS

    error Blog__AlreadyMember();
    error Blog__InsufficientAmount();
    error Blog__InvalidDiscountRate();

    //--------------------------------------------------------------------
    // EVENTS

    event PostCreated(
        uint256 id,
        string title,
        string postOverview,
        string coverImageURI,
        uint256 readTime,
        string contentURI,
        uint256 lastUpdatedAt,
        PostType postType
    );

    event PostUpdated(
        uint256 id,
        string title,
        string postOverview,
        string coverImageURI,
        string contentURI,
        uint256 lastUpdatedAt
    );

    //--------------------------------------------------------------------
    // MODIFIERS

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner call");
        _;
    }

    //--------------------------------------------------------------------
    // CONSTRUCTOR

    constructor(uint256 _fee, uint256 _discountRate) {
        if (_discountRate > 90) revert Blog__InvalidDiscountRate();
        owner = msg.sender;
        monthlyMembershipFee = _fee;
        yearlyDiscountRate = _discountRate;
    }

    //--------------------------------------------------------------------
    // FUNCTIONS

    function becomeMember(SubscriptionType _memberType) public payable {
        if (isMember(msg.sender)) revert Blog__AlreadyMember();
        if (_memberType == SubscriptionType.MONTHLY) {
            if (msg.value < monthlyMembershipFee) revert Blog__InsufficientAmount();
            uint256 period = block.timestamp + 30 days;
            blogMembers[msg.sender] = Member(period, SubscriptionType.MONTHLY);
        } else if (_memberType == SubscriptionType.YEARLY) {
            uint256 fee = (monthlyMembershipFee * 12 * yearlyDiscountRate) /
                100;
            if (msg.value < fee) revert Blog__InsufficientAmount();
            uint256 period = block.timestamp + 365 days;
            blogMembers[msg.sender] = Member(period, SubscriptionType.YEARLY);
        }
    }

    function createPost(
        string calldata _title,
        string calldata _postOverview,
        string calldata _coverImageURI,
        uint256 _readTime,
        string calldata _contentURI,
        PostType _type
    ) external payable onlyOwner {
        uint256 newPostId = posts.length;
        posts.push(
            Post(
                newPostId,
                _title,
                _postOverview,
                _coverImageURI,
                _readTime,
                _contentURI,
                block.timestamp,
                _type
            )
        );

        emit PostCreated(
            newPostId,
            _title,
            _postOverview,
            _coverImageURI,
            _readTime,
            _contentURI,
            block.timestamp,
            _type
        );
    }

    function updatePost(
        uint256 _postId,
        string calldata _newTitle,
        string calldata _newPostOverview,
        string calldata _newCoverImageURI,
        uint256 _newReadTime,
        string calldata _newContentURI
    ) external payable onlyOwner {
        Post memory _post = posts[_postId];
        _post.title = _newTitle;
        _post.postOverview = _newPostOverview;
        _post.readTime = _newReadTime;
        _post.coverImageURI = _newCoverImageURI;
        _post.contentURI = _newContentURI;
        _post.lastUpdatedAt = block.timestamp;

        posts[_postId] = _post;

        emit PostUpdated(
            _postId,
            _newTitle,
            _newPostOverview,
            _newCoverImageURI,
            _newContentURI,
            block.timestamp
        );
    }

    function isMember(address _user) public view returns (bool) {
        if (block.timestamp < blogMembers[_user].subscribedUntil) {
            return true;
        }
        return false;
    }

    function getMemberInfo(address _user)
        external
        view
        returns (Member memory)
    {
        return blogMembers[_user];
    }

    function getAllPosts() external view returns (Post[] memory) {
        return posts;
    }

    //--------------------------------------------------------------------
    // Owner FUNCTIONS

    function withdrawBalance() external payable onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function setMonthlyMembershipFee(uint256 _newFee)
        external
        payable
        onlyOwner
    {
        monthlyMembershipFee = _newFee;
    }

    function setYearlyDiscountRate(uint256 _newRate)
        external
        payable
        onlyOwner
    {
        if (_newRate > 90) revert Blog__InvalidDiscountRate();

        yearlyDiscountRate = _newRate;
    }
}
