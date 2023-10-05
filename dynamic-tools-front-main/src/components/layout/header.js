import React, { useCallback, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as _ from 'lodash';
import clsx from 'clsx';

import { saveUserAddress, setWalletAddress } from '../../store/slices/user';
import { getCollections, setSearchValue } from '../../store/slices/collection';
import { getMarketSummary } from '../../store/slices/market-summary';
import logoImage from '../../assets/images/Logo.png';
import logoutIcon from '../../assets/images/logout.png';
import ethereumImage from '../../assets/images/ethereum-header.svg';

function HeaderComponent({
  saveUserAddressAction,
  marketSummaryData,
  getCollectionsAction,
  setSearchValueAction,
  getMarketSummaryAction,
  setWalletAddressAction,
  collectionData,
  collectionDataStatus,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const [loggedIn, setLoggedIn] = useState(false);
  const [metamaskAccount, setMetamaskAccount] = useState('');
  const [originalAccountId, setOriginalAccountId] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const collectionSlug = collectionData && collectionData.length ? collectionData[0].slug : '';

  const menuItems = [
    ...(collectionSlug
      ? [
          {
            label: 'Analytics',
            link: '/',
          },
        ]
      : []),
    {
      label: 'Trending',
      link: '/collection',
    },
  ];

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast('MetaMask is not installed!');

      return;
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    const originalAccountId = accounts[0];
    const accountsId = accounts[0].split('').fill('.', 3, -4).join('');
    const mainAccountId = accountsId.split('').fill('', 5, -6).join('');

    localStorage.setItem('originalAccountId', originalAccountId);
    localStorage.setItem('metamaskId', mainAccountId);
    localStorage.setItem('loggedInToMetaMask', true);

    setWalletAddressAction(originalAccountId);
    setOriginalAccountId(originalAccountId);
    setMetamaskAccount(mainAccountId);
    setLoggedIn(true);
  };

  const clearAccountData = useCallback(() => {
    setWalletAddressAction('');
    setOriginalAccountId('');
    setMetamaskAccount('');
    setLoggedIn(false);

    localStorage.clear();
  }, [setWalletAddressAction]);

  useEffect(() => {
    getMarketSummaryAction();
  }, [getMarketSummaryAction]);

  useEffect(() => {
    const metamaskId = localStorage.getItem('metamaskId');
    const originalAccountId = localStorage.getItem('originalAccountId');

    setMetamaskAccount(metamaskId || '');
    setOriginalAccountId(originalAccountId || '');
    setWalletAddressAction(originalAccountId || '');

    if (originalAccountId) {
      setLoggedIn(true);
    }
  }, [setWalletAddressAction]);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (data) => {
        window.location.reload();

        if (data.length) {
          const temp = data[0].split('').fill('.', 3, -4).join('');
          const metamaskId = temp.split('').fill('', 5, -6).join('');

          localStorage.setItem('loggedInToMetaMask', true);
          localStorage.setItem('metamaskId', metamaskId);
          localStorage.setItem('originalAccountId', data[0]);

          setLoggedIn(true);
          setMetamaskAccount(metamaskId);
          setOriginalAccountId(data[0]);
          setWalletAddressAction(data[0]);
        } else {
          clearAccountData();
        }
      });

      window.ethereum.on('disconnect', clearAccountData);
    }
  }, [setWalletAddressAction, clearAccountData]);

  const refreshCollectionList = useCallback(
    (searchValue) => {
      setSearchValueAction(searchValue || '');
      getCollectionsAction({ offset: 0 });
      if (searchValue && location.pathname !== '/collection') {
        navigate('/collection');
      }
    },
    [getCollectionsAction, setSearchValueAction, location.pathname, navigate]
  );

  const onSearchKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') {
        refreshCollectionList(searchValue);
      }
    },
    [refreshCollectionList, searchValue]
  );

  const onSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      refreshCollectionList(searchValue);
    },
    [refreshCollectionList, searchValue]
  );

  useEffect(() => {
    refreshCollectionList(searchValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loggedIn) {
      saveUserAddressAction({ walletAddress: originalAccountId });
    }
  }, [loggedIn, saveUserAddressAction, originalAccountId]);

  const displayMarketSummary = marketSummaryData && _.isNumber(marketSummaryData.lastEthereumBlockNumber);

  return (
    <header className="header">
      <div className="container-fluid">
        <div className="content">
          <div className="logo pointer" onClick={() => navigate('/')}>
            <img src={logoImage} alt="Logo" />
          </div>
          <div className="beta-label">Beta</div>
          <div className="wrapper">
            <div className="search">
              <form onSubmit={onSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <button type="submit">
                  <i
                    className={clsx('fa', {
                      'fa-search': collectionDataStatus !== 'loading',
                      'fa-spinner fa-spin': collectionDataStatus === 'loading',
                    })}
                  />
                </button>
              </form>
            </div>
            <nav className="nav-left">
              <ul>
                {menuItems.map((menuItem) => {
                  if (menuItem.link) {
                    return (
                      <li key={menuItem.label}>
                        <Link to={menuItem.link}>{menuItem.label}</Link>
                      </li>
                    );
                  }

                  return (
                    <li key={menuItem.label}>
                      <a href="#" data-tip={menuItem.tooltip}>
                        {menuItem.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="nav-right">
              {displayMarketSummary ? (
                <div className="market-summary">
                  <div className="summary-block">
                    <i className="fal fad fa-box" style={{ color: '#F1A451' }} />
                    <span>{marketSummaryData.lastEthereumBlockNumber}</span>
                  </div>
                  <div className="summary-block">
                    <img src={ethereumImage} className="eth-icon" alt="Ethereum logo" />
                    <span>${marketSummaryData.ethereumUsdPrice}</span>
                  </div>
                  <div className="summary-block">
                    <i className="fal fad fa-gas-pump" style={{ color: '#A7F36C' }} />
                    <span>${marketSummaryData.gasUsdPrice}</span>
                  </div>
                </div>
              ) : null}
              <div className="connect-wrapper">
                {loggedIn ? (
                  <>
                    <button type="button" className="btn btn-wallet">
                      Wallet Connected
                      <p className="metamaskId">{metamaskAccount}</p>
                    </button>
                    <img
                      src={logoutIcon}
                      className="btn-logout pointer"
                      alt="Logout button"
                      onClick={clearAccountData}
                    />
                  </>
                ) : (
                  <button type="button" onClick={connectWallet} className="btn btn-wallet">
                    Connect Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const mapStateToProps = (state) => {
  return {
    collectionData: state.collection.collectionData,
    collectionDataStatus: state.collection.collectionDataStatus,
    token: state.user.token,
    userId: state.user.userId,
    marketSummaryData: state.marketSummary.marketSummaryData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  saveUserAddressAction: (payload) => dispatch(saveUserAddress(payload)),
  getCollectionsAction: (payload) => dispatch(getCollections(payload)),
  setSearchValueAction: (payload) => dispatch(setSearchValue(payload)),
  getMarketSummaryAction: (payload) => dispatch(getMarketSummary(payload)),
  setWalletAddressAction: (payload) => dispatch(setWalletAddress(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(HeaderComponent);
