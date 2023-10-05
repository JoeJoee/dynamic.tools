import React, { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useResizable } from 'react-resizable-layout';
import ClipLoader from 'react-spinners/ClipLoader';
import LayoutSplitter from '../components/layout/splitter';
import TradingView from '../components/analytics/TradingView';
import CollectionStatisticsView from '../components/analytics/CollectionStatisticsView';
import CollectionNoteView from '../components/analytics/CollectionNoteView';
import CollectionResistanceView from '../components/analytics/CollectionResistanceView';
import CollectionInfoView from '../components/analytics/CollectionInfoView';
import {
  getCollections,
  clearCollectionListings,
  clearCollectionSales,
  getCollectionDetails,
} from '../store/slices/collection';

function AnalyticsPageComponent({
  getCollectionsAction,
  clearCollectionListingsAction,
  clearCollectionSalesAction,
  getCollectionDetailsAction,
  collectionDetailsData,
  collectionData,
}) {
  const { slug } = useParams();
  const leftPanelRef = useRef();
  const rightPanelRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    clearCollectionListingsAction();
    clearCollectionSalesAction();
  }, [clearCollectionListingsAction, clearCollectionSalesAction]);

  useEffect(() => {
    getCollectionDetailsAction(slug);
  }, [getCollectionDetailsAction, slug]);

  // If the route does not contain the collection slug, we need to load the collection list
  useEffect(() => {
    if (!slug) {
      getCollectionsAction({ offset: 0 });
    }
  }, [getCollectionsAction, slug]);

  /*
   * If the route does not contain the collection slug and the collection list is updated in the store,
   * we try to navigate to the analytics page of the first collection in the list
   */
  useEffect(() => {
    if (!slug) {
      const collectionSlug = collectionData && collectionData.length ? collectionData[0].slug : '';

      if (collectionSlug) {
        setTimeout(() => {
          navigate(`/collection/${collectionSlug}`);
        }, 3000);
      }
    }
  }, [collectionData, slug, navigate]);

  const {
    isDragging: isCollectionViewPanelDragging,
    position: collectionViewPanelWidth,
    splitterProps: collectionViewPanelDragBarProps,
  } = useResizable({
    axis: 'x',
    initial: 300,
    min: 10,
    reverse: true,
  });

  const {
    isDragging: isNotePanelDragging,
    position: notePanelHeight,
    splitterProps: notePanelDragBarProps,
  } = useResizable({
    axis: 'y',
    initial: 170,
    min: 10,
    reverse: true,
    containerRef: leftPanelRef,
  });

  const {
    isDragging: isCollectionLinksPanelDragging,
    position: linksPanelHeight,
    splitterProps: linksPanelDragBarProps,
  } = useResizable({
    axis: 'y',
    initial: 350,
    min: 10,
    reverse: true,
    containerRef: rightPanelRef,
  });

  return (
    <div className="content analytics-page">
      {slug ? (
        <>
          <div className="collection-view-panel" ref={leftPanelRef}>
            <div className="collection-graph-panel">
              <CollectionStatisticsView data={collectionDetailsData} />
              <TradingView data={collectionDetailsData} />
            </div>
            <LayoutSplitter dir="horizontal" isDragging={isNotePanelDragging} {...notePanelDragBarProps} />
            <div
              className={clsx('collection-note-panel', {
                dragging: isNotePanelDragging,
              })}
              style={{ height: notePanelHeight }}
            >
              <CollectionNoteView slug={slug} />
            </div>
          </div>
          <LayoutSplitter isDragging={isCollectionViewPanelDragging} {...collectionViewPanelDragBarProps} />
          <div
            className={clsx('collection-details-panel', {
              dragging: isCollectionViewPanelDragging,
            })}
            style={{ width: collectionViewPanelWidth }}
            ref={rightPanelRef}
          >
            <div className="collection-resistance-panel">
              <CollectionResistanceView slug={slug} />
            </div>
            <LayoutSplitter dir="horizontal" isDragging={isCollectionLinksPanelDragging} {...linksPanelDragBarProps} />
            <div
              className={clsx('collection-links-panel', {
                dragging: isCollectionLinksPanelDragging,
              })}
              style={{ height: linksPanelHeight }}
            >
              <CollectionInfoView data={collectionDetailsData} />
            </div>
          </div>
        </>
      ) : (
        <div className="spinner-wrapper">
          <ClipLoader color="#9A75E2" loading size={100} />
          <div className="spinner-label">Loading data</div>
        </div>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    collectionData: state.collection.collectionData,
    collectionDetailsData: state.collection.collectionDetailsData,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getCollectionsAction: (payload) => dispatch(getCollections(payload)),
  getCollectionDetailsAction: (payload) => dispatch(getCollectionDetails(payload)),
  clearCollectionListingsAction: (payload) => dispatch(clearCollectionListings(payload)),
  clearCollectionSalesAction: (payload) => dispatch(clearCollectionSales(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsPageComponent);
