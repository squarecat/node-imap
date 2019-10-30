import { UserContext } from '../../providers/user-provider';
import { useContext, useMemo, useState, useEffect } from 'react';
import _isEqual from 'lodash.isequal';

export default (reduce = a => a, deps = []) => {
  const context = useContext(UserContext);
  const [user, dispatch] = context;
  const [state, setState] = useState(reduce(user) || null);

  useEffect(() => {
    const props = reduce(user) || null;
    // deep equal
    if (!_isEqual(props, state)) {
      setState(props);
    }
  }, [reduce, state, user, deps]);

  const actions = useMemo(() => {
    return Object.keys(functions).reduce((out, name) => {
      const type = functions[name];
      return {
        ...out,
        [name]: data => dispatch({ type, data })
      };
    }, {});
  }, [dispatch]);

  return [state, actions];
};

const functions = {
  load: 'load',
  addUnsub: 'add-unsub',
  updateReportedUnsub: 'update-reported-unsub',
  update: 'update',
  incrementUnsubCount: 'increment-unsub-count',
  setIgnoredSenderList: 'set-ignored',
  setReminder: 'set-reminder',
  setLastScan: 'set-last-scan',
  setPreferences: 'set-preferences',
  setRequiresTwoFactorAuth: 'set-requires-two-factor-auth',
  setbrowserUuid: 'set-browser-id',
  setMilestoneCompleted: 'set-milestone-completed',
  setBilling: 'set-billing',
  setCard: 'set-card',
  setCredits: 'set-credits',
  incrementCredits: 'increment-credits',
  setOrganisation: 'set-organisation',
  setOrganisationLastUpdated: 'set-organisation-last-updated',
  invalidateAccount: 'invalidate-account'
};
