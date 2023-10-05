import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { contactUs } from '../../store/slices/contact-us';

function ContactUsForm({ onContactUs, isContactUsSend }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = () => {
    if (name.length < 1) {
      toast("Name can't be empty");
    } else if (email.length < 1) {
      toast("Email can't be empty");
    } else if (!validateEmail(email)) {
      toast('Please Enter Vailid Email');
    } else if (description.length < 1) {
      toast("Description can't be empty");
    } else {
      onContactUs({ name, email, description });
    }
  };

  useEffect(() => {
    setName('');
    setEmail('');
    setDescription('');

    if (isContactUsSend === 'success') {
      toast("Contact Send Successfully , W'll back to you shortly");
    }
  }, [isContactUsSend]);

  return (
    <div className="row contact-fields">
      <div className="col-md-8 left-form">
        <div className="form-group">
          <label className="sr-only" htmlFor="fname">
            Name *
          </label>
          <input
            className="required form-control"
            id="fname"
            name="fname"
            placeholder="Enter Your Name *"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="sr-only" htmlFor="contactEmail">
            Email *
          </label>
          <input
            className="required form-control h5-email"
            id="contactEmail"
            name="contactEmail"
            placeholder="Email *"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="sr-only" htmlFor="comment">
            Type your message here
          </label>
          <textarea
            className="required form-control"
            id="comment"
            name="comment"
            placeholder="Type your message here *"
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <button type="button" className="btn btn-accent" onClick={handleSubmit}>
          Submit
        </button>
      </div>
      <div className="col-md-4 contact-info">
        <div className="phone">
          <h2>Call</h2>
          <a href="tel:+4046872730">555.555.5555</a>
        </div>
        <div className="email">
          <h2>Email</h2>
          <a href="mailto:info@testmail.com">info@testmail.com</a>
        </div>
        <div className="location">
          <h2>Visit</h2>
          <p>
            One Town Center <br />
            123 Easy Street <br />
            Suite 1000 <br />
            Orlando, FL 32803
            <br />
          </p>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    isContactUsSend: state.contact.contactUsStatus,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onContactUs: (payload) => dispatch(contactUs(payload)),
});
export default connect(mapStateToProps, mapDispatchToProps)(ContactUsForm);
