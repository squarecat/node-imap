import './org.module.scss';

import {
  InviteFormMultiple,
  InviteLink
} from '../../../components/form/invite';
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
            You can invite anyone inside or outside your company by email
            address:
          </p>
          <InviteFormMultiple organisationId={id} />
        </div>
      );
    },
    [organisation]
  );

  return content;
}

export default InviteSection;
