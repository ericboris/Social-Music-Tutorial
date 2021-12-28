const SocialMusic = artifacts.require('SocialMusic');

const truffleAssert = require('truffle-assertions');

require('chai').use(require('chai-as-promised')).should();

contract('Social Music', (accounts) => {
    let socialMusic;

    before(async () => {
        socialMusic = await SocialMusic.deployed();
    });

    describe('Initialization', async () => {
        it('Initializes successfully', async () => {
            const address = await socialMusic.address
            assert.notEqual(address, 0x0);
            assert.notEqual(address, '');
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        });
    });

    describe('Add first new user', async () => {
        let result;

        before(async () => {
            result = await socialMusic.writeUser('Name1', 1, 'State1', { from: accounts[0] });
        });

        it('Emits UserWritten event with correct parameters', async () => {
            truffleAssert.eventEmitted(result, 'UserWritten', (event) => {
                return event.name === 'Name1' && event.age == 1 && event.state === 'State1';
            });
        });

        it('Fails when passing invalid name', async () => {
            await await socialMusic.writeUser('', 1, 'State1', { from: accounts[0] }).should.be.rejected;
        });
    });

    describe('Add songs', async () => {
        let result;
        it('Emits first SongAdded event with correct parameters', async () => {
            result = await socialMusic.addSong('Song1', { from: accounts[0] });
            truffleAssert.eventEmitted(result, 'SongAdded', (event) => {
                return event.songName === 'Song1';
            });
        });

        it('Emits second SongAdded event with correct parameters', async () => {
            result = await socialMusic.addSong('Song2', { from: accounts[0] });
            truffleAssert.eventEmitted(result, 'SongAdded', (event) => {
                return event.songName === 'Song2';
            });
        });

        it('Fails when passing empty song name', async () => {
            await await socialMusic.addSong('', { from: accounts[0] }).should.be.rejected;
        });

        it('Fails when passing song name with more than 100 characters', async () => {
            await await socialMusic.addSong('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', { from: accounts[0] }).should.be.rejected;
        });
    });

    describe('Follow a user', async () => {
        it('Emits UserFollowed event with correct parameters', async () => {
            let result = await socialMusic.follow(accounts[1], { from: accounts[0] });
            const event = result.logs[0].args;
            assert.equal(event.user, accounts[1], 'Followed user addresses don\'t match');
            truffleAssert.eventEmitted(result, 'UserFollowed', (event) => {
                return event.user === accounts[1];
            });
        });

        it('Fails when attempting to follow genesis address', async () => {
            await await socialMusic.follow(0x0, { from: accounts[0] }).should.be.rejected;
        });

        it('Fails when attempting to follow self', async () => {
            await await socialMusic.follow(accounts[0], { from: accounts[0] }).should.be.rejected;
        });
    });

    describe('Add second new user', async () => {
        let result;

        before(async () => {
            result = await socialMusic.writeUser('Name2', 2, 'State2', { from: accounts[1] });
        });

        it('Emits UserWritten event with correct parameters', async () => {
            truffleAssert.eventEmitted(result, 'UserWritten', (event) => {
                return event.name === 'Name2' && event.age == 2 && event.state === 'State2';
            });
        });

        it('Fails when passing invalid name', async () => {
            await await socialMusic.writeUser('', 2, 'State2', { from: accounts[1] }).should.be.rejected;
        });
    });


    describe('Get number of recommendations', async () => {
        let count;
        it('Returns the correct number for user1', async () => {
            count = await socialMusic.getRecommendationLength(accounts[0]);
            assert.equal(count.toNumber(), 2, 'Incorrect number of recommendations');
        });

        it('Returns the correct number for user2', async () => {
            count = await socialMusic.getRecommendationLength(accounts[1]);
            assert.equal(count.toNumber(), 0, 'Incorrect number of recommendations');
        });
    });

    describe('Get the users list', async () => {
        let usersList;
        it('Check the that the users list contains the correct users', async () => {
            usersList = await socialMusic.getUsersList();
            assert.equal(usersList[0], accounts[0], 'List index 0 is incorrect');
            assert.equal(usersList[1], accounts[1], 'List index 1 is incorrect');
        });

        it('Check that there are not more than 2 users', async () => {
            assert.equal(usersList[2], undefined, 'List index 2 should be empty');
        });
    });

    describe('Get user recommendations by index', async () => {
        let recommendation;
        it('Check user1 recommendation 0', async () => {
            recommendation = await socialMusic.getRecommendation(accounts[0], 0);
            assert.equal(recommendation, 'Song1', 'Incorrect recommendation received');
        });

        it('Check user1 recommendation 1', async () => {
            recommendation = await socialMusic.getRecommendation(accounts[0], 1);
            assert.equal(recommendation, 'Song2', 'Incorrect recommendation received');
        });

        it('Check user2 recommendation 0', async () => {
            await await socialMusic.getRecommendation(accounts[1], 0).should.be.rejected;
        });
    });

    describe('Check whose following whom', async () => {
        let following;
        it('Check who user1 is following', async () => {
            following = await socialMusic.getFollowing(accounts[0]);
            assert.equal(following[0], accounts[1], 'Incorrect first follower for user1');
            assert.equal(following[1], undefined, 'user1 should only be following one other user');
        });

        it('Check who user2 is following', async () => {
            following = await socialMusic.getFollowing(accounts[1]);
            assert.equal(following[0], undefined, 'user2 should should not be following anyone');
        });
    });
});
