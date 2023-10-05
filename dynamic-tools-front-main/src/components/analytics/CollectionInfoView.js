import React from 'react';
import moment from 'moment';
import etherscanLogo from '../../assets/images/etherscan.png';
import openseaLogo from '../../assets/images/opensea.svg';
import discordLogo from '../../assets/images/discord.png';
import twitterLogo from '../../assets/images/twitter.png';
import instagramLogo from '../../assets/images/instagram.svg';

const openseaUrl = 'https://opensea.io/collection';
const etherscanUrl = 'https://etherscan.io/address';
const twitterUrl = 'https://twitter.com';
const instagramUrl = 'https://www.instagram.com';

function CollectionInfoView({ data }) {
  const primaryAssetContract =
    data && data.primaryAssetContracts && data.primaryAssetContracts[0] ? data.primaryAssetContracts[0] : null;

  const navigateToPage = (url) => {
    window.open(url, '_blank').focus();
  };

  return (
    <div className="collection-info">
      {data ? (
        <>
          {primaryAssetContract ? (
            <div className="collection-info-section">
              <div className="collection-info-section-title">Asset address</div>
              <div className="collection-info-section-value">{primaryAssetContract.address}</div>
            </div>
          ) : null}
          <div className="collection-info-section">
            <div className="collection-info-section-title">Creation date</div>
            <div className="collection-info-section-value">{moment(data.createdDate).format('YYYY-MM-DD HH:mm')}</div>
          </div>
          <div className="collection-info-section">
            <div className="collection-info-section-title">Collection info</div>
            <div className="collection-info-section-body">
              {primaryAssetContract ? (
                <button
                  type="button"
                  className="collection-info-button"
                  onClick={() => navigateToPage(`${etherscanUrl}/${primaryAssetContract.address}`)}
                >
                  <div className="collection-info-button-name">Etherscan</div>
                  <img className="collection-info-button-icon" src={etherscanLogo} alt="Etherscan icon" />
                </button>
              ) : null}
              {data.discordUrl ? (
                <button
                  type="button"
                  className="collection-info-button"
                  onClick={() => navigateToPage(data.discordUrl)}
                >
                  <div className="collection-info-button-name">Discord</div>
                  <img className="collection-info-button-icon" src={discordLogo} alt="Discord icon" />
                </button>
              ) : null}
              {data.twitterUsername ? (
                <button
                  type="button"
                  className="collection-info-button"
                  onClick={() => navigateToPage(`${twitterUrl}/${data.twitterUsername}`)}
                >
                  <div className="collection-info-button-name">Twitter</div>
                  <img className="collection-info-button-icon" src={twitterLogo} alt="Twitter icon" />
                </button>
              ) : null}
              {data.instagramUsername ? (
                <button
                  type="button"
                  className="collection-info-button"
                  onClick={() => navigateToPage(`${instagramUrl}/${data.instagramUsername}`)}
                >
                  <div className="collection-info-button-name">Instagram</div>
                  <img className="collection-info-button-icon" src={instagramLogo} alt="Instagram icon" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="collection-info-section">
            <div className="collection-info-section-title">Buy Now</div>
            <div className="collection-info-section-body">
              {primaryAssetContract ? (
                <button
                  type="button"
                  className="collection-info-button"
                  onClick={() => navigateToPage(`${openseaUrl}/${data.slug}`)}
                >
                  <div className="collection-info-button-name">OpenSea</div>
                  <img className="collection-info-button-icon" src={openseaLogo} alt="OpenSea icon" />
                </button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default CollectionInfoView;
