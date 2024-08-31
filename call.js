require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

const privateKey = process.env.PRIVATE_KEY;
const address = process.env.ADDRESS_TANPA_AWALAN_0X;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const logHeader = () => {
    console.log("AUTOSWAP T3RN [ SILENT AIRDROP ]");
    console.log("================================");
    console.log("Note : ");
    console.log("- Sebelum jalankan bot isi file .env dengan PK mu..");
    console.log("- Jika Reward tidak masuk Ubah pair");
    console.log("- Untuk stop tekan CTRL + C\n");
};

const askUserChoice = () => {
    return new Promise((resolve) => {
        rl.question(`Silahkan pilih Transaksi
===============================
1. Op sepolia to Arb sepolia
2. Arb sepolia to Op sepolia
3. Blast to Optimism sepolia
Masukan Pilihan     : `, (answer) => {
            resolve(answer);
        });
    });
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getProvider = (choice) => {
    let rpcUrl, chainId;
    if (choice === '1') {
        rpcUrl = 'https://sepolia.optimism.io';
        chainId = 11155420;
    } else if (choice === '2') {
        rpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc';
        chainId = 421614;
    } else if (choice === '3') {
        rpcUrl = 'https://sepolia.blast.io';
        chainId = 168587773;
    }
    return new ethers.providers.JsonRpcProvider(rpcUrl, { chainId });
};

const getTransactionData = (choice) => {
    let txData = {};
    if (choice === '1') {
        txData.to = '0xF221750e52aA080835d2957F2Eed0d5d7dDD8C38';
        txData.data = '0x56591d5961726274000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'+ address +'00000000000000000000000000000000000000000000000000005401f94790de000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c6bf52634000';
    } else if (choice === '2') {
        txData.to = '0x8d86c3573928ce125f9b2df59918c383aa2b514d';
        txData.data = '0x56591d596f707370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'+ address +'0000000000000000000000000000000000000000000000000001c467cfa579fa000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c6bf52634000';
    } else if (choice === '3') {
        txData.to = '0x1D5FD4ed9bDdCCF5A74718B556E9d15743cB26A2';
        txData.data = '0x56591d596f707370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'+ address +'0000000000000000000000000000000000000000000000000001c467cef89a0c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001c6bf52634000';
    }
    txData.value = ethers.utils.parseEther('0.0005');
    return txData;
};

let transactionCount = 1; // Counter for transactions

const sendTransaction = async (choice) => {
    try {
        const provider = getProvider(choice);
        const wallet = new ethers.Wallet(privateKey, provider);

        const txData = getTransactionData(choice);

        console.log('Sending transaction...');
        const txResponse = await wallet.sendTransaction(txData);

        console.log('Waiting for confirmation...');
        const txReceipt = await txResponse.wait();

        const balance = ethers.utils.formatEther(await provider.getBalance(wallet.address));

        console.log(`\n${transactionCount}. Sukses\nBalance\t\t: ${balance} ETH\nBlock Number\t: ${txReceipt.blockNumber}\nTx hash\t\t: ${txResponse.hash}`);
        
        transactionCount++; // Increment the transaction count

        return txResponse; // Returning txResponse for further use in main()
    } catch (error) {
        console.error('Error sending transaction:', error);
    }
};

const main = async () => {
    logHeader();
    while (true) {
        const choice = await askUserChoice();
        if (choice === '1' || choice === '2' || choice === '3') {
            // Mengirim transaksi setiap 10 detik
            while (true) {
                await sendTransaction(choice);
                console.log('Menunggu 10 detik sebelum transaksi berikutnya...');
                await sleep(10000); // Tunggu 10 detik
            }
        } else {
            console.log('Pilihan tidak valid. Silakan pilih 1 atau 2.');
        }
    }
};

main();
