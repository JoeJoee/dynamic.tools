import React, { useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import * as moment from 'moment';
import { getCollectionNotes, saveCollectionNote, deleteCollectionNote } from '../../store/slices/collection';

const notePageSize = 100;

function CollectionNoteView({ getCollectionNotesAction, notes, slug, walletAddress }) {
  const [viewMode, setViewMode] = useState('view');
  const [title, setTitle] = useState('');
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    getCollectionNotesAction({
      slug,
      offset: 0,
      limit: notePageSize,
      walletAddress,
    });
  }, [getCollectionNotesAction, slug, walletAddress]);

  const clearNoteForm = useCallback(() => {
    setTitle('');
    setNoteText('');
  }, []);

  const saveNote = useCallback(() => {
    if (title && noteText) {
      saveCollectionNote({
        slug,
        title,
        text: noteText,
        walletAddress,
      })
        .then(() => {
          toast('Note has been successfully saved');
          getCollectionNotesAction({
            slug,
            offset: 0,
            limit: notePageSize,
            walletAddress,
          });
          setViewMode('view');
          clearNoteForm();
        })
        .catch((e) => {
          toast.error('Failed to save the note');
        });
    }
  }, [noteText, title, slug, clearNoteForm, getCollectionNotesAction, walletAddress]);

  const onDeleteNoteClicked = useCallback(
    (item) => {
      deleteCollectionNote(item._id).then(() => {
        getCollectionNotesAction({
          slug,
          offset: 0,
          limit: notePageSize,
          walletAddress,
        });
      });
    },
    [getCollectionNotesAction, slug, walletAddress]
  );

  return (
    <div className="note-wrapper">
      {walletAddress && viewMode === 'view' ? (
        <div className="note-list-view">
          {notes && notes.length ? (
            <ul className="note-list">
              {notes.map((note) => (
                <div key={note._id} className="note-list-item-wrapper">
                  <i className="fa fa-trash negative" onClick={() => onDeleteNoteClicked(note)} />
                  <div className="note-list-item-content">
                    <div className="note-list-item-title">
                      {moment(note.createdAt).format('YYYY-MM-DD HH:mm')} - <i>{note.title}</i>
                    </div>
                    <p className="note-list-item-content">{note.text}</p>
                  </div>
                </div>
              ))}
            </ul>
          ) : (
            <h4 className="note-info-message">No notes found for this collection</h4>
          )}
          <button type="button" className="btn note-control-button" onClick={() => setViewMode('create')}>
            Add new note
          </button>
        </div>
      ) : null}
      {walletAddress && viewMode !== 'view' ? (
        <div className="new-note-view">
          <div className="new-note-area">
            <div className="note-control-panel">
              <div className="note-info-label">New Note</div>
              <input
                type="text"
                className="note-info-input "
                placeholder="Enter note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <textarea
              className="note-content-area"
              value={noteText}
              placeholder="Enter note text"
              onChange={(e) => setNoteText(e.target.value)}
            />
          </div>
          <div className="new-note-button-panel">
            <button type="button" className="btn note-control-button" onClick={() => setViewMode('view')}>
              Cancel
            </button>
            <button
              type="button"
              className="btn note-control-button save-btn"
              disabled={!title || !noteText}
              onClick={saveNote}
            >
              Save Note
            </button>
          </div>
        </div>
      ) : null}
      {walletAddress ? null : (
        <h4 className="note-info-message">You need to connect wallet in order to see the notes</h4>
      )}
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    notes: state.collection.collectionNotes,
    walletAddress: state.user.walletAddress,
  };
};

const mapDispatchToProps = (dispatch) => ({
  getCollectionNotesAction: (payload) => dispatch(getCollectionNotes(payload)),
});

export default connect(mapStateToProps, mapDispatchToProps)(CollectionNoteView);
