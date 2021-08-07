const Account = require('../models/Account');
const BaseRepository = require('./Base.Repository');
const accountMapper = require('../utilities/mappers/account');

class AccountsRepository extends BaseRepository {
  constructor() {
    super(Account, accountMapper);
  }

  findByUsername = async (username) => {
    const account = await Account.findOne({ username });
    return accountMapper(account);
  };
}

module.exports = AccountsRepository;
