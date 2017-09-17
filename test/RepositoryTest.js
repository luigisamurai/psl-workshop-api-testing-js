const request = require('superagent-promise')(require('superagent'), Promise);
const expect = require('chai').expect
const base64 = require('base-64');
const utf8 = require('utf8');
const config = require('config');
const HttpStatus = require('http-status-codes');
const githubAccount = {
  baseUrl: 'https://api.github.com',
  accessToken: base64.decode(config.accessToken)
};

let profile;
let repositoryName;

describe('Given a Github username', () => {
  describe('when a user it authenticates using an application token', () => {
    let tokenLoginResponse;

    before(async () => {
      tokenLoginResponse = await request
        .get(`${githubAccount.baseUrl}/user`)
        .set('Authorization', `token ${githubAccount.accessToken}`);

      profile = tokenLoginResponse.body;
    });

    it('then the user should be authenticated', () => {
      expect(tokenLoginResponse.status).to.equal(HttpStatus.OK);
      expect(profile.id).to.not.equal(undefined);
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
        .get(`${githubAccount.baseUrl}/repos/${profile.login}/${repositoryName}`)
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
        updateRepository = {
          name: repositoryName,
          description: `This is a Workshop about Api Testing in JavaScript.`,
          homepage: `${githubAccount.baseUrl}/${profile.login}/${repositoryName}#readme`,
          has_issues: true,
          has_wiki: true
        };

        updateRepositoryResponse = await request
          .patch(`${githubAccount.baseUrl}/repos/${profile.login}/${repositoryName}`, updateRepository)
          .set('Authorization', `token ${githubAccount.accessToken}`);
        
        repositoryResponse = await request
          .get(`${githubAccount.baseUrl}/repos/${profile.login}/${repositoryName}`)
          .set('Authorization', `token ${githubAccount.accessToken}`)
      });

      it('then the repository should be updated', () => {
        expect(updateRepositoryResponse.status).to.equal(HttpStatus.OK);
      });
    });    
  });
});
