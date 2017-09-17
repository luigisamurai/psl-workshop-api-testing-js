const request = require('superagent-promise')(require('superagent'), Promise);
const expect = require('chai').expect
const base64 = require('base-64');
const utf8 = require('utf8');
const HttpStatus = require('http-status-codes');
const githubAccount = {
  baseUrl: 'https://api.github.com',
  username: 'psl-automation-training',
  accessToken: 'efd77e901641cd54f855b0430a12ee2503713941'
};

let profile;
let repositoryName;

describe('Given a Github username', () => {
  before(async () => {
    const userProfileResponse = await request.get(`${githubAccount.baseUrl}/users/${githubAccount.username}`);
    profile = JSON.parse(userProfileResponse.text);
  });

  describe('when a user it authenticates using an application token', () => {
    let tokenLoginResponse;
    let tokenLogin;

    before(async () => {
      tokenLoginResponse = await request
        .get(profile.url)
        .set('Authorization', `token ${githubAccount.accessToken}`);

      tokenLogin = tokenLoginResponse.body;
    });

    it('then the user should be authenticated', () => {
      expect(tokenLoginResponse.status).to.equal(HttpStatus.OK);
      expect(tokenLogin.id).to.not.equal(undefined);
      expect(tokenLogin.login).to.equal(githubAccount.username);
    });
  });

  describe('when checking if the repository exists', () => {
    const repositoryName = 'automation-api-js';
    const newRepository = {
      name: repositoryName,
      description: 'This is your first repository',
      homepage: "https://github.com",
      private: false,
      has_issues: true,
      has_projects: true,
      has_wiki: true
    };
    let createRepositoryResponse;
    let repositoryResponse;
    let createRepository;
 
    before(async () => {
      repositoryResponse = await request
        .get(`${githubAccount.baseUrl}/repos/${githubAccount.username}/${repositoryName}`)
        .set('Authorization', `token ${githubAccount.accessToken}`)
        .catch((error) => error);
      
      createRepository = repositoryResponse.status === HttpStatus.NOT_FOUND;

    });

    it('then the repository should be created', async () => {
      if (createRepository) {
        createRepositoryResponse = await request
          .post(`${githubAccount.baseUrl}/user/repos`, newRepository)
          .set('Authorization', `token ${githubAccount.accessToken}`);

        expect(createRepositoryResponse.status).to.equal(HttpStatus.CREATED);
        expect(repositoryResponse.status).to.equal(HttpStatus.OK);
        expect(repositoryResponse.body.id).to.not.equal(undefined);
      }
    });

    describe('when it updates a repository', () => {
      let updateRepositoryResponse;
      let homepageResponse;
      let updateRepository;

      before(async () => {
        const timestamp = Date.now();
        updateRepository = {
          name: repositoryName,
          description: `This is a Workshop about Api Testing in JavaScript. #${timestamp}`,
          homepage: `${githubAccount.baseUrl}/${githubAccount.username}/${repositoryName}#readme`,
          has_issues: true,
          has_wiki: true
        };

        updateRepositoryResponse = await request
          .patch(`${githubAccount.baseUrl}/repos/${githubAccount.username}/${repositoryName}`, updateRepository)
          .set('Authorization', `token ${githubAccount.accessToken}`);
        
        repositoryResponse = await request
          .get(`${githubAccount.baseUrl}/repos/${githubAccount.username}/${repositoryName}`)
          .set('Authorization', `token ${githubAccount.accessToken}`)
      });

      it('then the repository should be updated', () => {
        expect(updateRepositoryResponse.status).to.equal(HttpStatus.OK);
        expect(repositoryResponse.body.description).to.equal(updateRepository.description);
      });
    });    
  });
});