const { Router } = require('express');
const ethUtil = require('ethereumjs-util');
const jwt = require('jsonwebtoken');

const { JWT_EXPIRATION_HOURS, JWT_SECRET } = process.env;

const User = require('../models/user');

const router = Router({ mergeParams: true });
const userController = router;

// Return the nonce value for the DB user with the specified wallet address
router.get('/:address/nonce', async (req, res) => {
  const address = req.params.address;

  if (!address) {
    return res.sendStatus(400);
  }

  const user = await User.findOne({ walletAddress: address }).lean();

  if (user === null) {
    return res.sendStatus(404);
  }

  let nonce = user.nonce;

  if (!nonce) {
    nonce = Math.floor(Math.random() * 1000000);
    await User.updateOne({ walletAddress: address }, { nonce });
  }

  return res.json({ nonce });
});

// Return existing user or register a new one
router.post('/', async (req, res) => {
  const newUser = req.body;

  if (!newUser || !newUser.walletAddress) {
    return res.sendStatus(400);
  }

  const existingUser = await User.findOne({ walletAddress: newUser.walletAddress }).lean();

  if (existingUser) {
    return res.json({ result: existingUser });
  }

  if (!newUser.nonce) {
    newUser.nonce = Math.floor(Math.random() * 1000000);
  }

  const dbUser = await User.create(new User(newUser));

  return res.json({ result: dbUser });
});

// Authenticate the user
router.post('/:address/login', async (req, res) => {
  const address = req.params.address;

  if (!address) {
    return res.sendStatus(400);
  }

  const signature = req.body.signature;

  if (!signature) {
    return res.sendStatus(400);
  }

  const user = await User.findOne({ walletAddress: address }).lean();

  if (user) {
    const msgToSign = `Nonce: ${user.nonce}`;

    // Convert message to the hex string
    const msgHex = ethUtil.bufferToHex(Buffer.from(msgToSign));

    // Check if the signature is valid
    const msgBuffer = ethUtil.toBuffer(msgHex);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(msgHash, signatureParams.v, signatureParams.r, signatureParams.s);
    const addresBuffer = ethUtil.publicToAddress(publicKey);
    const signatureAddress = ethUtil.bufferToHex(addresBuffer);

    // Check if the addresses match
    if (signatureAddress && signatureAddress.toLowerCase() === address.toLowerCase()) {
      // Update user nonce
      const newNonce = Math.floor(Math.random() * 1000000);
      await User.updateOne({ walletAddress: address }, { nonce: newNonce });

      // Create a jwt token
      const token = jwt.sign(
        {
          _id: user._id,
          walletAddress: user.walletAddress,
        },
        JWT_SECRET,
        { expiresIn: `${JWT_EXPIRATION_HOURS}h` }
      );

      return res.status(200).json({
        token,
        user,
      });
    }

    // User is not authenticated
    return res.status(401);
  }

  return res.sendStatus(404);
});

module.exports = userController;
