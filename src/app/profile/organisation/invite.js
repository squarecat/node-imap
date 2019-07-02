import './org.module.scss';

import { InviteForm, InviteLink } from '../../../components/form/invite';
import React, { useMemo } from 'react';

function InviteSection({ organisation }) {
  const content = useMemo(
    () => {
      if (!organisation) {
        return null;
      }
      const { id, inviteCode, allowAnyUserWithCompanyEmail } = organisation;

      return (
        <div styleName="organisation-section">
          <h2>Invite Users</h2>
          {allowAnyUserWithCompanyEmail ? (
            <>
              <p>
                Any user with your company domain can join. Instead of inviting
                them all, you can share this link:
              </p>
              <InviteLink code={inviteCode} />
            </>
          ) : null}
          <p>
            You can invite any member inside or outside of your organisation by
            email address. Members will be able to sign-in or connect an account
            with this email address.
          </p>
          <InviteForm organisationId={id} />
        </div>
      );
    },
    [organisation]
  );

  return content;
}

export default InviteSection;
