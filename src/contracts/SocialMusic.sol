pragma solidity ^0.5.0;

contract SocialMusic {
    event UserWritten (
        string name,
        uint256 age,
        string state
    );

    event SongAdded (
        string songName
    );

    event UserFollowed (
        address user
    );

    struct User {
        string name;                // User's name
        uint256 age;                // User's age
        string state;               // Description of user or how they feel
        string[] recommendations;   // User's music recommendations to other Users
        address[] following;        // Other Users this User is following 
    }

    mapping(address => User) public users;
    address[] public usersList;

    // Add, or if already added overwrite, a user's data in the collection.
    function writeUser(string memory _name, uint256 _age, string memory _state) public {
        // Cannot have an empty name
        require(bytes(_name).length > 0);
        users[msg.sender] = User(_name, _age, _state, users[msg.sender].recommendations, users[msg.sender].following);
        usersList.push(msg.sender);
        emit UserWritten(_name, _age, _state); 
    }

    // Add a song to a user's song recommendations.
    function addSong(string memory _songName) public {
        // Cannot have an empty song name or one that's too long
        require(bytes(_songName).length > 0 && bytes(_songName).length <= 100);
        users[msg.sender].recommendations.push(_songName);
        emit SongAdded(_songName);
    }

    // Follow a new user.
    function follow(address _user) public {
        // Prevent following the genesis block
        require(_user != address(0));
        // Prevent users from following themselves, i.e. loops
        require(_user != msg.sender);
        users[msg.sender].following.push(_user);
        emit UserFollowed(_user);
    }

    // Return the list of users in the collection.
    function getUsersList() public view returns(address[] memory) {
        return usersList;
    }

    // Return a song recommendation made by the given user.
    function getRecommendation(address _user, uint256 _index) public view returns(string memory) {
        return users[_user].recommendations[_index];
    }

    // Return the number of songs recommended by the given user.
    function getRecommendationLength(address _user) public view returns (uint256) {
        return users[_user].recommendations.length;
    }

    // Get the list of users being followed by the given user.
    function getFollowing(address _user) public view returns (address[] memory) {
        return users[_user].following;
    }
}
