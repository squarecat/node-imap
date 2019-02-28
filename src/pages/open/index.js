import './open.module.scss';

import React, { useEffect, useRef } from 'react';
import Table, { TableCell, TableRow } from '../../components/table';

import Chart from 'chart.js';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextLink } from '../../components/text';
import addMonths from 'date-fns/add_months';
import endOfMonth from 'date-fns/end_of_month';
import isWithinRange from 'date-fns/is_within_range';
import numeral from 'numeral';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import { useAsync } from '../../utils/hooks';

const lineColor = '#EB6C69';
const lineColor2 = 'rgb(158, 87, 174)';

function getStats() {
  return fetch('/api/stats').then(resp => resp.json());
}

function getExpenses() {
  return fetch('/api/stats/expenses').then(resp => resp.json());
}

function unsubscriptionsChart(ctx, stats) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  new Chart(ctx, {
    data: {
      datasets: [
        {
          label: 'Unsubscriptions',
          fill: false,
          backgroundColor: lineColor,
          borderColor: lineColor,
          data: histogram.map(d => ({
            x: startOfDay(d.timestamp),
            y: d.unsubscriptions || 0
          }))
        }
      ]
    },
    type: 'line',
    options: {
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              precision: 0
            }
          }
        ]
      },
      responsive: true
    }
  });
}
function dailyRevChart(ctx, stats) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;
  new Chart(ctx, {
    data: {
      datasets: [
        {
          fill: false,
          backgroundColor: lineColor,
          borderColor: lineColor,
          data: histogram.map(d => ({
            x: startOfDay(d.timestamp),
            y: d.totalRevenue || 0
          }))
        },
        {
          fill: false,
          backgroundColor: lineColor2,
          borderColor: lineColor2,
          data: histogram.map(d => ({
            x: startOfDay(d.timestamp),
            y: d.giftRevenue || 0
          }))
        }
      ]
    },
    type: 'line',
    options: {
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      tooltips: {
        callbacks: {
          label: function(items, data) {
            return currency(items.yLabel);
          }
        }
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              precision: 0,
              callback: function(label) {
                return numeral(label).format('$0,0');
              }
            }
          }
        ]
      },
      responsive: true
    }
  });
}

function scanChart(ctx, stats) {
  return simpleLineChart(ctx, stats, 'scans');
}
function referralChart(ctx, stats) {
  return simpleLineChart(ctx, stats, 'referralSignup');
}
function usersChart(ctx, stats) {
  return simpleLineChart(ctx, stats, 'users');
}

function simpleLineChart(ctx, stats, stat) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  new Chart(ctx, {
    data: {
      datasets: [
        {
          fill: false,
          backgroundColor: lineColor,
          borderColor: lineColor,
          data: histogram.map(d => ({
            x: startOfDay(d.timestamp),
            y: d[stat] || 0
          }))
        }
      ]
    },
    type: 'line',
    options: {
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              precision: 0
            }
          }
        ]
      },
      responsive: true
    }
  });
}

function mailtoLinkPieChart(ctx, stats) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  const data = histogram.reduce(
    (out, d) => {
      return {
        unsubscriptionsByMailtoStrategy:
          out.unsubscriptionsByMailtoStrategy +
            d.unsubscriptionsByMailtoStrategy || 0,
        unsubscriptionsByLinkStrategy:
          out.unsubscriptionsByLinkStrategy + d.unsubscriptionsByLinkStrategy ||
          0
      };
    },
    { unsubscriptionsByLinkStrategy: 0, unsubscriptionsByMailtoStrategy: 0 }
  );

  new Chart(ctx, {
    data: {
      datasets: [
        {
          backgroundColor: [lineColor, lineColor2],
          data: [
            data.unsubscriptionsByLinkStrategy,
            data.unsubscriptionsByMailtoStrategy
          ]
        }
      ],
      labels: ['Link', 'Mailto']
    },
    type: 'pie',
    options: {
      legend: {
        display: false
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

export default function Terms() {
  const { value: stats, loading } = useAsync(getStats);
  const { value: expenses, loadingExpenses } = useAsync(getExpenses);

  const subscriptionRef = useRef(null);
  const dailyRevRef = useRef(null);
  const scanRef = useRef(null);
  const referralRef = useRef(null);
  const mailtoLinkRef = useRef(null);
  const usersRef = useRef(null);

  useEffect(
    () => {
      if (subscriptionRef.current) {
        unsubscriptionsChart(subscriptionRef.current.getContext('2d'), stats);
      }
      if (dailyRevRef.current) {
        dailyRevChart(dailyRevRef.current.getContext('2d'), stats);
      }
      if (scanRef.current) {
        scanChart(scanRef.current.getContext('2d'), stats);
      }
      if (referralRef.current) {
        referralChart(referralRef.current.getContext('2d'), stats);
      }
      if (mailtoLinkRef.current) {
        mailtoLinkPieChart(mailtoLinkRef.current.getContext('2d'), stats);
      }
      if (usersRef.current) {
        usersChart(usersRef.current.getContext('2d'), stats);
      }
    },
    [stats, subscriptionRef.current, dailyRevRef.current, scanRef.current]
  );
  if (loading) {
    return null;
  }
  const prevMonthRev = getLastMonthValues(stats, 'totalRevenue');
  const prevMonthGiftRev = getLastMonthValues(stats, 'giftRevenue');
  const lastMonthsRevenue = prevMonthRev + prevMonthGiftRev;

  return (
    <SubPageLayout page="Open Stats">
      <div styleName="open-page">
        <div styleName="open-title box box--centered">
          <h1>All of our metrics are public</h1>
          <h2>
            We're proud to share our stats as part of the{' '}
            <TextLink href="https://openstartups.co/">Open Startups</TextLink>{' '}
            movement
          </h2>
        </div>
        {loading ? (
          <div styleName="box box--centered">
            <h2>Loading stats...</h2>
          </div>
        ) : (
          <>
            <div styleName="revenue">
              <div styleName="chart box">
                <h2>
                  Daily Revenue -{' '}
                  <span style={{ color: lineColor }}>Sales</span> vs{' '}
                  <span style={{ color: lineColor2 }}>Gift Sales</span>
                </h2>
                <canvas ref={dailyRevRef} />
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Last month's revenue</span>
                  <span styleName="value">{currency(lastMonthsRevenue)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total sales</span>
                  <span styleName="value">{format(stats.totalSales)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Revenue per user</span>
                  <span styleName="value">
                    {currency(stats.totalRevenue / stats.users)}
                  </span>
                </div>
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Revenue from gifts</span>
                  <span styleName="value">
                    {`${(
                      (stats.giftRevenue /
                        (stats.totalRevenue + stats.giftRevenue)) *
                      100
                    ).toFixed(0)}%`}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total gift sales</span>
                  <span styleName="value">{stats.giftSales}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Gifts redeemed</span>
                  <span styleName="value">{stats.giftRedemptions}</span>
                </div>
              </div>
            </div>
            <div styleName="users">
              <div styleName="chart box">
                <h2>New Signups</h2>
                <canvas ref={usersRef} />
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Last month's users</span>
                  <span styleName="value">
                    {getLastMonthValues(stats, 'users')}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total users</span>
                  <span styleName="value">{format(stats.users)}</span>
                </div>
              </div>
            </div>
            <div styleName="subscriptions">
              <div styleName="chart box">
                <h2>Daily Spam Email Unsubscriptions</h2>
                <canvas ref={subscriptionRef} />
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Total Spam Emails</span>
                  <span styleName="value">
                    {format(
                      stats.unsubscribableEmails -
                        stats.previouslyUnsubscribedEmails
                    )}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total Unsubscriptions</span>
                  <span styleName="value">{format(stats.unsubscriptions)}</span>
                </div>
              </div>
              <div styleName="chart box chart--pie">
                <h2>
                  Unsubscribes - <span style={{ color: lineColor }}>Link</span>{' '}
                  vs <span style={{ color: lineColor2 }}>Mailto</span>
                </h2>
                <canvas ref={mailtoLinkRef} />
              </div>
            </div>
            <div styleName="scans">
              <div styleName="chart box">
                <h2>Scans</h2>
                <canvas ref={scanRef} />
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Total number of scans</span>
                  <span styleName="value">{format(stats.scans)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total emails scanned</span>
                  <span styleName="value">{format(stats.emails)}</span>
                </div>
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Total reminders requested</span>
                  <span styleName="value">
                    {format(stats.remindersRequested)}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total reminders sent</span>
                  <span styleName="value">{format(stats.remindersSent)}</span>
                </div>
              </div>
            </div>

            <div styleName="referrals">
              <div styleName="chart box">
                <h2>Referrals</h2>
                <canvas ref={referralRef} />
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Total referral signups</span>
                  <span styleName="value">{format(stats.referralSignup)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Referral conversion rate</span>
                  <span styleName="value">
                    {percent(stats.referralPaidScan, stats.referralSignup)}
                  </span>
                </div>
                {/* <div styleName="big-stat box">
                  <span styleName="label">Total referral payouts</span>
                  <span styleName="value">{currency(stats.referralCredit)}</span>
                </div> */}
              </div>
            </div>
            <div styleName="expenses">
              {loadingExpenses ? (
                <div styleName="box box--unpadded">
                  <h2>Loading expenses...</h2>
                </div>
              ) : (
                <div styleName="box box--unpadded">
                  <h2>Last Month's Expenses</h2>
                  <Table>
                    {(expenses || []).map((expense, i) => {
                      return (
                        <TableRow key={i}>
                          <TableCell>{expense.type}</TableCell>
                          <TableCell>
                            <TextLink href={expense.url}>
                              {expense.service}
                            </TextLink>
                          </TableCell>
                          <TableCell>{currency(expense.cost)}</TableCell>
                        </TableRow>
                      );
                    })}
                    <TableRow inverted>
                      <TableCell />
                      <TableCell>Total</TableCell>
                      <TableCell>
                        <span>
                          {currency(
                            (expenses || []).reduce((out, e) => out + e.cost, 0)
                          )}
                        </span>
                      </TableCell>
                    </TableRow>
                  </Table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SubPageLayout>
  );
}

function getLastMonthValues(stats, stat) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  const today = new Date();
  const start = startOfMonth(addMonths(today, -1));
  const end = endOfMonth(addMonths(today, -1));

  return histogram.reduce((out, d) => {
    if (isWithinRange(d.timestamp, start, end)) return out + d[stat] || 0;
    return out;
  }, 0);
}

function format(num) {
  if (num < 1000) {
    return num;
  }
  return numeral(num).format('0.0a');
}

function currency(num) {
  return numeral(num).format('$0,0.00');
}

function percent(num, total) {
  return numeral(num / total).format('0%');
}
