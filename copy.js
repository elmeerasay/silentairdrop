require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

const privateKey = process.env.PRIVATE_KEY;
const address = process.env.ADDRESS_TANPA_AWALAN_0X;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const logHeader = async () => {
    console.log("AUTOSWAP T3RN [ SILENT AIRDROP ]");
    console.log("================================");
    console.log("Note : ");
    console.log("- Sebelum jalankan bot isi file .env dengan PK mu..");
    console.log("- Jika Reward tidak masuk Ubah pair");
    console.log("- Jika eror silahkan ganti jaringan | cek saldo");
    console.log("- Untuk stop tekan CTRL + C\n");

    const balances = await getAllBalances();
    console.log("Wallet Balance");
    console.log("==============================");
    console.log(`1. Optimism : ${balances.optimism} ETH`);
    console.log(`2. Arb      : ${balances.arbitrum} ETH`);
    console.log(`3. Blast    : ${balances.blast} ETH\n`);
};

const askUserChoice = () => {
    return new Promise((resolve) => {
        rl.question(`Silahkan pilih Transaksi
===============================
1. Optimism to Arbitrum
2. Arbitrum to Optimism
3. Blast to Optimism
4. Optimism to Blast
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
    } else if (choice === '4') {
        rpcUrl = 'https://sepolia.optimism.io';
        chainId = 11155420;
    }
    return new ethers.providers.JsonRpcProvider(rpcUrl, { chainId });
};

const getTransactionData = (choice) => {
    let txData = {};
    if (choice === '1') {
        txData.to = '0xF221750e52aA080835d2957F2Eed0d5d7dDD8C38';
        txData.data = '0x56591d5961726274000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'+ address +'0000000000000000000000000000000000000000000000000002be50f94737d80000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000';
    } else if (choice === '2') {
        txData.to = '0x8d86c3573928ce125f9b2df59918c383aa2b514d';
        txData.data = '0x56591d596f707370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'+ address +'00000000000000000000000000000000000000000000000000035fd3d50083bd0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000';
    } else if (choice === '3') {
        txData.to = '0x1D5FD4ed9bDdCCF5A74718B556E9d15743cB26A2';
        txData.data = '0x56591d596f707370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'+ address +'00000000000000000000000000000000000000000000000000035fd3d392322d0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000';
    } else if (choice === '4') {
        txData.to = '0xF221750e52aA080835d2957F2Eed0d5d7dDD8C38';
        txData.data = '0x56591d59626c7373000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'+ address +'00000000000000000000000000000000000000000000000000035fd464fddf0e0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000038d7ea4c68000';

    }
    txData.value = ethers.utils.parseEther('0.001');
    return txData;
};

let transactionCount = 1; // Counter for transactions

const sendTransaction = async (choice) => {
    try {
        const provider = getProvider(choice);
        const wallet = new ethers.Wallet(privateKey, provider);

        const txData = getTransactionData(choice);

        //console.log('Sending transaction...');
        const txResponse = await wallet.sendTransaction(txData);

        //console.log('Waiting for confirmation...');
        const txReceipt = await txResponse.wait();

        const balance = ethers.utils.formatEther(await provider.getBalance(wallet.address));

        console.log(`\n${transactionCount}. Sukses\nBalance\t\t: ${balance} ETH\nBlock Number\t: ${txReceipt.blockNumber}\nTx hash\t\t: ${txResponse.hash}`);
        
        transactionCount++; // Increment the transaction count

        return txResponse; // Returning txResponse for further use in main()
    } catch (error) {
        console.error('Failed :', error);
    }
};

const getAllBalances = async () => {
    const providers = {
        optimism: getProvider('1'),
        arbitrum: getProvider('2'),
        blast: getProvider('3')
    };

    const wallet = new ethers.Wallet(privateKey);
    
    const balances = await Promise.all([
        providers.optimism.getBalance(wallet.address),
        providers.arbitrum.getBalance(wallet.address),
        providers.blast.getBalance(wallet.address),
    ]);

    return {
        optimism: ethers.utils.formatEther(balances[0]),
        arbitrum: ethers.utils.formatEther(balances[1]),
        blast: ethers.utils.formatEther(balances[2])
    };
};

const main = async () => {
    await logHeader();
    while (true) {
        const choice = await askUserChoice();
        if (choice === '1' || choice === '2' || choice === '3' || choice === '4') {
            // Mengirim transaksi setiap 10 detik
            while (true) {
                await sendTransaction(choice);
                //console.log('Menunggu 3 detik sebelum transaksi berikutnya...');
                await sleep(3000); // Tunggu 10 detik
            }
        } else {
            console.log('Pilihan tidak valid. Silakan pilih 1 ,2 , 3 , 4');
        }
    }
};

main();
