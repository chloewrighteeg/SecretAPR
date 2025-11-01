import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: '',
  projectId: '51fbb7d6d1d16baf34b93cf9f5a353a6',
  chains: [sepolia],
  ssr: false,
});
