import React, { useCallback, useState } from 'react';
import { connect } from 'react-redux';
import { usePopper } from 'react-popper';
import twitterIcon from '../../assets/images/twitter.png';
import { saveFeedback } from '../../store/slices/user';

const twitterUrl = 'https://twitter.com/dynamicnfttools';

function Footer({ saveFeedbackAction, walletAddress }) {
  const [feedbackReferenceElement, setFeedbackReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [showFeedbackWidget, setShowFeedbackWidget] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const { styles, attributes } = usePopper(feedbackReferenceElement, popperElement, {
    modifiers: [{ name: 'offset', options: { offset: [10, 10] } }],
  });

  const onSaveFeedback = useCallback(
    (e) => {
      e.preventDefault();

      if (!feedbackText) {
        return;
      }

      saveFeedbackAction({
        text: feedbackText,
        walletAddress,
      }).then(() => {
        setFeedbackText('');
        setShowFeedbackWidget(false);
      });
    },
    [feedbackText, saveFeedbackAction, walletAddress]
  );

  return (
    <footer className="footer">
      <p className="copyright">&copy; 2023 dynamic.tools. All rights reserved</p>
      <img
        src={twitterIcon}
        className="twitter-icon pointer"
        alt="Twitter icon"
        onClick={() => window.open(twitterUrl, '_blank')}
      />
      <button
        type="button"
        ref={setFeedbackReferenceElement}
        onClick={() => setShowFeedbackWidget(!showFeedbackWidget)}
        className="feedback-button"
      >
        Feedback
      </button>
      {showFeedbackWidget ? (
        <div ref={setPopperElement} className="feedback-popup" style={styles.popper} {...attributes.popper}>
          <form onSubmit={onSaveFeedback}>
            <label htmlFor="feedback">How can we improve?</label>
            <textarea id="feedback" type="textarea" onChange={(e) => setFeedbackText(e.target.value)} />
            <button className="feedback-submit-button" type="submit" disabled={!feedbackText}>
              Send Feedback
            </button>
          </form>
        </div>
      ) : null}
    </footer>
  );
}

const mapStateToProps = (state) => {
  return {
    walletAddress: state.user.walletAddress,
  };
};

const mapDispatchToProps = (dispatch) => ({
  saveFeedbackAction: (payload) => dispatch(saveFeedback(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
