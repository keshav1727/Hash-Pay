import React, { useState } from "react";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
  Transaction,
  SystemProgram,
} from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

const dummyMap = {
  n1KmCcNYTb15Gzfbqo7aD818Dj1XPe2CcXUhfHfB3US3a6sUUxUimAcGhw4HJDwTvpkJCeDWCAbJRQdFL543UPwyhp36WoqqGLez6MX1tgsNnHm4vHzkQzFJBHbLUk6j1RAL1oKae6hutaf18J7isuMFGvxkB8p4N7mLSmdwXZppA5JCH4w5Zz6uZG1J3Fe3wi3ANASTs5ptdEWJJ1t9q2BKdgYQ1HCQ4ss1hxWDQE56eJ6hya8gchBHxSwr9GhTWgYFBFaKoAzECLQGHQJddiNLSSfWGRhvntQNe8qPNLFMUi3D1Af8vE76iEY5JNaEp4dcRNJKs99z4m2aMuH3i9YZaf1PkCj1FYjesxAvD8gTAjgaEpKLDY8PkfrbGVnLRnaAG7ThT2Yo3Rv48WUjQadTuyCeN7xvdzbJ8Pfy6VbiKhiAxu6qcuhCR9EUEiUfPGWfrFa6knFtz4P8MhwvStdAFDwCEt59CRFsZ1meoX1w4NhNJXaHzHnNUPn8y6rvKntaujMnaqNYEbspoLpfCSH3a6kwBmVchiRBmXYU2wbZUwckiDiurUzkHVHvVfYKdgtd7YJ41k71sa5F22mesxcqJ1LQqsygXLwU1PrpGUSdWeLJtH2mR3NKNzvR1ErY8xr6BeBdvYFt6RYp2YEtfbaMK9zHXHCfTgk1nbkHue5Yh15BLihhwEeo5YdVTBtiPjAxykD6Pwu1FKYT41DPByhVBN6ywiPbeSjH12MqNQAa6uiH98zpdsFxgWR5d33hVSuBTPkFFSquq: [
    "3rQZ6UPr2L2qrzBeT74Y41KLZRxAN6onqbvGoRP7S5Gi",
    "CnJ3hzWWDTwwsxrxVDE4pDN7CtLGL4NEeiqvTf1pyV8Q",
  ],
};

function App() {
  const [hashKey, setHashKey] = useState("");
  const [wallets, setWallets] = useState([]);
  const [amounts, setAmounts] = useState({});

  const fetchWallets = () => {
    setWallets(dummyMap[hashKey] || []);
  };

  const handlePayment = async (toAddress) => {
    try {
      if (!window.solana || !window.solana.isPhantom) {
        alert("Phantom Wallet not found");
        return;
      }

      const amount = parseFloat(amounts[toAddress]);
      if (!amount || isNaN(amount) || amount <= 0) {
        alert("Enter valid amount");
        return;
      }

      const provider = window.solana;
      await provider.connect();
      const fromPubkey = provider.publicKey;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey: new PublicKey(toAddress),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const signed = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(signature);

      alert(`✅ Sent ${amount} SOL to ${toAddress}\nTx: ${signature}`);
    } catch (e) {
      console.error(e);
      alert("❌ Payment failed");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>🔐 Enter Hash Key</h2>
      <input
        type="text"
        value={hashKey}
        onChange={(e) => setHashKey(e.target.value)}
        placeholder="Enter hash..."
      />
      <button onClick={fetchWallets} style={{ marginLeft: 10 }}>
        Fetch Wallets
      </button>

      {wallets.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>🔽 Wallet List:</h3>
          {wallets.map((address, index) => (
            <div key={index} style={{ marginBottom: 20 }}>
              <p><strong>{address}</strong></p>
              <input
                type="number"
                placeholder="Amount in SOL"
                onChange={(e) =>
                  setAmounts({ ...amounts, [address]: e.target.value })
                }
              />
              <button onClick={() => handlePayment(address)}>Pay</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
