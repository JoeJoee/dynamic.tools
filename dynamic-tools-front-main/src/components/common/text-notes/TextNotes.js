import React from 'react';

function TextNotes({ onClick, onChangeNotes, onChangeNotesTitle, notesTitleValue, notesvalue }) {
  return (
    <div className="market-text-editor">
      <ul className="text-edit-list text-edit-list-new">
        <li className="d-flex">
          <p>Text Note</p>
          <input
            type="text"
            className="ml-4"
            placeholder="Enter Note Title"
            onChange={onChangeNotesTitle}
            value={notesTitleValue}
          />
        </li>
        <li style={{ cursor: 'pointer' }}>
          <p onClick={onClick}>save notes</p>
        </li>
      </ul>
      <div className="text-aria">
        <textarea onChange={onChangeNotes} value={notesvalue} placeholder="Enter Notes Here" />
      </div>
    </div>
  );
}

export default TextNotes;
