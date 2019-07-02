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
              <span styleName="separator" />
            </>
          ) : null}
          <p>
            Or you can invite anyone inside or outside your organisation by
            email address:
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
