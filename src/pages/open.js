import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js';
import numeral from 'numeral';

import SubPageLayout from '../layouts/subpage-layout';
import { useAsync } from '../utils/hooks';

import './open.css';

async function getStats() {
  const resp = await fetch('/api/stats');
  return resp.json();
}

function chart(ctx, stats) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  new Chart(ctx, {
    data: {
      datasets: [
        {
          label: 'Unsubscriptions',
          fill: false,
          backgroundColor: 'blue',
          borderColor: 'blue',
          data: histogram.map(d => ({
            x: d.timestamp,
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
function scanChart(ctx, stats) {
  if (!stats) return null;
  const { daily } = stats;
  const { histogram } = daily;

  new Chart(ctx, {
    data: {
      datasets: [
        {
          label: 'Unsubscriptions',
          fill: false,
          backgroundColor: 'blue',
          borderColor: 'blue',
          data: histogram.map(d => ({
            x: d.timestamp,
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
export default function Terms() {
  const { error, value: stats, loading } = useAsync(getStats);

  const subscriptionRef = useRef(null);
  const monthlyRevRef = useRef(null);
  const scanRef = useRef(null);

  useEffect(
    () => {
      if (subscriptionRef.current) {
        chart(subscriptionRef.current.getContext('2d'), stats);
      }
      if (monthlyRevRef.current) {
        chart(monthlyRevRef.current.getContext('2d'), stats);
      }
      if (scanRef.current) {
        scanChart(scanRef.current.getContext('2d'), stats);
      }
    },
    [stats, subscriptionRef.current, monthlyRevRef.current, scanRef.current]
  );
  if (loading) {
    return null;
  }
  return (
    <SubPageLayout>
      <div className="open-page">
        <div className="open-title box">
          <h1>All of our metrics are public</h1>
          <h2>
            We're proud to share our stats as part of the{' '}
            <a href="https://openstartups.co/">Open Startups</a> movement
          </h2>
        </div>
        <div className="revenue">
          <div className="chart box">
            <h2>Monthly Revenue</h2>
            <canvas ref={monthlyRevRef} />
          </div>
          <div className="totals">
            <div className="big-stat box">
              <span className="label">Last month's revenue</span>
              <span className="value">{currency(0)}</span>
            </div>
            <div className="big-stat box">
              <span className="label">Total sales</span>
              <span className="value">0</span>
            </div>
            <div className="big-stat box">
              <span className="label">Revenue per user</span>
              <span className="value">{currency(0)}</span>
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

function format(num) {
  if (num < 1000) {
    return num;
  }
  return numeral(num).format('0.0a');
}

function currency(num) {
  return numeral(num).format('$0,0');
}
