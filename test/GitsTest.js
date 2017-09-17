const request = require('superagent-promise')(require('superagent'), Promise);
const expect = require('chai').expect

const githubAccount = {
  baseUrl: 'https://api.github.com',
  username: 'psl-automation-training',
  accessToken: process.env.accessToken
};

let profile;

describe('Given a Github user authenticated', () => {
  before(async () => {
    const userProfileResponse = await request.get(`${githubAccount.baseUrl}/users/${githubAccount.username}`);
    profile = JSON.parse(userProfileResponse.text);
  });
});