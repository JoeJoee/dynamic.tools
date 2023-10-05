import React from 'react';

function NotesAccordion({ title, note, id }) {
  return (
    <div id="accordion" className="py-2">
      <div className="card">
        <div className="card-header" id={id}>
          <h5 className="mb-0">
            <button
              type="button"
              className="btn"
              data-toggle="collapse"
              data-target={`#collapse${id}`}
              aria-expanded="false"
              aria-controls={`collapse${id}`}
            >
              {title}
            </button>
          </h5>
        </div>
        <div id={`collapse${id}`} className="collapse show" aria-labelledby={id} data-parent="#accordion">
          <div className="card-body" style={{ color: 'black' }}>
            {note}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesAccordion;
