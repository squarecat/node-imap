import {
  getOrganisation,
  getOrganisationUserStats,
  inviteUserToOrganisation
} from '../services/organisation';

import auth from '../middleware/route-auth';
import logger from '../utils/logger';

export default app => {
  app.get('/api/organisation/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
      const org = await getOrganisation(id);
      return res.send(org);
    } catch (err) {
      logger.error('organisations-rest: error getting organisation');
      logger.error(err);
      return res.status(500).send(err);
    }
  });

  app.get('/api/organisation/stats/:id', auth, async (req, res) => {
    const { id } = req.params;

    try {
      const org = await getOrganisationUserStats(id);
      return res.send(org);
    } catch (err) {
      logger.error('organisations-rest: error getting organisation stats');
      logger.error(err);
      return res.status(500).send(err);
    }
  });

  app.post('/api/organisation/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { email } = req.body;

    try {
      await inviteUserToOrganisation(id, email);
      return res.send({ success: true });
    } catch (err) {
      logger.error('organisations-rest: error getting organisation');
      logger.error(err);
      return res.status(500).send(err);
    }
  });
};
