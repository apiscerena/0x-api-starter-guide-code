import * as qs from 'qs';
import * as fetch from 'node-fetch';

import { setUpWeb3GanacheAsync, baseUnitAmount, fetchERC20BalanceFactory } from './utils';

const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL;
const MNEMONIC = process.env.MNEMONIC;
const DAI_CONTRACT = '0x6b175474e89094c44da98b954eedeac495271d0f';

(async () => {
    const { web3Wrapper, provider } = await setUpWeb3GanacheAsync(MNEMONIC, ETHEREUM_RPC_URL);

    // 1. call 0x api for a quote for one dollar of DAI.
    const buyAmount = baseUnitAmount(1);

    const userAddresses = await web3Wrapper.getAvailableAddressesAsync();
    const takerAddress = userAddresses[0];

    let params = {
        sellToken: 'ETH',
        buyToken: 'DAI',
        buyAmount: buyAmount.toString(),
    }
    
    const fetchDAIBalanceAsync = fetchERC20BalanceFactory(provider, DAI_CONTRACT);

    const res = await fetch(`https://api.0x.org/swap/v0/quote?${qs.stringify(params)}`);
    const quote = await res.json()

    try {
        console.log(`contract dai balance before: ${await fetchDAIBalanceAsync(takerAddress)}`);
        await web3Wrapper.sendTransactionAsync(quote);
        console.log(`contract dai balance after: ${await fetchDAIBalanceAsync(takerAddress)}`);
    } catch (e) {
        console.log(e)
    }
})();