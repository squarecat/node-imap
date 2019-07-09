import * as PaymentService from '../services/payments';

import {
  getOrganisationById,
  getOrganisationPayments,
  getOrganisationSubscription,
  getOrganisationUserStats,
  inviteUserToOrganisation,
  removeUserFromOrganisation,
  revokeOrganisationInvite,
  updateOrganisation
} from '../services/organisation';

import Joi from 'joi';
import { RestError } from '../utils/errors';
import auth from '../middleware/route-auth';
import logger from '../utils/logger';

// import { validateBody } from '../middleware/validation';

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

  app.get('/api/organisation/:id/stats', auth, async (req, res, next) => {
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

  app.get(
    '/api/organisation/:id/subscription',
    auth,
    async (req, res, next) => {
      const { id } = req.params;

      try {
        const subscription = await getOrganisationSubscription(id);
        return res.send(subscription);
      } catch (err) {
        logger.error(
          'organisations-rest: error getting organisation subscription'
        );
        logger.error(err);
        next(
          new RestError('failed to get organisation subscription', {
            organisationId: id,
            cause: err
          })
        );
      }
    }
  );

  app.get('/api/organisation/:id/billing', auth, async (req, res, next) => {
    const { id } = req.params;
    try {
      const payments = await getOrganisationPayments(id);
      res.send(payments);
    } catch (err) {
      next(
        new RestError('failed to get organisation payments', {
          organisationId: id,
          cause: err
        })
      );
    }
  });

  app.patch('/api/organisation/:id/invite', auth, async (req, res, next) => {
    const { id } = req.params;
    const { op, value: email } = req.body;

    try {
      if (op === 'add') {
        inviteUserToOrganisation(id, email);
        return res.status(202).send();
      } else if (op === 'remove') {
        const updatedOrg = await revokeOrganisationInvite(id, email);
        return res.send(updatedOrg);
      }

      logger.error(
        `organisations-rest: organisation patch op not supported ${op}`
      );
      throw new Error('organisations patch not supported');
    } catch (err) {
      logger.error('organisations-rest: error inviting user to organisation');
      logger.error(err);
      next(
        new RestError('failed to patch invite', {
          organisationId: id,
          cause: err
        })
      );
    }
  });

  app.patch(
    '/api/organisation/:id',
    auth,
    // validateBody(updateParams, {
    //   passthrough: true
    // }),
    async (req, res, next) => {
      const { id } = req.params;
      const { op, value } = req.body;
      try {
        let updatedOrg;
        if (op === 'update') {
          updatedOrg = await updateOrganisation(id, value);
        } else if (op === 'remove-user') {
          updatedOrg = await removeUserFromOrganisation(id, { email: value });
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

  app.patch('/api/organisation/:id/billing', auth, async (req, res, next) => {
    const { id } = req.params;
    const { op, value } = req.body;
    try {
      let updatedOrg;
      if (op === 'update') {
        updatedOrg = await PaymentService.updateBillingForOrganisation(
          id,
          value
        );
      } else {
        logger.error(
          `organisations-rest: organisation billing patch op not supported ${op}`
        );
        throw new Error('organisations billing patch not supported');
      }
      res.send(updatedOrg);
    } catch (err) {
      next(
        new RestError('failed to billing patch organisation', {
          organisationId: id,
          op,
          cause: err
        })
      );
    }
  });
};

const updateParams = {
  allowAnyUserWithCompanyEmail: Joi.boolean()
};
