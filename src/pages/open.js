import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js';
import numeral from 'numeral';
import startOfDay from 'date-fns/start_of_day';
import startOfMonth from 'date-fns/start_of_month';
import endOfMonth from 'date-fns/end_of_month';
import addMonths from 'date-fns/add_months';
import isWithinRange from 'date-fns/is_within_range';

import SubPageLayout from '../layouts/subpage-layout';
import { useAsync } from '../utils/hooks';

import './open.css';

const lineColor = '#EB6C69';

function getStats() {
  return fetch('/api/stats').then(resp => resp.json());
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
            y: d.unsubscriptions
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
            y: d.totalRevenue
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
            y: d[stat]
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
          backgroundColor: ['#EB6C69', '#fddbd7'],
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
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

function scanTypes(ctx, stats) {
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options
  });
}

export default function Terms() {
  const { error, value: stats, loading } = useAsync(getStats);

  const subscriptionRef = useRef(null);
  const dailyRevRef = useRef(null);
  const scanRef = useRef(null);
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
  return (
    <SubPageLayout page="Open Stats">
      <div className="open-page">
        <div className="open-title box">
          <h1>All of our metrics are public</h1>
          <h2>
            We're proud to share our stats as part of the{' '}
            <a className="link" href="https://openstartups.co/">
              Open Startups
            </a>{' '}
            movement
          </h2>
        </div>
        <div className="revenue">
          <div className="chart box">
            <h2>Daily Revenue</h2>
            <canvas ref={dailyRevRef} />
          </div>
          <div className="totals">
            <div className="big-stat box">
              <span className="label">Last month's revenue</span>
              <span className="value">
                {currency(getLastMonthValues(stats, 'totalRevenue'))}
              </span>
            </div>
            <div className="big-stat box">
              <span className="label">Total sales</span>
              <span className="value">{format(stats.totalSales)}</span>
            </div>
            <div className="big-stat box">
              <span className="label">Revenue per user</span>
              <span className="value">
                {currency(stats.totalRevenue / stats.users)}
              </span>
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
              <span className="label">Last month's users</span>
              <span className="value">
                {getLastMonthValues(stats, 'users')}
              </span>
            </div>
            <div className="big-stat box">
              <span className="label">Total users</span>
              <span className="value">{format(stats.users)}</span>
            </div>
          </div>
        </div>
        <div className="subscriptions">
          <div className="chart box">
            <h2>Unsubscriptions</h2>
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
            <h2>Link vs Mailto Unsubscriptions</h2>
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
        </div>
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
    if (isWithinRange(d.timestamp, start, end)) return out + d[stat];
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
