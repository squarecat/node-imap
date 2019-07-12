import './beta-testers.module.scss';

import React from 'react';

const BETA_TESTERS = [
  'sanv725',
  'stephsmithio',
  'jesswallaceuk',
  'matteing',
  'Leonhitchens',
  'rastakik_',
  'lordserch',
  'robertjgabriel',
  'pradipcloud',
  'fajarsiddiqfs',
  'AlinaCSava',
  'rbossk757',
  'm1guelpf',
  'marcperel',
  '_justirma',
  'Rossdavis',
  'tobyallen007',
  'edvinsantonovs',
  'kerrtrvs',
  'joshbal4',
  'vertis',
  'MrSimonBennett'
];

const BASE_IMG_URL = `${process.env.CDN_URL}/images/beta-testers`;

export default function BetaTesters() {
  return (
    <ul styleName="beta-list">
      {BETA_TESTERS.map(name => (
        <a
          key={name}
          href={`https:/twitter.com/${name}`}
          target="_"
          styleName="beta-member"
        >
          <li>
            <img
              styleName="beta-img"
              src={`${BASE_IMG_URL}/${name}.jpg`}
              alt={`profile picture of ${name}`}
            />
          </li>
        </a>
      ))}
    </ul>
  );
}
