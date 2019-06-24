import './open.module.scss';

import React, { useEffect, useRef } from 'react';
import Table, { TableCell, TableRow } from '../../components/table';

import Chart from 'chart.js';
import SubPageLayout from '../../layouts/subpage-layout';
import { TextLink } from '../../components/text';
import addMonths from 'date-fns/add_months';
import endOfMonth from 'date-fns/end_of_month';
import formatDate from 'date-fns/format';
import isAfter from 'date-fns/is_after';
import isWithinRange from 'date-fns/is_within_range';
import numeral from 'numeral';
import request from '../../utils/request';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import subDays from 'date-fns/sub_days';
import { useAsync } from 'react-use';

const lineColor = '#EB6C69';
const lineColorLight = '#fedbd5';

const lineColor2 = '#9D5AAC';
const lineColor2Light = '#CA9CD4';

const barColor1 = 'rgba(157, 90, 172, 0.3)';
// const barColor1 = 'rgba(0, 0, 0, 0.3)';
const barColor2 = 'rgba(157, 90, 172, 0.7)';
// const barColor2 = 'rgba(0, 0, 0, 0.5)';

function getStats() {
  return request('/api/stats');
}

function getExpenses() {
  return request('/api/stats/expenses');
}

function dailyRevChart(ctx, stats) {
  if (!stats) return null;
  new Chart(ctx, {
    data: {
      datasets: [
        {
          fill: false,
          backgroundColor: lineColor,
          borderColor: lineColor,
          data: getGraphStats(stats, 'totalRevenue')
        },
        {
          fill: false,
          backgroundColor: lineColor2,
          borderColor: lineColor2,
          data: getGraphStats(stats, 'giftRevenue')
        }
      ]
    },
    type: 'line',
    options: {
      legend: {
        display: false
      },
      tooltips: {
        callbacks: {
          label: function(items) {
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
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function monthlyProfitChart(ctx, stats, expenses) {
  if (!stats || !expenses) return null;

  const grossRevenue = getMonthlyRevenueGraphStats(stats);
  const costs = expenses.map(e => {
    return {
      x: startOfMonth(e.date),
      y: e.total
    };
  });
  const profits = grossRevenue.map(r => {
    const formatted = formatDate(r.x, 'YYYY-MM');
    const costs = expenses.find(
      e => formatDate(e.date, 'YYYY-MM') === formatted
    );
    return {
      x: r.x,
      y: r.y - (costs ? costs.total : 0)
    };
  });

  new Chart(ctx, {
    data: {
      datasets: [
        {
          label: 'Profit',
          type: 'line',
          fill: false,
          backgroundColor: lineColor,
          borderColor: lineColor,
          data: profits,
          yAxisID: 'y-axis-1'
        },
        {
          label: 'Revenue',
          data: getMonthlyRevenueGraphStats(stats),
          backgroundColor: barColor1,
          yAxisID: 'y-axis-1'
        },
        {
          label: 'Expenses',
          data: costs,
          backgroundColor: barColor2,
          yAxisID: 'y-axis-1'
        }
      ]
    },
    type: 'bar',
    options: {
      legend: {
        display: false
      },
      tooltips: {
        mode: 'index',
        intersect: true,
        callbacks: {
          title: function(items) {
            return formatDate(items[0].xLabel, 'MMM YYYY');
          },
          label: function(items, data) {
            return `${data.datasets[items.datasetIndex].label} - ${currency(
              items.yLabel
            )}`;
          }
        }
      },
      scales: {
        xAxes: [
          {
            offset: true,
            stacked: true,
            type: 'time',
            time: {
              unit: 'month'
            }
          }
        ],
        yAxes: [
          {
            stacked: true,
            display: true,
            position: 'left',
            id: 'y-axis-1',
            ticks: {
              beginAtZero: true,
              suggestedMin: 0,
              suggestedMax: 10,
              min: 0,
              precision: 0,
              callback: function(label) {
                return numeral(label).format('$0,0');
              }
            }
          }
        ]
      },
      responsive: true,
      maintainAspectRatio: false
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
function unsubscriptionsChart(ctx, stats) {
  return simpleLineChart(ctx, stats, 'unsubscriptions');
}

function simpleLineChart(ctx, stats, stat) {
  if (!stats) return null;
  new Chart(ctx, {
    data: {
      datasets: [
        {
          fill: false,
          backgroundColor: lineColor,
          borderColor: lineColor,
          data: getGraphStats(stats, stat)
        }
      ]
    },
    type: 'line',
    options: {
      legend: {
        display: false
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
              precision: 0
            }
          }
        ]
      },
      responsive: true,
      maintainAspectRatio: false
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

function providerBarChart(ctx, stats) {
  if (!stats) return null;

  const data = {
    google: stats.googleUsers,
    outlook: stats.outlookUsers
  };

  new Chart(ctx, {
    data: {
      datasets: [
        {
          backgroundColor: [lineColorLight, lineColor2Light],
          borderWidth: 2,
          borderColor: [lineColor, lineColor2],
          data: [data.google, data.outlook]
        }
      ],
      labels: ['Google', 'Outlook']
    },
    type: 'bar',
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [
          {
            barPercentage: 0.4
          }
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              precision: 0,
              callback: function(value) {
                if (value % 1 === 0) {
                  return value;
                }
              }
            }
          }
        ]
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

export default function OpenPage() {
  const { value: stats, loading } = useAsync(getStats);
  const { value: expenses = {}, loadingExpenses } = useAsync(getExpenses);
  const { itemised = [], monthly } = expenses;

  const subscriptionRef = useRef(null);
  const dailyRevRef = useRef(null);
  const monthlyProfitRef = useRef(null);
  const scanRef = useRef(null);
  const referralRef = useRef(null);
  const mailtoLinkRef = useRef(null);
  const usersRef = useRef(null);
  const providersRef = useRef(null);

  useEffect(
    () => {
      if (subscriptionRef.current) {
        unsubscriptionsChart(subscriptionRef.current.getContext('2d'), stats);
      }
      if (dailyRevRef.current) {
        dailyRevChart(dailyRevRef.current.getContext('2d'), stats);
      }
      if (monthlyProfitRef.current) {
        monthlyProfitChart(
          monthlyProfitRef.current.getContext('2d'),
          stats,
          monthly
        );
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
      if (providersRef.current) {
        providerBarChart(providersRef.current.getContext('2d'), stats);
      }
    },
    [
      stats,
      subscriptionRef.current,
      dailyRevRef.current,
      monthlyProfitRef.current,
      scanRef.current,
      referralRef.current,
      mailtoLinkRef.current,
      usersRef.current,
      providersRef.current
    ]
  );
  if (loading) {
    return null;
  }

  const totalRevenueStats = getBoxStats(stats, 'totalRevenue');
  const salesStats = getBoxStats(stats, 'totalSales');
  const usersStats = getBoxStats(stats, 'users');

  return (
    <SubPageLayout
      title="Open Startup"
      description="All of our metrics are public. See our sales, revenue, expenses, users, and more"
    >
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
                  <span styleName="value">
                    {currency(totalRevenueStats.lastMonth)}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Revenue Growth Rate (MoM)</span>
                  <span
                    styleName={`value ${
                      totalRevenueStats.growthRate > 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {totalRevenueStats.growthRate > 0 ? '+' : ''}
                    {percent(totalRevenueStats.growthRate)}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">This month's revenue to date</span>
                  <span styleName="value">
                    {currency(totalRevenueStats.thisMonth)}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total Revenue</span>
                  <span styleName="value">
                    {currency(
                      calculateWithRefunds(stats, 'totalRevenue') +
                        stats.giftRevenue
                    )}
                  </span>
                </div>
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Last month's sales</span>
                  <span styleName="value">{format(salesStats.lastMonth)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Sales Growth Rate (MoM)</span>
                  <span
                    styleName={`value ${
                      salesStats.growthRate > 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {salesStats.growthRate > 0 ? '+' : ''}
                    {percent(salesStats.growthRate)}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">This month's sales to date</span>
                  <span styleName="value">{format(salesStats.thisMonth)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total sales</span>
                  <span styleName="value">
                    {format(calculateWithRefunds(stats, 'totalSales'))}
                  </span>
                </div>
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Revenue per user</span>
                  <span styleName="value">
                    {currency(
                      calculateWithRefunds(stats, 'totalRevenue') / stats.users
                    )}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Revenue from gifts</span>
                  <span styleName="value">
                    {`${percentageRevenueFromGifts(stats)}%`}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total gift sales</span>
                  <span styleName="value">{format(stats.giftSales)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Gifts redeemed</span>
                  <span styleName="value">{format(stats.giftRedemptions)}</span>
                </div>
              </div>

              <div styleName="chart box">
                <h2>
                  <span style={{ color: lineColor }}>Monthly Profit</span> -{' '}
                  <span styleName="title-colored" style={{ color: barColor1 }}>
                    Revenue
                  </span>{' '}
                  vs{' '}
                  <span styleName="title-colored" style={{ color: barColor2 }}>
                    Expenses
                  </span>
                </h2>
                <canvas ref={monthlyProfitRef} />
              </div>
            </div>

            <div styleName="users">
              <div styleName="chart box">
                <h2>New Signups</h2>
                <canvas ref={usersRef} />
              </div>
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Last month's new signups</span>
                  <span styleName="value">{format(usersStats.lastMonth)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">New Signups Growth Rate (MoM)</span>
                  <span
                    styleName={`value ${
                      usersStats.growthRate > 0 ? 'positive' : 'negative'
                    }`}
                  >
                    {usersStats.growthRate > 0 ? '+' : ''}
                    {percent(usersStats.growthRate)}
                  </span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">
                    This month's new signups to date
                  </span>
                  <span styleName="value">{format(usersStats.thisMonth)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Total users</span>
                  <span styleName="value">{format(stats.users)}</span>
                </div>
              </div>
              <div styleName="chart box">
                <h2>
                  Users - <span style={{ color: lineColor }}>Google</span> vs{' '}
                  <span style={{ color: lineColor2 }}>Outlook</span>
                </h2>
                <canvas ref={providersRef} />
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
              <div styleName="chart box">
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
              {/* <div styleName="chart box">
                <h2>Referrals</h2>
                <canvas ref={referralRef} />
              </div> */}
              <div styleName="totals">
                <div styleName="big-stat box">
                  <span styleName="label">Total referral signups</span>
                  <span styleName="value">{format(stats.referralSignup)}</span>
                </div>
                <div styleName="big-stat box">
                  <span styleName="label">Referral conversion rate</span>
                  <span styleName="value">FIXME</span>
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
                    <tbody>
                      {itemised.map((expense, i) => {
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
                              itemised.reduce((out, e) => out + e.cost, 0)
                            )}
                          </span>
                        </TableCell>
                      </TableRow>
                    </tbody>
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

function getGraphStats(stats, stat) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  const today = new Date();
  // get last day of month before. 28th Feb not 1st March
  const lastDayToShow = endOfMonth(addMonths(today, -3));

  // only show data from the last month and this month to date
  return histogram.reduce((out, d) => {
    // stats are run at just past midnight so we actually want to show the day before

    const date = subDays(startOfDay(d.timestamp), 1);
    if (isAfter(date, lastDayToShow)) {
      return [
        ...out,
        {
          x: date,
          y: getYValue(d, stat)
        }
      ];
    }
    return out;
  }, []);
}

function getMonthlyRevenueGraphStats(stats, expenses) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  const today = new Date();
  // only show everything before the current month
  // e.g. we are in June 2019 and we want everything up to May 2019
  const lastMonthToShow = endOfMonth(addMonths(today, -1));

  const byMonth = histogram.reduce((out, d) => {
    const date = startOfMonth(subDays(startOfDay(d.timestamp), 1));
    if (isAfter(date, lastMonthToShow)) return out;

    const formatted = formatDate(date, 'YYYY-MM');
    if (!out[formatted]) {
      // const costs = expenses.find(
      //   e => formatDate(e.date, 'YYYY-MM') === formatted
      // );
      return {
        ...out,
        [formatted]: {
          date,
          profit: getYValue(d, 'totalRevenue')
          // expenses: costs ? costs.total : 0
        }
      };
    }

    return {
      ...out,
      [formatted]: {
        ...out[formatted],
        profit: out[formatted].profit + getYValue(d, 'totalRevenue')
      }
    };
  }, {});

  return Object.keys(byMonth).map(key => {
    const month = byMonth[key];
    return {
      x: month.date,
      y: month.profit
    };
  });
}

function getYValue(data, stat) {
  if (stat === 'totalRevenue') {
    const revenue = data[stat] || 0;
    const refunds = data['totalRevenueRefunded'] || 0;
    const value = revenue - refunds;
    return value;
  }
  return data[stat] || 0;
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
  const start = startOfMonth(today);

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

  if (stat === 'totalRevenue') {
    return revenueBoxStats(stats, {
      twoMonthsAgo,
      lastMonth,
      thisMonth
    });
  }

  if (stat === 'totalSales') {
    return salesBoxStats(stats, {
      twoMonthsAgo,
      lastMonth,
      thisMonth
    });
  }

  // Percent increase = ((new value - original value)/original value) * 100
  const divideBy = twoMonthsAgo === 0 ? 1 : twoMonthsAgo;
  const growthRate = (lastMonth - twoMonthsAgo) / divideBy;

  return {
    twoMonthsAgo,
    lastMonth,
    thisMonth,
    growthRate
  };
}

function revenueBoxStats(stats, { twoMonthsAgo, lastMonth, thisMonth }) {
  const twoMonthsAgoGifts = getPreviousMonthValues(stats, 'giftRevenue', -2);
  const lastMonthGifts = getPreviousMonthValues(stats, 'giftRevenue', -1);
  const thisMonthGifts = getThisMonthToDate(stats, 'giftRevenue');

  const twoMonthsAgoRevenueRefunds = getPreviousMonthValues(
    stats,
    'totalRevenueRefunded',
    -2
  );
  const lastMonthRevenueRefunds = getPreviousMonthValues(
    stats,
    'totalRevenueRefunded',
    -1
  );
  const thisMonthRevenueRefunds = getThisMonthToDate(
    stats,
    'totalRevenueRefunded'
  );

  const totalTwoMonths =
    twoMonthsAgo + twoMonthsAgoGifts - twoMonthsAgoRevenueRefunds;
  const totalLastMonth = lastMonth + lastMonthGifts - lastMonthRevenueRefunds;
  const totalThisMonth = thisMonth + thisMonthGifts - thisMonthRevenueRefunds;

  const totalGrowth = (totalLastMonth - totalTwoMonths) / totalTwoMonths;

  return {
    twoMonthsAgo: totalTwoMonths,
    lastMonth: totalLastMonth,
    thisMonth: totalThisMonth,
    growthRate: totalGrowth
  };
}

function salesBoxStats(stats, { twoMonthsAgo, lastMonth, thisMonth }) {
  const twoMonthsAgoRefunds = getPreviousMonthValues(
    stats,
    'totalSalesRefunded',
    -2
  );
  const lastMonthRefunds = getPreviousMonthValues(
    stats,
    'totalSalesRefunded',
    -1
  );
  const thisMonthRefunds = getThisMonthToDate(stats, 'totalSalesRefunded');

  const totalTwoMonths = twoMonthsAgo - twoMonthsAgoRefunds;
  const totalLastMonth = lastMonth - lastMonthRefunds;
  const totalThisMonth = thisMonth - thisMonthRefunds;
  const totalGrowth = (totalLastMonth - totalTwoMonths) / totalTwoMonths;

  return {
    twoMonthsAgo: totalTwoMonths,
    lastMonth: totalLastMonth,
    thisMonth: totalThisMonth,
    growthRate: totalGrowth
  };
}

function format(num) {
  if (!num) return 0;

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

function percentageRevenueFromGifts(stats) {
  if (!stats.giftRevenue) return 0;

  return (
    (stats.giftRevenue /
      (calculateWithRefunds(stats, 'totalRevenue') + stats.giftRevenue)) *
    100
  ).toFixed(0);
}

function calculateWithRefunds(stats, stat) {
  if (stat === 'totalRevenue')
    return stats.totalRevenue - (stats.totalRevenueRefunded || 0);
  if (stat === 'totalSales')
    return stats.totalSales - (stats.totalSalesRefunded || 0);
  return 0;
}
