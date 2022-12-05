import React from 'react';
import styled from 'styled-components';

import { GRAY, REACT_GRAY, PURPLE, WHITE, DARK_GRAY } from '../../constants';

import { hexToRGB } from '../../utils';

import Button from '../Button';
import { ConnectedAccounts, ConnectedMethods } from '../../App';
import { SupportedChainIcons, SupportedEVMChainIds } from '../../types';
import getChainName from '../../utils/getChainName';

// =============================================================================
// Styled Components
// =============================================================================

const Main = styled.main`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  align-items: center;
  background-color: ${REACT_GRAY};
  > * {
    margin-bottom: 10px;
  }
  @media (max-width: 768px) {
    width: 100%;
    height: auto;
  }
`;

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  button {
    margin-bottom: 15px;
  }
`;

const Link = styled.a.attrs({
  href: 'https://phantom.app/',
  target: '_blank',
  rel: 'noopener noreferrer',
})`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-decoration: none;
  margin-bottom: 30px;
  padding: 5px;
  &:focus-visible {
    outline: 2px solid ${hexToRGB(GRAY, 0.5)};
    border-radius: 6px;
  }
`;

const Subtitle = styled.h5`
  color: ${GRAY};
  font-weight: 400;
`;

const Pre = styled.pre`
  margin-bottom: 5px;
`;

const AccountRow = styled.div`
  display: flex;
  :first-of-type {
    margin-bottom: 8px;
  }
`;

const Badge = styled.div`
  margin: 0;
  padding: 10px;
  width: 100%;
  color: ${PURPLE};
  background-color: ${hexToRGB(PURPLE, 0.2)};
  font-size: 14px;
  border-radius: 6px;
  @media (max-width: 400px) {
    width: 280px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  @media (max-width: 320px) {
    width: 220px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  ::selection {
    color: ${WHITE};
    background-color: ${hexToRGB(PURPLE, 0.5)};
  }
  ::-moz-selection {
    color: ${WHITE};
    background-color: ${hexToRGB(PURPLE, 0.5)};
  }
`;

const Divider = styled.div`
  border: 1px solid ${DARK_GRAY};
  height: 1px;
  margin: 20px 0;
`;

const Tag = styled.p`
  text-align: center;
  color: ${GRAY};
  a {
    color: ${PURPLE};
    text-decoration: none;
    ::selection {
      color: ${WHITE};
      background-color: ${hexToRGB(PURPLE, 0.5)};
    }
    ::-moz-selection {
      color: ${WHITE};
      background-color: ${hexToRGB(PURPLE, 0.5)};
    }
  }
  @media (max-width: 320px) {
    font-size: 14px;
  }
  ::selection {
    color: ${WHITE};
    background-color: ${hexToRGB(PURPLE, 0.5)};
  }
  ::-moz-selection {
    color: ${WHITE};
    background-color: ${hexToRGB(PURPLE, 0.5)};
  }
`;

const ChainIcon = styled.img`
  height: ${(props) => props.height};
  width: ${(props) => props.height};
  border-radius: ${(props) => props.height};
  margin-right: 6px;
`;

// =============================================================================
// Typedefs
// =============================================================================

interface Props {
  connectedMethods: ConnectedMethods[];
  connectedEthereumChainId: SupportedEVMChainIds | null;
  connectedAccounts: ConnectedAccounts;
  connect: () => Promise<void>;
}

// =============================================================================
// Main Component
// =============================================================================
[];
const Sidebar = React.memo((props: Props) => {
  const { connectedAccounts, connectedEthereumChainId, connectedMethods, connect } = props;
  return (
    <Main>
      <Body>
        <Link>
          <img src="https://phantom.app/img/phantom-logo.svg" alt="Phantom" width="200" />
          <Subtitle>Multi-chain Sandbox</Subtitle>
        </Link>
        {connectedAccounts?.solana ? (
          // connected
          <>
            <div>
              <Pre>Connected as</Pre>
              <AccountRow>
                <ChainIcon src={SupportedChainIcons.Solana} height="36px" />
                <Badge>{connectedAccounts?.solana?.toBase58()}</Badge>
              </AccountRow>
              <AccountRow>
                <ChainIcon src={SupportedChainIcons.Ethereum} height="36px" />
                <Badge>{connectedAccounts?.ethereum}</Badge>
              </AccountRow>
              <p>Current Chain: {connectedEthereumChainId}</p>
              <Divider />
            </div>
            {connectedMethods.map((method, i) => (
              <Button key={`${method.name}-${i}`} onClick={method.onClick}>
                <ChainIcon src={SupportedChainIcons[method.chain]} height="16px" />
                <span>{method.name}</span>
              </Button>
            ))}
            <select>
              {Object.keys(SupportedEVMChainIds).map((key, i) => (
                <option key={`${SupportedEVMChainIds[key]}-${i}`}>{getChainName(SupportedEVMChainIds[key])}</option>
              ))}
            </select>
          </>
        ) : (
          // not connected
          <Button onClick={connect}>Connect to Phantom</Button>
        )}
      </Body>
      {/* 😊 💕  */}
      <Tag>
        Made with{' '}
        <span role="img" aria-label="Red Heart Emoji">
          ❤️
        </span>{' '}
        by the <a href="https://phantom.app">Phantom</a> team
      </Tag>
    </Main>
  );
});

export default Sidebar;
