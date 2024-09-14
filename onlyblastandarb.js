require('dotenv').config();
const { ethers } = require('ethers');
const readline = require('readline');

const privateKey = process.env.PRIVATE_KEY;
const address = process.env.ADDRESS_TANPA_AWALAN_0X;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Menampilkan header log
const logHeader = async () => {
    console.log("AUTOSWAP [BLAST TO ARBITRUM | ARBITRUM TO BLAST]");
    console.log("================================================");
    console.log("Note : ");
    console.log("- Pastikan file .env sudah terisi dengan PK Anda.");
    console.log("- Tekan CTRL + C untuk berhenti.\n");
};

// Fungsi untuk mendapatkan provider berdasarkan pilihan jaringan
const getProvider = (choice) => {
    let rpcUrl;
    if (choice === '1') {
        rpcUrl = 'https://sepolia.blast.io'; // RPC untuk Blast
    } else if (choice === '2') {
        rpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc'; // RPC untuk Arbitrum
    }
    return new ethers.providers.JsonRpcProvider(rpcUrl);
};

// Data transaksi berdasarkan pilihan pengguna
const getTransactionData = (choice) => {
    if (choice === '1') {
        return {
            to: '0x1D5FD4ed9bDdCCF5A74718B556E9d15743cB26A2', // Alamat tujuan Arbitrum
            data: '0x56591d5961726274000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' + address + '0000000000000000000000000000000000000000000000000021ddda5c7506ec00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002386f26fc10000',
            value: ethers.utils.parseEther('0.01'), // Nilai ETH yang dikirim
        };
    } else if (choice === '2') {
        return {
            to: '0x8D86c3573928CE125f9b2df59918c383aa2B514D', // Alamat tujuan Blast
            data: '0x56591d59626c7373000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000' + address + '0000000000000000000000000000000000000000000000000021e4c1843ff63b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002386f26fc10000',
            value: ethers.utils.parseEther('0.01'), // Nilai ETH yang dikirim
        };
    }
};

// Fungsi untuk mendapatkan semua saldo dari kedua jaringan
const getAllBalances = async () => {
    const providers = {
        blast: getProvider('1'),
        arbitrum: getProvider('2')
    };

    const wallet = new ethers.Wallet(privateKey);

    const balances = await Promise.all([
        providers.blast.getBalance(wallet.address),
        providers.arbitrum.getBalance(wallet.address)
    ]);

    return {
        blast: ethers.utils.formatEther(balances[0]),
        arbitrum: ethers.utils.formatEther(balances[1])
    };
};

// Fungsi untuk memeriksa saldo dan memilih jaringan yang memiliki saldo cukup
const chooseNetworkBasedOnBalance = async () => {
    const balances = await getAllBalances();
    
    console.log("Saldo Blast:", balances.blast, "ETH");
    console.log("Saldo Arbitrum:", balances.arbitrum, "ETH");

    if (parseFloat(balances.blast) >= 0.02) {
        console.log("Menggunakan jaringan Blast");
        return '1'; // Pilih Blast jika saldo cukup
    } else if (parseFloat(balances.arbitrum) >= 0.02) {
        console.log("Menggunakan jaringan Arbitrum");
        return '2'; // Pilih Arbitrum jika saldo cukup
    } else {
        console.log("Tidak ada jaringan yang memiliki saldo cukup.");
        return null; // Jika tidak ada jaringan yang memiliki saldo cukup
    }
};

// Fungsi untuk menanyakan pilihan jaringan pengguna
const askUserChoice = () => {
    return new Promise((resolve) => {
        rl.question(`Silakan pilih Transaksi:
=================================
1. Blast ke Arbitrum
2. Arbitrum ke Blast
Masukkan Pilihan: `, (answer) => {
            resolve(answer);
        });
    });
};

// Mengirim transaksi berdasarkan pilihan pengguna
let transactionCount = 1;

const sendTransaction = async (choice) => {
    try {
        const provider = getProvider(choice);
        const wallet = new ethers.Wallet(privateKey, provider);

        // Mendapatkan data transaksi berdasarkan pilihan
        const txData = getTransactionData(choice);

        // Mengirim transaksi
        const txResponse = await wallet.sendTransaction(txData);
        const txReceipt = await txResponse.wait();

        // Mencetak informasi transaksi
        const balance = ethers.utils.formatEther(await provider.getBalance(wallet.address));
        const txHash = txResponse.hash;
        const shortenedHash = `${txHash.substring(0, 10)}...`;

        console.log(`Nomor\t: ${transactionCount}\nBalance\t: ${balance} ETH\nBlock\t: ${txReceipt.blockNumber}\nTx hash\t: ${shortenedHash}`);

        transactionCount++; // Menambah nomor transaksi
    } catch (error) {
        console.error(`Error pada transaksi nomor ${transactionCount}`, error);
        transactionCount++; // Tetap menambah nomor transaksi meskipun terjadi error
    }
};

// Fungsi utama untuk menjalankan program
const main = async () => {
    await logHeader();

    let choice = await askUserChoice();

    // Memeriksa saldo dan memilih jaringan secara otomatis jika saldo tidak cukup
    if (choice === '1' || choice === '2') {
        while (true) {
            const selectedNetwork = await chooseNetworkBasedOnBalance();
            if (selectedNetwork) {
                await sendTransaction(selectedNetwork);
                await new Promise((resolve) => setTimeout(resolve, 3000)); // Tunggu 3 detik sebelum transaksi berikutnya
            } else {
                console.log("Saldo di kedua jaringan kurang dari 0.02 ETH. Program dihentikan.");
                break;
            }
        }
    } else {
        console.log('Pilihan tidak valid. Harap pilih 1 atau 2.');
    }
};

main();
