import chai, { expect } from 'chai'
import { Contract, BigNumber } from 'ethers'
import { solidity, MockProvider, deployContract } from 'ethereum-waffle'

import Game from '../build/Game.json'
import ERC20Token from '../build/ERC20Token.json'
import UserCenter from '../build/UserCenter.json'
import PropertyOwnership from '../build/PropertyOwnership.json'
import PropertyExchange from '../build/PropertyExchange.json'
import Gov from '../build/Gov.json'

chai.use(solidity)

const overrides = {
  gasLimit: 9999999,
  gasPrice: 0
}

describe('MonopolyTest', () => {
  const provider = new MockProvider({
    ganacheOptions: {
      gasLimit: 9999999
    }
  })
  /* accounts: [{ balance: 'BALANCE IN WEI', secretKey: 'PRIVATE KEY' }] */

  const [wallet] = provider.getWallets()

  let game: Contract
  let token: Contract
  let uc: Contract
  let po: Contract
  let pe: Contract
  let gov: Contract

  beforeEach(async function () {
    token = await deployContract(wallet, ERC20Token, [], overrides);
    console.log(`"Token": "${token.address}",`);
    uc = await deployContract(wallet, UserCenter, [], overrides);
    console.log(`"UserCenter": "${uc.address}",`);
    po = await deployContract(wallet, PropertyOwnership, [], overrides);
    console.log(`"PropertyOwnership": "${po.address}",`);
    pe = await deployContract(wallet, PropertyExchange, [po.address, token.address], overrides);
    console.log(`"PropertyExchange": "${pe.address}",`);
    gov = await deployContract(wallet, Gov, [pe.address, token.address], overrides);
    console.log(`"Gov": "${gov.address}",`);
    game = await deployContract(wallet, Game, [], overrides);
    console.log(`"Game": "${game.address}"`);
    await game.setMaxNumberOfMove(50);
    console.log(`setMaxNumberOfMove 50`);


    await uc.addAdmin(game.address);
    await token.addMinter(pe.address);
    await token.addMinter(gov.address);
    await token.addMinter(game.address);
    await po.addAdmin(pe.address);
    await po.addAdmin(game.address);
    await pe.addAdmin(gov.address);
    await pe.addAdmin(game.address);
    await gov.addAdmin(game.address);
    await game.setup(po.address, pe.address, token.address, uc.address, gov.address);

  })

  it('maxNumberOfMove', async () => {
    // const ethAmount = expandTo18Decimals(10)
    // await game.set(bigNumberify(123))
    // await ss.set(bigNumberify(1), {
    //   ...overrides,
    //   value: ethAmount
    // })

    const value = await game.maxNumberOfMove()
    expect(value.toString()).to.eq('50')
  })

})
