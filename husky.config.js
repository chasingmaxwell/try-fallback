module.exports = {
  hooks: {
    "pre-commit": "yarn prettier",
    "commit-msg": "yarn commitlint -e ${GIT_PARAMS}",
    "pre-push": "yarn lint && yarn test"
  }
};
