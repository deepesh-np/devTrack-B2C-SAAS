import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const DevConsole: React.FC = () => {
  const { logs, clearLogs } = useAuth();
  const [filter, setFilter] = useState<'all' | 'get' | 'post' | 'put'>('all');

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.method.toLowerCase() === filter;
  });

  return (
    <div className="card console-card">
      <div className="card-title">
        <div className="console-title-left">
          <span>🛠️ API Dev Console & Inspector</span>
          <span className="badge console-count">{filteredLogs.length} logs</span>
        </div>
        <div className="console-title-right">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ALL
            </button>
            <button
              className={`filter-btn ${filter === 'get' ? 'active' : ''}`}
              onClick={() => setFilter('get')}
            >
              GET
            </button>
            <button
              className={`filter-btn ${filter === 'post' ? 'active' : ''}`}
              onClick={() => setFilter('post')}
            >
              POST
            </button>
            <button
              className={`filter-btn ${filter === 'put' ? 'active' : ''}`}
              onClick={() => setFilter('put')}
            >
              PUT
            </button>
          </div>
          <button className="badge clear-btn" onClick={clearLogs}>
            Clear
          </button>
        </div>
      </div>

      <div className="console-box">
        {filteredLogs.length === 0 ? (
          <p className="console-empty">
            No API activity logged for filter &quot;{filter.toUpperCase()}&quot;. Interact with authentication or profile actions to record real-time telemetry.
          </p>
        ) : (
          filteredLogs.map((log) => (
            <div key={log.id} className="console-entry">
              <div className="console-meta">
                <span className={`console-method ${log.method.toLowerCase()}`}>{log.method}</span>
                <span className="console-endpoint">{log.endpoint}</span>
                <span className={`console-status ${log.status >= 200 && log.status < 300 ? 's200' : 's400'}`}>
                  {log.status}
                </span>
                <span className="console-time">{log.time}</span>
              </div>
              <pre className="console-body">{JSON.stringify(log.data, null, 2)}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
