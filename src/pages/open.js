import './open.css';

import React, { useEffect, useRef } from 'react';

import Chart from 'chart.js';
import SubPageLayout from '../layouts/subpage-layout';
import addMonths from 'date-fns/add_months';
import endOfMonth from 'date-fns/end_of_month';
import { isAfter } from 'date-fns';
import isWithinRange from 'date-fns/is_within_range';
import numeral from 'numeral';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import { useAsync } from '../utils/hooks';

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

  const totalRevenueStats = getBoxStats(stats, 'totalRevenue');
  const salesStats = getBoxStats(stats, 'totalSales');
  const usersStats = getBoxStats(stats, 'users');

  return (
    <SubPageLayout page="Open Stats">
      <div className="open-page">
        <div className="open-title box box--centered">
          <h1>All of our metrics are public</h1>
          <h2>
            We're proud to share our stats as part of the{' '}
            <a className="link" href="https://openstartups.co/">
              Open Startups
            </a>{' '}
            movement
          </h2>
        </div>
        {loading ? (
          <div className="box box--centered">
            <h2>Loading stats...</h2>
          </div>
        ) : (
          <>
            <div className="revenue">
              <div className="chart box">
                <h2>
                  Daily Revenue -{' '}
                  <span style={{ color: lineColor }}>Sales</span> vs{' '}
                  <span style={{ color: lineColor2 }}>Gift Sales</span>
                </h2>
                <canvas ref={dailyRevRef} />
              </div>
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Last month's revenue</span>
                  <span className="value">
                    {currency(totalRevenueStats.lastMonth)}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">Revenue Growth Rate (MoM)</span>
                  <span
                    className={`value ${
                      totalRevenueStats.growthRate > 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {totalRevenueStats.growthRate > 0 ? '+' : '-'}
                    {percent(totalRevenueStats.growthRate)}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">This month's revenue to date</span>
                  <span className="value">
                    {currency(totalRevenueStats.thisMonth)}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">Revenue per user</span>
                  <span className="value">
                    {currency(stats.totalRevenue / stats.users)}
                  </span>
                </div>
              </div>
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Last month's sales</span>
                  <span className="value">{format(salesStats.lastMonth)}</span>
                </div>
                <div className="big-stat box">
                  <span className="label">Sales Growth Rate (MoM)</span>
                  <span
                    className={`value ${
                      salesStats.growthRate > 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {salesStats.growthRate > 0 ? '+' : '-'}
                    {percent(salesStats.growthRate)}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">This month's sales to date</span>
                  <span className="value">{format(salesStats.thisMonth)}</span>
                </div>
                <div className="big-stat box">
                  <span className="label">Total sales</span>
                  <span className="value">{format(stats.totalSales)}</span>
                </div>
              </div>
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Revenue from gifts</span>
                  <span className="value">
                    {`${(
                      (stats.giftRevenue /
                        (stats.totalRevenue + stats.giftRevenue)) *
                      100
                    ).toFixed(0)}%`}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">Total gift sales</span>
                  <span className="value">{stats.giftSales}</span>
                </div>
                <div className="big-stat box">
                  <span className="label">Gifts redeemed</span>
                  <span className="value">{stats.giftRedemptions}</span>
                </div>
              </div>
            </div>
            <div className="users">
              <div className="chart box">
                <h2>New Signups</h2>
                <canvas ref={usersRef} />
              </div>
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Last month's new signups</span>
                  <span className="value">{format(usersStats.lastMonth)}</span>
                </div>
                <div className="big-stat box">
                  <span className="label">New Signups Growth Rate (MoM)</span>
                  <span
                    className={`value ${
                      usersStats.growthRate > 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {usersStats.growthRate > 0 ? '+' : '-'}
                    {percent(usersStats.growthRate)}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">
                    This month's new signups to date
                  </span>
                  <span className="value">{format(usersStats.thisMonth)}</span>
                </div>
                <div className="big-stat box">
                  <span className="label">Total users</span>
                  <span className="value">{format(stats.users)}</span>
                </div>
              </div>
            </div>
            <div className="subscriptions">
              <div className="chart box">
                <h2>Daily Spam Email Unsubscriptions</h2>
                <canvas ref={subscriptionRef} />
              </div>
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Total Spam Emails</span>
                  <span className="value">
                    {format(
                      stats.unsubscribableEmails -
                        stats.previouslyUnsubscribedEmails
                    )}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">Total Unsubscriptions</span>
                  <span className="value">{format(stats.unsubscriptions)}</span>
                </div>
              </div>
              <div className="chart box chart--pie">
                <h2>
                  Unsubscribes - <span style={{ color: lineColor }}>Link</span>{' '}
                  vs <span style={{ color: lineColor2 }}>Mailto</span>
                </h2>
                <canvas ref={mailtoLinkRef} />
              </div>
            </div>
            <div className="scans">
              <div className="chart box">
                <h2>Scans</h2>
                <canvas ref={scanRef} />
              </div>
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Total number of scans</span>
                  <span className="value">{format(stats.scans)}</span>
                </div>
                <div className="big-stat box">
                  <span className="label">Total emails scanned</span>
                  <span className="value">{format(stats.emails)}</span>
                </div>
              </div>
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Total reminders requested</span>
                  <span className="value">
                    {format(stats.remindersRequested)}
                  </span>
                </div>
                <div className="big-stat box">
                  <span className="label">Total reminders sent</span>
                  <span className="value">{format(stats.remindersSent)}</span>
                </div>
              </div>
            </div>

            <div className="referrals">
              {/* <div className="chart box">
                <h2>Referrals</h2>
                <canvas ref={referralRef} />
              </div> */}
              <div className="totals">
                <div className="big-stat box">
                  <span className="label">Total referral signups</span>
                  <span className="value">{format(stats.referralSignup)}</span>
                </div>
                <div className="big-stat box">
                  <span className="label">Referral conversion rate</span>
                  <span className="value">
                    {percent(stats.referralPaidScan / stats.referralSignup)}
                  </span>
                </div>
                {/* <div className="big-stat box">
                  <span className="label">Total referral payouts</span>
                  <span className="value">{currency(stats.referralCredit)}</span>
                </div> */}
              </div>
            </div>
            <div className="expenses">
              {loadingExpenses ? (
                <div className="box box--unpadded">
                  <h2>Loading expenses...</h2>
                </div>
              ) : (
                <div className="box box--unpadded">
                  <h2>Last Month's Expenses</h2>
                  <table className="expenses-table">
                    <tbody>
                      {(expenses || []).map((expense, i) => {
                        return (
                          <tr key={i} className="expenses-item">
                            <td>{expense.type}</td>
                            <td>
                              <a className="link" href={expense.url}>
                                {expense.service}
                              </a>
                            </td>
                            <td>{currency(expense.cost)}</td>
                          </tr>
                        );
                      })}
                      <tr key="total" className="expenses-item expenses-total">
                        <td />
                        <td>Total</td>
                        <td>
                          <span>
                            {currency(
                              (expenses || []).reduce(
                                (out, e) => out + e.cost,
                                0
                              )
                            )}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </SubPageLayout>
  );
}

function getPreviousMonthValues(stats, stat, timeframe = 0) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  const today = new Date();
  const start = startOfMonth(addMonths(today, timeframe));
  const end = endOfMonth(addMonths(today, timeframe));

  return histogram.reduce((out, d) => {
    if (isWithinRange(d.timestamp, start, end)) return out + d[stat] || 0;
    return out;
  }, 0);
}

function getThisMonthToDate(stats, stat) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram, previousDayTotals } = daily;

  const today = new Date();
  const start = startOfMonth(addMonths(today));

  const cumulative = histogram.reduce((out, d) => {
    if (isAfter(d.timestamp, start)) return out + d[stat] || 0;
    return out;
  }, 0);

  const sinceLastHistogram =
    (stats[stat] || 0) - (previousDayTotals[stat] || 0);

  return cumulative + sinceLastHistogram;
}

function getBoxStats(stats, stat) {
  const twoMonthsAgo = getPreviousMonthValues(stats, stat, -2);
  const lastMonth = getPreviousMonthValues(stats, stat, -1);
  const thisMonth = getThisMonthToDate(stats, stat);
  // Percent increase = ((new value - original value)/original value) * 100
  const growthRate = (lastMonth - twoMonthsAgo) / twoMonthsAgo;

  if (stat === 'totalRevenue') {
    const twoMonthsAgoGifts = getPreviousMonthValues(stats, 'giftRevenue', -2);
    const lastMonthGifts = getPreviousMonthValues(stats, 'giftRevenue', -1);
    const thisMonthGifts = getThisMonthToDate(stats, 'giftRevenue');

    const totalTwoMonths = twoMonthsAgo + twoMonthsAgoGifts;
    const totalLastMonth = lastMonth + lastMonthGifts;
    const totalThisMonth = thisMonth + thisMonthGifts;

    const totalGrowth = (totalLastMonth - totalTwoMonths) / totalTwoMonths;

    return {
      twoMonthsAgo: totalTwoMonths,
      lastMonth: totalLastMonth,
      thisMonth: totalThisMonth,
      growthRate: totalGrowth
    };
  }
  return {
    twoMonthsAgo,
    lastMonth,
    thisMonth,
    growthRate
  };
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

function percent(num) {
  return numeral(num).format('0%');
}
