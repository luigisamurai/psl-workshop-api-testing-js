const request = require('superagent-promise')(require('superagent'), Promise);
const expect = require('chai').expect
const HttpStatus = require('http-status-codes');
const config = require('config');
const base64 = require('base-64');

const githubAccount = {
  baseUrl: config.github.baseUrl,
  accessToken: base64.decode(config.github.accessToken)
};

describe('Given a Github username', () => {
  describe('when it creates a Gits', () => {
    let createGitsResponse;
    let gist;

    after(async () => {
      await request
        .del(`${githubAccount.baseUrl}/gists/${gist.id}`)
        .set('Authorization', `token ${githubAccount.accessToken}`);
    });

     before(async () => {
       const newGits = {
          description: 'the description for this gist',
          public: true,
          files: {
            "file1.txt": {
              "content": "String file contents"
            }
          }
        };

        createGitsResponse = await request
          .post(`${githubAccount.baseUrl}/gists`, newGits)
          .set('Authorization', `token ${githubAccount.accessToken}`);   
        
       gist = createGitsResponse.body;
          
     });

     it('then Gits should be created', () => {
      expect(createGitsResponse.status).to.equal(HttpStatus.CREATED);
      expect(gist.id).to.not.equal(undefined);
      expect(gist.url).to.not.equal(undefined);
     });

    it('and the Gits should be accessible', async () => {
      const gitsResponse = await request
        .get(gist.url)
        .set('Authorization', `token ${githubAccount.accessToken}`);
      expect(gitsResponse.status).to.equal(HttpStatus.OK);
    });
  });

  describe('when it create a new Gits', () => {
    let createGitsToBeDelete;
    let gistToBeDelete;

    before(async () => {
      const gitsToBeDelete = {
        description: 'gits to be delete',
        public: true,
        files: {
          "main.js": {
            "content": 'console.log("Hello world");'
          }
        }
      };

      createGitsToBeDelete = await request
        .post(`${githubAccount.baseUrl}/gists`, gitsToBeDelete)
        .set('Authorization', `token ${githubAccount.accessToken}`);

      gistToBeDelete = createGitsToBeDelete.body;
    });
    
    it('then Gits should be created', () => {
      expect(createGitsToBeDelete.status).to.equal(HttpStatus.CREATED);
      expect(gistToBeDelete.id).to.not.equal(undefined);
      expect(gistToBeDelete.url).to.not.equal(undefined);
    });

    describe('and it delete the Gits created', () => {
      let deleteGitsResponse;

      before(async () => {
        deleteGitsResponse = await request
        .del(`${githubAccount.baseUrl}/gists/${gistToBeDelete.id}`)
        .set('Authorization', `token ${githubAccount.accessToken}`);
      });

      it('then the Gits should be deleted', () => {
        expect(deleteGitsResponse.status).to.equal(HttpStatus.NO_CONTENT);
      });

      it('and the Gits should not be accessible', async() => {
        const gitsResponse = await request
          .get(gistToBeDelete.url)
          .set('Authorization', `token ${githubAccount.accessToken}`)
          .catch((error) => error);
        expect(gitsResponse.status).to.equal(HttpStatus.NOT_FOUND);
      });
    });
  });
});
