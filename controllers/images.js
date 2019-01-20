const cloudinary = require('cloudinary');
const HttpStatus = require('http-status-codes');

const User = require('../models/user');

cloudinary.config({
  cloud_name: 'codester47',
  api_key: '383616613174939',
  api_secret: 'wHFQ1sPzofWNop1kdo8-7XUogfc'
});

module.exports = {
  UploadImage(req, res) {
    console.log(req.body);
    cloudinary.uploader.upload(req.body.image, async result => {
      await User.update(
        {
          _id: req.user._id
        },
        {
          picId: result.public_id,
          picVersion: result.version
        }
      )
        .then(() =>
          res
            .status(HttpStatus.OK)
            .json({ message: 'Image uploaded successfully' })
        )
        .catch(err =>
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .json({ message: 'Error uploading image' })
        );
    });
  },

  async SetDefaultImage(req, res) {
    const { imgId, imgVersion } = req.params;

    await User.update(
      {
        _id: req.user._id
      },
      {
        picId: imgId,
        picVersion: imgVersion
      }
    )
      .then(() =>
        res.status(HttpStatus.OK).json({ message: 'Default image set' })
      )
      .catch(err =>
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json({ message: 'Error occured' })
      );
  }
};
