import { ethers } from "ethers";

/**
 * Generates a random Ethereum wallet.
 * Returns the address and private key (Note: In a real app, securely store the private key!).
 * For this MVP, we only strictly need the address for the public ledger.
 */
export function createRandomWallet() {
    const wallet = ethers.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase
    };
}

/**
 * Validates if a string is a valid Ethereum address.
 */
export function isValidAddress(address: string) {
    return ethers.isAddress(address);
}
