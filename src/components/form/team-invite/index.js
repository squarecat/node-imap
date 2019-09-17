import './team-invite.module.scss';

import { InviteForm, InviteFormMultiple, InviteLink } from '../invite';
import React, { useMemo } from 'react';

function TeamInvite({ organisation, multiple = true, onSuccess = () => {} }) {
  const content = useMemo(() => {
    if (!organisation) {
      return null;
    }
    const {
      id,
      domain,
      inviteCode,
      allowAnyUserWithCompanyEmail
    } = organisation;

    return (
      <>
        {allowAnyUserWithCompanyEmail && domain ? (
          <>
            <p>
              Share the link to add anyone with an allowed email domain to your
              team.
            </p>
            <InviteLink code={inviteCode} />
            <span styleName="separator" />
          </>
        ) : null}
        <p>Invite anyone to join your team using their email address:</p>
        {multiple ? (
          <InviteFormMultiple organisationId={id} onSuccess={onSuccess} />
        ) : (
          <InviteForm organisationId={id} onSuccess={onSuccess} />
        )}
      </>
    );
  }, [multiple, onSuccess, organisation]);

  return content;
}

export default TeamInvite;
