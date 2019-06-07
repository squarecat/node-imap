import {
  getOrganisationById,
  getOrganisationUserStats,
  inviteUserToOrganisation,
  updateOrganisation
} from '../services/organisation';

import Joi from 'joi';
import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import logger from '../utils/logger';
import { validateBody } from '../middleware/validation';

export default app => {
  app.get('/api/organisation/:id', auth, async (req, res, next) => {
    const { id } = req.params;

    try {
      const org = await getOrganisationById(id);
      return res.send(org);
    } catch (err) {
      logger.error('organisations-rest: error getting organisation');
      logger.error(err);
      next(
        new RestError('failed to get organisation', {
          organisationId: id,
          cause: err
        })
      );
    }
  });

  app.get('/api/organisation/stats/:id', auth, async (req, res, next) => {
    const { id } = req.params;

    try {
      const org = await getOrganisationUserStats(id);
      return res.send(org);
    } catch (err) {
      logger.error('organisations-rest: error getting organisation stats');
      logger.error(err);
      next(
        new RestError('failed to get organisation stats', {
          organisationId: id,
          cause: err
        })
      );
    }
  });

  app.post('/api/organisation/:id/invite', auth, async (req, res, next) => {
    const { id } = req.params;
    const { email } = req.body;

    try {
      await inviteUserToOrganisation(id, email);
      return res.send({ success: true });
    } catch (err) {
      logger.error('organisations-rest: error getting organisation');
      logger.error(err);
      next(
        new RestError('failed to send invite', {
          organisationId: id,
          cause: err
        })
      );
    }
  });

  app.patch(
    '/api/organisation/:id',
    auth,
    validateBody(updateParams, {
      passthrough: true
    }),
    async (req, res, next) => {
      const { id } = req.params;
      const { op, value } = req.body;
      try {
        let updatedOrg;
        if (op === 'update') {
          updatedOrg = await updateOrganisation(id, value);
        } else {
          logger.error(
            `organisations-rest: organisation patch op not supported ${op}`
          );
          throw new Error('organisations patch not supported');
        }
        res.send(updatedOrg);
      } catch (err) {
        next(
          new RestError('failed to patch organisation', {
            organisationId: id,
            op,
            cause: err
          })
        );
      }
    }
  );
};

const updateParams = {
  allowAnyUserWithCompanyEmail: Joi.boolean()
};
