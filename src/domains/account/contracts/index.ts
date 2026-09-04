import { getAccountProfileForAccountScreenContract } from '~/domains/account/contracts/get-account-profile-for-account-screen'
import { updateAccountProfileForAccountScreenContract } from '~/domains/account/contracts/update-account-profile-for-account-screen'

export const accountContracts = {
  getAccountProfileForAccountScreen: getAccountProfileForAccountScreenContract,
  updateAccountProfileForAccountScreen: updateAccountProfileForAccountScreenContract,
}
