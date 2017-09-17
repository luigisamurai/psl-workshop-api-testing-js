const request = require('superagent-promise')(require('superagent'), Promise);
const expect = require('chai').expect
const base64 = require('base-64');
const utf8 = require('utf8');
const HttpStatus = require('http-status-codes');

const repositoryName = `myNewRepository${Date.now()}`;
const account = {
  username: 'psl-automation-training',
  password: 'Automation-tr4ining',
  token: '6879b38023d9af4a298c22a7ad4758a9a62f091c'

};
let profile;

describe('Given a Github username', () => {
  before(async () => {
    const userProfileResponse = await request.get(`https://api.github.com/users/${account.username}`);
    profile = JSON.parse(userProfileResponse.text);
  });

  after(async () => {
    repositoryResponse = await request
      .del(`https://api.github.com/repos/${account.username}/${repositoryName}`)
      .set('Authorization', `token ${account.token}`);
  });

  describe('when a user it authenticate with username and password', () => {
    let basicLoginResponse;
    let basicLogin;

    before(async () => {
      const bytes = utf8.encode(`${account.username}:${account.password}`);
      const encodeCredentials = base64.encode(bytes); 
      
      basicLoginResponse = await request
        .get(profile.url)
        .set('Authorization', `basic ${encodeCredentials}`);

      basicLogin = basicLoginResponse.body;
    });

    it('then the user should be authenticated', () => {
      expect(basicLoginResponse.status).to.equal(HttpStatus.OK);
      expect(basicLogin.id).to.not.equal(undefined);
      expect(basicLogin.login).to.equal(account.username);
    });
  });

  describe('when a user it authenticate with a application token', () => {
    let tokenLoginResponse;
    let tokenLogin;

    before(async () => {
      tokenLoginResponse = await request
        .get(profile.url)
        .set('Authorization', `token ${account.token}`);

      tokenLogin = tokenLoginResponse.body;
    });

    it('then the user should be authenticated', () => {
      expect(tokenLoginResponse.status).to.equal(HttpStatus.OK);
      expect(tokenLogin.id).to.not.equal(undefined);
      expect(tokenLogin.login).to.equal(account.username);
    });
  });

  describe('when it creates a repository', () => {
    let createRepositoryResponse;
    let repositoryResponse;
 
    before(async () => {
      const repository = {
        "name": repositoryName,
        "description": "This is your first repository",
        "homepage": "https://github.com",
        "private": false,
        "has_issues": true,
        "has_projects": true,
        "has_wiki": true
      };

      createRepositoryResponse = await request
        .post('https://api.github.com/user/repos', repository)
        .set('Authorization', `token ${account.token}`);
      
      repositoryResponse = await request
        .get(`https://api.github.com/repos/${account.username}/${repositoryName}`)
        .set('Authorization', `token ${account.token}`);
    });

    it('then the repository should be created', () => {
      expect(createRepositoryResponse.status).to.equal(HttpStatus.CREATED);
      expect(repositoryResponse.status).to.equal(HttpStatus.OK);
      expect(repositoryResponse.body.id).to.not.equal(undefined);
    });
  });
});