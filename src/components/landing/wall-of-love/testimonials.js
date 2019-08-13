import './wall-of-love.module.scss';

import React from 'react';
import { TextHighlight } from '../../text';

const BASE_IMG_URL = `${process.env.CDN_URL}/images/testimonials`;

export default [
  {
    name: 'Brendan Weinstein',
    text: (
      <span>
        I have tried countless tools and email clients to help get through the
        thousands of useless emails I received daily.{' '}
        <TextHighlight>
          Nothing has worked nearly as seamlessly and effectively as Leave Me
          Alone
        </TextHighlight>
        . For the first time in years I have control over my inbox again. Highly
        recommend to anybody dealing with overloaded inboxes.
      </span>
    ),
    twitter: `BMWeinstein7`,
    avatarPath: `image-1.jpg`
  },

  {
    name: 'Pradip Khakhar',
    text: (
      <span>
        Leave Me Alone is a fantastic product to{' '}
        <TextHighlight>easily unsubscribe from unwanted emails</TextHighlight>.
        When I started using Leave Me Alone I had about 50k emails in my inbox,
        I am now down to 5k! Danielle and James are super responsive and always
        open for feedback.
      </span>
    ),
    twitter: `pradipcloud`,
    avatarPath: `image-2.jpg`
  },

  {
    name: 'Kerr Travers',
    text: (
      <span>
        Leave Me Alone let me{' '}
        <TextHighlight>easily clean up my inbox</TextHighlight> and direct my
        focus to more important emails.
      </span>
    ),
    twitter: `kerrtrvs`,
    avatarPath: `image-3.jpg`
  },
  {
    name: 'Josh Manders',
    text: (
      <span>
        I've signed up for a bunch of newsletters over the years and they flood
        me with emails that I just can't be bothered to handle, so I just delete
        them as they come in. Since using Leave Me Alone I don't have to do that
        anymore. I can{' '}
        <TextHighlight>officially get off unwanted email lists</TextHighlight>.
        I love this service.
      </span>
    ),
    twitter: `joshmanders`,
    avatarPath: `image-4.jpg`,
    company: (
      <img
        styleName="company-logo"
        src={`${BASE_IMG_URL}/companies/appmetrics.jpg`}
      />
    )
  },

  {
    name: 'Sergio Mattei',
    text: (
      <span>
        Until recently, my personal emails were garbage dumps of old
        subscriptions I've gathered over a decade. Now,{' '}
        <TextHighlight>
          my inbox only receives the emails that matter most
        </TextHighlight>
        . Leave Me Alone gave me something I didn't even know I wanted: inbox
        sanity!
      </span>
    ),
    twitter: `matteing`,
    avatarPath: `image-5.jpg`,
    company: (
      <>
        <img
          styleName="company-logo"
          src={`${BASE_IMG_URL}/companies/makerlog.jpg`}
        />
        <span styleName="company-name">Makerlog</span>
      </>
    )
  },

  {
    name: 'Jess Wallace',
    text: (
      <span>
        Leave Me Alone has helped me reduce spam 1000% over. I often would join
        things, and forget about it and I'd be getting marketing emails for
        years. I'm managing to clear a tonne of junk with Leave Me Alone and{' '}
        <TextHighlight>
          keep my inbox more focused on what matters
        </TextHighlight>
        .
      </span>
    ),
    twitter: `jesswallaceuk`,
    avatarPath: `image-6.jpg`,
    company: (
      <>
        <img
          styleName="company-logo"
          src={`${BASE_IMG_URL}/companies/coderstory.svg`}
        />
        <span styleName="company-name">CoderStory</span>
      </>
    )
  },

  {
    name: 'Fermin Rodriguez',
    text: (
      <span>
        If it wasn't for Leave Me Alone I would never have been able to
        unsubscribe from more than 250 subscriptions taking over my inbox. I can
        now{' '}
        <TextHighlight>
          take care of the really important emails without all the noise
        </TextHighlight>
        .
      </span>
    ),
    twitter: `Ferminrp`,
    avatarPath: `image-7.jpg`
  },

  {
    name: "Jordan O'Connor",
    text: (
      <span>
        Since using Leave Me Alone months ago, I have had a much less noisy
        inbox. By{' '}
        <TextHighlight>
          getting rid of all of those marketing emails
        </TextHighlight>
        , email is a much more enjoyable experience. Definitely a great
        investment for my future sanity!
      </span>
    ),
    twitter: `unindie`,
    avatarPath: `image-8.jpg`
  },

  {
    name: 'Marie',
    text: (
      <span>
        <TextHighlight>
          Unsubscribing to spam is really painful. Leave Me Alone makes it
          effortless.
        </TextHighlight>{' '}
        It's so satisfying to untick all those boxes and unsubscribe so easily.
      </span>
    ),
    twitter: `marie_dm_`,
    avatarPath: `image-9.jpg`,
    company: (
      <img
        styleName="company-logo"
        src={`${BASE_IMG_URL}/companies/threader.jpg`}
      />
    )
  },

  {
    name: 'Luke Chadwick',
    text: (
      <span>
        Using Leave Me Alone has resulted in a{' '}
        <TextHighlight>17% reduction in my emails</TextHighlight>, saving me
        hours of time each month.
      </span>
    ),
    twitter: `vertis`,
    avatarPath: `image-10.jpg`,
    company: (
      <span styleName="invert graphql360">
        <img
          styleName="company-logo"
          src={`${BASE_IMG_URL}/companies/graphql360.png`}
        />
      </span>
    )
  },

  {
    name: 'Tom Haworth',
    text: (
      <span>
        I must admit I'm lazy at unsubscribing to subscription emails, so my
        email inbox grows at an alarming rate every day. I just used Leave Me
        Alone and{' '}
        <TextHighlight>unsubscribed to 15 emails in 3 minutes</TextHighlight>{' '}
        What a great idea!
      </span>
    ),
    twitter: `tomhaworth_b13`,
    avatarPath: `image-11.jpg`,
    company: (
      <span styleName="invert b13technology">
        <img
          styleName="company-logo"
          src={`${BASE_IMG_URL}/companies/b13technology.webp`}
        />
      </span>
    )
  },

  {
    name: 'Dianna Allen',
    text: (
      <span>
        Leave Me Alone cleared my inbox from any and all junk. Not only that,
        but I was able to{' '}
        <TextHighlight>
          easily unsubscribe from past newsletters that I have no interest in
          receiving anymore
        </TextHighlight>
        . Now, I spend minimal time checking my email every day. And when I do
        get an email, I know it's important.
      </span>
    ),
    twitter: `diannamallen`,
    avatarPath: `image-12.jpg`,
    company: (
      <>
        <img
          styleName="company-logo"
          src={`${BASE_IMG_URL}/companies/budget-meal-planner.png`}
        />
        <span styleName="company-name">Budget Meal Planner</span>
      </>
    )
  },

  {
    name: 'Ross Kinkade',
    text: (
      <span>
        As an aspiring Consultant I am barraged with offers and spam everyday.
        It's refreshing to{' '}
        <TextHighlight>finally achieve inbox zero</TextHighlight> through Leave
        Me Alone, while also supporting two awesome Indie Founders.
      </span>
    ),
    twitter: `rbossk757`,
    avatarPath: `image-13.jpg`,
    company: (
      <img
        styleName="company-logo"
        src={`${BASE_IMG_URL}/companies/roviki-solutions.jpg`}
      />
    )
  },

  {
    name: 'Steph Smith',
    text: (
      <span>
        I love how Leave Me Alone{' '}
        <TextHighlight>
          seamlessly allows you to visualize your inbox and then remove the junk
          - permanently
        </TextHighlight>
        ! I found the product so valuable that I ended up buying scans for my
        entire team. In the age of constant distraction, it's nice to have a
        tool helping me have a clearer mind (and inbox!).
      </span>
    ),
    twitter: `stephsmithio`,
    avatarPath: `image-14.jpg`,
    company: (
      <img
        styleName="company-logo"
        src={`${BASE_IMG_URL}/companies/toptal.png`}
      />
    )
  },

  {
    name: 'JJ',
    text: (
      <span>
        If you value your time and really hate having to trawl through junk
        email to get to the important stuff, then Leave Me Alone is your
        solution. Added to that,{' '}
        <TextHighlight>
          it’s privacy-focused, simple and easy to use
        </TextHighlight>
        , and beautifully designed.
      </span>
    ),
    twitter: `jjbuildit`,
    avatarPath: `image-15.jpg`,
    company: (
      <img
        styleName="company-logo ptobot"
        src={`${BASE_IMG_URL}/companies/ptobot.svg`}
      />
    )
  },

  {
    name: 'Ben Song',
    text: (
      <span>
        <TextHighlight>
          Using Leave Me Alone to clean up my inbox has saved me countless hours
        </TextHighlight>
        . I was able to unsubscribe from dozens of emails in just a few minutes.
        Leave Me Alone is an excellent productivity booster!
      </span>
    ),
    twitter: `bensong`,
    avatarPath: `image-16.jpg`
  },

  {
    name: 'Dinuka Jayasuriya',
    text: (
      <span>
        Leave Me Alone helped me{' '}
        <TextHighlight>
          clean out all the spam and email subscriptions that I've been avoiding
        </TextHighlight>{' '}
        and reduced the burden on checking emails every day!
      </span>
    ),
    twitter: `dinuka_jay`,
    avatarPath: `image-17.jpg`,
    company: (
      <img
        styleName="company-logo"
        src={`${BASE_IMG_URL}/companies/tutorseek.png`}
      />
    )
  },

  {
    name: 'Marijke Peereboom',
    text: (
      <span>
        <TextHighlight>
          Within half an hour I was able to delete more than 160 newsletters
        </TextHighlight>
        . I saved the most important emails afterwards, deleted all the other
        ones, and managed to get to inbox zero the same day. Now I am so much
        more focused as there are only a few emails I have to deal with each
        day. Well done to Leave Me Alone!
      </span>
    ),
    twitter: `dubriger`,
    avatarPath: ``
  },

  {
    name: 'Tamara Sredojevic',
    text: (
      <span>
        <TextHighlight>I love to know that my data is safe</TextHighlight>.
        Leave Me Alone is user friendly, it's beautiful and it does the job
        well. What more could I ask for?
      </span>
    ),
    twitter: `gimmeacamera`,
    avatarPath: `image-18.jpg`
  },

  {
    name: 'AC Dye',
    text: (
      <span>
        <TextHighlight>
          Leave Me Alone is such an easy to use tool
        </TextHighlight>
        , and I love supporting indie founders. Danielle and James are active on
        Twitter, and they are always ready to help any way they can.
      </span>
    ),
    twitter: `acdyee`,
    avatarPath: `image-19.jpg`
  },

  {
    name: 'Kyle McDonald',
    text: (
      <span>
        After attending CES{' '}
        <TextHighlight>
          my inbox gets filled with tons of subscription emails from all the
          company email lists
        </TextHighlight>{' '}
        you get added to. I needed to get these out of my inbox and Leave Me
        Alone allowed me to do that so much faster then I would have been able
        to do it manually.
      </span>
    ),
    twitter: `designbykyle`,
    avatarPath: `image-20.jpg`
  }

  // {
  //   name: "",
  //   text: (
  //     <span>

  //       <TextHighlight>

  //       </TextHighlight>

  //     </span>
  //   ),
  //   twitter: ``,
  //   avatarPath: ``
  // }
];
