import { useState, useMemo } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Contract, formatEther, parseEther, type InterfaceAbi } from 'ethers';

import { Header } from './Header';
import { useEthersSigner } from '../hooks/useEthersSigner';
import { useZamaInstance } from '../hooks/useZamaInstance';
import {
  STAKING_CONTRACT_ADDRESS,
  STAKING_CONTRACT_ABI,
  COIN_CONTRACT_ADDRESS,
  COIN_CONTRACT_ABI,
  CONTRACTS_CONFIGURED,
} from '../config/contracts';

import '../styles/StakingApp.css';

const COIN_DECIMALS = 1_000_000n;
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

const STAKING_ABI_FOR_ETHERS = STAKING_CONTRACT_ABI as unknown as InterfaceAbi;

type StakeInfo = {
  amount: bigint;
  depositedAt: number;
  lastClaimAt: number;
  totalClaimed: bigint;
  pending: bigint;
};

function formatCoin(value: bigint): string {
  const whole = value / COIN_DECIMALS;
  const fraction = value % COIN_DECIMALS;
  const fractionPadded = fraction.toString().padStart(6, '0').replace(/0+$/, '');
  return fractionPadded.length > 0 ? `${whole}.${fractionPadded}` : `${whole}`;
}

function formatTimestamp(timestamp: number): string {
  if (!timestamp) {
    return '—';
  }
  return new Date(timestamp * 1000).toLocaleString();
}

export function StakingApp() {
  const { address, chainId, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: sepolia.id });
  const signer = useEthersSigner({ chainId: sepolia.id });
  const queryClient = useQueryClient();
  const { instance, isLoading: isZamaLoading, error: zamaError } = useZamaInstance();

  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);

  const wrongNetwork = useMemo(() => {
    if (!chainId) {
      return false;
    }
    return chainId !== sepolia.id;
  }, [chainId]);

  const stakeInfoQuery = useQuery({
    queryKey: ['stake-info', address],
    queryFn: async (): Promise<StakeInfo | null> => {
      if (!publicClient || !address || !CONTRACTS_CONFIGURED) {
        return null;
      }

      const response = (await publicClient.readContract({
        address: STAKING_CONTRACT_ADDRESS,
        abi: STAKING_CONTRACT_ABI,
        functionName: 'getStake',
        args: [address],
      })) as readonly [bigint, bigint, bigint, bigint, bigint];

      return {
        amount: response[0],
        depositedAt: Number(response[1]),
        lastClaimAt: Number(response[2]),
        totalClaimed: response[3],
        pending: response[4],
      };
    },
    enabled: Boolean(publicClient && address && CONTRACTS_CONFIGURED),
    refetchInterval: 15_000,
  });

  const coinBalanceQuery = useQuery({
    queryKey: ['coin-balance', address],
    queryFn: async (): Promise<`0x${string}`> => {
      if (!publicClient || !address || !CONTRACTS_CONFIGURED) {
        return ZERO_HASH as `0x${string}`;
      }

      const encryptedBalance = (await publicClient.readContract({
        address: COIN_CONTRACT_ADDRESS,
        abi: COIN_CONTRACT_ABI,
        functionName: 'confidentialBalanceOf',
        args: [address],
      })) as `0x${string}`;

      return encryptedBalance;
    },
    enabled: Boolean(publicClient && address && CONTRACTS_CONFIGURED),
    refetchInterval: 15_000,
  });

  const handleStake = async () => {
    if (!stakeAmount.trim()) {
      alert('Enter an amount to stake');
      return;
    }

    if (!CONTRACTS_CONFIGURED) {
      alert('Contracts are not configured. Deploy the contracts and update addresses first.');
      return;
    }

    const value = Number(stakeAmount);
    if (Number.isNaN(value) || value <= 0) {
      alert('Stake amount must be positive');
      return;
    }

    const resolvedSigner = await signer;
    if (!resolvedSigner) {
      alert('Connect your wallet to stake');
      return;
    }

    setIsSubmitting(true);
    try {
      const contract = new Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI_FOR_ETHERS, resolvedSigner);
      const tx = await contract.stake({ value: parseEther(stakeAmount) });
      await tx.wait();
      setStakeAmount('');
      setDecryptedBalance(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stake-info', address] }),
        queryClient.invalidateQueries({ queryKey: ['coin-balance', address] }),
      ]);
    } catch (error) {
      console.error('Stake failed:', error);
      alert(error instanceof Error ? error.message : 'Stake transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount.trim()) {
      alert('Enter an amount to unstake');
      return;
    }

    if (!CONTRACTS_CONFIGURED) {
      alert('Contracts are not configured. Deploy the contracts and update addresses first.');
      return;
    }

    const value = Number(unstakeAmount);
    if (Number.isNaN(value) || value <= 0) {
      alert('Unstake amount must be positive');
      return;
    }

    if (!CONTRACTS_CONFIGURED) {
      alert('Contracts are not configured. Deploy the contracts and update addresses first.');
      return;
    }

    const resolvedSigner = await signer;
    if (!resolvedSigner) {
      alert('Connect your wallet to unstake');
      return;
    }

    setIsSubmitting(true);
    try {
      const contract = new Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI_FOR_ETHERS, resolvedSigner);
      const tx = await contract.unstake(parseEther(unstakeAmount));
      await tx.wait();
      setUnstakeAmount('');
      setDecryptedBalance(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stake-info', address] }),
        queryClient.invalidateQueries({ queryKey: ['coin-balance', address] }),
      ]);
    } catch (error) {
      console.error('Unstake failed:', error);
      alert(error instanceof Error ? error.message : 'Unstake transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaim = async () => {
    const resolvedSigner = await signer;
    if (!resolvedSigner) {
      alert('Connect your wallet to claim interest');
      return;
    }

    setIsSubmitting(true);
    try {
      const contract = new Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI_FOR_ETHERS, resolvedSigner);
      const tx = await contract.claimInterest();
      await tx.wait();
      setDecryptedBalance(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['stake-info', address] }),
        queryClient.invalidateQueries({ queryKey: ['coin-balance', address] }),
      ]);
    } catch (error) {
      console.error('Claim failed:', error);
      alert(error instanceof Error ? error.message : 'Claim transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecryptBalance = async () => {
    if (!instance) {
      alert('Encryption service is not ready yet');
      return;
    }
    if (!address) {
      alert('Connect your wallet to decrypt the balance');
      return;
    }

    if (!CONTRACTS_CONFIGURED) {
      alert('Contracts are not configured. Deploy the contracts and update addresses first.');
      return;
    }

    const resolvedSigner = await signer;
    if (!resolvedSigner) {
      alert('Connect your wallet to decrypt the balance');
      return;
    }

    const encryptedBalance = coinBalanceQuery.data;
    if (!encryptedBalance || encryptedBalance === ZERO_HASH) {
      setDecryptedBalance('0');
      return;
    }

    setIsDecrypting(true);
    try {
      const keypair = instance.generateKeypair();
      const startTimestamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = '7';
      const contractAddresses = [COIN_CONTRACT_ADDRESS];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimestamp,
        durationDays,
      );

      const signature = await resolvedSigner.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message,
      );

      const handlePairs = [
        {
          handle: encryptedBalance,
          contractAddress: COIN_CONTRACT_ADDRESS,
        },
      ];

      const result = await instance.userDecrypt(
        handlePairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace('0x', ''),
        contractAddresses,
        address,
        startTimestamp,
        durationDays,
      );

      const clearValue = result[encryptedBalance as keyof typeof result] ?? '0';
      setDecryptedBalance(formatCoin(BigInt(clearValue)));
    } catch (error) {
      console.error('Decryption failed:', error);
      alert(error instanceof Error ? error.message : 'Failed to decrypt balance');
    } finally {
      setIsDecrypting(false);
    }
  };

  const stakeInfo = stakeInfoQuery.data;
  const encryptedBalance = coinBalanceQuery.data;

  return (
    <div className="staking-app">
      <Header />
      <main className="staking-main">
        <section className="staking-intro">
          <h1 className="staking-headline">Earn 1000 COIN per day for every staked ETH</h1>
          <p className="staking-subtitle">
            Stake ETH to accrue confidential COIN rewards powered by Zama FHE. Interest compounds linearly and can be
            claimed at any time.
          </p>
        </section>

        {!isConnected ? (
          <div className="staking-card connect-card">
            <p className="connect-message">Connect your wallet to start staking and tracking rewards.</p>
          </div>
        ) : wrongNetwork ? (
          <div className="staking-card warning-card">
            <p className="warning-message">Please switch to the Sepolia network to interact with the staking contract.</p>
          </div>
        ) : !CONTRACTS_CONFIGURED ? (
          <div className="staking-card warning-card">
            <p className="warning-message">Contracts are not configured yet. Deploy to Sepolia and update the addresses.</p>
          </div>
        ) : (
          <div className="staking-grid">
            <div className="staking-card summary-card">
              <h2 className="card-title">Stake Overview</h2>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Staked ETH</span>
                  <span className="summary-value">
                    {stakeInfo ? `${formatEther(stakeInfo.amount)} ETH` : '0 ETH'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Pending COIN</span>
                  <span className="summary-value">
                    {stakeInfo ? `${formatCoin(stakeInfo.pending)} COIN` : '0 COIN'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Claimed COIN</span>
                  <span className="summary-value">
                    {stakeInfo ? `${formatCoin(stakeInfo.totalClaimed)} COIN` : '0 COIN'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Staking Since</span>
                  <span className="summary-value">{stakeInfo ? formatTimestamp(stakeInfo.depositedAt) : '—'}</span>
                </div>
              </div>
            </div>

            <div className="staking-card actions-card">
              <h2 className="card-title">Stake Controls</h2>
              <div className="form-group">
                <label className="input-label">Stake ETH</label>
                <div className="input-row">
                  <input
                    className="number-input"
                    placeholder="0.00"
                    value={stakeAmount}
                    onChange={(event) => setStakeAmount(event.target.value)}
                    type="number"
                    min="0"
                    step="0.0001"
                  />
                  <button className="primary-button" onClick={handleStake} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing…' : 'Stake'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Unstake ETH</label>
                <div className="input-row">
                  <input
                    className="number-input"
                    placeholder="0.00"
                    value={unstakeAmount}
                    onChange={(event) => setUnstakeAmount(event.target.value)}
                    type="number"
                    min="0"
                    step="0.0001"
                  />
                  <button className="secondary-button" onClick={handleUnstake} disabled={isSubmitting}>
                    {isSubmitting ? 'Processing…' : 'Unstake'}
                  </button>
                </div>
              </div>

              <div className="claim-row">
                <button className="outline-button" onClick={handleClaim} disabled={isSubmitting}>
                  {isSubmitting ? 'Processing…' : 'Claim Interest'}
                </button>
              </div>
            </div>

            <div className="staking-card balance-card">
              <h2 className="card-title">Encrypted COIN Balance</h2>
              <p className="balance-description">
                COIN balances remain encrypted on-chain. Reveal the clear value locally through the Zama relayer when you
                need full visibility.
              </p>
              <div className="balance-display">
                <span className="balance-value">{decryptedBalance ?? '***'}</span>
                <span className="balance-suffix">COIN</span>
              </div>
              <div className="balance-meta">
                <span className="meta-label">Ciphertext</span>
                <code className="meta-code">{encryptedBalance ?? ZERO_HASH}</code>
              </div>
              <button className="primary-button" onClick={handleDecryptBalance} disabled={isDecrypting || isZamaLoading}>
                {isDecrypting ? 'Decrypting…' : 'Decrypt Balance'}
              </button>
              {zamaError ? <p className="error-text">{zamaError}</p> : null}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
