import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import fs from 'fs';
import { imageStoragePath } from 'getconfig';

export default function(app) {
  app.get('/api/mail/image/:mailId', auth, async (req, res, next) => {
    const { user, params } = req;
    const { mailId } = params;
    const path = `${imageStoragePath}/${user.id}/${mailId}.png`;
    try {
      if (fs.existsSync(path)) {
        return res.sendFile(path);
      }
      return res.sendStatus(404);
    } catch (err) {
      next(
        new RestError('Failed to get mail image', {
          userId: user.id,
          path,
          cause: err
        })
      );
    }
  });
}
